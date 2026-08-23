"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { toggleTaskDone, toggleTopThree } from "@/app/(app)/tasks/actions";
import type { Task } from "@/lib/supabase/types";

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  high: "bg-stamp-red",
  medium: "bg-mustard",
  low: "bg-ink-faint",
};

function formatDue(dueAt: string | null): string | null {
  if (!dueAt) return null;
  const date = new Date(dueAt);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + `, ${time}`;
}

export function TaskRow({ task, threadIndex }: { task: Task; threadIndex: number }) {
  const [pending, startTransition] = useTransition();
  const due = formatDue(task.due_at);
  const done = task.status === "done";

  return (
    <div className="ledger-row flex items-center gap-3 px-1 py-3">
      <input
        type="checkbox"
        checked={done}
        disabled={pending}
        onChange={(e) => startTransition(() => toggleTaskDone(task.id, e.target.checked))}
        className="h-4 w-4 shrink-0 accent-moss"
        aria-label={`Mark "${task.title}" ${done ? "open" : "done"}`}
      />

      {threadIndex >= 0 && <span className="stamp-dot" data-thread={threadIndex} aria-hidden />}

      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_COLOR[task.priority]}`} aria-hidden />

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm transition-colors duration-150 ${done ? "text-ink-faint line-through" : "text-ink"}`}>
          {task.title}
        </p>
        {due && <p className="truncate font-mono text-xs text-ink-faint">{due}</p>}
      </div>

      <button
        onClick={() => startTransition(() => toggleTopThree(task.id, !task.is_top_three))}
        disabled={pending}
        aria-label={task.is_top_three ? "Remove from top three" : "Add to top three"}
        aria-pressed={task.is_top_three}
        className={`shrink-0 transition-transform duration-150 active:scale-90 ${task.is_top_three ? "text-stamp-red" : "text-ink-faint hover:text-ink"}`}
      >
        <Star size={16} fill={task.is_top_three ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
