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
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">{item.title}</h1>
        <StatusSelect value={item.status} options={STATUSES} onChange={updateContentStatus.bind(null, item.id)} />
      </div>
      <p className="mt-1 font-mono text-xs uppercase tracking-wide text-ink-faint">{item.content_type}</p>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink-faint">Details</h2>
        <form action={updateContentDetails.bind(null, item.id)} className="card mt-3 flex flex-col gap-3 p-4">
          <label className="flex flex-col gap-1 text-xs text-ink-faint">
            URL
            <input
              name="url"
              defaultValue={item.url ?? ""}
              placeholder="https://…"
              className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-faint">
            Publish date
            <input
              type="date"
              name="publish_date"
              defaultValue={item.publish_date ?? ""}
              className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-faint">
            Outline
            <textarea
              name="outline_markdown"
              defaultValue={item.outline_markdown ?? ""}
              rows={6}
              placeholder="Outline, script notes, talking points… (markdown)"
              className="resize-none border border-paper-line bg-paper px-3 py-2 font-mono text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
            />
          </label>
          <button type="submit" className="self-start bg-stamp-red px-4 py-2 text-sm font-medium text-paper-card">
            Save
          </button>
        </form>
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
                  .map((cItem) => (
                    <ChecklistItemRow key={cItem.id} item={cItem} onToggle={toggleContentChecklistItem.bind(null, item.id)} />
                  ))}
              </div>
              <form action={addContentChecklistItem.bind(null, item.id, checklist.id)} className="mt-2 flex gap-2">
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

          <form action={createContentChecklist.bind(null, item.id)} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1 text-xs text-ink-faint">
              New checklist
              <input
                name="name"
                required
                placeholder="Outline → publish → promote"
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
    </div>
  );
}
