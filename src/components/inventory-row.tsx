"use client";

import { useTransition } from "react";
import { setRemoved } from "@/app/(app)/inventory/actions";
import type { InventoryItem } from "@/lib/supabase/types";

export function InventoryRow({ item }: { item: InventoryItem }) {
  const [pending, startTransition] = useTransition();
  const removed = item.removed_at !== null;

  return (
    <div className="ledger-row flex items-center justify-between gap-3 px-1 py-3 text-sm">
      <div className="min-w-0">
        <p className={`truncate transition-colors duration-150 ${removed ? "text-ink-faint line-through" : "text-ink"}`}>{item.name}</p>
        {item.location && <p className="truncate text-xs text-ink-faint">{item.location}</p>}
      </div>
      <button
        onClick={() => startTransition(() => setRemoved(item.id, !removed))}
        disabled={pending}
        className="btn-outline shrink-0 py-1 text-xs"
      >
        {removed ? "Restore" : "Remove"}
      </button>
    </div>
  );
}
