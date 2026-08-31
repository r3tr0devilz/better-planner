import type { ReactNode } from "react";

/**
 * Every list page opens on the same masthead: a page title at full display
 * strength over a 3px ink rule (the same rule .ledger opens a list with —
 * amplifying a device the system already owns, not inventing a new one),
 * with the orientation stat set below it in the mono "stamped ledger"
 * voice instead of quiet body text.
 */
export function PageHeader({
  title,
  context,
  children,
}: {
  title: string;
  context?: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-[3px] border-ink pb-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-black uppercase leading-none tracking-tight text-ink sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {children && <div className="shrink-0 pb-1">{children}</div>}
      </div>
      {context && (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-ink-faint">{context}</p>
      )}
    </div>
  );
}
