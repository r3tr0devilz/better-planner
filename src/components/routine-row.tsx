"use client";

import { useTransition } from "react";
import { setCompletion } from "@/app/(app)/routines/actions";
import type { Routine } from "@/lib/supabase/types";

export function RoutineRow({
  routine,
  today,
  doneToday,
  streak,
  history,
}: {
  routine: Routine;
  today: string;
  doneToday: boolean;
  streak: number;
  /** true/false/undefined per day, oldest first */
  history: (boolean | undefined)[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="ledger-row flex items-center gap-3 px-1 py-3">
      <input
        type="checkbox"
        checked={doneToday}
        disabled={pending}
        onChange={(e) => startTransition(() => setCompletion(routine.id, today, e.target.checked))}
        className="h-4 w-4 shrink-0 accent-moss"
        aria-label={`Mark "${routine.name}" ${doneToday ? "not done" : "done"} today`}
      />

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm transition-colors duration-150 ${doneToday ? "text-ink-faint line-through" : "text-ink"}`}>
          {routine.name}
        </p>
        <div className="mt-1.5 flex gap-0.5" aria-hidden>
          {history.map((v, i) => (
            <span
              key={i}
              className={`h-2.5 w-1.5 rounded-sm transition-colors duration-150 ${
                v === true ? "bg-moss" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>

      {streak > 0 && (
        <span className="shrink-0 border border-cobalt px-2 py-0.5 font-mono text-xs text-cobalt">
          {streak}d streak
        </span>
      )}
    </div>
  );
}
