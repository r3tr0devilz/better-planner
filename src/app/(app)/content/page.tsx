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

      <form action={createContentItem} className="card mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-xs text-ink-faint">
          New content item
          <input
            name="title"
            required
            placeholder="Video, article, podcast idea…"
            className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-faint">
          Type
          <select name="content_type" defaultValue="video" className="border border-paper-line bg-paper px-2 py-2 text-sm text-ink outline-none">
            <option value="video">Video</option>
            <option value="article">Article</option>
            <option value="podcast">Podcast</option>
            <option value="newsletter">Newsletter</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-faint">
          Domain
          <select name="domain_id" className="border border-paper-line bg-paper px-2 py-2 text-sm text-ink outline-none">
            <option value="">None</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="bg-stamp-red px-4 py-2 text-sm font-medium text-paper-card">
          Add
        </button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STATUSES.map(({ key, label }) => {
          const columnItems = items.filter((i) => i.status === key);
          return (
            <div key={key}>
              <h2 className="text-sm font-medium text-ink-faint">
                {label} <span className="font-mono">({columnItems.length})</span>
              </h2>
              <div className="mt-3 flex flex-col gap-2">
                {columnItems.map((item) => (
                  <Link key={item.id} href={`/content/${item.id}`} className="card block p-3 hover:bg-paper">
                    <p className="text-sm text-ink">{item.title}</p>
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
