"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckSquare, ChevronRight, ListTodo, Trash2, X } from "lucide-react";
import { TaskRow } from "@/components/task-row";
import { FilterBar } from "@/components/filter-bar";
import { EmptyState } from "@/components/empty-state";
import { SubmitButton } from "@/components/submit-button";
import { threadIndexFor } from "@/lib/domain-threads";
import { useUndoableDelete } from "@/lib/use-undoable-delete";
import { useUrlState } from "@/lib/use-url-state";
import { groupByState } from "@/lib/task-sections";
import { bulkSetStatus, deleteTask, createTaskState, deleteTaskState } from "./actions";
import type { Domain, Task, TaskState } from "@/lib/supabase/types";

const OPEN_PAGE_SIZE = 25;

export function TaskList({ tasks, domains, states }: { tasks: Task[]; domains: Domain[]; states: TaskState[] }) {
  const [search, setSearch] = useUrlState("q");
  const [domainId, setDomainId] = useUrlState("domain");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAllOpen, setShowAllOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { hiddenIds, requestDelete, requestDeleteMany } = useUndoableDelete(deleteTask);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (hiddenIds.has(t.id)) return false;
      if (domainId && t.domain_id !== domainId) return false;
      if (q && !t.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, search, domainId, hiddenIds]);

  const open = filtered.filter((t) => t.status === "open");
  const done = filtered.filter((t) => t.status === "done");
  const filtering = search.trim() !== "" || domainId !== "";
  const openShown = showAllOpen || filtering ? open : open.slice(0, OPEN_PAGE_SIZE);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  function handleBulkDone() {
    const ids = [...selected];
    startTransition(() => bulkSetStatus(ids, "done"));
    exitSelectMode();
  }

  function handleBulkDelete() {
    // Same undoable path as a single-row delete, collapsed into one toast —
    // consistent with every other delete in the app instead of stacking a
    // blocking confirm() on top of a bulk action.
    const targets = tasks.filter((t) => selected.has(t.id)).map((t) => ({ id: t.id, label: `"${t.title}"` }));
    requestDeleteMany(targets, "task");
    exitSelectMode();
  }

  function rowProps(task: Task) {
    return {
      task,
      threadIndex: threadIndexFor(task.domain_id, domains),
      domains,
      states,
      selectable: selectMode,
      selected: selected.has(task.id),
      onToggleSelect: () => toggleSelect(task.id),
      onDelete: () => requestDelete(task.id, `"${task.title}"`),
    };
  }

  const openSections = groupByState(openShown, states);

  return (
    <>
      <div className="mt-6">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search tasks…"
          domains={domains}
          activeDomainId={domainId || null}
          onDomainChange={(id) => setDomainId(id ?? "")}
        />
      </div>

      <div className="mt-4 flex min-h-9 items-center">
        {selectMode ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-ink-faint">{selected.size} selected</span>
            <button type="button" disabled={selected.size === 0 || pending} onClick={handleBulkDone} className="btn-outline px-3 py-1.5 text-xs">
              Mark done
            </button>
            <button
              type="button"
              disabled={selected.size === 0 || pending}
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors duration-150 hover:text-vermillion disabled:opacity-50"
            >
              <Trash2 size={13} />
              Delete
            </button>
            <button type="button" onClick={exitSelectMode} className="inline-flex items-center gap-1 text-xs text-ink-faint transition-colors duration-150 hover:text-ink">
              <X size={13} />
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSelectMode(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint transition-colors duration-150 hover:text-ink"
          >
            <CheckSquare size={14} />
            Select
          </button>
        )}
      </div>

      <section className="mt-4">
        {open.length === 0 ? (
          <>
            <h2 data-snap="tasks-open" className="text-sm font-medium text-ink-faint">Open (0)</h2>
            <div className="mt-3">
              <EmptyState
                icon={ListTodo}
                message={filtering ? "No open tasks match this filter." : "Nothing open — add your first task above."}
              />
            </div>
          </>
        ) : (
          openSections.map((sec, i) => (
            <div key={sec.id ?? "open"} className={i > 0 ? "mt-6" : ""}>
              <div className="flex items-baseline gap-1.5">
                <h2 data-snap={i === 0 ? "tasks-open" : undefined} className="text-sm font-medium text-ink-faint">
                  {sec.label} {i === 0 && `(${open.length})`}
                  {i > 0 && ` (${sec.items.length})`}
                </h2>
                {sec.canDrop && (
                  <button
                    type="button"
                    onClick={() => startTransition(() => deleteTaskState(sec.id!))}
                    className="st-drop"
                    title="Remove this state"
                  >
                    ×
                  </button>
                )}
              </div>
              {sec.items.length === 0 ? (
                <p className="mt-3 border-t border-line pt-3 text-center font-mono text-xs text-ink-faint">Nothing here.</p>
              ) : (
                <div className="ledger mt-3">
                  {sec.items.map((task) => (
                    <TaskRow key={task.id} {...rowProps(task)} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        {!filtering && open.length > openShown.length && (
          <button
            type="button"
            onClick={() => setShowAllOpen(true)}
            className="mt-2 text-xs font-semibold text-oxblood hover:underline"
          >
            Show all {open.length} →
          </button>
        )}
        <form
          action={(formData) => startTransition(() => createTaskState(formData))}
          className="mt-6 flex gap-2 border-t border-line pt-4"
        >
          <input name="name" placeholder="New state — waiting on someone, blocked…" className="field min-w-0 flex-1" />
          <SubmitButton className="btn-outline px-3 py-1.5 text-xs" pendingText="Adding…">
            Add state
          </SubmitButton>
        </form>
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
          A state gets its own heading here and on Today. Press the tag on a slip to move it along.
        </p>
      </section>

      {done.length > 0 && (
        <details className="group mt-8">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-ink-faint marker:hidden transition-colors duration-150 hover:text-ink [&::-webkit-details-marker]:hidden">
            <ChevronRight size={14} className="shrink-0 transition-transform duration-150 group-open:rotate-90" aria-hidden />
            Done ({done.length})
          </summary>
          <div className="ledger mt-3">
            {done.map((task) => (
              <TaskRow key={task.id} {...rowProps(task)} />
            ))}
          </div>
        </details>
      )}
    </>
  );
}
