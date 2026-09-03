import { createTask } from "@/app/(app)/tasks/actions";
import { createNote, createBook } from "@/app/(app)/library/actions";
import { createPerson } from "@/app/(app)/people/actions";
import { createItem } from "@/app/(app)/inventory/actions";
import { createDomain, createProject } from "@/app/(app)/projects/actions";
import { createRoutine } from "@/app/(app)/routines/actions";
import { createCourse, createCertificate, createCareerContact } from "@/app/(app)/career/actions";
import { parseDayKey } from "@/app/(app)/calendar/lib";

/**
 * Every page already has its own "+ New X" server action, and every one
 * listed here tolerates a single required field, defaulting the rest —
 * createTask just needs a title, createNote just a body, and so on. This
 * lets the global Capture button skip the AI round trip on pages where
 * "what kind of thing is this" is already obvious from where you're
 * standing, and just call that same action directly.
 *
 * Excluded on purpose: createJobApplication (needs both company AND role —
 * no single line of text splits into those two safely) and pages with no
 * create action at all (Ash, Settings, and /notes — that page is a
 * deliberately static archive with no live data or create action of its
 * own, see its own page.tsx comment). Those keep going through AI capture,
 * same as before this existed.
 */
export type QuickCaptureTarget = {
  /** Stable id for the picker's selection state — not shown anywhere. */
  key: string;
  /** Short noun for the picker chip and the success line ("Task", "Note"). */
  label: string;
  placeholder: string;
  /** The FormData key the target action reads for the one typed field. */
  field: string;
  action: (formData: FormData) => void | Promise<void>;
  /** Extra FormData entries computed at submit time from page context —
   * Calendar's due date, derived from the day currently being viewed
   * rather than typed. Reads window.location directly (called from a
   * client event handler, not a hook) so it doesn't force this component's
   * whole subtree into a Suspense boundary the way useSearchParams would. */
  extra?: () => Record<string, string>;
};

function calendarDueAt(): Record<string, string> {
  const dateParam = new URLSearchParams(window.location.search).get("date");
  const date = dateParam ? parseDayKey(dateParam) : new Date();
  date.setHours(12, 0, 0, 0);
  return { due_at: date.toISOString() };
}

const TARGETS: { prefixes: string[]; targets: QuickCaptureTarget[] }[] = [
  {
    prefixes: ["/today", "/tasks"],
    targets: [{ key: "task", label: "Task", placeholder: "New task…", field: "title", action: createTask }],
  },
  {
    prefixes: ["/library"],
    targets: [
      { key: "note", label: "Note", placeholder: "New note…", field: "body", action: createNote },
      { key: "book", label: "Book", placeholder: "New book…", field: "title", action: createBook },
    ],
  },
  {
    prefixes: ["/people"],
    targets: [{ key: "person", label: "Person", placeholder: "New person…", field: "name", action: createPerson }],
  },
  {
    prefixes: ["/inventory"],
    targets: [{ key: "item", label: "Item", placeholder: "New item…", field: "name", action: createItem }],
  },
  {
    prefixes: ["/projects"],
    targets: [
      { key: "project", label: "Project", placeholder: "New project or area…", field: "name", action: createProject },
      { key: "domain", label: "Domain", placeholder: "New domain…", field: "name", action: createDomain },
    ],
  },
  {
    prefixes: ["/routines"],
    targets: [{ key: "routine", label: "Routine", placeholder: "New routine…", field: "name", action: createRoutine }],
  },
  {
    prefixes: ["/calendar"],
    targets: [
      {
        key: "calendar-task",
        label: "Task",
        placeholder: "New task on this day…",
        field: "title",
        action: createTask,
        extra: calendarDueAt,
      },
    ],
  },
  {
    prefixes: ["/career"],
    targets: [
      { key: "course", label: "Course", placeholder: "New course…", field: "name", action: createCourse },
      { key: "certificate", label: "Certificate", placeholder: "New certificate…", field: "title", action: createCertificate },
      { key: "contact", label: "Contact", placeholder: "New contact…", field: "name", action: createCareerContact },
    ],
  },
];

/** Empty on any page without a quick-capture target — the caller falls back
 * to the existing AI-parsed capture flow unchanged. */
export function quickCaptureFor(pathname: string): QuickCaptureTarget[] {
  return TARGETS.find(({ prefixes }) => prefixes.some((p) => pathname.startsWith(p)))?.targets ?? [];
}
