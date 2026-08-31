import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { CaptureSettingsForm } from "@/components/capture-settings-form";
import { SubmitButton } from "@/components/submit-button";
import { getCaptureSettings, getDisplayName } from "@/lib/data/settings";
import { getGoogleCalendarStatus } from "@/lib/google-calendar";
import { disconnectGoogleCalendar, signOut, updateDisplayName } from "./actions";

const CALENDAR_MESSAGES: Record<string, string> = {
  connected: "Google Calendar connected.",
  denied: "Google Calendar connection was cancelled.",
  invalid_state: "Google Calendar connection expired. Try again.",
  missing_google_env: "Google Calendar credentials are missing.",
  token_exchange_failed: "Google Calendar did not return usable tokens.",
  storage_failed: "Google Calendar connected, but token storage failed.",
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ calendar?: string }> }) {
  const { calendar } = await searchParams;
  const calendarMessage = calendar ? CALENDAR_MESSAGES[calendar] : null;
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    captureSettings,
    displayName,
    calendarStatus,
  ] = await Promise.all([supabase.auth.getUser(), getCaptureSettings(), getDisplayName(), getGoogleCalendarStatus()]);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Settings" context="Account & integrations" />

      {calendarMessage && (
        <p className="card mt-6 px-4 py-3 text-sm text-ink" role="status">
          {calendarMessage}
        </p>
      )}

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
          <div>
            <span className="text-ink">Google Calendar</span>
            <p className="mt-0.5 text-xs text-ink-faint">
              {calendarStatus.connected
                ? calendarStatus.lastSyncedAt
                  ? `Last synced ${new Date(calendarStatus.lastSyncedAt).toLocaleString()}`
                  : "Connected"
                : "Not connected"}
            </p>
          </div>
          {calendarStatus.connected ? (
            <form action={disconnectGoogleCalendar}>
              <SubmitButton className="btn-outline px-3 py-1.5 text-xs">Disconnect</SubmitButton>
            </form>
          ) : (
            <a href="/api/auth/google" className="btn-outline px-3 py-1.5 text-xs">
              Connect
            </a>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-ink">Push notifications</span>
          <span className="text-xs text-ink-faint">Not connected — coming soon</span>
        </div>
      </section>
    </div>
  );
}
