"use client";

import { Search } from "lucide-react";
import { THREAD_COUNT } from "@/lib/domain-threads";
import type { Domain } from "@/lib/supabase/types";

/** Search + optional domain filter, shared across every list page. Domain
 * chips reuse the exact pill styling already proven on the Career mobile
 * stage-picker (`kanban-board.tsx`) rather than inventing a new primitive. */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  domains,
  activeDomainId,
  onDomainChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  domains?: Domain[];
  activeDomainId?: string | null;
  onDomainChange?: (id: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="relative block">
        <span className="sr-only">{searchPlaceholder}</span>
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="field w-full pl-9"
        />
      </label>

      {domains && domains.length > 0 && onDomainChange && (
        <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter by domain">
          <button
            type="button"
            onClick={() => onDomainChange(null)}
            aria-pressed={activeDomainId == null}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors duration-150 ${
              activeDomainId == null ? "border-oxblood bg-oxblood text-panel" : "border-line bg-panel text-ink-faint"
            }`}
          >
            All
          </button>
          {domains.map((d, i) => {
            const active = activeDomainId === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onDomainChange(active ? null : d.id)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors duration-150 ${
                  active ? "border-oxblood bg-oxblood text-panel" : "border-line bg-panel text-ink-faint"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: active ? "var(--color-panel)" : `var(--color-${["cobalt", "vermillion", "moss", "mustard", "plum", "teal"][i % THREAD_COUNT]})` }}
                  aria-hidden
                />
                {d.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
