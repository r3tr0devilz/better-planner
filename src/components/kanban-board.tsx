"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { moveJobApplication } from "@/app/(app)/career/actions";
import type { JobApplication } from "@/lib/supabase/types";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

const COLUMNS: { status: JobApplication["status"]; label: string; dot: string }[] = [
  { status: "saved", label: "Saved", dot: "bg-ink-faint" },
  { status: "applied", label: "Applied", dot: "bg-cobalt" },
  { status: "interviewing", label: "Interviewing", dot: "bg-mustard" },
  { status: "offer", label: "Offer", dot: "bg-moss" },
  { status: "rejected", label: "Rejected", dot: "bg-vermillion" },
  { status: "archived", label: "Archived", dot: "bg-ink-faint" },
];

function formatDate(d: string | null): string | null {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ApplicationCard({ app }: { app: JobApplication }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id });
  const deadline = formatDate(app.deadline);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? `transform 200ms var(--ease-in-out)`,
      }}
      className={`card relative flex items-start gap-1.5 p-3 pt-4 transition-opacity duration-150 ${isDragging ? "opacity-35" : ""}`}
    >
      <span className="card-flag" data-thread={-1} style={{ background: "var(--color-ink-faint)" }}>
        {app.company}
      </span>
      <span
        {...attributes}
        {...listeners}
        title="Drag to move"
        aria-label="Drag to move"
        className="mt-0.5 cursor-grab touch-none text-ink-faint/60 transition-colors hover:text-ink-faint active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink">{app.role}</p>
        {deadline && <p className="mt-0.5 font-mono text-xs text-ink-faint">Due {deadline}</p>}
      </div>
    </div>
  );
}

function Column({
  status,
  label,
  dot,
  apps,
}: {
  status: JobApplication["status"];
  label: string;
  dot: string;
  apps: JobApplication[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` });

  return (
    <div className="w-64 shrink-0">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden />
        <span className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</span>
        <span className="font-mono text-xs text-ink-faint">{apps.length}</span>
      </div>
      <SortableContext items={apps.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex min-h-24 flex-col gap-3 rounded-lg p-1.5 transition-colors duration-150 ${isOver ? "bg-oxblood/10" : ""}`}
        >
          {apps.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
          {apps.length === 0 && <p className="px-2 py-3 text-xs text-ink-faint">Nothing here.</p>}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({ applications }: { applications: JobApplication[] }) {
  const grouped = useMemo(() => {
    const map = new Map<JobApplication["status"], JobApplication[]>();
    for (const c of COLUMNS) map.set(c.status, []);
    for (const app of [...applications].sort((a, b) => a.sort_order - b.sort_order)) {
      map.get(app.status)?.push(app);
    }
    return map;
  }, [applications]);

  const [board, setBoard] = useState(grouped);
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null);

  // Re-sync after the server revalidates (e.g. once a drop's moveJobApplication
  // lands) — adjusting state during render, not in an effect, per React's
  // guidance for state derived from props: https://react.dev/learn/you-might-not-need-an-effect
  const [prevApplications, setPrevApplications] = useState(applications);
  if (applications !== prevApplications) {
    setPrevApplications(applications);
    setBoard(grouped);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  function columnOf(id: string): JobApplication["status"] | null {
    if (id.startsWith("column:")) return id.slice(7) as JobApplication["status"];
    for (const [status, apps] of board) {
      if (apps.some((a) => a.id === id)) return status;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    for (const apps of board.values()) {
      const found = apps.find((a) => a.id === id);
      if (found) {
        setActiveApp(found);
        return;
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const fromStatus = columnOf(activeId);
    const toStatus = columnOf(overId);
    if (!fromStatus || !toStatus) return;

    setBoard((prev) => {
      const next = new Map(prev);

      if (fromStatus === toStatus) {
        const apps = [...(next.get(fromStatus) ?? [])];
        const activeIndex = apps.findIndex((a) => a.id === activeId);
        const overIndex = apps.findIndex((a) => a.id === overId);
        if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) return prev;
        next.set(fromStatus, arrayMove(apps, activeIndex, overIndex));
        return next;
      }

      const fromApps = [...(next.get(fromStatus) ?? [])];
      const moving = fromApps.find((a) => a.id === activeId);
      if (!moving) return prev;
      next.set(fromStatus, fromApps.filter((a) => a.id !== activeId));

      const toApps = [...(next.get(toStatus) ?? [])];
      const overIndex = toApps.findIndex((a) => a.id === overId);
      const insertAt = overIndex >= 0 ? overIndex : toApps.length;
      toApps.splice(insertAt, 0, { ...moving, status: toStatus });
      next.set(toStatus, toApps);
      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active } = event;
    setActiveApp(null);

    const activeId = String(active.id);
    const status = columnOf(activeId);
    if (!status) return;

    // dragOver already placed the card in its final column/position; just persist it.
    const ordered = (board.get(status) ?? []).map((a) => a.id);
    moveJobApplication(activeId, status, ordered);
  }

  return (
    <DndContext
      id="career-kanban"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 overflow-x-auto pb-2">
        {COLUMNS.map((c) => (
          <Column key={c.status} status={c.status} label={c.label} dot={c.dot} apps={board.get(c.status) ?? []} />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 220, easing: EASE_OUT }}>
        {activeApp ? (
          <div
            className="card w-60 rotate-[-1.5deg] scale-[1.03] p-3 pt-4"
            style={{ boxShadow: "0 14px 30px rgba(20, 19, 15, 0.32)" }}
          >
            <span className="card-flag" style={{ background: "var(--color-ink-faint)" }}>
              {activeApp.company}
            </span>
            <p className="truncate text-sm text-ink">{activeApp.role}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
