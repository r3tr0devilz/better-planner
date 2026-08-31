import { Repeat } from "lucide-react";
import { getRoutines, getArchivedRoutines, getRecentCompletions, currentStreak, todayStr, HISTORY_DAYS } from "@/lib/data/routines";
import { RoutineRow, ArchivedRoutineRow } from "@/components/routine-row";
import { PageHeader } from "@/components/page-header";
import { CollapsibleForm } from "@/components/collapsible-form";
import { SubmitButton } from "@/components/submit-button";
import { EmptyState } from "@/components/empty-state";
import { createRoutine } from "./actions";
import type { Routine } from "@/lib/supabase/types";

const SECTIONS: { key: Routine["time_of_day"]; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
  { key: "anytime", label: "Anytime" },
];

function historyFor(routineId: string, completions: Awaited<ReturnType<typeof getRecentCompletions>>) {
  const byDate = new Map(
    completions.filter((c) => c.routine_id === routineId).map((c) => [c.date, c.completed]),
  );
  const days: (boolean | undefined)[] = [];
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(byDate.get(d.toISOString().slice(0, 10)));
  }
  return days;
}

export default async function RoutinesPage() {
  const [routines, archivedRoutines, completions] = await Promise.all([
    getRoutines(),
    getArchivedRoutines(),
    getRecentCompletions(),
  ]);
  const today = todayStr();
  const doneToday = routines.filter(
    (r) => completions.find((c) => c.routine_id === r.id && c.date === today)?.completed,
  ).length;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Routines" context={`${doneToday}/${routines.length} done today`} />

      <CollapsibleForm action={createRoutine} triggerLabel="New routine">
        <label className="field-wide">
          New routine
          <input name="name" required placeholder="Take vitamins, check email…" className="field" />
        </label>
        <label>
          Time of day
          <select name="time_of_day" defaultValue="anytime" className="field">
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="anytime">Anytime</option>
          </select>
        </label>
        <label>
          Mode
          <select name="mode" defaultValue="ongoing" className="field">
            <option value="ongoing">Ongoing streak</option>
            <option value="fixed_days">Fixed number of days</option>
          </select>
        </label>
        <label className="field-narrow">
          Days (if fixed)
          <input type="number" name="total_days" min={1} placeholder="30" className="field" />
        </label>
        <SubmitButton>Add</SubmitButton>
      </CollapsibleForm>

      {SECTIONS.map(({ key, label }) => {
        const items = routines.filter((r) => r.time_of_day === key);
        if (items.length === 0) return null;
        return (
          <section key={key} className="mt-8">
            <h2 className="text-sm font-medium text-ink-faint">{label}</h2>
            <div className="ledger mt-3">
              {items.map((routine) => (
                <RoutineRow
                  key={routine.id}
                  routine={routine}
                  today={today}
                  doneToday={
                    completions.find((c) => c.routine_id === routine.id && c.date === today)?.completed ?? false
                  }
                  streak={currentStreak(routine.id, completions)}
                  history={historyFor(routine.id, completions)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {routines.length === 0 && (
        <div className="mt-8">
          <EmptyState icon={Repeat} message="No routines yet — add one above to start a streak." />
        </div>
      )}

      {archivedRoutines.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink-faint">Archived</h2>
          <div className="ledger mt-3">
            {archivedRoutines.map((routine) => (
              <ArchivedRoutineRow key={routine.id} routine={routine} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
