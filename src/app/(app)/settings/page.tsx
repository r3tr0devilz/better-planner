import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { CaptureSettingsForm } from "@/components/capture-settings-form";
import { SubmitButton } from "@/components/submit-button";
import { getCaptureSettings, getDisplayName } from "@/lib/data/settings";
import { signOut, updateDisplayName } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    captureSettings,
    displayName,
  ] = await Promise.all([supabase.auth.getUser(), getCaptureSettings(), getDisplayName()]);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Settings" context="Account & integrations" />

      <section className="card mt-6 p-4">
        <h2 className="text-sm font-medium text-ink-faint">Account</h2>
        <p className="mt-2 truncate text-sm text-ink">{user?.email}</p>

        <form action={updateDisplayName} className="mt-4 flex items-end gap-2">
          <label className="flex-1 text-xs text-ink-faint">
            Display name
            <input
              name="display_name"
              defaultValue={displayName ?? ""}
              placeholder="What should Today call you?"
              className="field mt-1.5"
            />
          </label>
          <SubmitButton className="btn-outline px-3 py-1.5 text-xs">Save</SubmitButton>
        </form>

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
