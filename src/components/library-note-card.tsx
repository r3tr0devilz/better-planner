"use client";

import { useCallback, useState, useTransition } from "react";
import { updateNote, deleteNote } from "@/app/(app)/library/actions";
import { DocketPanel, DocketFacts } from "@/components/docket-panel";
import { NoteFlagToggle } from "@/components/note-flag-toggle";
import { DeleteButton } from "@/components/delete-button";
import type { LibraryNote } from "@/lib/supabase/types";

const KIND_LABEL: Record<LibraryNote["kind"], string> = {
  note: "Note",
  quote: "Quote",
  journal: "Journal",
};

const FIELD_STYLE = { padding: "0.25rem 0.45rem", fontSize: "0.8125rem" };

export function LibraryNoteCard({ note, onDelete }: { note: LibraryNote; onDelete: () => void }) {
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="card-cold relative">
      <button type="button" onClick={() => setOpen(true)} className="card-btn w-full cursor-pointer border-0 bg-transparent p-0 text-left">
        <div className="flex flex-wrap items-center gap-2 pr-16">
          <span className="tag">{KIND_LABEL[note.kind]}</span>
          {note.source && <span className="max-w-[14rem] truncate font-mono text-[10px] tracking-wide text-ink-faint">{note.source}</span>}
        </div>
        <p className="mt-2.5 text-sm leading-relaxed text-ink [overflow-wrap:anywhere]">{note.body}</p>
        {note.tags.length > 0 && (
          <p className="mt-2.5 font-mono text-[10px] tracking-wide text-ink-faint">{note.tags.join(" · ")}</p>
        )}
      </button>
      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        <NoteFlagToggle id={note.id} flagged={note.flagged_for_review} />
        <DeleteButton
          confirmMessage="Delete this note? This can't be undone."
          label=""
          pendingLabel=""
          ariaLabel="Delete note"
          onDelete={() => {
            onDelete();
            return Promise.resolve();
          }}
          skipConfirm
          className="flex h-7 w-7 shrink-0 items-center justify-center text-ink-faint/60 transition-colors duration-150 hover:text-vermillion"
          iconSize={13}
        />
      </div>

      {open && (
        <DocketPanel onClose={close} spineLabel={KIND_LABEL[note.kind]} spineKind="Library">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              startTransition(() => updateNote(note.id, formData));
              close();
            }}
          >
            <DocketFacts
              facts={[
                {
                  label: "Kind",
                  value: (
                    <select name="kind" defaultValue={note.kind} className="cap-field" style={FIELD_STYLE}>
                      <option value="note">Note</option>
                      <option value="quote">Quote</option>
                      <option value="journal">Journal</option>
                    </select>
                  ),
                },
                { label: "Source", value: <input name="source" defaultValue={note.source ?? ""} placeholder="Book, podcast, conversation…" className="cap-field" style={FIELD_STYLE} /> },
                { label: "Tags", value: <input name="tags" defaultValue={note.tags.join(", ")} placeholder="focus, parenting…" className="cap-field" style={FIELD_STYLE} /> },
              ]}
            />
            <p className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.1em] text-[#8d887c]">Body</p>
            <textarea
              name="body"
              defaultValue={note.body}
              required
              rows={5}
              className="cap-field mt-1.5"
              style={{ fontSize: "0.875rem", lineHeight: 1.5 }}
            />
            <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5">
              <button
                type="button"
                onClick={() => {
                  close();
                  onDelete();
                }}
                className="btn-quiet"
              >
                Delete
              </button>
              <span className="flex gap-2">
                <button type="button" onClick={close} className="btn-quiet">
                  Close
                </button>
                <button type="submit" className="btn-ink">
                  Save
                </button>
              </span>
            </div>
          </form>
        </DocketPanel>
      )}
    </div>
  );
}
