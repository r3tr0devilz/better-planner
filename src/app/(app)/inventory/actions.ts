"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const location = String(formData.get("location") ?? "").trim() || null;
  const photoUrl = String(formData.get("photo_url") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("inventory_items").insert({ name, location, photo_url: photoUrl, removed_at: null });
  if (error) throw error;

  revalidatePath("/inventory");
}

export async function setRemoved(id: string, removed: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_items")
    .update({ removed_at: removed ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/inventory");
}

export async function updateItem(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const location = String(formData.get("location") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("inventory_items").update({ name, location }).eq("id", id);
  if (error) throw error;

  revalidatePath("/inventory");
}

export async function deleteItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("inventory_items").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/inventory");
}
