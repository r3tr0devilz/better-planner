import { createClient } from "@/lib/supabase/server";
import type { NotificationRow } from "@/lib/supabase/types";

export async function getRecentNotifications(limit = 6): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
