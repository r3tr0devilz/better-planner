"use server";

// Incense Ledger: the real mutations behind the tear → burn → char (undo
// hold) → ash sequence. "Burn" and "quench" both write a permanent
// burn_events row (see supabase/migrations/0009_burn_events.sql) — that's
// the Ash page's data, independent of whatever the source task/routine ends
// up doing next (edited, deleted, reopened).

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayStr } from "@/lib/data/routines";

function minutesSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

async function insertBurnEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    itemType: "task" | "routine" | "checklist_item";
    itemId: string;
    title: string;
    domainId: string | null;
    outcome: "burned" | "put_out";
    satMinutes: number;
  },
) {
  const { error } = await supabase.from("burn_events").insert({
    item_type: params.itemType,
    item_id: params.itemId,
    title: params.title,
    domain_id: params.domainId,
    outcome: params.outcome,
    sat_minutes: params.satMinutes,
  });
  if (error) throw error;
}

function revalidateBurnPaths() {
  revalidatePath("/tasks");
  revalidatePath("/today");
  revalidatePath("/routines");
  revalidatePath("/projects");
  revalidatePath("/calendar");
  revalidatePath("/ash");
}

export async function burnTask(id: string) {
  const supabase = await createClient();
  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("title, domain_id, created_at")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase.from("tasks").update({ status: "done" }).eq("id", id);
  if (error) throw error;

  await insertBurnEvent(supabase, {
    itemType: "task",
    itemId: id,
    title: task.title,
    domainId: task.domain_id,
    outcome: "burned",
    satMinutes: minutesSince(task.created_at),
  });
  revalidateBurnPaths();
}

export async function quenchTask(id: string) {
  const supabase = await createClient();
  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("title, domain_id, created_at")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase.from("tasks").update({ status: "open" }).eq("id", id);
  if (error) throw error;

  await insertBurnEvent(supabase, {
    itemType: "task",
    itemId: id,
    title: task.title,
    domainId: task.domain_id,
    outcome: "put_out",
    satMinutes: minutesSince(task.created_at),
  });
  revalidateBurnPaths();
}

export async function burnRoutine(id: string) {
  const supabase = await createClient();
  const { data: routine, error: fetchError } = await supabase
    .from("routines")
    .select("name, created_at")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("routine_completions")
    .upsert({ routine_id: id, date: todayStr(), completed: true }, { onConflict: "routine_id,date" });
  if (error) throw error;

  await insertBurnEvent(supabase, {
    itemType: "routine",
    itemId: id,
    title: routine.name,
    domainId: null,
    outcome: "burned",
    satMinutes: minutesSince(routine.created_at),
  });
  revalidateBurnPaths();
}

export async function quenchRoutine(id: string) {
  const supabase = await createClient();
  const { data: routine, error: fetchError } = await supabase
    .from("routines")
    .select("name, created_at")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("routine_completions")
    .upsert({ routine_id: id, date: todayStr(), completed: false }, { onConflict: "routine_id,date" });
  if (error) throw error;

  await insertBurnEvent(supabase, {
    itemType: "routine",
    itemId: id,
    title: routine.name,
    domainId: null,
    outcome: "put_out",
    satMinutes: minutesSince(routine.created_at),
  });
  revalidateBurnPaths();
}

export async function burnChecklistItem(id: string, domainId: string | null) {
  const supabase = await createClient();
  const { data: item, error: fetchError } = await supabase
    .from("checklist_items")
    .select("text")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase.from("checklist_items").update({ done: true }).eq("id", id);
  if (error) throw error;

  await insertBurnEvent(supabase, {
    itemType: "checklist_item",
    itemId: id,
    title: item.text,
    domainId,
    outcome: "burned",
    satMinutes: 0,
  });
  revalidateBurnPaths();
}

export async function quenchChecklistItem(id: string, domainId: string | null) {
  const supabase = await createClient();
  const { data: item, error: fetchError } = await supabase
    .from("checklist_items")
    .select("text")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase.from("checklist_items").update({ done: false }).eq("id", id);
  if (error) throw error;

  await insertBurnEvent(supabase, {
    itemType: "checklist_item",
    itemId: id,
    title: item.text,
    domainId,
    outcome: "put_out",
    satMinutes: 0,
  });
  revalidateBurnPaths();
}
