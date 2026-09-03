import { createClient } from "@/lib/supabase/server";
import type { BurnEvent } from "@/lib/supabase/types";

/** Everything ever burned or put out, newest first — the Ash page keeps
 * these forever rather than pruning them. */
export async function getBurnEvents(): Promise<BurnEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("burn_events")
    .select("*")
    .order("occurred_at", { ascending: false });
  if (error) throw error;
  return data;
}

/** Burned-task count per domain over the last 7 days, queried server-side
 * rather than filtered from getBurnEvents()'s full unpruned history — this
 * runs on every page (AppShell's DomainTabs rail), not just Ash/Today, so it
 * stays a narrow, indexed-by-time query instead of pulling everything ever
 * burned on each navigation. */
export async function getBurnedThisWeek(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data, error } = await supabase
    .from("burn_events")
    .select("domain_id")
    .eq("outcome", "burned")
    .gte("occurred_at", weekAgo.toISOString());
  if (error) throw error;

  const result: Record<string, number> = {};
  for (const e of data) {
    if (!e.domain_id) continue;
    result[e.domain_id] = (result[e.domain_id] ?? 0) + 1;
  }
  return result;
}

function startOfWeek(): Date {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function weekStats(events: BurnEvent[]): { burned: number; quenched: number; longestSitMinutes: number } {
  const since = startOfWeek();
  const inWeek = events.filter((e) => new Date(e.occurred_at) >= since);
  const burned = inWeek.filter((e) => e.outcome === "burned").length;
  const quenched = inWeek.filter((e) => e.outcome === "put_out").length;
  const longestSitMinutes = inWeek.reduce((max, e) => Math.max(max, e.sat_minutes), 0);
  return { burned, quenched, longestSitMinutes };
}

/** "Stub length" bucket for the ash-stub visual — how long a slip sat before it burned. */
export function sitBucket(sitMinutes: number): 1 | 2 | 3 {
  if (sitMinutes < 60) return 1;
  if (sitMinutes < 60 * 24) return 2;
  return 3;
}

export function formatSitDuration(sitMinutes: number): string {
  if (sitMinutes < 60) return `${Math.max(1, Math.round(sitMinutes))}m`;
  if (sitMinutes < 60 * 24) return `${Math.round(sitMinutes / 60)}h`;
  return `${Math.round(sitMinutes / (60 * 24))}d`;
}
