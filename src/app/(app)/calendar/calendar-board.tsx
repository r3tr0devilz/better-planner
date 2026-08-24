"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { rescheduleTask } from "@/app/(app)/tasks/actions";
import { TaskRow } from "@/components/task-row";
import { threadIndexFor } from "@/lib/domain-threads";
import type { Domain, Task } from "@/lib/supabase/types";
import { NowLine } from "./now-line";
import { ROW_HEIGHT } from "./constants";
import {
  WEEKDAYS,
  WEEKDAY_LONG,
  HOURS,
  monthLabel,
  buildWeeks,
  isSameDate,
  dayKey,
  parseDayKey,
  addDays,
  monthHref,
  dayHref,
  formatTime,
  formatHour,
} from "./lib";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

function DraggableTask({ task, threadIndex, domains }: { task: Task; threadIndex: number; domains: Domain[] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id, data: { task } });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`transition-[opacity,transform] duration-150 ease-out ${isDragging ? "scale-[0.97] opacity-40" : ""}`}
    >
      <TaskRow task={task} threadIndex={threadIndex} domains={domains} />
    </div>
  );
}

function MonthAgendaRow({
  date,
  tasks,
  domains,
  isToday,
}: {
  date: Date;
  tasks: Task[];
  domains: Domain[];
  isToday: boolean;
}) {
  const key = dayKey(date);
  const { setNodeRef, isOver } = useDroppable({ id: `day:${key}` });

  return (
    <div
      ref={setNodeRef}
      id={`day-${key}`}
      className={`flex gap-4 rounded-md border-b border-line px-2 py-5 transition-colors duration-150 first:pt-0 scroll-mt-20 ${isOver ? "bg-oxblood/10" : ""}`}
    >
      <div className="w-16 shrink-0 text-center">
        <div className="font-[family-name:var(--font-display)] text-4xl font-black leading-none text-ink">
          {String(date.getDate()).padStart(2, "0")}
        </div>
        <div className={`mt-1 font-mono text-[0.65rem] uppercase tracking-wide ${isToday ? "font-bold text-oxblood" : "text-ink-faint"}`}>
          {WEEKDAY_LONG[date.getDay()]}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {tasks.length === 0 && <p className="py-2 text-sm text-ink-faint">Nothing scheduled.</p>}
        {tasks.map((task) => {
          const threadIndex = threadIndexFor(task.domain_id, domains);
          return (
            <div key={task.id} className="day-card" data-thread={threadIndex >= 0 ? threadIndex : undefined}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-ink-faint">{task.due_at && formatTime(task.due_at)}</span>
                {task.priority === "high" && <span className="text-[0.65rem] font-semibold text-vermillion">High</span>}
              </div>
              <p className={`mt-0.5 truncate text-sm ${task.status === "done" ? "text-ink-faint line-through" : "text-ink"}`}>
                {task.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayHourRow({ hour, dateKey: key }: { hour: number; dateKey: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: `hour:${key}:${hour}` });
  return (
    <div
      ref={setNodeRef}
      className={`absolute inset-x-0 transition-colors duration-150 ${isOver ? "bg-oxblood/10" : ""}`}
      style={{ top: hour * ROW_HEIGHT, height: ROW_HEIGHT }}
    >
      <span className="absolute left-0 top-0 w-14 -translate-y-2 pr-2 text-right font-mono text-[0.65rem] text-ink-faint">
        {formatHour(hour)}
      </span>
      <div className="absolute bottom-0 border-t border-line" style={{ left: 61, right: 0 }} />
    </div>
  );
}

export function CalendarBoard({
  view,
  year,
  monthIndex,
  selectedDateKey,
  todayKey,
  tasks: initialTasks,
  domains,
}: {
  view: "month" | "day";
  year: number;
  monthIndex: number;
  selectedDateKey: string;
  todayKey: string;
  tasks: Task[];
  domains: Domain[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const today = parseDayKey(todayKey);
  const selectedDate = parseDayKey(selectedDateKey);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const weeks = useMemo(() => buildWeeks(year, monthIndex), [year, monthIndex]);

  const days = useMemo(() => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => new Date(year, monthIndex, i + 1));
  }, [year, monthIndex]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const day of days) map.set(dayKey(day), []);
    for (const t of tasks) {
      if (!t.due_at) continue;
      const key = dayKey(new Date(t.due_at));
      if (map.has(key)) map.get(key)!.push(t);
    }
    return map;
  }, [days, tasks]);

  const monthTasks = useMemo(
    () => tasks.filter((t) => t.due_at && tasksByDay.has(dayKey(new Date(t.due_at)))),
    [tasks, tasksByDay],
  );
  const selectedDayTasks = tasksByDay.get(selectedDateKey) ?? [];
  const sidebarTasks = view === "month" ? monthTasks : selectedDayTasks;

  function handleDragStart(event: DragStartEvent) {
    setActiveTask((event.active.data.current?.task as Task) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const task = active.data.current?.task as Task | undefined;
    if (!task) return;

    const overId = String(over.id);
    let newDueAt: string;

    if (overId.startsWith("day:")) {
      const target = parseDayKey(overId.slice(4));
      const prev = task.due_at ? new Date(task.due_at) : null;
      newDueAt = new Date(
        target.getFullYear(),
        target.getMonth(),
        target.getDate(),
        prev ? prev.getHours() : 9,
        prev ? prev.getMinutes() : 0,
      ).toISOString();
    } else if (overId.startsWith("hour:")) {
      const [, dateKeyPart, hourPart] = overId.split(":");
      const target = parseDayKey(dateKeyPart);
      newDueAt = new Date(target.getFullYear(), target.getMonth(), target.getDate(), Number(hourPart), 0).toISOString();
    } else {
      return;
    }

    if (task.due_at === newDueAt) return;

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, due_at: newDueAt } : t)));
    startTransition(() => {
      rescheduleTask(task.id, newDueAt).then(() => router.refresh());
    });
  }

  const activeThreadIndex = activeTask ? threadIndexFor(activeTask.domain_id, domains) : -1;

  return (
    <DndContext id="calendar-dnd" sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-64">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-ink">
            Calendar
          </h1>
          <p className="mt-1 text-xs text-ink-faint">
            Google Calendar isn&apos;t connected —{" "}
            <Link href="/settings" className="underline hover:text-ink">
              connect it
            </Link>
            .
          </p>

          <div className="mt-4 flex gap-1 rounded-lg border border-line bg-stone p-1">
            <Link
              href={monthHref("month", year, monthIndex)}
              className={`flex-1 rounded-md px-2 py-1 text-center text-xs font-medium transition-colors ${view === "month" ? "bg-panel text-ink" : "text-ink-faint hover:text-ink"}`}
            >
              Month
            </Link>
            <Link
              href={dayHref(selectedDate)}
              className={`flex-1 rounded-md px-2 py-1 text-center text-xs font-medium transition-colors ${view === "day" ? "bg-panel text-ink" : "text-ink-faint hover:text-ink"}`}
            >
              Day
            </Link>
          </div>

          <div className="card mt-4 p-3">
            <div className="flex items-center justify-between">
              <Link href={monthHref(view, monthIndex === 0 ? year - 1 : year, monthIndex === 0 ? 11 : monthIndex - 1)} aria-label="Previous month" className="px-1 text-ink-faint hover:text-ink">
                ‹
              </Link>
              <span className="text-xs font-medium text-ink">{monthLabel(year, monthIndex)}</span>
              <Link href={monthHref(view, monthIndex === 11 ? year + 1 : year, monthIndex === 11 ? 0 : monthIndex + 1)} aria-label="Next month" className="px-1 text-ink-faint hover:text-ink">
                ›
              </Link>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-y-0.5">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center font-mono text-[0.6rem] text-ink-faint">
                  {d}
                </div>
              ))}
              {weeks.flatMap((week, wi) =>
                week.map((date, di) =>
                  date ? (
                    <Link
                      key={`${wi}-${di}`}
                      href={view === "day" ? dayHref(date) : `#day-${dayKey(date)}`}
                      className="mini-cal-day"
                      data-today={isSameDate(date, today)}
                      data-selected={view === "day" && isSameDate(date, selectedDate)}
                      data-has-tasks={(tasksByDay.get(dayKey(date))?.length ?? 0) > 0}
                    >
                      {date.getDate()}
                    </Link>
                  ) : (
                    <span key={`${wi}-${di}`} />
                  ),
                ),
              )}
            </div>
          </div>

          {sidebarTasks.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-ink-faint">
                {view === "month" ? "This month" : selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </h2>
              <div className="ledger mt-2">
                {sidebarTasks.map((task) => (
                  <DraggableTask key={task.id} task={task} threadIndex={threadIndexFor(task.domain_id, domains)} domains={domains} />
                ))}
              </div>
            </div>
          )}
        </aside>

        <div className="min-w-0 flex-1">
          {view === "month" ? (
            days.map((day) => (
              <MonthAgendaRow
                key={dayKey(day)}
                date={day}
                tasks={tasksByDay.get(dayKey(day)) ?? []}
                domains={domains}
                isToday={isSameDate(day, today)}
              />
            ))
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Link href={dayHref(addDays(selectedDate, -1))} className="btn-outline px-3 py-1.5 text-sm">
                  ← Prev
                </Link>
                <div className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
                <Link href={dayHref(addDays(selectedDate, 1))} className="btn-outline px-3 py-1.5 text-sm">
                  Next →
                </Link>
              </div>

              <div className="relative mt-4" style={{ height: 24 * ROW_HEIGHT }}>
                {HOURS.map((h) => (
                  <DayHourRow key={h} hour={h} dateKey={selectedDateKey} />
                ))}

                <div className="pointer-events-none absolute inset-y-0 left-16 right-0">
                  {selectedDayTasks.map((task) => {
                    if (!task.due_at) return null;
                    const d = new Date(task.due_at);
                    const top = ((d.getHours() * 60 + d.getMinutes()) / 60) * ROW_HEIGHT;
                    const threadIndex = threadIndexFor(task.domain_id, domains);
                    return (
                      <div
                        key={task.id}
                        className="day-card pointer-events-auto absolute inset-x-1 overflow-hidden"
                        data-thread={threadIndex >= 0 ? threadIndex : undefined}
                        style={{ top, height: ROW_HEIGHT - 8 }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 font-mono text-[0.65rem] text-ink-faint">{formatTime(task.due_at)}</span>
                          <span className={`truncate text-xs ${task.status === "done" ? "text-ink-faint line-through" : "text-ink"}`}>
                            {task.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <NowLine dateKey={selectedDateKey} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 220, easing: EASE_OUT }}>
        {activeTask ? (
          <div
            className="day-card w-56 rotate-[-1.5deg] scale-[1.03]"
            data-thread={activeThreadIndex >= 0 ? activeThreadIndex : undefined}
            style={{ boxShadow: "0 14px 30px rgba(20, 19, 15, 0.32)" }}
          >
            <span className="font-mono text-xs text-ink-faint">{activeTask.due_at ? formatTime(activeTask.due_at) : "Unscheduled"}</span>
            <p className="mt-0.5 truncate text-sm text-ink">{activeTask.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
