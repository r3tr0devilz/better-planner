import { notFound } from "next/navigation";
import { getPersonDetail } from "@/lib/data/people";
import { PersonHeader } from "@/components/person-header";
import { addFact, addInteraction } from "../actions";

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let detail: Awaited<ReturnType<typeof getPersonDetail>>;
  try {
    detail = await getPersonDetail(id);
  } catch {
    notFound();
  }
  const { person, facts, interactions } = detail!;

  return (
    <div className="mx-auto max-w-2xl">
      <PersonHeader person={person} />

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink-faint">Things to remember</h2>
        <div className="card mt-3 flex flex-col gap-3 p-4">
          {facts.map((f) => (
            <p key={f.id} className="text-sm text-ink [overflow-wrap:anywhere]">
              {f.fact}
            </p>
          ))}
          {facts.length === 0 && <p className="text-sm text-ink-faint">Nothing logged yet.</p>}
          <form action={addFact.bind(null, person.id)} className="flex gap-2">
            <input
              name="fact"
              required
              placeholder="A birthday, a shared interest, a follow-up…"
              className="field min-w-0 flex-1 py-1.5"
            />
            <button type="submit" className="btn py-1.5">
              Add
            </button>
          </form>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink-faint">Interactions</h2>
        <div className="card mt-3 p-4">
          <form action={addInteraction.bind(null, person.id)} className="flex gap-2">
            <input
              name="note"
              required
              placeholder="What did you talk about, or do together?"
              className="field min-w-0 flex-1 py-1.5"
            />
            <button type="submit" className="btn py-1.5">
              Log
            </button>
          </form>

          {interactions.length > 0 && (
            <ul className="ledger mt-4">
              {interactions.map((i) => (
                <li key={i.id} className="ledger-row flex justify-between gap-3 px-1 py-2 text-xs text-ink-faint">
                  <span className="min-w-0 truncate">{i.note}</span>
                  <span className="shrink-0 font-mono">{new Date(i.occurred_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
