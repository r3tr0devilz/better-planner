/**
 * Every page already has its own "+ New X" form (CollapsibleForm, with its
 * real fields — domain, due date, priority, whatever that page's create
 * action actually takes), so Capture's job is just to open the right one,
 * not to rebuild a smaller copy of it. This maps a pathname to the
 * captureId(s) CollapsibleForm instances register themselves under
 * (collapsible-form.tsx's `captureId` prop) — quickCaptureFor picks the
 * page, openQuickCapture asks whichever CollapsibleForm (and, on Career,
 * whichever tab) owns that id to open and scroll itself into view.
 *
 * Excluded on purpose: Career's "New application" (createJobApplication
 * needs both company AND role typed in a real form — there's nothing to
 * jump straight to) and pages with no create form at all (Calendar has
 * none today, nor do Ash/Settings, and /notes is a deliberately static
 * archive — see its own page.tsx comment). Those keep going through AI
 * capture, same as before this existed.
 */
export type QuickCaptureTarget = {
  /** Must match the matching CollapsibleForm's captureId prop exactly. */
  key: string;
  /** Short noun for the picker chip ("Task", "Note"). */
  label: string;
};

const TARGETS: { prefixes: string[]; targets: QuickCaptureTarget[] }[] = [
  { prefixes: ["/today", "/tasks"], targets: [{ key: "task", label: "Task" }] },
  {
    prefixes: ["/library"],
    targets: [
      { key: "note", label: "Note" },
      { key: "book", label: "Book" },
    ],
  },
  { prefixes: ["/people"], targets: [{ key: "person", label: "Person" }] },
  { prefixes: ["/inventory"], targets: [{ key: "item", label: "Item" }] },
  {
    prefixes: ["/projects"],
    targets: [
      { key: "project", label: "Project" },
      { key: "domain", label: "Domain" },
    ],
  },
  { prefixes: ["/routines"], targets: [{ key: "routine", label: "Routine" }] },
  {
    prefixes: ["/career"],
    targets: [
      { key: "course", label: "Course" },
      { key: "certificate", label: "Certificate" },
      { key: "contact", label: "Contact" },
    ],
  },
];

/** Empty on any page without a quick-capture target — the caller falls back
 * to the existing AI-parsed capture flow unchanged. */
export function quickCaptureFor(pathname: string): QuickCaptureTarget[] {
  return TARGETS.find(({ prefixes }) => prefixes.some((p) => pathname.startsWith(p)))?.targets ?? [];
}

/** Fired at CollapsibleForm (opens + scrolls into view) and, on Career,
 * at CareerTabs (switches to the tab that id lives on first) — see their
 * own "bp:quick-capture" listeners. */
export function openQuickCapture(key: string) {
  window.dispatchEvent(new CustomEvent("bp:quick-capture", { detail: { id: key } }));
}
