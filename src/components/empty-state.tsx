import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * A page with zero data is still a real moment, not a loading accident —
 * give it the same paper-and-ink weight as everything else instead of one
 * faint line of text. Sharp corners on purpose: this represents a blank
 * ledger page (a physical-artifact moment), not a control the user presses.
 */
export function EmptyState({
  icon: Icon,
  message,
  action,
}: {
  icon: LucideIcon;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 border border-line px-6 py-14 text-center">
      <Icon size={20} strokeWidth={1.5} className="text-ink-faint" aria-hidden />
      <p className="max-w-xs text-sm text-ink-faint">{message}</p>
      {action}
    </div>
  );
}
