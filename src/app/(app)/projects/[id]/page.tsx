import { notFound } from "next/navigation";
import { getProjectDetail, getChecklistTemplates } from "@/lib/data/projects";
import { MilestoneRow } from "@/components/milestone-row";
import { ChecklistItemRow } from "@/components/checklist-item-row";
import { createMilestone, createChecklist, addChecklistItem, logActivity } from "../actions";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let detail: Awaited<ReturnType<typeof getProjectDetail>>;
  try {
    detail = await getProjectDetail(id);
  } catch {
    notFound();
  }
  const { project, milestones, checklists, checklistItems, activityLogs } = detail!;
  const templates = await getChecklistTemplates();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-mist">{project.name}</h1>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-mist-dim">
          {project.engagement === "retainer" ? "Retainer" : project.kind === "area" ? "Area" : "Project"}
        </span>
      </div>
      <p className="mt-1 text-sm text-mist-dim">{project.hours_logged.toFixed(1)} hours logged</p>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-mist-dim">Milestones</h2>
        <div className="glass mt-3 flex flex-col gap-4 rounded-xl p-4">
          {milestones.map((m) => (
            <MilestoneRow key={m.id} projectId={project.id} milestone={m} />
          ))}
          {milestones.length === 0 && <p className="text-sm text-mist-dim">No milestones yet.</p>}
          <form action={createMilestone.bind(null, project.id)} className="flex gap-2">
            <input
              name="name"
              required
              placeholder="New milestone"
              className="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-mist outline-none focus-visible:ring-2 focus-visible:ring-dusk"
            />
            <button type="submit" className="rounded-lg bg-dawn px-3 py-1.5 text-sm font-medium text-ink">
              Add
            </button>
          </form>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-mist-dim">Checklists</h2>
        <div className="mt-3 flex flex-col gap-3">
          {checklists.map((checklist) => (
            <div key={checklist.id} className="glass rounded-xl p-4">
              <p className="text-sm font-medium text-mist">{checklist.name}</p>
              <div className="mt-2 flex flex-col gap-1.5">
                {checklistItems
                  .filter((i) => i.checklist_id === checklist.id)
                  .map((item) => (
                    <ChecklistItemRow key={item.id} projectId={project.id} item={item} />
                  ))}
              </div>
              <form
                action={addChecklistItem.bind(null, project.id, checklist.id)}
                className="mt-2 flex gap-2"
              >
                <input
                  name="text"
                  required
                  placeholder="Add item"
                  className="flex-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-xs text-mist outline-none"
                />
                <button type="submit" className="rounded-lg bg-white/10 px-2 py-1 text-xs text-mist">
                  Add
                </button>
              </form>
            </div>
          ))}

          <form action={createChecklist.bind(null, project.id)} className="glass flex flex-col gap-2 rounded-xl p-4 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1 text-xs text-mist-dim">
              New checklist
              <input
                name="name"
                required
                placeholder="Launch checklist"
                className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-mist outline-none focus-visible:ring-2 focus-visible:ring-dusk"
              />
            </label>
            {templates.length > 0 && (
              <label className="flex flex-col gap-1 text-xs text-mist-dim">
                From template
                <select name="template_id" className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-mist outline-none">
                  <option value="">Blank</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button type="submit" className="rounded-lg bg-dawn px-4 py-2 text-sm font-medium text-ink">
              Add
            </button>
          </form>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-mist-dim">Activity</h2>
        <div className="glass mt-3 rounded-xl p-4">
          <form action={logActivity.bind(null, project.id)} className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs text-mist-dim">
              Minutes
              <input
                type="number"
                name="minutes"
                required
                min={1}
                className="w-20 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-sm text-mist outline-none"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs text-mist-dim">
              Note
              <input
                name="note"
                placeholder="What did you work on?"
                className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-mist outline-none"
              />
            </label>
            <button type="submit" className="rounded-lg bg-dawn px-3 py-1.5 text-sm font-medium text-ink">
              Log
            </button>
          </form>

          {activityLogs.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {activityLogs.map((log) => (
                <li key={log.id} className="flex justify-between text-xs text-mist-dim">
                  <span>{log.note || "—"}</span>
                  <span>
                    {log.minutes}m · {new Date(log.logged_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
