import { createClient } from "@/lib/supabase/server";

export const GOOGLE_CALENDAR_PROVIDER = "google_calendar";
export const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

export type GoogleCalendarStatus = {
  connected: boolean;
  lastSyncedAt: string | null;
  scope: string | null;
  tokenExpiresAt: string | null;
};

export function googleRedirectUri(origin: string) {
  return `${origin}/api/auth/google/callback`;
}

export function googleOAuthUrl(origin: string, state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return null;

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", googleRedirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_CALENDAR_SCOPE);
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  return url;
}

export async function getGoogleCalendarStatus(): Promise<GoogleCalendarStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return disconnectedStatus();

  const { data, error } = await supabase
    .from("integration_status")
    .select("connected, last_synced_at, scope, token_expires_at")
    .eq("user_id", user.id)
    .eq("provider", GOOGLE_CALENDAR_PROVIDER)
    .maybeSingle();

  if (error || !data) return disconnectedStatus();

  return {
    connected: data.connected,
    lastSyncedAt: data.last_synced_at,
    scope: data.scope,
    tokenExpiresAt: data.token_expires_at,
  };
}

function disconnectedStatus(): GoogleCalendarStatus {
  return { connected: false, lastSyncedAt: null, scope: null, tokenExpiresAt: null };
}
