"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { GOOGLE_CALENDAR_PROVIDER } from "@/lib/google-calendar";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** user_settings is one row per user shared by two separate forms (this one
 * and Capture AI below) — the insert type requires every column explicitly,
 * so each action reads the existing row first and carries its other columns
 * forward untouched instead of upserting a partial row that would reset
 * them to column defaults. */
export async function updateDisplayName(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const displayName = (formData.get("display_name") as string)?.trim() || null;

  const { data: existing } = await supabase
    .from("user_settings")
    .select("capture_provider, capture_model")
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      display_name: displayName,
      capture_provider: existing?.capture_provider ?? "anthropic",
      capture_model: existing?.capture_model ?? null,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;

  revalidatePath("/settings");
  revalidatePath("/today");
}

export async function updateCaptureSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const providerRaw = formData.get("capture_provider");
  const provider =
    providerRaw === "ollama" ? "ollama"
    : providerRaw === "openrouter" ? "openrouter"
    : providerRaw === "groq" ? "groq"
    : providerRaw === "gemini" ? "gemini"
    : "anthropic";
  const model = (formData.get("capture_model") as string)?.trim() || null;

  const { data: existing } = await supabase.from("user_settings").select("display_name").eq("user_id", user.id).maybeSingle();

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      capture_provider: provider,
      capture_model: model,
      display_name: existing?.display_name ?? null,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;

  revalidatePath("/settings");
}

export async function disconnectGoogleCalendar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("integration_status")
    .update({
      connected: false,
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      scope: null,
    })
    .eq("user_id", user.id)
    .eq("provider", GOOGLE_CALENDAR_PROVIDER);
  if (error) throw error;

  revalidatePath("/settings");
  revalidatePath("/calendar");
  revalidatePath("/today");
}
