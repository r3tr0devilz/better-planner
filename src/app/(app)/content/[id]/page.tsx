import { notFound } from "next/navigation";
import { getContentItemDetail } from "@/lib/data/content";
import { getChecklistTemplates } from "@/lib/data/projects";
import { ChecklistItemRow } from "@/components/checklist-item-row";
import { StatusSelect } from "@/components/status-select";
import {
  updateContentStatus,
  updateContentDetails,
  createContentChecklist,
  addContentChecklistItem,
  toggleContentChecklistItem,
} from "../actions";

const STATUSES = ["idea", "outlining", "editing", "waiting", "published"] as const;

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let detail: Awaited<ReturnType<typeof getContentItemDetail>>;
  try {
    detail = await getContentItemDetail(id);
  } catch {
    notFound();
  }
  const { item, checklists, checklistItems } = detail!;
  const templates = await getChecklistTemplates();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink [overflow-wrap:anywhere]">{item.title}</h1>
        <div className="shrink-0">
          <StatusSelect value={item.status} options={STATUSES} onChange={updateContentStatus.bind(null, item.id)} />
        </div>
      </div>
      <p className="mt-1 font-mono text-xs uppercase tracking-wide text-ink-faint">{item.content_type}</p>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink-faint">Details</h2>
        <form action={updateContentDetails.bind(null, item.id)} className="card mt-3 flex flex-col gap-3 p-4">
          <label className="flex flex-col gap-1 text-xs text-ink-faint">
            URL
            <input name="url" defaultValue={item.url ?? ""} placeholder="https://…" className="field" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-faint">
            Publish date
            <input type="date" name="publish_date" defaultValue={item.publish_date ?? ""} className="field" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-faint">
            Outline
            <textarea
              name="outline_markdown"
              defaultValue={item.outline_markdown ?? ""}
              rows={6}
              placeholder="Outline, script notes, talking points… (markdown)"
              className="field font-mono"
            />
          </label>
          <button type="submit" className="btn self-start">
            Save
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink-faint">Checklists</h2>
        <div className="mt-3 flex flex-col gap-3">
          {checklists.map((checklist) => (
            <div key={checklist.id} className="card p-4">
              <p className="truncate text-sm font-medium text-ink">{checklist.name}</p>
              <div className="mt-2 flex flex-col gap-1.5">
                {checklistItems
                  .filter((i) => i.checklist_id === checklist.id)
                  .map((cItem) => (
                    <ChecklistItemRow key={cItem.id} item={cItem} onToggle={toggleContentChecklistItem.bind(null, item.id)} />
                  ))}
              </div>
              <form action={addContentChecklistItem.bind(null, item.id, checklist.id)} className="mt-2 flex gap-2">
                <input name="text" required placeholder="Add item" className="field min-w-0 flex-1 py-1 text-xs" />
                <button type="submit" className="btn-outline py-1 text-xs">
                  Add
                </button>
              </form>
            </div>
          ))}

          <form action={createContentChecklist.bind(null, item.id)} className="field-row card p-4">
            <label className="field-wide">
              New checklist
              <input name="name" required placeholder="Outline → publish → promote" className="field" />
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
            <button type="submit" className="btn">
              Add
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
