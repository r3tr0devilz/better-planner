import { getLibraryNotes, getBooks } from "@/lib/data/library";
import { PageHeader } from "@/components/page-header";
import { CollapsibleForm } from "@/components/collapsible-form";
import { SubmitButton } from "@/components/submit-button";
import { LibraryList } from "./library-list";
import { createNote, createBook } from "./actions";

export default async function LibraryPage() {
  const [notes, books] = await Promise.all([getLibraryNotes(), getBooks()]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Library" context={`${notes.length} notes, ${books.length} books`} />

      <CollapsibleForm action={createNote} triggerLabel="New note" className="flex flex-col gap-3">
        <div className="field-row">
          <label className="field-narrow">
            Kind
            <select name="kind" defaultValue="note" className="field">
              <option value="note">Note</option>
              <option value="quote">Quote</option>
              <option value="journal">Journal</option>
            </select>
          </label>
          <label>
            Source
            <input name="source" placeholder="Book, podcast, conversation…" className="field" />
          </label>
          <label>
            Tags (comma-separated)
            <input name="tags" placeholder="focus, parenting…" className="field" />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs text-ink-faint">
          Body
          <textarea name="body" required rows={2} placeholder="What do you want to remember?" className="field" />
        </label>
        <SubmitButton className="btn self-start">Save</SubmitButton>
      </CollapsibleForm>

      <CollapsibleForm action={createBook} triggerLabel="New book">
        <label className="field-wide">
          Title
          <input name="title" required className="field" />
        </label>
        <label>
          Author
          <input name="author" className="field" />
        </label>
        <SubmitButton>Add</SubmitButton>
      </CollapsibleForm>

      <LibraryList notes={notes} books={books} />
    </div>
  );
}
