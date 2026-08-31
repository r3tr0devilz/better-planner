import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { CaptureSettingsForm } from "@/components/capture-settings-form";
import { getCaptureSettings } from "@/lib/data/settings";
import { signOut } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    captureSettings,
  ] = await Promise.all([supabase.auth.getUser(), getCaptureSettings()]);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Settings" context="Account & integrations" />

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
        <CaptureSettingsForm settings={captureSettings} />
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
