"use client";

import { useCallback, useTransition } from "react";
import { Slip } from "@/components/slip";
import { useBurn } from "@/lib/use-burn";
import type { ChecklistItem } from "@/lib/supabase/types";

export function ChecklistItemRow({
  item,
  onToggle,
}: {
  item: ChecklistItem;
  onToggle: (itemId: string, done: boolean) => Promise<void>;
}) {
  const [, startTransition] = useTransition();

  const burn = useBurn(
    item.id,
    useCallback(() => startTransition(() => onToggle(item.id, true)), [item.id, onToggle]),
    useCallback(() => startTransition(() => onToggle(item.id, false)), [item.id, onToggle]),
  );

  if (item.done) {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked
          onChange={() => startTransition(() => onToggle(item.id, false))}
          className="h-3.5 w-3.5 shrink-0 accent-moss"
        />
        <span className="min-w-0 text-ink-faint line-through [overflow-wrap:anywhere]">{item.text}</span>
      </label>
    );
  }

  return (
    <Slip phase={burn.phase} slipRef={burn.elRef} threadIndex={-1}>
      <button
        type="button"
        onClick={burn.onPrimary}
        disabled={burn.disabled}
        aria-label={burn.phase === "char" ? `Put out "${item.text}"` : `Complete "${item.text}"`}
        title={burn.phase === "char" ? "Put it out" : "Mark done"}
        className="slip-check"
        style={{ width: 15, height: 15 }}
      />
      <span className="slip-text min-w-0 flex-1 text-sm text-ink [overflow-wrap:anywhere]">{item.text}</span>
    </Slip>
  );
}
