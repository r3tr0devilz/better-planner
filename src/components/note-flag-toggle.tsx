"use client";

import { useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleNoteFlag } from "@/app/(app)/library/actions";

export function NoteFlagToggle({ id, flagged }: { id: string; flagged: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleNoteFlag(id, !flagged))}
      disabled={pending}
      aria-label={flagged ? "Unflag for review" : "Flag for review"}
      aria-pressed={flagged}
      className={`shrink-0 transition-transform duration-150 active:scale-90 ${flagged ? "text-stamp-red" : "text-ink-faint hover:text-ink"}`}
    >
      <Bookmark size={14} fill={flagged ? "currentColor" : "none"} />
    </button>
  );
}
