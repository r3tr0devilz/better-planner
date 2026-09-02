"use client";

import { useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { updateCourseProgress, deleteCourse } from "@/app/(app)/career/actions";
import { DeleteButton } from "@/components/delete-button";
import type { Course } from "@/lib/supabase/types";

/** A row3 row for the Career > Courses list. Progress has no other edit
 * surface anywhere in the app (createCourse never asked for it either), so
 * the +/- stepper stays inline here rather than being dropped outright. */
export function CourseCard({ course }: { course: Course }) {
  const [pending, startTransition] = useTransition();

  function step(delta: number) {
    startTransition(() => updateCourseProgress(course.id, course.progress_percent + delta));
  }

  return (
    <div className="row3">
      <div className="min-w-0">
        <span className="truncate text-sm text-ink">{course.name}</span>
        {course.next_lesson && <p className="truncate text-xs text-ink-faint">Next: {course.next_lesson}</p>}
      </div>
      <span className="font-mono text-[10px] tracking-wide text-ink-faint">{course.platform || "—"}</span>
      <span className="flex shrink-0 items-center gap-2">
        <button onClick={() => step(-10)} disabled={pending} aria-label="Decrease progress" className="text-ink-faint hover:text-ink">
          <Minus size={12} />
        </button>
        <span className="tag">{course.progress_percent}%</span>
        <button onClick={() => step(10)} disabled={pending} aria-label="Increase progress" className="text-ink-faint hover:text-ink">
          <Plus size={12} />
        </button>
        <DeleteButton
          confirmMessage={`Delete "${course.name}"? This can't be undone.`}
          label=""
          pendingLabel=""
          ariaLabel="Delete course"
          onDelete={deleteCourse.bind(null, course.id)}
          className="flex h-7 w-7 shrink-0 items-center justify-center text-ink-faint/60 transition-colors duration-150 hover:text-vermillion"
          iconSize={13}
        />
      </span>
    </div>
  );
}
