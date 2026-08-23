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
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">{project.name}</h1>
        <span className="border border-paper-line px-3 py-1 font-mono text-xs text-ink-faint">
          {project.engagement === "retainer" ? "Retainer" : project.kind === "area" ? "Area" : "Project"}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-faint">{project.hours_logged.toFixed(1)} hours logged</p>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink-faint">Milestones</h2>
        <div className="card mt-3 flex flex-col gap-4 p-4">
          {milestones.map((m) => (
            <MilestoneRow key={m.id} projectId={project.id} milestone={m} />
          ))}
          {milestones.length === 0 && <p className="text-sm text-ink-faint">No milestones yet.</p>}
          <form action={createMilestone.bind(null, project.id)} className="flex gap-2">
            <input
              name="name"
              required
              placeholder="New milestone"
              className="flex-1 border border-paper-line bg-paper px-3 py-1.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
            />
            <button type="submit" className="bg-stamp-red px-3 py-1.5 text-sm font-medium text-paper-card">
              Add
            </button>
          </form>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink-faint">Checklists</h2>
        <div className="mt-3 flex flex-col gap-3">
          {checklists.map((checklist) => (
            <div key={checklist.id} className="card p-4">
              <p className="text-sm font-medium text-ink">{checklist.name}</p>
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
                  className="flex-1 border border-paper-line bg-paper px-2 py-1 text-xs text-ink outline-none"
                />
                <button type="submit" className="border border-paper-line px-2 py-1 text-xs text-ink">
                  Add
                </button>
              </form>
            </div>
          ))}

          <form action={createChecklist.bind(null, project.id)} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1 text-xs text-ink-faint">
              New checklist
              <input
                name="name"
                required
                placeholder="Launch checklist"
                className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
              />
            </label>
            {templates.length > 0 && (
              <label className="flex flex-col gap-1 text-xs text-ink-faint">
                From template
                <select name="template_id" className="border border-paper-line bg-paper px-2 py-2 text-sm text-ink outline-none">
                  <option value="">Blank</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button type="submit" className="bg-stamp-red px-4 py-2 text-sm font-medium text-paper-card">
              Add
            </button>
          </form>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink-faint">Activity</h2>
        <div className="card mt-3 p-4">
          <form action={logActivity.bind(null, project.id)} className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs text-ink-faint">
              Minutes
              <input
                type="number"
                name="minutes"
                required
                min={1}
                className="w-20 border border-paper-line bg-paper px-2 py-1.5 text-sm text-ink outline-none"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs text-ink-faint">
              Note
              <input
                name="note"
                placeholder="What did you work on?"
                className="border border-paper-line bg-paper px-3 py-1.5 text-sm text-ink outline-none"
              />
            </label>
            <button type="submit" className="bg-stamp-red px-3 py-1.5 text-sm font-medium text-paper-card">
              Log
            </button>
          </form>

          {activityLogs.length > 0 && (
            <ul className="ledger mt-4">
              {activityLogs.map((log) => (
                <li key={log.id} className="ledger-row flex justify-between px-1 py-2 text-xs text-ink-faint">
                  <span>{log.note || "—"}</span>
                  <span className="font-mono">
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
