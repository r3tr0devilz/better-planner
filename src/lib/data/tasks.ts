import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/lib/supabase/types";

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("due_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data;
}

export async function getTopThree(): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("is_top_three", true)
    .eq("status", "open")
    .order("due_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data;
}
