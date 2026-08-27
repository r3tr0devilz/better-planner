"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/filter-bar";
import { DeleteButton } from "@/components/delete-button";
import { useUndoableDelete } from "@/lib/use-undoable-delete";
import { deleteProject } from "./actions";
import type { Domain, Project } from "@/lib/supabase/types";

function ProjectCard({
  project,
  threadIndex,
  onDelete,
}: {
  project: Project;
  threadIndex: number;
  onDelete: () => void;
}) {
  return (
    <div className="card relative flex flex-col gap-1 px-4 py-3 transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]">
      <Link href={`/projects/${project.id}`} className="flex flex-col gap-1 pr-7">
        <div className="flex items-center gap-2">
          {threadIndex >= 0 && <span className="thread-mark" data-thread={threadIndex} aria-hidden />}
          <p className="min-w-0 flex-1 truncate text-sm text-ink">{project.name}</p>
          <span className="shrink-0 border border-line px-2 py-0.5 font-mono text-[11px] text-ink-faint">
            {project.engagement === "retainer" ? "Retainer" : project.kind === "area" ? "Area" : "Project"}
          </span>
        </div>
        <p className="pl-[19px] text-xs text-ink-faint">{project.hours_logged.toFixed(1)}h logged</p>
      </Link>
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
        className="absolute right-1 top-1 flex h-9 w-9 shrink-0 items-center justify-center text-ink-faint/60 transition-colors duration-150 hover:text-vermillion"
        iconSize={14}
      />
    </div>
  );
}

export function ProjectList({ projects, domains }: { projects: Project[]; domains: Domain[] }) {
  const [search, setSearch] = useState("");
  const [domainId, setDomainId] = useState<string | null>(null);
  const { hiddenIds, requestDelete } = useUndoableDelete(deleteProject);
  const filtering = search.trim() !== "" || domainId !== null;

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
        <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search projects…" domains={domains} activeDomainId={domainId} onDomainChange={setDomainId} />
      </div>

      {domains.map((domain, i) => {
        if (domainId && domainId !== domain.id) return null;
        const items = filtered.filter((p) => p.domain_id === domain.id);
        if (filtering && items.length === 0) return null;
        return (
          <section key={domain.id} id={`domain-${domain.id}`} className="mt-8 scroll-mt-20">
            <h2 className="flex items-center gap-2 text-sm font-medium text-ink-faint">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: domain.color }} aria-hidden />
              {domain.name}
            </h2>
            {items.length === 0 ? (
              <p className="mt-3 text-sm text-ink-faint">No projects in this domain yet — add one above.</p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {items.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    threadIndex={i % 6}
                    onDelete={() => requestDelete(project.id, `"${project.name}"`)}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {!domainId && unassigned.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink-faint">No domain</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {unassigned.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                threadIndex={-1}
                onDelete={() => requestDelete(project.id, `"${project.name}"`)}
              />
            ))}
          </div>
        </section>
      )}

      {filtering && totalShown === 0 && <p className="mt-8 text-sm text-ink-faint">No projects match this filter.</p>}
    </>
  );
}
