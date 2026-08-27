"use client";

import { useCallback, useState, useTransition } from "react";
import { updateCareerContact, deleteCareerContact } from "@/app/(app)/career/actions";
import { Modal } from "@/components/modal";
import { DeleteButton } from "@/components/delete-button";
import type { CareerContact } from "@/lib/supabase/types";

const RELATIONSHIP_LABEL: Record<CareerContact["relationship_type"], string> = {
  recruiter: "Recruiter",
  mentor: "Mentor",
  referral: "Referral",
  company_contact: "Company contact",
  contact: "Contact",
};

function formatDate(d: string | null): string | null {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CareerContactRow({ contact }: { contact: CareerContact }) {
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const close = useCallback(() => setEditing(false), []);
  const nextFollowUp = formatDate(contact.next_follow_up);

  return (
    <div className="ledger-row flex items-center gap-3 px-1 py-3">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="truncate text-sm text-ink">{contact.name}</span>
          <span className="shrink-0 border border-line px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide text-ink-faint">
            {RELATIONSHIP_LABEL[contact.relationship_type]}
          </span>
        </div>
        {contact.company && <p className="truncate text-xs text-ink-faint">{contact.company}</p>}
      </button>
      {nextFollowUp && (
        <span className="shrink-0 font-mono text-xs text-oxblood">Follow up {nextFollowUp}</span>
      )}

      {editing && (
        <Modal onClose={close} title="Edit contact">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              startTransition(() => updateCareerContact(contact.id, formData));
              close();
            }}
            className="mt-4 flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
              Name
              <input name="name" defaultValue={contact.name} required className="field" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
              Relationship
              <select name="relationship_type" defaultValue={contact.relationship_type} className="field">
                <option value="recruiter">Recruiter</option>
                <option value="mentor">Mentor</option>
                <option value="referral">Referral</option>
                <option value="company_contact">Company contact</option>
                <option value="contact">Contact</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
              Company
              <input name="company" defaultValue={contact.company ?? ""} className="field" />
            </label>
            <div className="mt-1 flex items-center justify-between gap-3">
              <DeleteButton
                confirmMessage={`Delete "${contact.name}"? This can't be undone.`}
                onDelete={() => {
                  close();
                  return deleteCareerContact(contact.id);
                }}
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
