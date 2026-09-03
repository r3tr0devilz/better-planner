"use client";

import { useCallback, useMemo, useState } from "react";
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
import { moveJobApplication } from "@/app/(app)/career/actions";
import { ApplicationEditModal, STATUS_LABEL, formatDate } from "@/components/application-row";
import type { JobApplication } from "@/lib/supabase/types";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

// The board only shows the live pipeline — Archived apps drop out of it
// entirely (still reachable and settable via the table view's edit modal,
// same status field). "Advance" walks this same fixed order; there's no
// well-defined "next" after Rejected, so the button just disappears there.
const COLUMNS: JobApplication["status"][] = ["saved", "applied", "interviewing", "offer", "rejected"];

const DAY_MS = 86_400_000;

/** "What the application has left to burn": the fraction of its
 * saved→deadline window still remaining, on the same 0–10 scale as every
 * other burn-down stick in this theme. No deadline reads as untouched
 * (full stick, nothing counting down); a passed deadline reads as spent. */
function deadlineBurn(app: JobApplication): { fill: number; urgent: boolean } {
  if (!app.deadline) return { fill: 10, urgent: false };
  const total = new Date(app.deadline).getTime() - new Date(app.created_at).getTime();
  const remaining = new Date(app.deadline).getTime() - Date.now();
  if (total <= 0) return { fill: remaining < 0 ? 0 : 10, urgent: remaining < 0 };
  const fill = Math.max(0, Math.min(10, Math.round((remaining / total) * 10)));
  return { fill, urgent: remaining < 0 };
}

function ApplicationCard({ app }: { app: JobApplication }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id });
  const [editing, setEditing] = useState(false);
  const close = useCallback(() => setEditing(false), []);
  const deadline = formatDate(app.deadline);
  const { fill, urgent } = deadlineBurn(app);
  const columnIndex = COLUMNS.indexOf(app.status);
  const next = columnIndex >= 0 && columnIndex < COLUMNS.length - 1 ? COLUMNS[columnIndex + 1] : null;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition: transition ?? `transform 200ms var(--ease-in-out)` }}
      data-drag={isDragging}
      className="kb-card"
    >
      <button type="button" onClick={() => setEditing(true)} className="kb-open">
        <span className="kb-role">{app.role}</span>
        <span className="kb-co">{app.company}</span>
      </button>
      <div className="kb-foot">
        <span className="mini" title={deadline ? `Due ${deadline}` : "No deadline"}>
          <span className="day-burn" data-fill={fill}>
            <span className="stick-tip" />
          </span>
        </span>
        <span className="kb-due" data-urgent={urgent}>
          {deadline ?? "—"}
        </span>
        {next && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              moveJobApplication(app.id, next, [app.id]);
            }}
            className="kb-next"
            title={`Move to ${STATUS_LABEL[next]}`}
            aria-label={`Move ${app.company} application to ${STATUS_LABEL[next]}`}
          >
            ▸
          </button>
        )}
      </div>

      {editing && <ApplicationEditModal app={app} onClose={close} />}
    </div>
  );
}

function Column({ status, apps }: { status: JobApplication["status"]; apps: JobApplication[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` });
  const scorch = Math.min(4, apps.length);

  return (
    <div className="kb-col" data-over={isOver}>
      <div className="kb-head">
        <span className="kb-title">{STATUS_LABEL[status]}</span>
        <span className="kb-n">{apps.length}</span>
      </div>
      <span className="kb-stub" data-scorch={scorch || undefined} />
      <SortableContext items={apps.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="kb-body">
          {apps.map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
          {apps.length === 0 && <p className="kb-empty">Nothing here.</p>}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({ applications }: { applications: JobApplication[] }) {
  const live = useMemo(() => applications.filter((a) => a.status !== "archived"), [applications]);

  const grouped = useMemo(() => {
    const map = new Map<JobApplication["status"], JobApplication[]>();
    for (const status of COLUMNS) map.set(status, []);
    for (const app of [...live].sort((a, b) => a.sort_order - b.sort_order)) {
      map.get(app.status)?.push(app);
    }
    return map;
  }, [live]);

  const [board, setBoard] = useState(grouped);
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null);

  // Re-sync after the server revalidates — adjusting state during render,
  // not in an effect, per https://react.dev/learn/you-might-not-need-an-effect
  const [prevLive, setPrevLive] = useState(live);
  if (live !== prevLive) {
    setPrevLive(live);
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
      <div className="kb">
        {COLUMNS.map((status) => (
          <Column key={status} status={status} apps={board.get(status) ?? []} />
        ))}
      </div>
      <p className="mt-2.5 font-mono text-[10px] leading-relaxed tracking-wide text-ink-faint">
        Drag a card, or press ▸ to move it on a stage. The stick on each card is what the application has left to burn.
      </p>

      <DragOverlay dropAnimation={{ duration: 220, easing: EASE_OUT }}>
        {activeApp ? (
          <div className="kb-card" style={{ width: 220, boxShadow: "0 14px 30px rgba(20, 19, 15, 0.32)", transform: "rotate(-1.5deg) scale(1.03)" }}>
            <span className="kb-role">{activeApp.role}</span>
            <span className="kb-co">{activeApp.company}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
