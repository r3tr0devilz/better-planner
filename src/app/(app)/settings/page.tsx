import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-mist">Settings</h1>

      <section className="glass mt-6 rounded-xl p-4">
        <h2 className="text-sm font-medium text-mist-dim">Account</h2>
        <p className="mt-2 text-sm text-mist">{user?.email}</p>
        <form action={signOut} className="mt-4">
          <button type="submit" className="rounded-lg bg-white/10 px-4 py-2 text-sm text-mist hover:bg-white/15">
            Sign out
          </button>
        </form>
      </section>

      <section className="glass mt-4 rounded-xl p-4">
        <h2 className="text-sm font-medium text-mist-dim">Integrations</h2>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-mist">Google Calendar</span>
          <span className="text-xs text-mist-dim">Not connected — coming soon</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-mist">Push notifications</span>
          <span className="text-xs text-mist-dim">Not connected — coming soon</span>
        </div>
      </section>
    </div>
  );
}
