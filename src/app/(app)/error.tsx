"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Without this, any thrown error in a page/action under (app) — a failed
 * insert, an RLS violation, anything — took down the whole page with Next's
 * bare default error screen. Every "the site crashed" report traces back to
 * there being no boundary here at all.
 */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <div className="card w-full p-6">
        <p className="font-mono text-xs uppercase tracking-wide text-vermillion">Something went wrong</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold uppercase tracking-tight text-ink">
          That didn&apos;t save
        </h1>
        <p className="mt-2 text-sm text-ink-faint">
          The page hit an error instead of loading. Nothing else on your account was affected — try again below.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button onClick={reset} className="btn">
            Try again
          </button>
          <Link href="/today" className="btn-outline">
            Back to Today
          </Link>
        </div>
      </div>
    </div>
  );
}
