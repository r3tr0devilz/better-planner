import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CaptureSchema, type CaptureResult } from "./schema";
import type { Domain } from "@/lib/supabase/types";
import type { CaptureSettings } from "@/lib/data/settings";

const anthropic = new Anthropic();

function systemPrompt(domains: Domain[]): string {
  return `You turn a captured voice/text note into a structured record for a personal planner.
Current date/time: ${new Date().toISOString()}.
Existing domains: ${domains.map((d) => d.name).join(", ") || "(none yet)"}.

Pick "kind" from:
- "job_application": the note is about a NEW job opportunity to save or an application just submitted (a company + role are identifiable). Set company, role, application_status (e.g. "applied to X" → applied, "saved a listing" → saved), job_link, due_at (deadline) as mentioned.
- "course": the note is about a NEW course to start tracking. Set course_platform, course_link.
- "certificate": the note is about a NEW certificate/credential to save. Set issuer, credential_link.
- "career_contact": the note is about a NEW networking contact to remember (recruiter/mentor/referral/company contact). Set company, relationship_type, due_at (next follow-up date) as mentioned.
- "task": anything else actionable — a chore, reminder, or action item, including progress reminders about an existing course/application/certificate ("finish module 3 tomorrow") that aren't themselves creating one of the above records.
- "other": everything else.

Resolve relative dates/times ("tomorrow at 2pm", "next Friday") against the current date/time above.
Leave every field not relevant to the chosen kind as null.`;
}

async function parseWithAnthropic(text: string, domains: Domain[], model: string): Promise<CaptureResult | null> {
  const response = await anthropic.messages.parse({
    model,
    max_tokens: 1024,
    system: systemPrompt(domains),
    messages: [{ role: "user", content: text }],
    output_config: { format: zodOutputFormat(CaptureSchema) },
  });
  return response.parsed_output;
}

async function parseWithOllama(text: string, domains: Domain[], model: string): Promise<CaptureResult | null> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt(domains) },
        { role: "user", content: text },
      ],
      format: z.toJSONSchema(CaptureSchema),
      // ponytail: fixed 4k context. Ollama sizes the KV cache to the model's
      // full context window (some of these run to 131k) unless capped, which
      // OOM'd on this machine during testing. 4k covers this prompt many
      // times over — raise it (or make it env-configurable) if a model needs
      // more room.
      options: { num_ctx: 4096 },
    }),
  });
  if (!res.ok) {
    throw new Error(`Ollama request failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  if (!data.message?.content) return null;

  const parsed = CaptureSchema.safeParse(JSON.parse(data.message.content));
  return parsed.success ? parsed.data : null;
}

/** Provider/model come from Settings (DB, per user) with the env vars as the
 * fallback default — see src/lib/data/settings.ts. Note a local Ollama model
 * only exists on whichever machine has Ollama running. */
export async function parseCapture(text: string, domains: Domain[], settings: CaptureSettings): Promise<CaptureResult | null> {
  if (settings.provider === "ollama") {
    return parseWithOllama(text, domains, settings.model ?? process.env.OLLAMA_MODEL ?? "llama3.2:3b");
  }
  return parseWithAnthropic(text, domains, settings.model ?? "claude-sonnet-5");
}
