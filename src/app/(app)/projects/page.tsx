import Link from "next/link";
import { getProjects, getChecklistTemplates } from "@/lib/data/projects";
import { getDomains } from "@/lib/data/domains";
import { PageHeader } from "@/components/page-header";
import { createDomain, createProject, createChecklistTemplate } from "./actions";

export default async function ProjectsPage() {
  const [projects, domains, templates] = await Promise.all([
    getProjects(),
    getDomains(),
    getChecklistTemplates(),
  ]);

  const unassigned = projects.filter((p) => !p.domain_id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Projects" context={`${projects.length} projects across ${domains.length} domains`} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <form action={createDomain} className="card flex flex-col gap-2 p-4">
          <span className="text-xs text-ink-faint">New domain</span>
          <div className="field-row">
            <label className="field-wide">
              Name
              <input name="name" required placeholder="Home, Hill Media Group…" className="field" />
            </label>
            <label className="field-narrow">
              Color
              <input type="color" name="color" defaultValue="#33486e" className="h-9 w-full border border-line bg-transparent p-0" />
            </label>
            <button type="submit" className="btn">
              Add
            </button>
          </div>
        </form>

        <form action={createProject} className="card flex flex-col gap-2 p-4">
          <span className="text-xs text-ink-faint">New project or area</span>
          <input name="name" required placeholder="Client website, Family…" className="field" />
          <div className="field-row">
            <label className="field-wide">
              Domain
              <select name="domain_id" className="field">
                <option value="">No domain</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Kind
              <select name="kind" className="field">
                <option value="project">Project</option>
                <option value="area">Area</option>
              </select>
            </label>
            <label>
              Engagement
              <select name="engagement" className="field">
                <option value="project">One-time</option>
                <option value="retainer">Retainer</option>
              </select>
            </label>
            <button type="submit" className="btn">
              Add
            </button>
          </div>
        </form>
      </div>

      {domains.map((domain, i) => {
        const items = projects.filter((p) => p.domain_id === domain.id);
        if (items.length === 0) return null;
        return (
          <section key={domain.id} id={`domain-${domain.id}`} className="mt-8 scroll-mt-20">
            <h2 className="flex items-center gap-2 text-sm font-medium text-ink-faint">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: domain.color }}
                aria-hidden
              />
              {domain.name}
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {items.map((project) => (
                <ProjectCard key={project.id} project={project} threadIndex={i % 6} />
              ))}
            </div>
          </section>
        );
      })}

      {unassigned.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink-faint">No domain</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {unassigned.map((project) => (
              <ProjectCard key={project.id} project={project} threadIndex={-1} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-medium text-ink-faint">Checklist templates</h2>
        <p className="mt-1 text-xs text-ink-faint">
          Reusable checklists (e.g. &ldquo;New website&rdquo;) you can drop into any project.
        </p>
        <form action={createChecklistTemplate} className="card mt-3 flex flex-col gap-2 p-4">
          <input name="name" required placeholder="Template name" className="field" />
          <textarea
            name="items"
            required
            rows={3}
            placeholder={"One item per line\nSet up hosting\nInstall WordPress"}
            className="field"
          />
          <button type="submit" className="btn self-start">
            Save template
          </button>
        </form>
        {templates.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {templates.map((t) => (
              <li key={t.id} className="max-w-full truncate border border-line px-3 py-1 font-mono text-xs text-ink-faint">
                {t.name}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ProjectCard({
  project,
  threadIndex,
}: {
  project: Awaited<ReturnType<typeof getProjects>>[number];
  threadIndex: number;
}) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="card flex flex-col gap-1 px-4 py-3 transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]"
    >
      <div className="flex items-center gap-2">
        {threadIndex >= 0 && <span className="thread-mark" data-thread={threadIndex} aria-hidden />}
        <p className="min-w-0 flex-1 truncate text-sm text-ink">{project.name}</p>
        <span className="shrink-0 border border-line px-2 py-0.5 font-mono text-[11px] text-ink-faint">
          {project.engagement === "retainer" ? "Retainer" : project.kind === "area" ? "Area" : "Project"}
        </span>
      </div>
      <p className="pl-[19px] text-xs text-ink-faint">{project.hours_logged.toFixed(1)}h logged</p>
    </Link>
  );
}
