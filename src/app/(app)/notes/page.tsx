import { PageHeader } from "@/components/page-header";

// Deliberately static — see CLAUDE.md. "Nothing here burns" and this
// colophon are permanent copy: Notes is the one cold surface the whole
// ritual is measured against, so it stays fixed rather than reflecting
// live data the way every other page in this nav does.
const ENTRIES = [
  { title: "Print run notes — archive", meta: "EDITED 2 DAYS AGO · 4 PAGES", cold: false },
  { title: "Northline scope — working draft", meta: "EDITED YESTERDAY · 2 PAGES", cold: false },
  { title: "Papers from Anya — reading marks", meta: "EDITED LAST WEEK · 1 PAGE", cold: true },
  { title: "Scent log — benzoin, cedar, vetiver", meta: "EDITED 3 WEEKS AGO · 6 PAGES", cold: true },
];

export default function NotesPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Notes" context="NOTHING HERE BURNS" />

      <div className="mt-6 flex flex-col gap-4">
        {ENTRIES.map((entry) => (
          <div key={entry.title} className={`border-l-2 pl-3.5 ${entry.cold ? "border-line" : "border-ink"}`}>
            <p className={`text-[0.9375rem] ${entry.cold ? "text-ink-faint" : "text-ink"}`}>{entry.title}</p>
            <p className="mt-1 font-mono text-[11px] tracking-wide text-ink-faint">{entry.meta}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 border-t border-line pt-4 font-mono text-[10px] leading-relaxed text-ink-faint">
        No embers, no tear, no ash. Notes are the archive the ritual is measured against — keeping one surface cold
        is what keeps the tear meaningful.
      </p>
    </div>
  );
}
