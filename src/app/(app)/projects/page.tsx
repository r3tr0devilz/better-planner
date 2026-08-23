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
      <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-mist">Projects</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <form action={createDomain} className="glass flex flex-col gap-2 rounded-xl p-4">
          <span className="text-xs text-mist-dim">New domain</span>
          <div className="flex gap-2">
            <input
              name="name"
              required
              placeholder="Home, Hill Media Group…"
              className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-mist outline-none focus-visible:ring-2 focus-visible:ring-dusk"
            />
            <input type="color" name="color" defaultValue="#8c9eff" className="h-9 w-9 rounded-lg bg-transparent" />
            <button type="submit" className="rounded-lg bg-dawn px-3 py-2 text-sm font-medium text-ink">
              Add
            </button>
          </div>
        </form>

        <form action={createProject} className="glass flex flex-col gap-2 rounded-xl p-4">
          <span className="text-xs text-mist-dim">New project or area</span>
          <input
            name="name"
            required
            placeholder="Client website, Family…"
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-mist outline-none focus-visible:ring-2 focus-visible:ring-dusk"
          />
          <div className="flex gap-2">
            <select name="domain_id" className="flex-1 rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-mist outline-none">
              <option value="">No domain</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select name="kind" className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-mist outline-none">
              <option value="project">Project</option>
              <option value="area">Area</option>
            </select>
            <select name="engagement" className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-mist outline-none">
              <option value="project">One-time</option>
              <option value="retainer">Retainer</option>
            </select>
            <button type="submit" className="rounded-lg bg-dawn px-3 py-2 text-sm font-medium text-ink">
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
            <h2 className="flex items-center gap-2 text-sm font-medium text-mist-dim">
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
          <h2 className="text-sm font-medium text-mist-dim">No domain</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {unassigned.map((project) => (
              <ProjectCard key={project.id} project={project} threadIndex={-1} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-medium text-mist-dim">Checklist templates</h2>
        <p className="mt-1 text-xs text-mist-dim">
          Reusable checklists (e.g. &ldquo;New website&rdquo;) you can drop into any project.
        </p>
        <form action={createChecklistTemplate} className="glass mt-3 flex flex-col gap-2 rounded-xl p-4">
          <input
            name="name"
            required
            placeholder="Template name"
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-mist outline-none focus-visible:ring-2 focus-visible:ring-dusk"
          />
          <textarea
            name="items"
            required
            rows={3}
            placeholder={"One item per line\nSet up hosting\nInstall WordPress"}
            className="resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-mist outline-none focus-visible:ring-2 focus-visible:ring-dusk"
          />
          <button type="submit" className="self-start rounded-lg bg-dawn px-3 py-2 text-sm font-medium text-ink">
            Save template
          </button>
        </form>
        {templates.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {templates.map((t) => (
              <li key={t.id} className="rounded-full bg-white/5 px-3 py-1 text-xs text-mist-dim">
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
      data-thread={threadIndex >= 0 ? threadIndex : undefined}
      className="thread-edge glass flex flex-col gap-1 rounded-xl px-4 py-3 transition-transform hover:scale-[1.01]"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-mist">{project.name}</p>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-mist-dim">
          {project.engagement === "retainer" ? "Retainer" : project.kind === "area" ? "Area" : "Project"}
        </span>
      </div>
      <p className="text-xs text-mist-dim">{project.hours_logged.toFixed(1)}h logged</p>
    </Link>
  );
}
