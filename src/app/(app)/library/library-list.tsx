"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/filter-bar";
import { NoteFlagToggle } from "@/components/note-flag-toggle";
import { DeleteButton } from "@/components/delete-button";
import { useUndoableDelete } from "@/lib/use-undoable-delete";
import { useUrlState } from "@/lib/use-url-state";
import { deleteNote, deleteBookInPlace } from "./actions";
import type { Book, LibraryNote } from "@/lib/supabase/types";

const KINDS: { key: LibraryNote["kind"]; label: string }[] = [
  { key: "note", label: "Notes" },
  { key: "quote", label: "Quotes" },
  { key: "journal", label: "Journal" },
];

export function LibraryList({ notes, books }: { notes: LibraryNote[]; books: Book[] }) {
  const [search, setSearch] = useUrlState("q");
  const noteUndo = useUndoableDelete(deleteNote);
  const bookUndo = useUndoableDelete(deleteBookInPlace);

  const { filteredNotes, filteredBooks } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const visibleNotes = notes.filter((n) => !noteUndo.hiddenIds.has(n.id));
    const visibleBooks = books.filter((b) => !bookUndo.hiddenIds.has(b.id));
    if (!q) return { filteredNotes: visibleNotes, filteredBooks: visibleBooks };
    return {
      filteredNotes: visibleNotes.filter(
        (n) => n.body.toLowerCase().includes(q) || n.source?.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q)),
      ),
      filteredBooks: visibleBooks.filter((b) => b.title.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)),
    };
  }, [notes, books, search, noteUndo.hiddenIds, bookUndo.hiddenIds]);

  return (
    <>
      <div className="mt-6">
        <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search notes and books…" />
      </div>

      {KINDS.map(({ key, label }) => {
        const items = filteredNotes.filter((n) => n.kind === key);
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
                      onDelete={() => {
                        noteUndo.requestDelete(note.id, "note");
                        return Promise.resolve();
                      }}
                      skipConfirm
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
        {filteredBooks.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">
            {search.trim() === "" ? "No books yet — add one above." : "No books match this search."}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {filteredBooks.map((book) => (
              <div key={book.id} className="card relative min-w-0 p-4">
                <Link href={`/library/books/${book.id}`} className="hoverable block min-w-0 pr-7">
                  <p className="truncate text-sm text-ink">{book.title}</p>
                  {book.author && <p className="truncate text-xs text-ink-faint">{book.author}</p>}
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-ink-faint">{book.status}</p>
                </Link>
                <DeleteButton
                  confirmMessage={`Delete "${book.title}"? This also removes its highlights. This can't be undone.`}
                  label=""
                  pendingLabel=""
                  ariaLabel={`Delete "${book.title}"`}
                  onDelete={() => {
                    bookUndo.requestDelete(book.id, `"${book.title}"`);
                    return Promise.resolve();
                  }}
                  skipConfirm
                  className="absolute right-0 top-0 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint/60 transition-colors duration-150 hover:text-vermillion"
                  iconSize={14}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
