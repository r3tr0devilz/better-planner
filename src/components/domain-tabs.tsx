"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { THREAD_COUNT } from "@/lib/domain-threads";
import type { Domain, Task } from "@/lib/supabase/types";
import { TaskRow } from "@/components/task-row";

/**
 * Physical binder-tab navigation, one per domain, cycling the same accent
 * set as thread-mark/card-flag. Desktop only — a fixed vertical strip has
 * nowhere sensible to go on a narrow viewport, so it just hides on mobile
 * rather than trying to collapse into something else. Domains already come
 * in from `getDomains()` sorted by name, so tab order — and the index each
 * tab's color is derived from — stays alphabetical automatically as domains
 * are added or renamed.
 *
 * Clicking a tab opens a modal listing that domain's tasks, filtered from
 * the same task list the page already fetched for its own lists.
 */
export function DomainTabs({ domains, tasks }: { domains: Domain[]; tasks: Task[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const close = useCallback(() => setOpenId(null), []);

  useEffect(() => {
    if (!openId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, close]);

  if (domains.length === 0) return null;

  const openIndex = domains.findIndex((d) => d.id === openId);
  const openDomain = openIndex === -1 ? null : domains[openIndex];
  const openTasks = openDomain ? tasks.filter((t) => t.domain_id === openDomain.id) : [];

  return (
    <>
      <nav aria-label="Jump to a domain" className="hidden shrink-0 flex-col md:flex">
        {domains.map((domain, i) => (
          <button
            key={domain.id}
            type="button"
            onClick={() => setOpenId(domain.id)}
            className="tab"
            data-thread={i % THREAD_COUNT}
          >
            {domain.name}
          </button>
        ))}
      </nav>

      {openDomain && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-24"
          onClick={close}
        >
          <div className="modal-panel card w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-tight text-ink">
                {openDomain.name}
              </h2>
              <button onClick={close} aria-label="Close" className="text-ink-faint transition-colors duration-150 hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <div className="ledger mt-4 max-h-[60vh] overflow-y-auto">
              {openTasks.map((task) => (
                <TaskRow key={task.id} task={task} threadIndex={openIndex % THREAD_COUNT} domains={domains} />
              ))}
              {openTasks.length === 0 && (
                <p className="py-3 text-sm text-ink-faint">No tasks in this domain yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
