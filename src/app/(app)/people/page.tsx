import Link from "next/link";
import { getPeople } from "@/lib/data/people";
import { createPerson } from "./actions";

function formatBirthday(birthday: string | null): string | null {
  if (!birthday) return null;
  const [, month, day] = birthday.split("-");
  return new Date(2000, Number(month) - 1, Number(day)).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function PeoplePage() {
  const people = await getPeople();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">People</h1>

      <form action={createPerson} className="card mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-xs text-ink-faint">
          New person
          <input
            name="name"
            required
            placeholder="Name"
            className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-faint">
          Birthday
          <input
            type="date"
            name="birthday"
            className="border border-paper-line bg-paper px-2 py-2 text-sm text-ink outline-none"
          />
        </label>
        <button type="submit" className="bg-stamp-red px-4 py-2 text-sm font-medium text-paper-card">
          Add
        </button>
      </form>

      <div className="ledger mt-8">
        {people.map((person) => (
          <Link key={person.id} href={`/people/${person.id}`} className="ledger-row flex items-center justify-between px-1 py-3 text-sm hover:bg-paper">
            <span className="text-ink">{person.name}</span>
            {person.birthday && <span className="font-mono text-xs text-ink-faint">{formatBirthday(person.birthday)}</span>}
          </Link>
        ))}
        {people.length === 0 && <p className="py-3 text-sm text-ink-faint">No one here yet — add someone above.</p>}
      </div>
    </div>
  );
}
