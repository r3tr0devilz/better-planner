import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Settings</h1>

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
