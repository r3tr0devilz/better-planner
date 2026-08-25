import type { ReactNode } from "react";

/**
 * Every list page starts with the same shape: title, a one-line stat for
 * orientation, and room for a primary action once pages grow one.
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
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase tracking-tight text-ink">
          {title}
        </h1>
        {context && <p className="mt-1 text-sm text-ink-faint">{context}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
