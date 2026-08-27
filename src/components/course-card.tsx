"use client";

import { useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { updateCourseProgress, deleteCourse } from "@/app/(app)/career/actions";
import { DeleteButton } from "@/components/delete-button";
import type { Course } from "@/lib/supabase/types";

const STATUS_LABEL: Record<Course["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  paused: "Paused",
  completed: "Completed",
};

export function CourseCard({ course }: { course: Course }) {
  const [pending, startTransition] = useTransition();

  function step(delta: number) {
    startTransition(() => updateCourseProgress(course.id, course.progress_percent + delta));
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{course.name}</p>
          {course.platform && <p className="truncate text-xs text-ink-faint">{course.platform}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-wide text-ink-faint">
            {STATUS_LABEL[course.status]}
          </span>
          <DeleteButton
            confirmMessage={`Delete "${course.name}"? This can't be undone.`}
            label=""
            pendingLabel=""
            ariaLabel="Delete course"
            onDelete={deleteCourse.bind(null, course.id)}
            className="-m-2.5 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint transition-colors duration-150 hover:text-vermillion"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-mono text-ink-faint">{course.progress_percent}%</span>
          </div>
          <div className="mt-1 h-1.5 border border-line bg-stone">
            <div
              className="h-full bg-oxblood transition-[width] duration-200 ease-out"
              style={{ width: `${course.progress_percent}%` }}
            />
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button onClick={() => step(-10)} disabled={pending} aria-label="Decrease progress" className="btn-outline p-1">
            <Minus size={12} />
          </button>
          <button onClick={() => step(10)} disabled={pending} aria-label="Increase progress" className="btn-outline p-1">
            <Plus size={12} />
          </button>
        </div>
      </div>

      {course.next_lesson && <p className="mt-2 text-xs text-ink-faint">Next: {course.next_lesson}</p>}
    </div>
  );
}
