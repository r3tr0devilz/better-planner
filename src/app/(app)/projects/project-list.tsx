"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/filter-bar";
import { DeleteButton } from "@/components/delete-button";
import { useUndoableDelete } from "@/lib/use-undoable-delete";
import { useUrlState } from "@/lib/use-url-state";
import { threadIndexFor } from "@/lib/domain-threads";
import { deleteProject } from "./actions";
import type { Domain, Project, Task } from "@/lib/supabase/types";

/** The print-run stick: 10 (untouched — no tasks yet, or none started) down
 * to 0 (fully burned through — every task done). Same 0–10 scale and
 * semantics as Today's day stick (see incense.css .day-burn[data-fill]),
 * just keyed to one project's tasks instead of today's due tasks. */
function printRun(projectId: string, tasks: Task[]): { fill: number; countText: string } {
  const own = tasks.filter((t) => t.project_id === projectId);
  const open = own.filter((t) => t.status === "open").length;
  const total = own.length;
  if (total === 0) return { fill: 10, countText: "0 OPEN" };
  if (open === 0) return { fill: 0, countText: "CLEAR" };
  return { fill: Math.round((open / total) * 10), countText: `${open} OPEN` };
}

function ProjectRow({
  project,
  threadIndex,
  tasks,
  onDelete,
}: {
  project: Project;
  threadIndex: number;
  tasks: Task[];
  onDelete: () => void;
}) {
  const { fill, countText } = printRun(project.id, tasks);
  const meta = `${project.kind === "area" ? "AREA" : "PROJECT"} · ${project.engagement === "retainer" ? "RETAINER" : "ONE-TIME"}`;

  return (
    <div className="proj-row relative" data-thread={threadIndex >= 0 ? threadIndex : undefined}>
      <Link href={`/projects/${project.id}`} className="min-w-0">
        <p className="truncate text-sm text-ink">{project.name}</p>
        <p className="mt-0.5 font-mono text-[10px] tracking-wide text-ink-faint">{meta}</p>
      </Link>
      <span className="stick-track">
        <span className="day-burn" data-fill={fill}>
          <span className="stick-tip" />
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] tracking-wide text-ink-faint">
        {countText}
        <DeleteButton
          confirmMessage={`Delete "${project.name}"? This also removes its milestones, checklists, and activity log. This can't be undone.`}
          label=""
          pendingLabel=""
          ariaLabel={`Delete "${project.name}"`}
          onDelete={() => {
            onDelete();
            return Promise.resolve();
          }}
          skipConfirm
          className="flex h-7 w-7 shrink-0 items-center justify-center text-ink-faint/60 transition-colors duration-150 hover:text-vermillion"
          iconSize={13}
        />
      </span>
    </div>
  );
}

export function ProjectList({ projects, domains, tasks }: { projects: Project[]; domains: Domain[]; tasks: Task[] }) {
  const [search, setSearch] = useUrlState("q");
  const [domainId, setDomainId] = useUrlState("domain");
  const { hiddenIds, requestDelete } = useUndoableDelete(deleteProject);
  const filtering = search.trim() !== "" || domainId !== "";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (hiddenIds.has(p.id)) return false;
      if (domainId && p.domain_id !== domainId) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [projects, search, domainId, hiddenIds]);

  const unassigned = filtered.filter((p) => !p.domain_id);
  const totalShown = filtered.length;

  return (
    <>
      <div className="mt-6">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search projects…"
          domains={domains}
          activeDomainId={domainId || null}
          onDomainChange={(id) => setDomainId(id ?? "")}
        />
      </div>

      {domains.map((domain) => {
        if (domainId && domainId !== domain.id) return null;
        const items = filtered.filter((p) => p.domain_id === domain.id);
        if (filtering && items.length === 0) return null;
        const threadIndex = threadIndexFor(domain.id, domains);
        return (
          <section key={domain.id} id={`domain-${domain.id}`} className="mt-8 scroll-mt-20" data-thread={threadIndex}>
            <div className="flex items-center gap-2.5 border-b-2 border-ink pb-2.5">
              <span className="dom-swatch" aria-hidden />
              <h2 className="flex-1 text-sm font-medium text-ink-faint">{domain.name}</h2>
              <span className="font-mono text-[10px] tracking-wide text-ink-faint">
                {items.length} ON THE TAB
              </span>
            </div>
            {items.length === 0 ? (
              <p className="mt-3 text-sm text-ink-faint">No projects in this domain yet — add one above.</p>
            ) : (
              items.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  threadIndex={threadIndex}
                  tasks={tasks}
                  onDelete={() => requestDelete(project.id, `"${project.name}"`)}
                />
              ))
            )}
          </section>
        );
      })}

      {!domainId && unassigned.length > 0 && (
        <section className="mt-8">
          <div className="border-b-2 border-ink pb-2.5">
            <h2 className="text-sm font-medium text-ink-faint">No domain</h2>
          </div>
          {unassigned.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              threadIndex={-1}
              tasks={tasks}
              onDelete={() => requestDelete(project.id, `"${project.name}"`)}
            />
          ))}
        </section>
      )}

      {filtering && totalShown === 0 && <p className="mt-8 text-sm text-ink-faint">No projects match this filter.</p>}
    </>
  );
}
