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

const KIND_LABEL: Record<LibraryNote["kind"], string> = {
  note: "Note",
  quote: "Quote",
  journal: "Journal",
};

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

      {filteredNotes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-ink-faint">Notes, quotes, journal</h2>
          <div className="mt-3 flex flex-col gap-2.5">
            {filteredNotes.map((note) => (
              <div key={note.id} className="card-cold relative">
                <div className="flex flex-wrap items-center gap-2 pr-16">
                  <span className="tag">{KIND_LABEL[note.kind]}</span>
                  {note.source && <span className="max-w-[14rem] truncate font-mono text-[10px] tracking-wide text-ink-faint">{note.source}</span>}
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-ink [overflow-wrap:anywhere]">{note.body}</p>
                {note.tags.length > 0 && (
                  <p className="mt-2.5 font-mono text-[10px] tracking-wide text-ink-faint">{note.tags.join(" · ")}</p>
                )}
                <div className="absolute right-3 top-3 flex items-center gap-1.5">
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
                    className="flex h-7 w-7 shrink-0 items-center justify-center text-ink-faint/60 transition-colors duration-150 hover:text-vermillion"
                    iconSize={13}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-medium text-ink-faint">Books</h2>
        {filteredBooks.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">
            {search.trim() === "" ? "No books yet — add one above." : "No books match this search."}
          </p>
        ) : (
          <div className="mt-3 border-t border-line">
            {filteredBooks.map((book) => (
              <div key={book.id} className="group flex items-center gap-3.5 border-b border-line py-2.5">
                <Link href={`/library/books/${book.id}`} className="min-w-0 flex-1 truncate text-sm text-ink hover:underline">
                  {book.title}
                </Link>
                {book.author && <span className="shrink-0 font-mono text-[10px] tracking-wide text-ink-faint">{book.author}</span>}
                <span className="w-16 shrink-0 text-right font-mono text-[10px] uppercase tracking-wide text-ink-faint">{book.status}</span>
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
                  className="flex h-7 w-7 shrink-0 items-center justify-center text-ink-faint/60 opacity-0 transition-colors duration-150 hover:text-vermillion group-hover:opacity-100"
                  iconSize={13}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
