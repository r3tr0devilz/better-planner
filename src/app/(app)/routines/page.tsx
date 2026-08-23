import { getRoutines, getRecentCompletions, currentStreak, todayStr, HISTORY_DAYS } from "@/lib/data/routines";
import { RoutineRow } from "@/components/routine-row";
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
  const [routines, completions] = await Promise.all([getRoutines(), getRecentCompletions()]);
  const today = todayStr();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-mist">Routines</h1>

      <form action={createRoutine} className="glass mt-6 flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-xs text-mist-dim">
          New routine
          <input
            name="name"
            required
            placeholder="Take vitamins, check email…"
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-mist outline-none focus-visible:ring-2 focus-visible:ring-dusk"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-mist-dim">
          Time of day
          <select
            name="time_of_day"
            defaultValue="anytime"
            className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-mist outline-none"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="anytime">Anytime</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-mist-dim">
          Mode
          <select
            name="mode"
            defaultValue="ongoing"
            className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-mist outline-none"
          >
            <option value="ongoing">Ongoing streak</option>
            <option value="fixed_days">Fixed number of days</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-mist-dim">
          Days (if fixed)
          <input
            type="number"
            name="total_days"
            min={1}
            placeholder="30"
            className="w-20 rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-mist outline-none"
          />
        </label>
        <button type="submit" className="rounded-lg bg-dawn px-4 py-2 text-sm font-medium text-ink">
          Add
        </button>
      </form>

      {SECTIONS.map(({ key, label }) => {
        const items = routines.filter((r) => r.time_of_day === key);
        if (items.length === 0) return null;
        return (
          <section key={key} className="mt-8">
            <h2 className="text-sm font-medium text-mist-dim">{label}</h2>
            <div className="mt-3 flex flex-col gap-2">
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
        <p className="mt-8 text-sm text-mist-dim">No routines yet — add one above.</p>
      )}
    </div>
  );
}
