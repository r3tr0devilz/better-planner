import Link from "next/link";
import { getContentItems } from "@/lib/data/content";
import { getDomains } from "@/lib/data/domains";
import { createContentItem } from "./actions";
import type { ContentItem } from "@/lib/supabase/types";

const STATUSES: { key: ContentItem["status"]; label: string }[] = [
  { key: "idea", label: "Idea" },
  { key: "outlining", label: "Outlining" },
  { key: "editing", label: "Editing" },
  { key: "waiting", label: "Waiting" },
  { key: "published", label: "Published" },
];

export default async function ContentPage() {
  const [items, domains] = await Promise.all([getContentItems(), getDomains()]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Content</h1>

      <form action={createContentItem} className="field-row card mt-6 p-4">
        <label className="field-wide">
          New content item
          <input name="title" required placeholder="Video, article, podcast idea…" className="field" />
        </label>
        <label>
          Type
          <select name="content_type" defaultValue="video" className="field">
            <option value="video">Video</option>
            <option value="article">Article</option>
            <option value="podcast">Podcast</option>
            <option value="newsletter">Newsletter</option>
          </select>
        </label>
        <label>
          Domain
          <select name="domain_id" className="field">
            <option value="">None</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn">
          Add
        </button>
      </form>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STATUSES.map(({ key, label }) => {
          const columnItems = items.filter((i) => i.status === key);
          return (
            <div key={key} className="min-w-0">
              <h2 className="text-sm font-medium text-ink-faint">
                {label} <span className="font-mono">({columnItems.length})</span>
              </h2>
              <div className="mt-3 flex flex-col gap-2">
                {columnItems.map((item) => (
                  <Link key={item.id} href={`/content/${item.id}`} className="hoverable card block p-3 hover:bg-paper">
                    <p className="truncate text-sm text-ink">{item.title}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-ink-faint">{item.content_type}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
