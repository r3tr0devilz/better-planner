import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { googleOAuthUrl } from "@/lib/google-calendar";

const STATE_COOKIE = "bp_google_oauth_state";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const state = randomBytes(24).toString("base64url");
  const oauthUrl = googleOAuthUrl(request.nextUrl.origin, state);
  if (!oauthUrl) {
    return NextResponse.redirect(new URL("/settings?calendar=missing_google_env", request.url));
  }

  const response = NextResponse.redirect(oauthUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}
