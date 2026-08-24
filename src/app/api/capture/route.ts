import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDomains } from "@/lib/data/domains";
import { parseCapture } from "@/lib/capture/parse";

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

  const parsed = await parseCapture(text, domains);
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
