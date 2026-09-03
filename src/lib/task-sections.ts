import type { Task, TaskState } from "@/lib/supabase/types";

export type TaskSection = { id: string | null; label: string; items: Task[]; canDrop: boolean };

const PRIORITY_RANK: Record<Task["priority"], number> = { high: 0, medium: 1, low: 2 };

/** Groups open tasks into "Open" (no state) plus one section per user-defined
 * state, in sort_order — shared by Today and Tasks so the two pages can't
 * drift into grouping tasks differently. Each bucket is then ordered high
 * to low priority; `Array#sort` is stable, so same-priority tasks keep the
 * due-date order the caller fetched them in. */
export function groupByState(tasks: Task[], states: TaskState[]): TaskSection[] {
  const sections: TaskSection[] = [{ id: null, label: "Open", items: [], canDrop: false }];
  const byId = new Map<string, TaskSection>();
  for (const state of states) {
    const section: TaskSection = { id: state.id, label: state.name, items: [], canDrop: true };
    sections.push(section);
    byId.set(state.id, section);
  }

  for (const task of tasks) {
    const section = (task.state_id && byId.get(task.state_id)) || sections[0];
    section.items.push(task);
  }

  for (const section of sections) {
    section.items.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  }

  return sections;
}

/** The state a slip's chip moves it to next: the following state in sort
 * order, wrapping back to null (plain Open) after the last one. */
export function nextState(currentStateId: string | null, states: TaskState[]): string | null {
  if (states.length === 0) return null;
  if (!currentStateId) return states[0].id;
  const index = states.findIndex((s) => s.id === currentStateId);
  if (index === -1 || index === states.length - 1) return null;
  return states[index + 1].id;
}
