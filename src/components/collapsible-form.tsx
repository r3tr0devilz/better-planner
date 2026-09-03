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
  captureId,
  children,
}: {
  action: (formData: FormData) => void;
  triggerLabel: string;
  className?: string;
  topMargin?: string;
  /** Registers this exact form with the global Capture button (see
   * quick-capture.ts) — Capture opens the real per-page form instead of a
   * separate quick-add UI, so the id must match the key that page lists
   * there. Omit on a form Capture shouldn't be able to open directly. */
  captureId?: string;
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

  useEffect(() => {
    if (!captureId) return;
    function onQuickCapture(e: Event) {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (id !== captureId) return;
      setOpen(true);
      // Runs a frame after setOpen so the form has actually mounted —
      // formRef.current is still the pre-open null/undefined synchronously.
      requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
    window.addEventListener("bp:quick-capture", onQuickCapture);
    return () => window.removeEventListener("bp:quick-capture", onQuickCapture);
  }, [captureId]);

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
