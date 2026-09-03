import { createTask } from "@/app/(app)/tasks/actions";
import { createNote } from "@/app/(app)/library/actions";
import { createPerson } from "@/app/(app)/people/actions";
import { createItem } from "@/app/(app)/inventory/actions";
import { createProject } from "@/app/(app)/projects/actions";
import { createRoutine } from "@/app/(app)/routines/actions";

/**
 * Every page already has its own "+ New X" server action, and every one of
 * them tolerates a single-field FormData — createTask just needs a title,
 * createNote just a body, and so on, defaulting everything else. This map
 * lets the global Capture button skip the AI round trip on pages where
 * "what kind of thing is this" is already obvious from where you're
 * standing, and just call that same action directly.
 *
 * Deliberately excludes pages whose create action needs more than one
 * required field to mean anything (Career's createJobApplication needs
 * both company AND role — there's no single line of text that splits into
 * those two safely) and pages with no create action at all (Calendar, Ash,
 * Settings). Those keep going through AI capture same as before.
 */
export type QuickCaptureTarget = {
  /** What the field is called in the modal and the toast ("Add a task"). */
  kind: string;
  /** Placeholder text for the quick-add input. */
  placeholder: string;
  /** The FormData key the target action reads for this one field. */
  field: string;
  action: (formData: FormData) => void | Promise<void>;
};

const TARGETS: { prefixes: string[]; target: QuickCaptureTarget }[] = [
  {
    prefixes: ["/today", "/tasks"],
    target: { kind: "task", placeholder: "New task…", field: "title", action: createTask },
  },
  {
    prefixes: ["/library", "/notes"],
    target: { kind: "note", placeholder: "New note…", field: "body", action: createNote },
  },
  {
    prefixes: ["/people"],
    target: { kind: "person", placeholder: "New person…", field: "name", action: createPerson },
  },
  {
    prefixes: ["/inventory"],
    target: { kind: "item", placeholder: "New item…", field: "name", action: createItem },
  },
  {
    prefixes: ["/projects"],
    target: { kind: "project", placeholder: "New project or area…", field: "name", action: createProject },
  },
  {
    prefixes: ["/routines"],
    target: { kind: "routine", placeholder: "New routine…", field: "name", action: createRoutine },
  },
];

/** Null on any page without a quick-capture target — the caller falls back
 * to the existing AI-parsed capture flow unchanged. */
export function quickCaptureFor(pathname: string): QuickCaptureTarget | null {
  return TARGETS.find(({ prefixes }) => prefixes.some((p) => pathname.startsWith(p)))?.target ?? null;
}
