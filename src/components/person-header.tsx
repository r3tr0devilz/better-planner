"use client";

import { useCallback, useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { updatePerson, deletePersonInPlace } from "@/app/(app)/people/actions";
import { Modal } from "@/components/modal";
import { RedirectDeleteButton } from "@/components/redirect-delete-button";
import type { Person } from "@/lib/supabase/types";

export function PersonHeader({ person }: { person: Person }) {
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const close = useCallback(() => setEditing(false), []);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink [overflow-wrap:anywhere]">{person.name}</h1>
        {person.birthday && <p className="mt-1 text-sm text-ink-faint">Birthday: {person.birthday}</p>}
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Edit person"
        className="-m-2.5 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint transition-colors duration-150 hover:text-ink"
      >
        <Pencil size={16} />
      </button>

      {editing && (
        <Modal onClose={close} title="Edit person">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              startTransition(() => updatePerson(person.id, formData));
              close();
            }}
            className="mt-4 flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
              Name
              <input name="name" defaultValue={person.name} required className="field" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
              Birthday
              <input type="date" name="birthday" defaultValue={person.birthday ?? ""} className="field" />
            </label>
            <div className="mt-1 flex items-center justify-between gap-3">
              <RedirectDeleteButton
                id={person.id}
                label={`"${person.name}"`}
                deleteFn={deletePersonInPlace}
                redirectTo="/people"
              />
              <button type="submit" className="btn">
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
