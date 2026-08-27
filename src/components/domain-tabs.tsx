"use client";

import { useCallback, useState } from "react";
import { THREAD_COUNT } from "@/lib/domain-threads";
import type { Domain, Task } from "@/lib/supabase/types";
import { TaskRow } from "@/components/task-row";
import { Modal } from "@/components/modal";

/** Long names ("YouTube — Field Notes") make the vertical binder tab heavy —
 * take the first segment/word or two and let the tooltip carry the rest. */
function shortDomainLabel(name: string): string {
  const firstSegment = name.split(/[—–|:]/)[0].trim();
  const words = firstSegment.split(/\s+/);
  return words.length <= 2 ? firstSegment : words.slice(0, 2).join(" ");
}

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

  if (domains.length === 0) return null;

  const openIndex = domains.findIndex((d) => d.id === openId);
  const openDomain = openIndex === -1 ? null : domains[openIndex];
  const openTasks = openDomain ? tasks.filter((t) => t.domain_id === openDomain.id) : [];

  return (
    <>
      <nav aria-label="Jump to a domain" className="hidden shrink-0 flex-col md:flex">
        {domains.map((domain, i) => (
          <div key={domain.id} className="group relative">
            <button
              type="button"
              onClick={() => setOpenId(domain.id)}
              className="tab"
              data-thread={i % THREAD_COUNT}
              aria-label={domain.name}
            >
              {shortDomainLabel(domain.name)}
            </button>
            {domain.name !== shortDomainLabel(domain.name) && (
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 z-10 ml-1 -translate-y-1/2 whitespace-nowrap rounded border border-ink bg-ink px-2 py-1 font-mono text-[0.65rem] text-panel opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
              >
                {domain.name}
              </span>
            )}
          </div>
        ))}
      </nav>

      {openDomain && (
        <Modal onClose={close} title={openDomain.name}>
          <div className="ledger mt-4 max-h-[60vh] overflow-y-auto">
            {openTasks.map((task) => (
              <TaskRow key={task.id} task={task} threadIndex={openIndex % THREAD_COUNT} domains={domains} />
            ))}
            {openTasks.length === 0 && <p className="py-3 text-sm text-ink-faint">No tasks in this domain yet.</p>}
          </div>
        </Modal>
      )}
    </>
  );
}
