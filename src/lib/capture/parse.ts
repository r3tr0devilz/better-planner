import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CaptureSchema, type CaptureResult } from "./schema";
import type { Domain } from "@/lib/supabase/types";

const anthropic = new Anthropic();

function systemPrompt(domains: Domain[]): string {
  return `You turn a captured voice/text note into a structured record for a personal planner.
Current date/time: ${new Date().toISOString()}.
Existing domains: ${domains.map((d) => d.name).join(", ") || "(none yet)"}.
If the note describes something to do (a task, chore, reminder), set kind "task". Otherwise set kind "other".
Resolve relative dates/times ("tomorrow at 2pm") against the current date/time above.`;
}

async function parseWithAnthropic(text: string, domains: Domain[]): Promise<CaptureResult | null> {
  const response = await anthropic.messages.parse({
    model: "claude-opus-5",
    max_tokens: 1024,
    system: systemPrompt(domains),
    messages: [{ role: "user", content: text }],
    output_config: { format: zodOutputFormat(CaptureSchema) },
  });
  return response.parsed_output;
}

async function parseWithOllama(text: string, domains: Domain[]): Promise<CaptureResult | null> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.2:3b";

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

/** Provider is a deployment-time choice (env var), not a per-request one — a
 * local model only exists on whichever machine has Ollama running. */
export async function parseCapture(text: string, domains: Domain[]): Promise<CaptureResult | null> {
  if (process.env.CAPTURE_LLM_PROVIDER === "ollama") {
    return parseWithOllama(text, domains);
  }
  return parseWithAnthropic(text, domains);
}
