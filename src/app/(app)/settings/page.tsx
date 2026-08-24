import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const usingOllama = process.env.CAPTURE_LLM_PROVIDER === "ollama";
  const captureModel = usingOllama ? (process.env.OLLAMA_MODEL ?? "llama3.2:3b") : "claude-opus-5";

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-black uppercase tracking-tight text-ink">Settings</h1>

      <section className="card mt-6 p-4">
        <h2 className="text-sm font-medium text-ink-faint">Account</h2>
        <p className="mt-2 truncate text-sm text-ink">{user?.email}</p>
        <form action={signOut} className="mt-4">
          <button type="submit" className="btn-outline">
            Sign out
          </button>
        </form>
      </section>

      <section className="card mt-4 p-4">
        <h2 className="text-sm font-medium text-ink-faint">Capture AI</h2>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-ink">Provider</span>
          <span className="font-mono text-xs text-ink-faint">{usingOllama ? "Ollama (local)" : "Anthropic"}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-ink">Model</span>
          <span className="font-mono text-xs text-ink-faint">{captureModel}</span>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Set by <code className="font-mono">CAPTURE_LLM_PROVIDER</code> in your environment — this page just reports it,
          it can&apos;t be changed here.
        </p>
      </section>

      <section className="card mt-4 p-4">
        <h2 className="text-sm font-medium text-ink-faint">Integrations</h2>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-ink">Google Calendar</span>
          <span className="text-xs text-ink-faint">Not connected — coming soon</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-ink">Push notifications</span>
          <span className="text-xs text-ink-faint">Not connected — coming soon</span>
        </div>
      </section>
    </div>
  );
}
