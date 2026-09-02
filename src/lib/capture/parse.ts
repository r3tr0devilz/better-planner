import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z, type ZodType } from "zod";
import { CaptureSchema, CaptureBatchSchema, type CaptureResult, type CaptureBatchResult } from "./schema";
import type { Domain } from "@/lib/supabase/types";
import type { CaptureSettings } from "@/lib/data/settings";

const anthropic = new Anthropic();

const BATCH_INSTRUCTION =
  "The text may describe several distinct actionable items — extract EVERY one you find (up to 8) as a separate entry in \"items\", not just the first.";

function systemPrompt(domains: Domain[], extra?: string): string {
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
Leave every field not relevant to the chosen kind as null.${extra ? `\n\n${extra}` : ""}`;
}

/** Anthropic and Ollama get the actual schema attached to the request
 * (zodOutputFormat / Ollama's own `format`) and the model is constrained
 * server-side to match it. Providers without schema-constrained output have
 * nothing forcing that shape: a prompt that only described the field
 * semantics in prose (no field names, no "single object" instruction) let a
 * real response come back as {"summary": ..., "tasks": [...]} for "create 4
 * random tasks" — a plausible-sounding but unparseable structure the model
 * invented because it was never told what shape was actually expected.
 * Spelling out the exact JSON Schema removes that ambiguity. Single-mode
 * also has to say "never an array" here for the same reason: nothing else
 * stops a free-form provider from doing exactly what batch mode wants. */
function jsonModeSystemPrompt<T>(domains: Domain[], schema: ZodType<T>, batch: boolean): string {
  const shapeInstruction = batch
    ? `${BATCH_INSTRUCTION} Respond with ONLY a single JSON object matching this exact JSON Schema. No other text, no markdown fences.`
    : "Respond with ONLY a single JSON object matching this exact JSON Schema — never an array, even if the note describes multiple items (capture only the first/primary one then). No other text, no markdown fences.";
  return `${systemPrompt(domains)}

${shapeInstruction}
${JSON.stringify(z.toJSONSchema(schema))}`;
}

async function parseWithAnthropic<T>(text: string, domains: Domain[], model: string, schema: ZodType<T>, batch: boolean): Promise<T | null> {
  const response = await anthropic.messages.parse({
    model,
    max_tokens: 2048,
    system: systemPrompt(domains, batch ? BATCH_INSTRUCTION : undefined),
    messages: [{ role: "user", content: text }],
    output_config: { format: zodOutputFormat(schema) },
  });
  return response.parsed_output;
}

async function parseWithOllama<T>(text: string, domains: Domain[], model: string, schema: ZodType<T>, batch: boolean): Promise<T | null> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt(domains, batch ? BATCH_INSTRUCTION : undefined) },
        { role: "user", content: text },
      ],
      format: z.toJSONSchema(schema),
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

  const parsed = schema.safeParse(JSON.parse(data.message.content));
  return parsed.success ? parsed.data : null;
}

/** Shared by OpenRouter and Groq — both plain OpenAI-compatible chat
 * completions endpoints, so this is a plain fetch rather than a dedicated
 * SDK. json_object mode (not the stricter json_schema mode) on purpose —
 * schema mode isn't reliably supported across every model on either
 * provider, especially OpenRouter's free ones, so this asks for JSON in the
 * prompt (jsonModeSystemPrompt) and parses forgivingly. */
async function parseOpenAiCompatible<T>(
  url: string,
  apiKey: string,
  text: string,
  domains: Domain[],
  model: string,
  schema: ZodType<T>,
  batch: boolean,
): Promise<T | null> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: jsonModeSystemPrompt(domains, schema, batch) },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    throw new Error(`Request to ${new URL(url).host} failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = schema.safeParse(JSON.parse(content));
  return parsed.success ? parsed.data : null;
}

/** Plain JSON mode (responseMimeType, no responseSchema) rather than
 * Gemini's native schema-constrained output — z.toJSONSchema's nullable
 * unions and other JSON Schema shapes don't map cleanly onto Gemini's more
 * restrictive Schema object, so this asks for JSON in the prompt and parses
 * forgivingly, same as the OpenRouter/Groq path. */
async function parseWithGemini<T>(text: string, domains: Domain[], model: string, schema: ZodType<T>, batch: boolean): Promise<T | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: jsonModeSystemPrompt(domains, schema, batch) }],
        },
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`Gemini request failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) return null;

  const parsed = schema.safeParse(JSON.parse(content));
  return parsed.success ? parsed.data : null;
}

/** Provider/model come from Settings (DB, per user) with the env vars as the
 * fallback default — see src/lib/data/settings.ts. Note a local Ollama model
 * only exists on whichever machine has Ollama running. OpenRouter has no
 * hardcoded default model — its free-model catalog shifts over time, so a
 * guessed slug could silently be dead; the model field is required for it. */
function dispatch<T>(text: string, domains: Domain[], settings: CaptureSettings, schema: ZodType<T>, batch: boolean): Promise<T | null> {
  if (settings.provider === "ollama") {
    return parseWithOllama(text, domains, settings.model ?? process.env.OLLAMA_MODEL ?? "llama3.2:3b", schema, batch);
  }
  if (settings.provider === "openrouter") {
    if (!settings.model) throw new Error("Pick a model in Settings for OpenRouter (see openrouter.ai/models)");
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");
    return parseOpenAiCompatible("https://openrouter.ai/api/v1/chat/completions", apiKey, text, domains, settings.model, schema, batch);
  }
  if (settings.provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");
    return parseOpenAiCompatible(
      "https://api.groq.com/openai/v1/chat/completions",
      apiKey,
      text,
      domains,
      settings.model ?? "llama-3.3-70b-versatile",
      schema,
      batch,
    );
  }
  if (settings.provider === "gemini") {
    return parseWithGemini(text, domains, settings.model ?? "gemini-3.6-flash", schema, batch);
  }
  return parseWithAnthropic(text, domains, settings.model ?? "claude-sonnet-5", schema, batch);
}

/** Single-item capture — the quick text/voice bar. Always yields at most one
 * record, even for input that describes several things (see the single-mode
 * instruction in jsonModeSystemPrompt). */
export function parseCapture(text: string, domains: Domain[], settings: CaptureSettings): Promise<CaptureResult | null> {
  return dispatch(text, domains, settings, CaptureSchema, false);
}

/** AI capture — paste a paragraph, get back every distinct item it
 * describes for review before anything is written. */
export async function parseCaptureBatch(text: string, domains: Domain[], settings: CaptureSettings): Promise<CaptureResult[]> {
  const result = await dispatch(text, domains, settings, CaptureBatchSchema, true);
  return result?.items ?? [];
}

export type { CaptureBatchResult };
