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
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink">{milestone.name}</span>
          <span className="font-mono text-ink-faint">{milestone.percent_complete}%</span>
        </div>
        <div className="mt-1 h-1.5 border border-paper-line bg-paper">
          <div
            className="h-full bg-fountain transition-all"
            style={{ width: `${milestone.percent_complete}%` }}
          />
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => step(-10)}
          disabled={pending}
          aria-label="Decrease progress"
          className="border border-paper-line p-1 text-ink-faint hover:text-ink"
        >
          <Minus size={12} />
        </button>
        <button
          onClick={() => step(10)}
          disabled={pending}
          aria-label="Increase progress"
          className="border border-paper-line p-1 text-ink-faint hover:text-ink"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}
