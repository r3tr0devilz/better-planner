"use client";

import { useTransition } from "react";
import type { ChecklistItem } from "@/lib/supabase/types";

export function ChecklistItemRow({
  item,
  onToggle,
}: {
  item: ChecklistItem;
  onToggle: (itemId: string, done: boolean) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={item.done}
        disabled={pending}
        onChange={(e) => startTransition(() => onToggle(item.id, e.target.checked))}
        className="h-3.5 w-3.5 accent-moss"
      />
      <span className={item.done ? "text-ink-faint line-through" : "text-ink"}>{item.text}</span>
    </label>
  );
}
