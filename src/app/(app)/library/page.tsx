import Link from "next/link";
import { getLibraryNotes, getBooks } from "@/lib/data/library";
import { NoteFlagToggle } from "@/components/note-flag-toggle";
import { createNote, createBook } from "./actions";
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
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Library</h1>

      <form action={createNote} className="card mt-6 flex flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-3 sm:items-end">
          <label className="flex flex-col gap-1 text-xs text-ink-faint">
            Kind
            <select name="kind" defaultValue="note" className="border border-paper-line bg-paper px-2 py-2 text-sm text-ink outline-none">
              <option value="note">Note</option>
              <option value="quote">Quote</option>
              <option value="journal">Journal</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-faint">
            Source
            <input
              name="source"
              placeholder="Book, podcast, conversation…"
              className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-faint">
            Tags (comma-separated)
            <input
              name="tags"
              placeholder="focus, parenting…"
              className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs text-ink-faint">
          Body
          <textarea
            name="body"
            required
            rows={2}
            placeholder="What do you want to remember?"
            className="resize-none border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
          />
        </label>
        <button type="submit" className="self-start bg-stamp-red px-4 py-2 text-sm font-medium text-paper-card">
          Save
        </button>
      </form>

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
                    <p className="text-sm text-ink">{note.body}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-faint">
                      {note.source && <span>{note.source}</span>}
                      {note.tags.map((t) => (
                        <span key={t} className="border border-paper-line px-1.5 py-0.5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <NoteFlagToggle id={note.id} flagged={note.flagged_for_review} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-10">
        <h2 className="text-sm font-medium text-ink-faint">Books</h2>
        <form action={createBook} className="card mt-3 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-xs text-ink-faint">
            Title
            <input
              name="title"
              required
              className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-fountain"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-faint">
            Author
            <input name="author" className="border border-paper-line bg-paper px-3 py-2 text-sm text-ink outline-none" />
          </label>
          <button type="submit" className="bg-stamp-red px-4 py-2 text-sm font-medium text-paper-card">
            Add
          </button>
        </form>

        {books.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {books.map((book) => (
              <Link key={book.id} href={`/library/books/${book.id}`} className="card block p-4 hover:bg-paper">
                <p className="text-sm text-ink">{book.title}</p>
                {book.author && <p className="text-xs text-ink-faint">{book.author}</p>}
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-ink-faint">{book.status}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
