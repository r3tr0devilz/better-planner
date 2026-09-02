"use client";

import { useCallback, useState, useTransition } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import { updateRoutine, setRoutineArchived, deleteRoutine } from "@/app/(app)/routines/actions";
import { burnRoutine, quenchRoutine } from "@/lib/burn-actions";
import { Modal } from "@/components/modal";
import { DeleteButton } from "@/components/delete-button";
import { Slip } from "@/components/slip";
import { useBurn } from "@/lib/use-burn";
import { scentForThread } from "@/lib/scent";
import type { Routine } from "@/lib/supabase/types";

export function RoutineRow({
  routine,
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
  // Routines carry no domain in this schema — the slip still gets a scent
  // (the "unassigned" one) and a neutral (grey) spine rather than inventing
  // a domain association that isn't there.
  const scent = scentForThread(-1);

  const burn = useBurn(
    routine.id,
    useCallback(() => startTransition(() => burnRoutine(routine.id)), [routine.id]),
    useCallback(() => startTransition(() => quenchRoutine(routine.id)), [routine.id]),
  );

  const historyMarks = (
    <span className="hist" title={`${history.filter((v) => v).length} of the last ${history.length} days`}>
      {history.map((v, i) => (
        <i key={i} data-d={v ? "1" : "0"} />
      ))}
    </span>
  );

  const streakBadge = streak > 0 && (
    <span className="shrink-0 border border-oxblood px-2 py-0.5 font-mono text-xs text-oxblood">{streak}d streak</span>
  );

  const editModal = editing && (
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
  );

  if (doneToday) {
    return (
      <div className="ledger-row flex items-center gap-3 px-1 py-3">
        <label className="-m-3.5 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            checked
            disabled={pending}
            onChange={() => startTransition(() => quenchRoutine(routine.id))}
            className="h-4 w-4 accent-moss"
            aria-label={`Mark "${routine.name}" not done today`}
          />
        </label>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
        >
          <p className="truncate text-sm text-ink-faint line-through">{routine.name}</p>
          <div className="mt-1.5 flex gap-0.5" aria-hidden>
            {history.map((v, i) => (
              <span key={i} className={`h-2.5 w-1.5 rounded-sm ${v === true ? "bg-moss" : "bg-line"}`} />
            ))}
          </div>
        </button>
        {streakBadge}
        <DeleteButton
          confirmMessage={`Delete "${routine.name}"? This also removes its completion history. This can't be undone.`}
          label=""
          pendingLabel=""
          ariaLabel={`Delete "${routine.name}"`}
          onDelete={deleteRoutine.bind(null, routine.id)}
          className="-m-3 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint/60 transition-colors duration-150 hover:text-vermillion"
          iconSize={14}
        />
        {editModal}
      </div>
    );
  }

  return (
    <Slip phase={burn.phase} slipRef={burn.elRef} threadIndex={-1}>
      <button
        type="button"
        onClick={burn.onPrimary}
        disabled={burn.disabled}
        aria-label={burn.phase === "char" ? `Put out "${routine.name}" — keeps it undone today` : `Complete "${routine.name}" today`}
        title={burn.phase === "char" ? "Put it out" : "Mark done"}
        className="slip-check"
      />
      <div className="relative min-w-0 flex-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left"
        >
          <p className="slip-text truncate text-sm text-ink">{routine.name}</p>
          <div className="slip-meta mt-1.5 flex items-center gap-2">
            {historyMarks}
            <span className="scent-tag" data-desc={scent.desc}>
              <span>{scent.mark}</span>
              {scent.name}
            </span>
          </div>
        </button>
        <span className="slip-hint">Press to put it out</span>
      </div>
      {streakBadge}
      <DeleteButton
        confirmMessage={`Delete "${routine.name}"? This also removes its completion history. This can't be undone.`}
        label=""
        pendingLabel=""
        ariaLabel={`Delete "${routine.name}"`}
        onDelete={deleteRoutine.bind(null, routine.id)}
        className="-m-3 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint/60 transition-colors duration-150 hover:text-vermillion"
        iconSize={14}
      />
      {editModal}
    </Slip>
  );
}

/** Kept alongside RoutineRow since it's the only place an archived routine
 * ever needs an "unarchive" control — the routines list itself never shows
 * archived routines (getRoutines filters them out). Archived routines read
 * as cold ash stubs: they keep their marks and never relight. */
export function ArchivedRoutineRow({ routine }: { routine: Routine }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="ledger-row flex items-center gap-3 px-1 py-3">
      <span className="ash-stub" data-sit="2" data-cold="1" />
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
