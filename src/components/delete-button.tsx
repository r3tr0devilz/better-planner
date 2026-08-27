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
  skipConfirm = false,
}: {
  confirmMessage: string;
  onDelete: () => Promise<void>;
  label?: string;
  pendingLabel?: string;
  /** Required when `label` is empty (icon-only) so the button still has an accessible name. */
  ariaLabel?: string;
  className?: string;
  iconSize?: number;
  /** Skip the native confirm() — only for callers that already give the user
   * a real way back out, e.g. an undo toast. A blocking dialog and an undo
   * safety net are redundant friction stacked on top of each other; pick one. */
  skipConfirm?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!skipConfirm && !confirm(confirmMessage)) return;
    startTransition(() => onDelete());
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-label={ariaLabel}
      title={label ? undefined : (ariaLabel ?? "Delete")}
      className={className}
    >
      <Trash2 size={iconSize} />
      {pending ? pendingLabel : label}
    </button>
  );
}
