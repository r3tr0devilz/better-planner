import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createClient } from "@/lib/supabase/server";
import { getDomains } from "@/lib/data/domains";

const CaptureSchema = z.object({
  kind: z.enum(["task", "other"]),
  title: z.string().describe("Cleaned-up title — no filler words, no 'um's, rewritten as a clear action item"),
  domain_name: z.string().nullable().describe("Best-matching existing domain name, or null if none fits"),
  due_at: z.string().nullable().describe("ISO 8601 datetime if a due date/time was mentioned, else null"),
  reminder_minutes_before: z.number().nullable().describe("Minutes before due_at to remind, else null"),
  priority: z.enum(["low", "medium", "high"]),
});

const client = new Anthropic();

export async function POST(request: Request) {
  const { text, source } = (await request.json()) as { text: string; source: "text" | "voice" };
  if (!text?.trim()) {
    return NextResponse.json({ error: "empty capture" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const domains = await getDomains();

  const { data: inbox, error: inboxErr } = await supabase
    .from("capture_inbox")
    .insert({ raw_text: text, source, parsed_result: null })
    .select()
    .single();
  if (inboxErr) throw inboxErr;

  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 1024,
    system: `You turn a captured voice/text note into a structured record for a personal planner.
Current date/time: ${new Date().toISOString()}.
Existing domains: ${domains.map((d) => d.name).join(", ") || "(none yet)"}.
If the note describes something to do (a task, chore, reminder), set kind "task". Otherwise set kind "other".
Resolve relative dates/times ("tomorrow at 2pm") against the current date/time above.`,
    messages: [{ role: "user", content: text }],
    output_config: { format: zodOutputFormat(CaptureSchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed) {
    return NextResponse.json({ error: "could not parse capture" }, { status: 502 });
  }

  const domain = domains.find((d) => d.name.toLowerCase() === parsed.domain_name?.toLowerCase());
  let label = parsed.title;

  if (parsed.kind === "task") {
    const reminderAt =
      parsed.due_at && parsed.reminder_minutes_before
        ? new Date(new Date(parsed.due_at).getTime() - parsed.reminder_minutes_before * 60_000).toISOString()
        : null;

    const { error: taskErr } = await supabase.from("tasks").insert({
      title: parsed.title,
      domain_id: domain?.id ?? null,
      project_id: null,
      content_item_id: null,
      notes: null,
      due_at: parsed.due_at,
      reminder_at: reminderAt,
      priority: parsed.priority,
      status: "open",
      is_top_three: false,
      recurring_rule: null,
    });
    if (taskErr) throw taskErr;
    label = `Task created: ${parsed.title}`;
  } else {
    label = `Captured: ${parsed.title}`;
  }

  await supabase.from("capture_inbox").update({ parsed_result: parsed }).eq("id", inbox.id);
  await supabase.from("notifications").insert({ kind: "capture", message: label, read: false });

  return NextResponse.json({ label });
}
