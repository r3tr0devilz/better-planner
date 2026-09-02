import { getBurnEvents, weekStats, sitBucket } from "@/lib/data/burn";
import { PageHeader } from "@/components/page-header";

function dateline(): string {
  const now = new Date();
  return now
    .toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })
    .toUpperCase();
}

function stamp(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toUpperCase();
}

export default async function AshPage() {
  const events = await getBurnEvents();
  const { burned, quenched, longestSitMinutes } = weekStats(events);
  const longestDays = Math.max(1, Math.round(longestSitMinutes / (60 * 24)));

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Ash" context={dateline()} />

      <h2 className="mt-8 text-sm font-medium text-ink-faint">Newest first — everything kept</h2>
      <div className="mt-3 border-t border-line">
        {events.map((e) => (
          <div key={e.id} className="flex items-center gap-3.5 border-b border-line py-2.5">
            <span className="ash-stub" data-sit={sitBucket(e.sat_minutes)} data-cold={e.outcome === "put_out"} />
            <span className="min-w-0 flex-1 truncate font-mono text-[11px] tracking-wide text-ink-faint">
              {e.title}
              {e.outcome === "put_out" && " — put out"}
            </span>
            <span className="shrink-0 font-mono text-[11px] tracking-wide text-ink-faint">{stamp(e.occurred_at)}</span>
          </div>
        ))}
        {events.length === 0 && (
          <p className="border-b border-line py-3.5 font-mono text-[11px] tracking-wide text-ink-faint">
            Nothing burned yet — go close something.
          </p>
        )}
      </div>

      <div className="mt-5 h-4 bg-gradient-to-t from-[#4a4030] via-[rgba(74,64,48,0.32)] to-transparent" />
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
        Stub length shows how long the slip sat before it burned. Ash settles at the foot of the page and builds
        through the week.
      </p>

      <h2 className="mt-10 text-sm font-medium text-ink-faint">This week</h2>
      <div className="mt-4 flex flex-wrap gap-10 border-t border-line pt-4">
        <div>
          <div className="font-[family-name:var(--font-display)] text-4xl font-black leading-none text-ink">{burned}</div>
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">Burned</div>
        </div>
        <div>
          <div className="font-[family-name:var(--font-display)] text-4xl font-black leading-none text-ink">{quenched}</div>
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">Put out</div>
        </div>
        <div>
          <div className="font-[family-name:var(--font-display)] text-4xl font-black leading-none text-ink">
            {longestSitMinutes > 0 ? `${longestDays}d` : "—"}
          </div>
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">Longest sit</div>
        </div>
      </div>
      <p className="mt-4 font-mono text-[10px] leading-relaxed text-ink-faint">
        Quenching is recorded, not punished. It is the honest counterpart to burning.
      </p>
    </div>
  );
}
