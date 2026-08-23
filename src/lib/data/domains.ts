import { createClient } from "@/lib/supabase/server";
import type { Domain } from "@/lib/supabase/types";

export const THREAD_COUNT = 6;

export async function getDomains(): Promise<Domain[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("domains").select("*").order("name");
  if (error) throw error;
  return data;
}

/** Stable thread index per domain so its color stays consistent everywhere it appears. */
export function threadIndexFor(domainId: string | null, domains: Domain[]): number {
  if (!domainId) return -1;
  const i = domains.findIndex((d) => d.id === domainId);
  return i === -1 ? -1 : i % THREAD_COUNT;
}
