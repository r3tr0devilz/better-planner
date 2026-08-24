import type { Domain } from "@/lib/supabase/types";

export const THREAD_COUNT = 6;

/** Stable thread index per domain so its color stays consistent everywhere it appears. */
export function threadIndexFor(domainId: string | null, domains: Domain[]): number {
  if (!domainId) return -1;
  const i = domains.findIndex((d) => d.id === domainId);
  return i === -1 ? -1 : i % THREAD_COUNT;
}
