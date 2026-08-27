"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

/** Generic confirm-then-delete button used across every entity that can be
 * hard-deleted (projects, tasks, routines, people, library items, career
 * records) — one confirm+pending+icon implementation instead of one per page. */
export function DeleteButton({
  confirmMessage,
  onDelete,
  label = "Delete",
  pendingLabel = "Deleting…",
  ariaLabel,
  className = "inline-flex shrink-0 items-center gap-1.5 text-xs text-ink-faint transition-colors duration-150 hover:text-vermillion",
  iconSize = 13,
}: {
  confirmMessage: string;
  onDelete: () => Promise<void>;
  label?: string;
  pendingLabel?: string;
  /** Required when `label` is empty (icon-only) so the button still has an accessible name. */
  ariaLabel?: string;
  className?: string;
  iconSize?: number;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    startTransition(() => onDelete());
  }

  return (
    <button onClick={handleClick} disabled={pending} aria-label={ariaLabel} className={className}>
      <Trash2 size={iconSize} />
      {pending ? pendingLabel : label}
    </button>
  );
}
