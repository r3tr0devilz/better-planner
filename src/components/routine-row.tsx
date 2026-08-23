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
    <div className="glass flex items-center gap-3 rounded-xl px-4 py-3">
      <input
        type="checkbox"
        checked={doneToday}
        disabled={pending}
        onChange={(e) => startTransition(() => setCompletion(routine.id, today, e.target.checked))}
        className="h-4 w-4 shrink-0 accent-sage"
        aria-label={`Mark "${routine.name}" ${doneToday ? "not done" : "done"} today`}
      />

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm ${doneToday ? "text-mist-dim line-through" : "text-mist"}`}>
          {routine.name}
        </p>
        <div className="mt-1.5 flex gap-0.5" aria-hidden>
          {history.map((v, i) => (
            <span
              key={i}
              className={`h-3 w-1.5 rounded-sm ${
                v === true ? "bg-sage" : v === false ? "bg-white/10" : "bg-white/5"
              }`}
            />
          ))}
        </div>
      </div>

      {streak > 0 && (
        <span className="shrink-0 rounded-full bg-dawn/15 px-2 py-0.5 text-xs font-medium text-dawn">
          {streak}d streak
        </span>
      )}
    </div>
  );
}
