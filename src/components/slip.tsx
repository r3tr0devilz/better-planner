import type { Ref } from "react";
import type { BurnPhase } from "@/lib/use-burn";

/**
 * The paper scaffold every burnable row (task, routine, checklist item)
 * shares: a torn/perforated edge on tear, the char/cracks/ember overlays
 * that ride the `--burn` custom property, and the grid-rows collapse once
 * the slip is fully ash. The row itself supplies its own content
 * (checkbox, title, meta) as children — Slip only owns the paper.
 *
 * `threadIndex` sets `data-thread`, which the app's existing thread-color
 * custom properties (globals.css `[data-thread="n"] { --dot }`) cascade
 * down through — the same variable both the proj-edge spine here and any
 * `.thread-mark` dot inside children pick up, so a slip stays one color.
 */
export function Slip({
  phase,
  slipRef,
  threadIndex,
  children,
}: {
  phase: BurnPhase;
  slipRef: Ref<HTMLDivElement>;
  threadIndex: number;
  children: React.ReactNode;
}) {
  return (
    <div data-burn={phase} data-thread={threadIndex >= 0 ? threadIndex : undefined} className="slip-collapse">
      <div className="slip-clip">
        <span className="slip-stitch" />
        <div ref={slipRef} className="slip-body">
          {children}
          <span className="proj-edge" />
          <span className="slip-char" />
          <span className="slip-cracks" />
          <span className="slip-ember" />
        </div>
      </div>
    </div>
  );
}
