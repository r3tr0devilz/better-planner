import { createClient } from "@/lib/supabase/server";

export type CaptureSettings = { provider: "anthropic" | "ollama"; model: string | null };

/** Falls back to the env-var defaults (the original deploy-time-only config)
 * whenever there's no saved row — including the 0004 migration not having
 * been applied to this database yet (relation-does-not-exist errors are
 * swallowed here on purpose, not just the zero-rows case), so this can
 * deploy ahead of the migration without taking down /settings or capture. */
export async function getCaptureSettings(): Promise<CaptureSettings> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return envDefaults();

  const { data, error } = await supabase
    .from("user_settings")
    .select("capture_provider, capture_model")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return envDefaults();
  return { provider: data.capture_provider, model: data.capture_model };
}

function envDefaults(): CaptureSettings {
  return {
    provider: process.env.CAPTURE_LLM_PROVIDER === "ollama" ? "ollama" : "anthropic",
    model: null,
  };
}
