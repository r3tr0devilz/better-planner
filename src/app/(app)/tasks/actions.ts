"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const domainId = String(formData.get("domain_id") ?? "") || null;
  const dueAt = String(formData.get("due_at") ?? "") || null;
  const priority = String(formData.get("priority") ?? "medium");

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    title,
    domain_id: domainId,
    project_id: null,
    content_item_id: null,
    notes: null,
    due_at: dueAt ? new Date(dueAt).toISOString() : null,
    reminder_at: null,
    priority: priority as "low" | "medium" | "high",
    status: "open",
    is_top_three: false,
    recurring_rule: null,
    duration_minutes: null,
    state_id: null,
  });
  if (error) throw error;

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/calendar");
}

export async function updateTask(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const notes = String(formData.get("notes") ?? "").trim() || null;
  const domainId = String(formData.get("domain_id") ?? "") || null;
  const dueAt = String(formData.get("due_at") ?? "") || null;
  const priority = String(formData.get("priority") ?? "medium");

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      notes,
      domain_id: domainId,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      priority: priority as "low" | "medium" | "high",
    })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/calendar");
}

export async function rescheduleTask(id: string, dueAtIso: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ due_at: dueAtIso }).eq("id", id);
  if (error) throw error;

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/calendar");
}

export async function updateTaskDuration(id: string, durationMinutes: number | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ duration_minutes: durationMinutes }).eq("id", id);
  if (error) throw error;

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/calendar");
}

export async function toggleTaskDone(id: string, done: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: done ? "done" : "open" })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/calendar");
}

export async function toggleTopThree(id: string, isTopThree: boolean) {
  const supabase = await createClient();

  // Top three is a hard cap of three, not a suggestion — refuse a 4th star
  // outright rather than letting the list grow unbounded. Whichever three
  // got there first simply stay put until one is removed.
  if (isTopThree) {
    const { count, error: countError } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("is_top_three", true)
      .eq("status", "open");
    if (countError) throw countError;
    if ((count ?? 0) >= 3) {
      throw new Error("Top three is full — remove one before adding another.");
    }
  }

  const { error } = await supabase.from("tasks").update({ is_top_three: isTopThree }).eq("id", id);
  if (error) throw error;

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/calendar");
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/calendar");
}

export async function bulkSetStatus(ids: string[], status: "open" | "done") {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status }).in("id", ids);
  if (error) throw error;

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/calendar");
}

/** Sets which section a slip lives in — null returns it to the plain "Open"
 * section. Distinct from status: a stated task is still open, just grouped
 * under its own heading instead of "Open". */
export async function setTaskState(id: string, stateId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ state_id: stateId }).eq("id", id);
  if (error) throw error;

  revalidatePath("/tasks");
  revalidatePath("/today");
}

export async function createTaskState(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase.from("task_states").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const sortOrder = (existing?.[0]?.sort_order ?? -10) + 10;

  const { error } = await supabase.from("task_states").insert({ name, sort_order: sortOrder });
  if (error) throw error;

  revalidatePath("/tasks");
  revalidatePath("/today");
}

/** "Drop" a state — the state itself goes away; every task that was in it
 * falls back to null (plain "Open") via the column's own ON DELETE SET
 * NULL, not a separate update here. */
export async function deleteTaskState(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("task_states").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/tasks");
  revalidatePath("/today");
}
