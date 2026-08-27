import Link from "next/link";
import { getLibraryNotes, getBooks } from "@/lib/data/library";
import { NoteFlagToggle } from "@/components/note-flag-toggle";
import { PageHeader } from "@/components/page-header";
import { CollapsibleForm } from "@/components/collapsible-form";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";
import { createNote, createBook, deleteNote } from "./actions";
import type { LibraryNote } from "@/lib/supabase/types";

const KINDS: { key: LibraryNote["kind"]; label: string }[] = [
  { key: "note", label: "Notes" },
  { key: "quote", label: "Quotes" },
  { key: "journal", label: "Journal" },
];

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

      {KINDS.map(({ key, label }) => {
        const items = notes.filter((n) => n.kind === key);
        if (items.length === 0) return null;
        return (
          <section key={key} className="mt-8">
            <h2 className="text-sm font-medium text-ink-faint">{label}</h2>
            <div className="ledger mt-3">
              {items.map((note) => (
                <div key={note.id} className="ledger-row flex items-start gap-3 px-1 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink [overflow-wrap:anywhere]">{note.body}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-faint">
                      {note.source && <span className="max-w-[12rem] truncate">{note.source}</span>}
                      {note.tags.map((t) => (
                        <span key={t} className="max-w-[10rem] truncate border border-line px-1.5 py-0.5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <NoteFlagToggle id={note.id} flagged={note.flagged_for_review} />
                    <DeleteButton
                      confirmMessage="Delete this note? This can't be undone."
                      label=""
                      pendingLabel=""
                      ariaLabel="Delete note"
                      onDelete={deleteNote.bind(null, note.id)}
                      className="-m-2.5 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint transition-colors duration-150 hover:text-vermillion"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-10">
        <h2 className="text-sm font-medium text-ink-faint">Books</h2>
        <CollapsibleForm action={createBook} triggerLabel="New book" topMargin="mt-3">
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

        {books.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {books.map((book) => (
              <Link key={book.id} href={`/library/books/${book.id}`} className="hoverable card block min-w-0 p-4 hover:bg-stone">
                <p className="truncate text-sm text-ink">{book.title}</p>
                {book.author && <p className="truncate text-xs text-ink-faint">{book.author}</p>}
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-ink-faint">{book.status}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
