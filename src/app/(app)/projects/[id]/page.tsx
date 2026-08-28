import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getProjectDetail, getChecklistTemplates } from "@/lib/data/projects";
import { MilestoneRow } from "@/components/milestone-row";
import { ChecklistItemRow } from "@/components/checklist-item-row";
import { RedirectDeleteButton } from "@/components/redirect-delete-button";
import { SubmitButton } from "@/components/submit-button";
import {
  createMilestone,
  createChecklist,
  addChecklistItem,
  toggleChecklistItem,
  logActivity,
  deleteProject,
} from "../actions";

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
      <Link href="/projects" className="inline-flex items-center gap-1 text-xs font-semibold text-ink-faint transition-colors duration-150 hover:text-ink">
        <ArrowLeft size={13} />
        Projects
      </Link>
      <div className="mt-2 flex items-start justify-between gap-3">
        <h1 className="min-w-0 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink [overflow-wrap:anywhere]">{project.name}</h1>
        <span className="shrink-0 border border-line px-3 py-1 font-mono text-xs text-ink-faint">
          {project.engagement === "retainer" ? "Retainer" : project.kind === "area" ? "Area" : "Project"}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-faint">{project.hours_logged.toFixed(1)} hours logged</p>
        <RedirectDeleteButton
          id={project.id}
          label={`"${project.name}"`}
          buttonLabel="Delete project"
          deleteFn={deleteProject}
          redirectTo="/projects"
        />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink-faint">Milestones</h2>
        <div className="card mt-3 flex flex-col gap-4 p-4">
          {milestones.map((m) => (
            <MilestoneRow key={m.id} projectId={project.id} milestone={m} />
          ))}
          {milestones.length === 0 && <p className="text-sm text-ink-faint">No milestones yet.</p>}
          <form action={createMilestone.bind(null, project.id)} className="flex gap-2">
            <input name="name" required placeholder="New milestone" className="field min-w-0 flex-1" />
            <SubmitButton>Add</SubmitButton>
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
                    <ChecklistItemRow key={item.id} item={item} onToggle={toggleChecklistItem.bind(null, project.id)} />
                  ))}
              </div>
              <form
                action={addChecklistItem.bind(null, project.id, checklist.id)}
                className="mt-2 flex gap-2"
              >
                <input name="text" required placeholder="Add item" className="field min-w-0 flex-1 py-1 text-xs" />
                <SubmitButton className="btn-outline py-1 text-xs" pendingText="…">Add</SubmitButton>
              </form>
            </div>
          ))}

          <form action={createChecklist.bind(null, project.id)} className="field-row card p-4">
            <label className="field-wide">
              New checklist
              <input name="name" required placeholder="Launch checklist" className="field" />
            </label>
            {templates.length > 0 && (
              <label>
                From template
                <select name="template_id" className="field">
                  <option value="">Blank</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <SubmitButton>Add</SubmitButton>
          </form>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink-faint">Activity</h2>
        <div className="card mt-3 p-4">
          <form action={logActivity.bind(null, project.id)} className="field-row">
            <label className="field-narrow">
              Minutes
              <input type="number" name="minutes" required min={1} className="field" />
            </label>
            <label className="field-wide">
              Note
              <input name="note" placeholder="What did you work on?" className="field" />
            </label>
            <SubmitButton pendingText="Logging…">Log</SubmitButton>
          </form>

          {activityLogs.length > 0 && (
            <ul className="ledger mt-4">
              {activityLogs.map((log) => (
                <li key={log.id} className="ledger-row flex justify-between gap-3 px-1 py-2 text-xs text-ink-faint">
                  <span className="min-w-0 truncate">{log.note || "—"}</span>
                  <span className="shrink-0 font-mono">
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
