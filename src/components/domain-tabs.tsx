import Link from "next/link";
import { THREAD_COUNT } from "@/lib/data/domains";
import type { Domain } from "@/lib/supabase/types";

/**
 * Physical binder-tab navigation, one per domain, cycling the same accent
 * set as thread-mark/card-flag. Desktop only — a fixed vertical strip has
 * nowhere sensible to go on a narrow viewport, so it just hides on mobile
 * rather than trying to collapse into something else.
 */
export function DomainTabs({ domains }: { domains: Domain[] }) {
  if (domains.length === 0) return null;

  return (
    <nav aria-label="Jump to a domain" className="hidden shrink-0 flex-col md:flex">
      {domains.map((domain, i) => (
        <Link key={domain.id} href={`/projects#domain-${domain.id}`} className="tab" data-thread={i % THREAD_COUNT}>
          {domain.name}
        </Link>
      ))}
    </nav>
  );
}
