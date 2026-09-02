import { getTasks } from "@/lib/data/tasks";
import { getRoutines } from "@/lib/data/routines";
import { getProjects } from "@/lib/data/projects";
import { getBurnEvents } from "@/lib/data/burn";
import { getLibraryNotes, getBooks } from "@/lib/data/library";
import { getPeople } from "@/lib/data/people";
import { getJobApplications } from "@/lib/data/career";
import { getInventoryItems } from "@/lib/data/inventory";

/** The counts on the right edge of the desktop ledger-index nav — see
 * AppShell. One fetch per page load; this is a single-user planner, not a
 * scale concern. */
export async function getNavCounts() {
  const [tasks, routines, projects, burnEvents, libraryNotes, books, people, applications, inventory] =
    await Promise.all([
      getTasks(),
      getRoutines(),
      getProjects(),
      getBurnEvents(),
      getLibraryNotes(),
      getBooks(),
      getPeople(),
      getJobApplications(),
      getInventoryItems(),
    ]);

  const now = new Date();
  const open = tasks.filter((t) => t.status === "open");
  const today = open.filter((t) => {
    if (!t.due_at) return false;
    const due = new Date(t.due_at);
    return due < now || due.toDateString() === now.toDateString();
  });

  return {
    today: today.length,
    tasks: open.length,
    routines: routines.length,
    projects: projects.length,
    ash: burnEvents.length,
    library: libraryNotes.length + books.length,
    people: people.length,
    career: applications.filter((a) => a.status !== "rejected" && a.status !== "archived").length,
    inventory: inventory.filter((i) => !i.removed_at).length,
  };
}
