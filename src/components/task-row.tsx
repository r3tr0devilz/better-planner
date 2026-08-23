"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { toggleTaskDone, toggleTopThree } from "@/app/(app)/tasks/actions";
import type { Task } from "@/lib/supabase/types";

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  high: "bg-coral",
  medium: "bg-gold",
  low: "bg-mist-dim",
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
    <div
      data-thread={threadIndex >= 0 ? threadIndex : undefined}
      className="thread-edge glass flex items-center gap-3 rounded-xl px-4 py-3"
    >
      <input
        type="checkbox"
        checked={done}
        disabled={pending}
        onChange={(e) => startTransition(() => toggleTaskDone(task.id, e.target.checked))}
        className="h-4 w-4 shrink-0 accent-sage"
        aria-label={`Mark "${task.title}" ${done ? "open" : "done"}`}
      />

      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_COLOR[task.priority]}`} aria-hidden />

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm ${done ? "text-mist-dim line-through" : "text-mist"}`}>
          {task.title}
        </p>
        {due && <p className="text-xs text-mist-dim">{due}</p>}
      </div>

      <button
        onClick={() => startTransition(() => toggleTopThree(task.id, !task.is_top_three))}
        disabled={pending}
        aria-label={task.is_top_three ? "Remove from top three" : "Add to top three"}
        aria-pressed={task.is_top_three}
        className={task.is_top_three ? "text-dawn" : "text-mist-dim hover:text-mist"}
      >
        <Star size={16} fill={task.is_top_three ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
