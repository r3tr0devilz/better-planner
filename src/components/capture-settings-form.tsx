"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCaptureSettings } from "@/app/(app)/settings/actions";
import type { CaptureSettings } from "@/lib/data/settings";

const ANTHROPIC_MODELS = [
  { value: "claude-sonnet-5", label: "Sonnet 5 (recommended)" },
  { value: "claude-opus-5", label: "Opus 5" },
  { value: "claude-haiku-4-5-20251001", label: "Haiku 4.5" },
  { value: "claude-fable-5", label: "Fable 5" },
];

export function CaptureSettingsForm({ settings }: { settings: CaptureSettings }) {
  const [provider, setProvider] = useState(settings.provider);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // settings.model is whichever provider was saved last — only use it as the
  // model field's default when the dropdown is still on that same provider.
  // Otherwise it leaks the previous provider's model string into a field for
  // an unrelated provider (e.g. an OpenRouter slug showing up under Gemini).
  const savedModel = provider === settings.provider ? settings.model : null;

  return (
    <form
      action={(formData) => startTransition(async () => {
        await updateCaptureSettings(formData);
        // revalidatePath alone doesn't reliably refresh an already-mounted
        // client page when the form action is this wrapping closure rather
        // than the server action passed directly — confirmed by testing: a
        // fresh page load always showed the correct saved value, only the
        // current session's UI stayed stale. router.refresh() re-fetches
        // this page's Server Component data explicitly instead of relying
        // on that implicit tracking.
        router.refresh();
        toast("Capture settings saved");
      })}
      className="mt-3 flex flex-col gap-3"
    >
      <label className="flex flex-col gap-1.5 text-xs text-ink-faint">
        Provider
        <select
          name="capture_provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value as CaptureSettings["provider"])}
          className="field"
        >
          <option value="anthropic">Anthropic</option>
          <option value="ollama">Ollama (local)</option>
          <option value="openrouter">OpenRouter</option>
          <option value="groq">Groq</option>
          <option value="gemini">Google Gemini</option>
        </select>
      </label>

      {provider === "anthropic" && (
        <label className="flex flex-col gap-1.5 text-xs text-ink-faint">
          Model
          <select name="capture_model" defaultValue={savedModel ?? "claude-sonnet-5"} className="field">
            {ANTHROPIC_MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {provider === "ollama" && (
        <label className="flex flex-col gap-1.5 text-xs text-ink-faint">
          Model
          <input
            name="capture_model"
            defaultValue={savedModel ?? ""}
            placeholder="llama3.2:3b"
            className="field"
          />
          <span className="text-[11px] text-ink-faint">Whatever you&apos;ve pulled locally with Ollama — must be running on the same machine as the server.</span>
        </label>
      )}

      {provider === "openrouter" && (
        <label className="flex flex-col gap-1.5 text-xs text-ink-faint">
          Model
          <input
            name="capture_model"
            defaultValue={savedModel ?? ""}
            placeholder="meta-llama/llama-3.2-3b-instruct:free"
            required
            className="field"
          />
          <span className="text-[11px] text-ink-faint">
            A model slug from openrouter.ai/models — filter by &quot;Free&quot; for no-cost options. Needs OPENROUTER_API_KEY set in the server&apos;s environment.
          </span>
        </label>
      )}

      {provider === "groq" && (
        <label className="flex flex-col gap-1.5 text-xs text-ink-faint">
          Model
          <input
            name="capture_model"
            defaultValue={savedModel ?? "llama-3.3-70b-versatile"}
            placeholder="llama-3.3-70b-versatile"
            className="field"
          />
          <span className="text-[11px] text-ink-faint">
            A model from console.groq.com/docs/models — free tier, runs on Groq&apos;s own hardware (fast, no shared-pool waits). Needs GROQ_API_KEY set in the server&apos;s environment.
          </span>
        </label>
      )}

      {provider === "gemini" && (
        <label className="flex flex-col gap-1.5 text-xs text-ink-faint">
          Model
          <input
            name="capture_model"
            defaultValue={savedModel ?? "gemini-2.5-flash"}
            placeholder="gemini-2.5-flash"
            className="field"
          />
          <span className="text-[11px] text-ink-faint">
            A model from ai.google.dev/gemini-api/docs/models — free tier. Needs GEMINI_API_KEY set in the server&apos;s environment.
          </span>
        </label>
      )}

      <button type="submit" disabled={pending} className="btn-outline self-start px-3 py-1.5 text-xs">
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
