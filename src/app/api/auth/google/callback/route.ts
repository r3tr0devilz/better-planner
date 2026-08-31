import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GOOGLE_CALENDAR_PROVIDER, googleRedirectUri } from "@/lib/google-calendar";

const STATE_COOKIE = "bp_google_oauth_state";

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

export async function GET(request: NextRequest) {
  const redirect = (status: string) => NextResponse.redirect(new URL(`/settings?calendar=${status}`, request.url));
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (error) return clearState(redirect("denied"));
  if (!code || !state || !expectedState || state !== expectedState) return clearState(redirect("invalid_state"));

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return clearState(redirect("missing_google_env"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return clearState(NextResponse.redirect(new URL("/login", request.url)));

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: googleRedirectUri(request.nextUrl.origin),
      grant_type: "authorization_code",
    }),
  });
  const tokenJson = (await tokenResponse.json()) as GoogleTokenResponse;

  if (!tokenResponse.ok || !tokenJson.access_token || !tokenJson.expires_in) {
    console.error("google calendar token exchange failed:", tokenJson.error, tokenJson.error_description);
    return clearState(redirect("token_exchange_failed"));
  }

  const { data: existing } = await supabase
    .from("integration_status")
    .select("refresh_token")
    .eq("user_id", user.id)
    .eq("provider", GOOGLE_CALENDAR_PROVIDER)
    .maybeSingle();

  const { error: upsertError } = await supabase.from("integration_status").upsert(
    {
      user_id: user.id,
      provider: GOOGLE_CALENDAR_PROVIDER,
      connected: true,
      last_synced_at: null,
      access_token: tokenJson.access_token,
      refresh_token: tokenJson.refresh_token ?? existing?.refresh_token ?? null,
      token_expires_at: new Date(Date.now() + tokenJson.expires_in * 1000).toISOString(),
      scope: tokenJson.scope ?? null,
    },
    { onConflict: "user_id,provider" },
  );

  if (upsertError) {
    console.error("google calendar token storage failed:", upsertError);
    return clearState(redirect("storage_failed"));
  }

  return clearState(redirect("connected"));
}

function clearState(response: NextResponse) {
  response.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
