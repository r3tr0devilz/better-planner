import { createClient } from "@/lib/supabase/server";
import type { InventoryItem } from "@/lib/supabase/types";

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("inventory_items").select("*").order("added_at", { ascending: false });
  if (error) throw error;
  return data;
}
