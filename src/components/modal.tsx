"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The one modal shell for the whole app (Capture, task edit, domain tabs all
 * used to hand-roll this same backdrop+panel with no dialog semantics or
 * focus trap). Owns Escape-to-close, a Tab focus trap, focus restoration on
 * close, and the aria-labelledby/role wiring so every caller gets it for free.
 */
export function Modal({
  onClose,
  title,
  children,
  className = "w-full max-w-lg p-5",
}: {
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Portaled to <body>, so this is a sibling of #app-root, not a descendant —
    // safe to inert without also inerting the modal it's hiding behind.
    const appRoot = document.getElementById("app-root");
    appRoot?.setAttribute("inert", "");

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      appRoot?.removeAttribute("inert");
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-24"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`modal-panel card ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2
            id={titleId}
            className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-tight text-ink"
          >
            {title}
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-ink-faint transition-colors duration-150 hover:text-ink">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
