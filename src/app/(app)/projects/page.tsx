import Link from "next/link";
import { getProjects, getChecklistTemplates } from "@/lib/data/projects";
import { getDomains } from "@/lib/data/domains";
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
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Projects</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <form action={createDomain} className="card flex flex-col gap-2 p-4">
          <span className="text-xs text-ink-faint">New domain</span>
          <div className="flex gap-2">
            <input
              name="name"
              required
              placeholder="Home, Hill Media Group…"
              className="flex-1 border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
            />
            <input type="color" name="color" defaultValue="#33486e" className="h-9 w-9 border border-paper-line bg-transparent" />
            <button type="submit" className="bg-stamp-red px-3 py-2 text-sm font-medium text-paper-card">
              Add
            </button>
          </div>
        </form>

        <form action={createProject} className="card flex flex-col gap-2 p-4">
          <span className="text-xs text-ink-faint">New project or area</span>
          <input
            name="name"
            required
            placeholder="Client website, Family…"
            className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
          />
          <div className="flex gap-2">
            <select name="domain_id" className="flex-1 border border-paper-line bg-paper px-2 py-2 text-sm text-ink outline-none">
              <option value="">No domain</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select name="kind" className="border border-paper-line bg-paper px-2 py-2 text-sm text-ink outline-none">
              <option value="project">Project</option>
              <option value="area">Area</option>
            </select>
            <select name="engagement" className="border border-paper-line bg-paper px-2 py-2 text-sm text-ink outline-none">
              <option value="project">One-time</option>
              <option value="retainer">Retainer</option>
            </select>
            <button type="submit" className="bg-stamp-red px-3 py-2 text-sm font-medium text-paper-card">
              Add
            </button>
          </div>
        </form>
      </div>

      {domains.map((domain, i) => {
        const items = projects.filter((p) => p.domain_id === domain.id);
        if (items.length === 0) return null;
        return (
          <section key={domain.id} className="mt-8">
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
          <input
            name="name"
            required
            placeholder="Template name"
            className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
          />
          <textarea
            name="items"
            required
            rows={3}
            placeholder={"One item per line\nSet up hosting\nInstall WordPress"}
            className="resize-none border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
          />
          <button type="submit" className="self-start bg-stamp-red px-3 py-2 text-sm font-medium text-paper-card">
            Save template
          </button>
        </form>
        {templates.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {templates.map((t) => (
              <li key={t.id} className="border border-paper-line px-3 py-1 font-mono text-xs text-ink-faint">
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
      className="card flex flex-col gap-1 px-4 py-3 transition-transform hover:scale-[1.01]"
    >
      <div className="flex items-center gap-2">
        {threadIndex >= 0 && <span className="stamp-dot" data-thread={threadIndex} aria-hidden />}
        <p className="flex-1 text-sm text-ink">{project.name}</p>
        <span className="border border-paper-line px-2 py-0.5 font-mono text-[11px] text-ink-faint">
          {project.engagement === "retainer" ? "Retainer" : project.kind === "area" ? "Area" : "Project"}
        </span>
      </div>
      <p className="pl-[19px] text-xs text-ink-faint">{project.hours_logged.toFixed(1)}h logged</p>
    </Link>
  );
}
