"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateCaptureSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const provider = formData.get("capture_provider") === "ollama" ? "ollama" : "anthropic";
  const model = (formData.get("capture_model") as string)?.trim() || null;

  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: user.id, capture_provider: provider, capture_model: model }, { onConflict: "user_id" });
  if (error) throw error;

  revalidatePath("/settings");
}
