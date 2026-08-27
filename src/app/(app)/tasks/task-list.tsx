"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckSquare, Trash2, X } from "lucide-react";
import { TaskRow } from "@/components/task-row";
import { FilterBar } from "@/components/filter-bar";
import { threadIndexFor } from "@/lib/domain-threads";
import { useUndoableDelete } from "@/lib/use-undoable-delete";
import { bulkSetStatus, bulkDelete, deleteTask } from "./actions";
import type { Domain, Task } from "@/lib/supabase/types";

export function TaskList({ tasks, domains }: { tasks: Task[]; domains: Domain[] }) {
  const [search, setSearch] = useState("");
  const [domainId, setDomainId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const { hiddenIds, requestDelete } = useUndoableDelete(deleteTask);

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
  const filtering = search.trim() !== "" || domainId !== null;

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
    if (!confirm(`Delete ${selected.size} task${selected.size === 1 ? "" : "s"}? This can't be undone.`)) return;
    const ids = [...selected];
    startTransition(() => bulkDelete(ids));
    exitSelectMode();
  }

  function rowProps(task: Task) {
    return {
      task,
      threadIndex: threadIndexFor(task.domain_id, domains),
      domains,
      selectable: selectMode,
      selected: selected.has(task.id),
      onToggleSelect: () => toggleSelect(task.id),
      onDelete: () => requestDelete(task.id, `"${task.title}"`),
    };
  }

  return (
    <>
      <div className="mt-6">
        <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search tasks…" domains={domains} activeDomainId={domainId} onDomainChange={setDomainId} />
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
        <h2 className="text-sm font-medium text-ink-faint">Open ({open.length})</h2>
        <div className="ledger mt-3">
          {open.length === 0 && (
            <p className="py-3 text-sm text-ink-faint">
              {filtering ? "No open tasks match this filter." : "Nothing open. Add something above."}
            </p>
          )}
          {open.map((task) => (
            <TaskRow key={task.id} {...rowProps(task)} />
          ))}
        </div>
      </section>

      {done.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer list-none text-sm font-medium text-ink-faint marker:hidden [&::-webkit-details-marker]:hidden">
            Done ({done.length}) — tap to show
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
