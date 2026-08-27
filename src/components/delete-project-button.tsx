"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteProjectButton({
  projectName,
  onDelete,
}: {
  projectName: string;
  onDelete: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Delete "${projectName}"? This also removes its milestones, checklists, and activity log. This can't be undone.`)) {
      return;
    }
    startTransition(() => onDelete());
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex shrink-0 items-center gap-1.5 text-xs text-ink-faint transition-colors duration-150 hover:text-vermillion"
    >
      <Trash2 size={13} />
      {pending ? "Deleting…" : "Delete project"}
    </button>
  );
}
