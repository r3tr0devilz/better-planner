import { getPeople } from "@/lib/data/people";
import { PageHeader } from "@/components/page-header";
import { CollapsibleForm } from "@/components/collapsible-form";
import { SubmitButton } from "@/components/submit-button";
import { PeopleList } from "./people-list";
import { createPerson } from "./actions";

export default async function PeoplePage() {
  const people = await getPeople();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="People" context={`${people.length} people`} />
      <p className="mt-2 text-sm text-ink-faint">A lit candle marks a birthday inside the next thirty days.</p>

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

      <PeopleList people={people} />
    </div>
  );
}
