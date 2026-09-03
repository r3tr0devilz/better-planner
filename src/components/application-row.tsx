"use client";

import { useCallback, useState, useTransition } from "react";
import { updateJobApplication, deleteJobApplication } from "@/app/(app)/career/actions";
import { Modal } from "@/components/modal";
import { DeleteButton } from "@/components/delete-button";
import type { JobApplication } from "@/lib/supabase/types";

export const STATUS_LABEL: Record<JobApplication["status"], string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  archived: "Archived",
};

export function formatDate(d: string | null): string | null {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Shared by the table row below and the Kanban card (kanban-board.tsx) —
 * the only two places a job application ever renders. */
export function ApplicationEditModal({ app, onClose }: { app: JobApplication; onClose: () => void }) {
  const [, startTransition] = useTransition();

  return (
    <Modal onClose={onClose} title="Edit application">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          startTransition(() => updateJobApplication(app.id, formData));
          onClose();
        }}
        className="mt-4 flex flex-col gap-3"
      >
        <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
          Company
          <input name="company" defaultValue={app.company} required className="field" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
          Role
          <input name="role" defaultValue={app.role} required className="field" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
          Status
          <select name="status" defaultValue={app.status} className="field">
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
          Deadline
          <input type="date" name="deadline" defaultValue={app.deadline ?? ""} className="field" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-ink-faint">
          Job link
          <input type="url" name="job_link" defaultValue={app.job_link ?? ""} placeholder="https://…" className="field" />
        </label>
        <div className="mt-1 flex items-center justify-between gap-3">
          <DeleteButton
            confirmMessage={`Delete the application to ${app.company}? This can't be undone.`}
            onDelete={() => {
              onClose();
              return deleteJobApplication(app.id);
            }}
          />
          <button type="submit" className="btn">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

/** A single row3 row for the Career > Applications table view — company/
 * role, deadline, status tag. */
export function ApplicationRow({ app }: { app: JobApplication }) {
  const [editing, setEditing] = useState(false);
  const close = useCallback(() => setEditing(false), []);
  const deadline = formatDate(app.deadline);

  return (
    <div className="row3">
      <button type="button" onClick={() => setEditing(true)} className="min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left">
        <span className="truncate text-sm text-ink">
          {app.company} — {app.role}
        </span>
      </button>
      <span className="font-mono text-[10px] tracking-wide text-ink-faint">{deadline ?? "—"}</span>
      <span className="tag">{STATUS_LABEL[app.status]}</span>

      {editing && <ApplicationEditModal app={app} onClose={close} />}
    </div>
  );
}
