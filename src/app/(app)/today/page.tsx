import Link from "next/link";
import { ListTodo, Repeat } from "lucide-react";
import { getTopThree, getTasks } from "@/lib/data/tasks";
import { getDomains, threadIndexFor } from "@/lib/data/domains";
import { getRoutines, getRecentCompletions, todayStr } from "@/lib/data/routines";
import { getSlippingProjects } from "@/lib/data/projects";
import { getRecentNotifications } from "@/lib/data/notifications";
import { getDisplayName } from "@/lib/data/settings";
import { getGoogleCalendarStatus } from "@/lib/google-calendar";
import { TaskRow } from "@/components/task-row";
import { RoutineRow } from "@/components/routine-row";
import { DomainTabs } from "@/components/domain-tabs";
import { OpenCaptureButton } from "@/components/open-capture-button";
import { EmptyState } from "@/components/empty-state";

function greeting(name: string | null): string {
  const hour = new Date().getHours();
  const base = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${base}, ${name}` : base;
}

/** Masthead dateline — a real orientation device (what day is it), not
 * decoration, in the same mono "stamped ledger" voice the rest of the
 * system already uses for timestamps. */
function dateline(): string {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  return `${weekday} · ${monthDay}`.toUpperCase();
}

/** A second line under the greeting, in the ledger's own voice rather than
 * generic chat-assistant small talk — rotates once per calendar day (seeded
 * by date, not per render) so it reads as a deliberate daily line rather
 * than flickering on every reload. */
const DAILY_LINES = [
  "Let's see what's on the books today.",
  "New page, same handwriting — let's fill it in.",
  "Let's take stock of what's due.",
  "Nothing's crossed off yet. Let's fix that.",
  "The day's wide open — let's narrow it down.",
  "Another entry in the ledger. Let's see what's on it.",
  "Let's get today squared away.",
  "How are we doing today? Let's have a look.",
];

function dailyLine(): string {
  const seed = todayStr();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return DAILY_LINES[hash % DAILY_LINES.length];
}

const TONE_CLASS = { moss: "text-moss", vermillion: "text-vermillion", faint: "text-ink-faint" } as const;

export default async function TodayPage() {
  const [topThree, tasks, domains, routines, completions, slipping, notifications, displayName, calendarStatus] = await Promise.all([
    getTopThree(),
    getTasks(),
    getDomains(),
    getRoutines(),
    getRecentCompletions(),
    getSlippingProjects(),
    getRecentNotifications(),
    getDisplayName(),
    getGoogleCalendarStatus(),
  ]);

  const open = tasks.filter((t) => t.status === "open");
  const today = todayStr();
  const routinesDoneToday = routines.filter(
    (r) => completions.find((c) => c.routine_id === r.id && c.date === today)?.completed,
  ).length;

  const now = new Date();
  const overdueCount = open.filter((t) => t.due_at && new Date(t.due_at) < now).length;
  const topThreeRemaining = topThree.filter((t) => t.status !== "done").length;
  const routinesRemaining = routines.length - routinesDoneToday;

  const stats: { label: string; value: string; status: string | null; tone: keyof typeof TONE_CLASS }[] = [
    {
      label: "Top three",
      value: String(topThree.length),
      status: topThree.length === 0 ? null : topThreeRemaining > 0 ? `${topThreeRemaining} remaining` : "all done",
      tone: topThreeRemaining > 0 ? "faint" : "moss",
    },
    {
      label: "Open tasks",
      value: String(open.length),
      status: overdueCount > 0 ? `${overdueCount} overdue` : null,
      tone: "vermillion",
    },
    {
      label: "Routines done",
      value: `${routinesDoneToday}/${routines.length}`,
      status: routines.length === 0 ? null : routinesRemaining > 0 ? `${routinesRemaining} left today` : "all done",
      tone: routinesRemaining > 0 ? "faint" : "moss",
    },
  ];

  return (
    <div className="flex gap-6 md:-ml-8">
      <DomainTabs domains={domains} tasks={tasks} />

      <div className="mx-auto w-full min-w-0 max-w-5xl flex-1">
        <div className="border-b-[3px] border-ink pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-5xl font-black uppercase leading-none tracking-tight text-ink sm:text-6xl md:text-7xl">
                {greeting(displayName)}
              </h1>
              <p className="mt-2 text-sm text-ink-faint sm:text-base">{dailyLine()}</p>
            </div>
            <p className="shrink-0 pt-1 font-mono text-[11px] uppercase tracking-wide text-ink-faint">{dateline()}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          {stats.map((s) => (
            <div key={s.label} className="px-3 py-4 first:pl-0 sm:px-6">
              <div className="font-[family-name:var(--font-display)] text-3xl font-black leading-none text-ink sm:text-4xl md:text-5xl">
                {s.value}
              </div>
              <div className="mt-1.5 font-mono text-[0.6rem] uppercase leading-tight tracking-wide text-ink-faint sm:text-[0.65rem]">
                {s.label}
              </div>
              {s.status && (
                <div className={`mt-0.5 font-mono text-[0.6rem] uppercase leading-tight tracking-wide sm:text-[0.65rem] ${TONE_CLASS[s.tone]}`}>
                  {s.status}
                </div>
              )}
            </div>
          ))}
        </div>

        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink-faint">Top three today</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {topThree.map((task) => {
              const threadIndex = threadIndexFor(task.domain_id, domains);
              return (
                <div key={task.id} className="card p-4">
                  <TaskRow task={task} threadIndex={threadIndex} domains={domains} />
                </div>
              );
            })}
            {topThree.length === 0 && (
              <p className="card col-span-full p-4 text-sm text-ink-faint">
                Star a task on the Tasks page to pin your top three here.
              </p>
            )}
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="text-sm font-medium text-ink-faint">Open tasks ({open.length})</h2>
              {open.length === 0 ? (
                <div className="mt-3">
                  <EmptyState icon={ListTodo} message="Nothing open — nice." />
                </div>
              ) : (
                <div className="ledger mt-3">
                  {open.slice(0, 8).map((task) => (
                    <TaskRow key={task.id} task={task} threadIndex={threadIndexFor(task.domain_id, domains)} domains={domains} />
                  ))}
                </div>
              )}
              {open.length > 8 && (
                <Link href="/tasks" className="mt-2 inline-block text-xs font-semibold text-oxblood hover:underline">
                  View all {open.length} →
                </Link>
              )}
            </section>

            <section>
              <h2 className="text-sm font-medium text-ink-faint">Routine checklist</h2>
              {routines.length === 0 ? (
                <div className="mt-3">
                  <EmptyState icon={Repeat} message="No routines set up yet." />
                </div>
              ) : (
                <div className="ledger mt-3">
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
                </div>
              )}
            </section>
          </div>

          <div className="flex flex-col gap-8">
            <section className="card p-4">
              <h2 className="text-sm font-medium text-ink-faint">Calendar</h2>
              <p className="mt-2 text-xs text-ink-faint">
                {calendarStatus.connected ? "Google Calendar is connected." : "Google Calendar sync isn't connected yet."}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {calendarStatus.connected ? (
                  <Link href="/settings" className="btn-outline px-3 py-1.5 text-xs">
                    Manage calendar
                  </Link>
                ) : (
                  <a href="/api/auth/google" className="btn-outline px-3 py-1.5 text-xs">
                    Connect calendar
                  </a>
                )}
                <Link href="/calendar" className="text-xs font-semibold text-oxblood hover:underline">
                  View calendar →
                </Link>
              </div>
            </section>

            {slipping.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-ink-faint">Needs a look</h2>
                <div className="mt-3 flex flex-col gap-2">
                  {slipping.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="hoverable card block px-4 py-3 text-sm text-ink hover:bg-stone"
                    >
                      <span className="[overflow-wrap:anywhere]">{project.name}</span>
                      <span className="ml-2 text-xs font-semibold text-vermillion">no activity in 7+ days</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-sm font-medium text-ink-faint">Recent activity</h2>
              <div className="mt-3 flex flex-col gap-2">
                {notifications.map((n) => (
                  <div key={n.id} className="card px-4 py-2.5 text-xs text-ink-faint">
                    {n.message}
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="card p-4">
                    <p className="text-sm text-ink-faint">Nothing captured yet.</p>
                    <OpenCaptureButton />
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
