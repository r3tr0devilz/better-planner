"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/**
 * Every form here submits a server action directly with no pending state —
 * under a slow network the button just sat there looking clickable with
 * nothing happening. useFormStatus is the native way to know a parent
 * <form>'s submission is in flight; no state wiring needed per call site.
 */
export function SubmitButton({
  children,
  pendingText = "Saving…",
  className = "btn",
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} aria-busy={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
