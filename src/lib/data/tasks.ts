import { createClient } from "@/lib/supabase/server";
import type { Task, TaskState } from "@/lib/supabase/types";

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
    .order("due_at", { ascending: true, nullsFirst: false })
    // toggleTopThree already refuses a 4th star, but this is the display's
    // own backstop — Top three never renders more than three no matter what
    // the data looks like.
    .limit(3);
  if (error) throw error;
  return data;
}

export async function getTaskStates(): Promise<TaskState[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("task_states").select("*").order("sort_order");
  if (error) throw error;
  return data;
}
