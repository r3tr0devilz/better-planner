"use client";

import { useCallback, useState, useTransition } from "react";
import { Sparkle } from "lucide-react";
import { deleteTask, toggleTaskDone, toggleTopThree, updateTask } from "@/app/(app)/tasks/actions";
import { Modal } from "@/components/modal";
import { DeleteButton } from "@/components/delete-button";
import type { Domain, Task } from "@/lib/supabase/types";

const SPARKLE_PATH =
  "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z";

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  high: "bg-vermillion",
  medium: "bg-mustard",
  low: "bg-ink-faint",
};

function formatDue(dueAt: string | null): string | null {
  if (!dueAt) return null;
  const date = new Date(dueAt);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + `, ${time}`;
}

function toDatetimeLocal(dueAt: string | null): string {
  if (!dueAt) return "";
  const d = new Date(dueAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TaskRow({
  task,
  threadIndex,
  domains = [],
}: {
  task: Task;
  threadIndex: number;
  domains?: Domain[];
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const due = formatDue(task.due_at);
  const done = task.status === "done";

  const close = useCallback(() => setEditing(false), []);

  return (
    <div className="ledger-row flex items-center gap-3 px-1 py-3">
      <label className="-m-3.5 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          checked={done}
          disabled={pending}
          onChange={(e) => startTransition(() => toggleTaskDone(task.id, e.target.checked))}
          className="h-4 w-4 accent-moss"
          aria-label={`Mark "${task.title}" ${done ? "open" : "done"}`}
        />
      </label>

      {threadIndex >= 0 && <span className="thread-mark" data-thread={threadIndex} aria-hidden />}

      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_COLOR[task.priority]}`} aria-hidden />

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
      >
        <p className={`truncate text-sm transition-colors duration-150 ${done ? "text-ink-faint line-through" : "text-ink"}`}>
          {task.title}
        </p>
        {due && <p className="truncate font-mono text-xs text-ink-faint">{due}</p>}
      </button>

      <button
        onClick={() => startTransition(() => toggleTopThree(task.id, !task.is_top_three))}
        disabled={pending}
        aria-label={task.is_top_three ? "Remove from top three" : "Add to top three"}
        aria-pressed={task.is_top_three}
        className={`-m-3 flex h-11 w-11 shrink-0 items-center justify-center transition-transform duration-150 active:scale-90 ${task.is_top_three ? "" : "text-ink-faint hover:text-ink"}`}
      >
        {task.is_top_three ? (
          <svg width={19} height={19} viewBox="0 0 24 24" aria-hidden>
            <path d={SPARKLE_PATH} className="fill-oxblood" />
            <g transform="translate(12 12) scale(0.42) translate(-12 -12)">
              <path d={SPARKLE_PATH} className="fill-mustard" />
            </g>
          </svg>
        ) : (
          <Sparkle size={19} fill="none" />
        )}
      </button>

      {editing && (
        <Modal onClose={close} title="Edit task">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              startTransition(() => {
                updateTask(task.id, formData);
              });
              close();
            }}
            className="mt-4 flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
              Title
              <input name="title" defaultValue={task.title} required className="field" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
              Notes
              <textarea name="notes" defaultValue={task.notes ?? ""} rows={3} className="field" />
            </label>
            <div className="field-row">
              <label className="field-wide">
                Domain
                <select name="domain_id" defaultValue={task.domain_id ?? ""} className="field">
                  <option value="">None</option>
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due
                <input type="datetime-local" name="due_at" defaultValue={toDatetimeLocal(task.due_at)} className="field" />
              </label>
              <label className="field-narrow">
                Priority
                <select name="priority" defaultValue={task.priority} className="field">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <DeleteButton
                confirmMessage={`Delete "${task.title}"? This can't be undone.`}
                onDelete={() => {
                  close();
                  return deleteTask(task.id);
                }}
              />
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
