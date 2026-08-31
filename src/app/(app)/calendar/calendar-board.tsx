"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GripVertical } from "lucide-react";
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
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { rescheduleTask, updateTaskDuration } from "@/app/(app)/tasks/actions";
import { TaskRow } from "@/components/task-row";
import { threadIndexFor } from "@/lib/domain-threads";
import type { GoogleCalendarStatus } from "@/lib/google-calendar";
import type { Domain, Task } from "@/lib/supabase/types";
import { NowLine } from "./now-line";
import { ROW_HEIGHT } from "./constants";
import {
  WEEKDAYS,
  WEEKDAY_LONG,
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
const QUARTER_HEIGHT = ROW_HEIGHT / 4;
const MIN_BLOCK_HEIGHT = 34;

function DraggableTask({ task, threadIndex, domains }: { task: Task; threadIndex: number; domains: Domain[] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id, data: { task } });
  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-1 transition-[opacity,transform] duration-[140ms] ${isDragging ? "scale-[0.98] opacity-35" : ""}`}
      style={{ transitionTimingFunction: EASE_OUT }}
    >
      <span
        {...listeners}
        {...attributes}
        title="Drag to schedule"
        aria-label="Drag to schedule"
        className="cursor-grab touch-none self-stretch px-1 py-3 text-ink-faint/60 transition-colors hover:text-ink-faint active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <TaskRow task={task} threadIndex={threadIndex} domains={domains} />
      </div>
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
  const empty = tasks.length === 0;

  return (
    <div
      ref={setNodeRef}
      id={`day-${key}`}
      className={`flex gap-4 rounded-md border-b border-line px-2 transition-colors duration-150 first:pt-0 scroll-mt-20 ${empty ? "py-2.5" : "py-5"} ${isOver ? "bg-oxblood/10" : ""}`}
    >
      <div className="w-16 shrink-0 text-center">
        <div className={`font-[family-name:var(--font-display)] font-black leading-none text-ink ${empty ? "text-xl opacity-60" : "text-4xl"}`}>
          {String(date.getDate()).padStart(2, "0")}
        </div>
        <div className={`mt-1 font-mono text-[0.65rem] uppercase tracking-wide ${isToday ? "font-bold text-oxblood" : "text-ink-faint"}`}>
          {WEEKDAY_LONG[date.getDay()]}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
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

function DayQuarterSlot({ hour, quarter, dateKey: key }: { hour: number; quarter: number; dateKey: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: `quarter:${key}:${hour}:${quarter}` });
  return (
    <div
      ref={setNodeRef}
      className={`absolute inset-x-0 border-l-2 transition-colors duration-[120ms] ${isOver ? "border-oxblood bg-oxblood/10" : "border-transparent"}`}
      style={{ top: quarter * QUARTER_HEIGHT, height: QUARTER_HEIGHT }}
    />
  );
}

function DayHourRow({ hour, dateKey: key, offsetHour }: { hour: number; dateKey: string; offsetHour: number }) {
  return (
    <div className="absolute inset-x-0" style={{ top: (hour - offsetHour) * ROW_HEIGHT, height: ROW_HEIGHT }}>
      <span className="pointer-events-none absolute left-0 top-0 w-14 -translate-y-2 pr-2 text-right font-mono text-[0.65rem] text-ink-faint">
        {formatHour(hour)}
      </span>
      <div className="pointer-events-none absolute bottom-0 border-t border-line" style={{ left: 61, right: 0 }} />
      <div className="absolute inset-y-0" style={{ left: 61, right: 0 }}>
        {[0, 1, 2, 3].map((q) => (
          <DayQuarterSlot key={q} hour={hour} quarter={q} dateKey={key} />
        ))}
      </div>
    </div>
  );
}

function ResizableDayCard({
  task,
  threadIndex,
  offsetHour,
  onResize,
}: {
  task: Task;
  threadIndex: number;
  offsetHour: number;
  onResize: (taskId: string, durationMinutes: number) => void;
}) {
  const baseDuration = task.duration_minutes ?? 30;
  const [liveDuration, setLiveDuration] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const liveDurationRef = useRef<number | null>(null);

  if (!task.due_at) return null;
  const d = new Date(task.due_at);
  const top = ((d.getHours() * 60 + d.getMinutes() - offsetHour * 60) / 60) * ROW_HEIGHT;
  const duration = liveDuration ?? baseDuration;
  const height = Math.max((duration / 60) * ROW_HEIGHT, MIN_BLOCK_HEIGHT);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    setDragging(true);

    function onMove(ev: PointerEvent) {
      const deltaMinutes = ((ev.clientY - startY) / ROW_HEIGHT) * 60;
      const raw = Math.max(15, baseDuration + deltaMinutes);
      liveDurationRef.current = raw;
      setLiveDuration(raw);
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDragging(false);
      const snapped = Math.max(15, Math.round((liveDurationRef.current ?? baseDuration) / 15) * 15);
      liveDurationRef.current = null;
      setLiveDuration(snapped);
      onResize(task.id, snapped);
      // Let the resolved prop value take back over once the parent re-renders with it.
      setTimeout(() => setLiveDuration(null), 0);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const next = Math.max(15, baseDuration + (e.key === "ArrowUp" ? 15 : -15));
    onResize(task.id, next);
  }

  return (
    <div
      className="day-card pointer-events-auto absolute inset-x-1 overflow-hidden"
      data-thread={threadIndex >= 0 ? threadIndex : undefined}
      style={{
        top,
        height,
        transition: dragging ? "none" : `height 180ms ${EASE_OUT}`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="shrink-0 font-mono text-[0.65rem] text-ink-faint">{formatTime(task.due_at)}</span>
        <span className={`truncate text-xs ${task.status === "done" ? "text-ink-faint line-through" : "text-ink"}`}>
          {task.title}
        </span>
        {dragging && <span className="ml-auto shrink-0 font-mono text-[0.6rem] text-oxblood">{Math.round(duration)}m</span>}
      </div>
      <div
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        role="slider"
        tabIndex={0}
        aria-label={`Duration for "${task.title}" — use Up/Down arrows to adjust in 15-minute steps`}
        aria-orientation="vertical"
        aria-valuemin={15}
        aria-valuemax={480}
        aria-valuenow={Math.round(duration)}
        aria-valuetext={`${Math.round(duration)} minutes`}
        className="absolute inset-x-0 bottom-0 flex h-2.5 touch-none cursor-ns-resize items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood/40"
      >
        <span className="h-0.5 w-6 rounded-full bg-ink-faint/50" />
      </div>
    </div>
  );
}

function parseQuarterId(id: string) {
  const [, dateKeyPart, hourPart, quarterPart] = id.split(":");
  return { dateKey: dateKeyPart, hour: Number(hourPart), quarter: Number(quarterPart) };
}

export function CalendarBoard({
  view,
  year,
  monthIndex,
  selectedDateKey,
  todayKey,
  fullDay,
  tasks: initialTasks,
  domains,
  calendarStatus,
}: {
  view: "month" | "day";
  year: number;
  monthIndex: number;
  selectedDateKey: string;
  todayKey: string;
  fullDay: boolean;
  tasks: Task[];
  domains: Domain[];
  calendarStatus: GoogleCalendarStatus;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [hoveredOverId, setHoveredOverId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const today = parseDayKey(todayKey);
  const selectedDate = parseDayKey(selectedDateKey);
  const offsetHour = fullDay ? 0 : 6;
  const visibleHours = fullDay ? 24 : 18;
  const hours = useMemo(() => Array.from({ length: visibleHours }, (_, i) => i + offsetHour), [visibleHours, offsetHour]);

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

  // Auto-scroll the page near "now" when opening today's Day view — the
  // timeline is part of normal page flow (no nested scroll container), so
  // this scrolls the window itself rather than an inner pane.
  useEffect(() => {
    if (view !== "day" || selectedDateKey !== todayKey || !timelineRef.current) return;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes() - offsetHour * 60;
    const nowOffsetWithinTimeline = (nowMinutes / 60) * ROW_HEIGHT;
    const timelineTop = timelineRef.current.getBoundingClientRect().top + window.scrollY;
    const target = Math.max(0, timelineTop + nowOffsetWithinTimeline - window.innerHeight / 3);
    window.scrollTo({ top: target });
  }, [view, selectedDateKey, todayKey, offsetHour]);

  function handleDragStart(event: DragStartEvent) {
    setActiveTask((event.active.data.current?.task as Task) ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    setHoveredOverId(event.over ? String(event.over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    setHoveredOverId(null);
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
    } else if (overId.startsWith("quarter:")) {
      const { dateKey: dk, hour, quarter } = parseQuarterId(overId);
      const target = parseDayKey(dk);
      newDueAt = new Date(target.getFullYear(), target.getMonth(), target.getDate(), hour, quarter * 15).toISOString();
    } else {
      return;
    }

    if (task.due_at === newDueAt) return;

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, due_at: newDueAt } : t)));
    startTransition(() => {
      rescheduleTask(task.id, newDueAt).then(() => router.refresh());
    });
  }

  function handleResize(taskId: string, durationMinutes: number) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, duration_minutes: durationMinutes } : t)));
    startTransition(() => {
      updateTaskDuration(taskId, durationMinutes).then(() => router.refresh());
    });
  }

  const activeThreadIndex = activeTask ? threadIndexFor(activeTask.domain_id, domains) : -1;

  const previewSlot = activeTask && hoveredOverId?.startsWith("quarter:") ? parseQuarterId(hoveredOverId) : null;

  return (
    <DndContext id="calendar-dnd" sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="contents w-full shrink-0 lg:block lg:w-64">
          <div className="order-1">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-ink">
              Calendar
            </h1>
            <p className="mt-1 text-xs text-ink-faint">
              {calendarStatus.connected ? "Google Calendar is connected." : "Google Calendar isn't connected."}
            </p>
            {calendarStatus.connected ? (
              <Link href="/settings" className="btn-outline mt-2 inline-block px-3 py-1.5 text-xs">
                Manage calendar
              </Link>
            ) : (
              <a href="/api/auth/google" className="btn-outline mt-2 inline-block px-3 py-1.5 text-xs">
                Connect calendar
              </a>
            )}

            <div className="relative mt-4 flex gap-1 rounded-lg border border-line bg-stone p-1">
              <div
                className="absolute inset-y-1 w-[calc(50%-0.375rem)] rounded-md bg-panel transition-transform duration-[180ms]"
                style={{
                  transform: view === "day" ? "translateX(calc(100% + 0.5rem))" : "translateX(0)",
                  transitionTimingFunction: EASE_OUT,
                }}
              />
              <Link
                href={monthHref("month", year, monthIndex)}
                className={`relative z-10 flex-1 rounded-md px-2 py-3.5 text-center text-xs font-medium transition-colors md:py-1 ${view === "month" ? "text-ink" : "text-ink-faint hover:text-ink"}`}
              >
                Month
              </Link>
              <Link
                href={dayHref(selectedDate, fullDay)}
                className={`relative z-10 flex-1 rounded-md px-2 py-3.5 text-center text-xs font-medium transition-colors md:py-1 ${view === "day" ? "text-ink" : "text-ink-faint hover:text-ink"}`}
              >
                Day
              </Link>
            </div>
          </div>

          <div className="card order-3 p-3 lg:order-none lg:mt-4">
            <div className="flex items-center justify-between">
              <Link
                href={monthHref(view, monthIndex === 0 ? year - 1 : year, monthIndex === 0 ? 11 : monthIndex - 1)}
                aria-label="Previous month"
                className="-m-2.5 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint hover:text-ink"
              >
                ‹
              </Link>
              <span className="text-xs font-medium text-ink">{monthLabel(year, monthIndex)}</span>
              <Link
                href={monthHref(view, monthIndex === 11 ? year + 1 : year, monthIndex === 11 ? 0 : monthIndex + 1)}
                aria-label="Next month"
                className="-m-2.5 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint hover:text-ink"
              >
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
                      href={view === "day" ? dayHref(date, fullDay) : `#day-${dayKey(date)}`}
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
            <div className="order-4 lg:order-none lg:mt-6">
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

        <div className="order-2 min-w-0 flex-1 lg:order-none">
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
              <div className="flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-4">
                <div className="font-[family-name:var(--font-display)] text-xl font-bold text-ink md:order-2">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
                <div className="flex w-full items-center justify-between gap-2 md:contents">
                  <Link href={dayHref(addDays(selectedDate, -1), fullDay)} className="btn-outline px-3 py-3 text-sm md:order-1 md:py-1.5">
                    ← Prev
                  </Link>
                  <Link href={dayHref(addDays(selectedDate, 1), fullDay)} className="btn-outline px-3 py-3 text-sm md:order-3 md:py-1.5">
                    Next →
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto mt-2 flex w-full max-w-xs gap-1 rounded-lg border border-line bg-stone p-1">
                <div
                  className="absolute inset-y-1 w-[calc(50%-0.375rem)] rounded-md bg-panel transition-transform duration-[180ms]"
                  style={{
                    transform: fullDay ? "translateX(calc(100% + 0.5rem))" : "translateX(0)",
                    transitionTimingFunction: EASE_OUT,
                  }}
                />
                <Link
                  href={dayHref(selectedDate, false)}
                  className={`relative z-10 flex-1 rounded-md px-3 py-3.5 text-center font-mono text-[0.65rem] transition-colors md:py-1.5 ${!fullDay ? "text-ink" : "text-ink-faint hover:text-ink"}`}
                >
                  6 AM – 12 AM
                </Link>
                <Link
                  href={dayHref(selectedDate, true)}
                  className={`relative z-10 flex-1 rounded-md px-3 py-3.5 text-center font-mono text-[0.65rem] transition-colors md:py-1.5 ${fullDay ? "text-ink" : "text-ink-faint hover:text-ink"}`}
                >
                  Full Day
                </Link>
              </div>

              <div ref={timelineRef} className="mt-4">
                <div className="relative" style={{ height: visibleHours * ROW_HEIGHT }}>
                  {hours.map((h) => (
                    <DayHourRow key={h} hour={h} dateKey={selectedDateKey} offsetHour={offsetHour} />
                  ))}

                  <div className="pointer-events-none absolute inset-y-0 left-16 right-0">
                    {selectedDayTasks.map((task) => (
                      <ResizableDayCard
                        key={task.id}
                        task={task}
                        threadIndex={threadIndexFor(task.domain_id, domains)}
                        offsetHour={offsetHour}
                        onResize={handleResize}
                      />
                    ))}
                    {previewSlot && previewSlot.dateKey === selectedDateKey && (
                      <div
                        className="pointer-events-none absolute inset-x-1 rounded-[0_8px_8px_0] border-l-2 border-oxblood bg-oxblood/10"
                        style={{
                          top: (((previewSlot.hour - offsetHour) * 60 + previewSlot.quarter * 15) / 60) * ROW_HEIGHT,
                          height: Math.max(((activeTask?.duration_minutes ?? 30) / 60) * ROW_HEIGHT, MIN_BLOCK_HEIGHT),
                        }}
                      />
                    )}
                    <NowLine dateKey={selectedDateKey} offsetHour={offsetHour} />
                  </div>
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
