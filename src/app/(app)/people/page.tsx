import Link from "next/link";
import { getPeople } from "@/lib/data/people";
import { PageHeader } from "@/components/page-header";
import { createPerson } from "./actions";

function formatBirthday(birthday: string | null): string | null {
  if (!birthday) return null;
  const [, month, day] = birthday.split("-");
  return new Date(2000, Number(month) - 1, Number(day)).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function PeoplePage() {
  const people = await getPeople();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="People" context={`${people.length} people`} />

      <form action={createPerson} className="field-row card mt-6 p-4">
        <label className="field-wide">
          New person
          <input name="name" required placeholder="Name" className="field" />
        </label>
        <label>
          Birthday
          <input type="date" name="birthday" className="field" />
        </label>
        <button type="submit" className="btn">
          Add
        </button>
      </form>

      <div className="ledger mt-8">
        {people.map((person) => (
          <Link
            key={person.id}
            href={`/people/${person.id}`}
            className="hoverable ledger-row flex items-center justify-between gap-3 px-1 py-3 text-sm hover:bg-stone"
          >
            <span className="min-w-0 truncate text-ink">{person.name}</span>
            {person.birthday && <span className="shrink-0 font-mono text-xs text-ink-faint">{formatBirthday(person.birthday)}</span>}
          </Link>
        ))}
        {people.length === 0 && <p className="py-3 text-sm text-ink-faint">No one here yet — add someone above.</p>}
      </div>
    </div>
  );
}
