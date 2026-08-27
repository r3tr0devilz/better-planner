import Link from "next/link";
import { getPeople } from "@/lib/data/people";
import { PageHeader } from "@/components/page-header";
import { CollapsibleForm } from "@/components/collapsible-form";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";
import { createPerson, deletePerson } from "./actions";

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

      <CollapsibleForm action={createPerson} triggerLabel="New person">
        <label className="field-wide">
          New person
          <input name="name" required placeholder="Name" className="field" />
        </label>
        <label>
          Birthday
          <input type="date" name="birthday" className="field" />
        </label>
        <SubmitButton>Add</SubmitButton>
      </CollapsibleForm>

      <div className="ledger mt-8">
        {people.map((person) => (
          <div key={person.id} className="ledger-row flex items-center gap-3 px-1 py-3">
            <Link
              href={`/people/${person.id}`}
              className="hoverable flex min-w-0 flex-1 items-center justify-between gap-3 text-sm"
            >
              <span className="min-w-0 truncate text-ink">{person.name}</span>
              {person.birthday && <span className="shrink-0 font-mono text-xs text-ink-faint">{formatBirthday(person.birthday)}</span>}
            </Link>
            <DeleteButton
              confirmMessage={`Delete "${person.name}"? This also removes everything logged about them. This can't be undone.`}
              label=""
              pendingLabel=""
              ariaLabel={`Delete "${person.name}"`}
              onDelete={deletePerson.bind(null, person.id)}
              className="-m-3 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint/60 transition-colors duration-150 hover:text-vermillion"
              iconSize={14}
            />
          </div>
        ))}
        {people.length === 0 && <p className="py-3 text-sm text-ink-faint">No one here yet — add someone above.</p>}
      </div>
    </div>
  );
}
