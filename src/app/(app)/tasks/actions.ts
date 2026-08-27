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

export async function bulkDelete(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().in("id", ids);
  if (error) throw error;

  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/calendar");
}
