"use client";

import { useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { updateMilestonePercent } from "@/app/(app)/projects/actions";
import type { Milestone } from "@/lib/supabase/types";

export function MilestoneRow({ projectId, milestone }: { projectId: string; milestone: Milestone }) {
  const [pending, startTransition] = useTransition();

  function step(delta: number) {
    startTransition(() => updateMilestonePercent(projectId, milestone.id, milestone.percent_complete + delta));
  }

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="min-w-0 truncate text-ink">{milestone.name}</span>
          <span className="shrink-0 font-mono text-ink-faint">{milestone.percent_complete}%</span>
        </div>
        <div className="mt-1 h-1.5 border border-line bg-stone">
          <div
            className="h-full bg-oxblood transition-[width] duration-200 ease-out"
            style={{ width: `${milestone.percent_complete}%` }}
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
  );
}
