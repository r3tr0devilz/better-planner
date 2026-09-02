"use client";

import { useTransition } from "react";
import { setRemoved } from "@/app/(app)/inventory/actions";
import type { InventoryItem } from "@/lib/supabase/types";

export function InventoryRow({ item }: { item: InventoryItem }) {
  const [pending, startTransition] = useTransition();
  const removed = item.removed_at !== null;

  return (
    <div className="group flex items-center gap-3.5 border-b border-line py-2.5 text-sm">
      {removed && <span className="ash-stub" data-sit="1" data-cold="true" />}
      <div className="min-w-0 flex-1">
        <p className={removed ? "truncate text-ink-faint" : "truncate text-ink"}>{item.name}</p>
      </div>
      {item.location && (
        <span className="shrink-0 font-mono text-[10px] tracking-wide text-ink-faint">{item.location}</span>
      )}
      <button
        onClick={() => startTransition(() => setRemoved(item.id, !removed))}
        disabled={pending}
        className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-ink-faint opacity-0 transition-opacity duration-150 hover:text-ink group-hover:opacity-100"
      >
        {removed ? "Restore" : "Remove"}
      </button>
    </div>
  );
}
