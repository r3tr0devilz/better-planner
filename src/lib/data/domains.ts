import { createClient } from "@/lib/supabase/server";
import type { Domain } from "@/lib/supabase/types";

export { THREAD_COUNT, threadIndexFor } from "@/lib/domain-threads";

export async function getDomains(): Promise<Domain[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("domains").select("*").order("name");
  if (error) throw error;
  return data;
}
