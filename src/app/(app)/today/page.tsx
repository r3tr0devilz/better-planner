import Link from "next/link";
import { getTopThree, getTasks } from "@/lib/data/tasks";
import { getDomains, threadIndexFor } from "@/lib/data/domains";
import { getRoutines, getRecentCompletions, todayStr } from "@/lib/data/routines";
import { getSlippingProjects } from "@/lib/data/projects";
import { getRecentNotifications } from "@/lib/data/notifications";
import { TaskRow } from "@/components/task-row";
import { RoutineRow } from "@/components/routine-row";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function TodayPage() {
  const [topThree, tasks, domains, routines, completions, slipping, notifications] = await Promise.all([
    getTopThree(),
    getTasks(),
    getDomains(),
    getRoutines(),
    getRecentCompletions(),
    getSlippingProjects(),
    getRecentNotifications(),
  ]);

  const open = tasks.filter((t) => t.status === "open");
  const today = todayStr();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-[family-name:var(--font-display)] text-4xl italic text-mist">{greeting()}</h1>

      <section className="mt-6">
        <h2 className="text-sm font-medium text-mist-dim">Top three today</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {topThree.map((task) => (
            <div
              key={task.id}
              data-thread={
                threadIndexFor(task.domain_id, domains) >= 0 ? threadIndexFor(task.domain_id, domains) : undefined
              }
              className="thread-edge glass-strong rounded-2xl p-4"
            >
              <TaskRow task={task} threadIndex={-1} />
            </div>
          ))}
          {topThree.length === 0 && (
            <p className="glass col-span-full rounded-xl p-4 text-sm text-mist-dim">
              Star a task on the Tasks page to pin your top three here.
            </p>
          )}
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-sm font-medium text-mist-dim">Open tasks ({open.length})</h2>
            <div className="mt-3 flex flex-col gap-2">
              {open.slice(0, 8).map((task) => (
                <TaskRow key={task.id} task={task} threadIndex={threadIndexFor(task.domain_id, domains)} />
              ))}
              {open.length === 0 && <p className="text-sm text-mist-dim">Nothing open — nice.</p>}
            </div>
            {open.length > 8 && (
              <Link href="/tasks" className="mt-2 inline-block text-xs text-dusk hover:underline">
                View all {open.length} →
              </Link>
            )}
          </section>

          <section>
            <h2 className="text-sm font-medium text-mist-dim">Routine checklist</h2>
            <div className="mt-3 flex flex-col gap-2">
              {routines.map((routine) => (
                <RoutineRow
                  key={routine.id}
                  routine={routine}
                  today={today}
                  doneToday={
                    completions.find((c) => c.routine_id === routine.id && c.date === today)?.completed ?? false
                  }
                  streak={0}
                  history={[]}
                />
              ))}
              {routines.length === 0 && <p className="text-sm text-mist-dim">No routines set up yet.</p>}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-8">
          <section className="glass rounded-xl p-4">
            <h2 className="text-sm font-medium text-mist-dim">Calendar</h2>
            <p className="mt-2 text-xs text-mist-dim">
              Google Calendar sync isn&apos;t connected yet — set it up from Settings.
            </p>
          </section>

          {slipping.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-mist-dim">Needs a look</h2>
              <div className="mt-3 flex flex-col gap-2">
                {slipping.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="glass block rounded-xl px-4 py-3 text-sm text-mist hover:bg-white/[0.07]"
                  >
                    {project.name}
                    <span className="ml-2 text-xs text-coral">no activity in 7+ days</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-sm font-medium text-mist-dim">Recent activity</h2>
            <div className="mt-3 flex flex-col gap-2">
              {notifications.map((n) => (
                <div key={n.id} className="glass rounded-xl px-4 py-2.5 text-xs text-mist-dim">
                  {n.message}
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-mist-dim">Nothing captured yet — try ⌘J.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
