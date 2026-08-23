"use client";

import { useTransition } from "react";
import { setRemoved } from "@/app/(app)/inventory/actions";
import type { InventoryItem } from "@/lib/supabase/types";

export function InventoryRow({ item }: { item: InventoryItem }) {
  const [pending, startTransition] = useTransition();
  const removed = item.removed_at !== null;

  return (
    <div className="ledger-row flex items-center justify-between px-1 py-3 text-sm">
      <div>
        <p className={removed ? "text-ink-faint line-through" : "text-ink"}>{item.name}</p>
        {item.location && <p className="text-xs text-ink-faint">{item.location}</p>}
      </div>
      <button
        onClick={() => startTransition(() => setRemoved(item.id, !removed))}
        disabled={pending}
        className="border border-paper-line px-2 py-1 font-mono text-xs text-ink-faint hover:text-ink"
      >
        {removed ? "Restore" : "Remove"}
      </button>
    </div>
  );
}
