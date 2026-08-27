"use client";

import { useCallback, useState, useTransition } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { setCompletion, updateRoutine, setRoutineArchived, deleteRoutine } from "@/app/(app)/routines/actions";
import { Modal } from "@/components/modal";
import { DeleteButton } from "@/components/delete-button";
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
  const [editing, setEditing] = useState(false);
  const close = useCallback(() => setEditing(false), []);

  return (
    <div className="ledger-row flex items-center gap-3 px-1 py-3">
      <label className="-m-3.5 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          checked={doneToday}
          disabled={pending}
          onChange={(e) => startTransition(() => setCompletion(routine.id, today, e.target.checked))}
          className="h-4 w-4 accent-moss"
          aria-label={`Mark "${routine.name}" ${doneToday ? "not done" : "done"} today`}
        />
      </label>

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
      >
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
      </button>

      <DeleteButton
        confirmMessage={`Delete "${routine.name}"? This also removes its completion history. This can't be undone.`}
        label=""
        pendingLabel=""
        ariaLabel={`Delete "${routine.name}"`}
        onDelete={deleteRoutine.bind(null, routine.id)}
        className="-m-3 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint/60 transition-colors duration-150 hover:text-vermillion"
        iconSize={14}
      />

      {streak > 0 && (
        <span className="shrink-0 border border-oxblood px-2 py-0.5 font-mono text-xs text-oxblood">
          {streak}d streak
        </span>
      )}

      {editing && (
        <Modal onClose={close} title="Edit routine">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              startTransition(() => updateRoutine(routine.id, formData));
              close();
            }}
            className="mt-4 flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
              Name
              <input name="name" defaultValue={routine.name} required className="field" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
              Time of day
              <select name="time_of_day" defaultValue={routine.time_of_day} className="field">
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </label>
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <DeleteButton
                  confirmMessage={`Delete "${routine.name}"? This also removes its completion history. This can't be undone.`}
                  onDelete={() => {
                    close();
                    return deleteRoutine(routine.id);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    close();
                    startTransition(() => setRoutineArchived(routine.id, true));
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 text-xs text-ink-faint transition-colors duration-150 hover:text-ink"
                >
                  <Archive size={13} />
                  Archive
                </button>
              </div>
              <button type="submit" className="btn">
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/** Kept alongside RoutineRow since it's the only place an archived routine
 * ever needs an "unarchive" control — the routines list itself never shows
 * archived routines (getRoutines filters them out). */
export function ArchivedRoutineRow({ routine }: { routine: Routine }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="ledger-row flex items-center justify-between gap-3 px-1 py-3">
      <span className="min-w-0 flex-1 truncate text-sm text-ink-faint">{routine.name}</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => setRoutineArchived(routine.id, false))}
        className="inline-flex shrink-0 items-center gap-1.5 text-xs text-ink-faint transition-colors duration-150 hover:text-ink"
      >
        <ArchiveRestore size={13} />
        Restore
      </button>
    </div>
  );
}
