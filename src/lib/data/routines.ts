import { createClient } from "@/lib/supabase/server";
import type { Routine, RoutineCompletion } from "@/lib/supabase/types";

export const HISTORY_DAYS = 14;

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export async function getRoutines(): Promise<Routine[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("archived", false)
    .order("time_of_day");
  if (error) throw error;
  return data;
}

/** Completions for the last HISTORY_DAYS, across all routines, keyed for lookup. */
export async function getRecentCompletions(): Promise<RoutineCompletion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("routine_completions")
    .select("*")
    .gte("date", daysAgoStr(HISTORY_DAYS - 1));
  if (error) throw error;
  return data;
}

/** Consecutive completed days ending today (or yesterday, so a not-yet-done today doesn't zero the streak). */
export function currentStreak(routineId: string, completions: RoutineCompletion[]): number {
  const byDate = new Map(
    completions.filter((c) => c.routine_id === routineId).map((c) => [c.date, c.completed]),
  );
  let streak = 0;
  const cursor = new Date();
  if (byDate.get(todayStr()) !== true) cursor.setDate(cursor.getDate() - 1);
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (byDate.get(key) !== true) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
