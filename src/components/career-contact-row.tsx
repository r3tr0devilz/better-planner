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
    <div className="row3">
      <button type="button" onClick={() => setEditing(true)} className="min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left">
        <span className="truncate text-sm text-ink">{contact.name}</span>
      </button>
      <span className="font-mono text-[10px] tracking-wide text-ink-faint">{contact.company || "—"}</span>
      <span className="flex shrink-0 items-center gap-2">
        {nextFollowUp && <span className="font-mono text-[10px] tracking-wide text-oxblood">Follow up {nextFollowUp}</span>}
        <span className="tag">{RELATIONSHIP_LABEL[contact.relationship_type]}</span>
      </span>

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
