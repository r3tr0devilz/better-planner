"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";

/**
 * Every "new X" form on a list page starts collapsed behind a slim trigger,
 * so the list itself — not an always-open form — is the first thing a
 * returning visitor sees. Wraps the page's existing <form action={...}>
 * unchanged; only the shell around it is new.
 */
export function CollapsibleForm({
  action,
  triggerLabel,
  className = "field-row",
  topMargin = "mt-6",
  children,
}: {
  action: (formData: FormData) => void;
  triggerLabel: string;
  className?: string;
  topMargin?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    formRef.current?.querySelector<HTMLElement>("input, textarea, select")?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={false}
        className={`btn-outline ${topMargin} inline-flex items-center gap-1.5 text-ink-faint`}
      >
        <Plus size={14} />
        {triggerLabel}
      </button>
    );
  }

  return (
    <form ref={formRef} action={action} className={`${className} card stagger-in relative ${topMargin} p-4`}>
      <button
        type="button"
        onClick={close}
        aria-label="Cancel"
        className="absolute right-2 top-2 text-ink-faint transition-colors duration-150 hover:text-ink"
      >
        <X size={14} />
      </button>
      {children}
      <button type="button" onClick={close} className="btn-outline shrink-0">
        Cancel
      </button>
    </form>
  );
}
