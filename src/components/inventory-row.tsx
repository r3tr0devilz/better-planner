"use client";

import { useCallback, useState, useTransition } from "react";
import { setRemoved, updateItem, deleteItem } from "@/app/(app)/inventory/actions";
import { DocketPanel, DocketFacts } from "@/components/docket-panel";
import type { InventoryItem } from "@/lib/supabase/types";

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function InventoryRow({ item }: { item: InventoryItem }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const removed = item.removed_at !== null;

  return (
    <div className="group flex items-center gap-3.5 border-b border-line py-2.5 text-sm">
      {removed && <span className="ash-stub" data-sit="1" data-cold="true" />}
      <button type="button" onClick={() => setOpen(true)} className="block min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left">
        <p className={removed ? "truncate text-ink-faint" : "truncate text-ink"}>{item.name}</p>
      </button>
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

      {open && (
        <DocketPanel onClose={close} spineLabel={item.name} spineKind={removed ? "Removed item" : "Item"}>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.09em] text-[#8d887c]">
            {removed ? `Removed ${formatDate(item.removed_at!)}` : `Added ${formatDate(item.added_at)}`}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              startTransition(() => updateItem(item.id, formData));
              close();
            }}
          >
            <DocketFacts
              facts={[
                { label: "Name", value: <input name="name" defaultValue={item.name} required className="cap-field" style={{ padding: "0.25rem 0.45rem", fontSize: "0.8125rem" }} /> },
                { label: "Location", value: <input name="location" defaultValue={item.location ?? ""} className="cap-field" style={{ padding: "0.25rem 0.45rem", fontSize: "0.8125rem" }} /> },
              ]}
            />
            <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5">
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    close();
                    startTransition(() => deleteItem(item.id));
                  }}
                  className="btn-quiet"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    startTransition(() => setRemoved(item.id, !removed));
                    close();
                  }}
                  className="btn-quiet"
                >
                  {removed ? "Restore" : "Remove"}
                </button>
              </span>
              <span className="flex gap-2">
                <button type="button" onClick={close} className="btn-quiet">
                  Close
                </button>
                <button type="submit" className="btn-ink">
                  Save
                </button>
              </span>
            </div>
          </form>
        </DocketPanel>
      )}
    </div>
  );
}
