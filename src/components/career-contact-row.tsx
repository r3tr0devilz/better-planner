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
  const nextFollowUp = formatDate(contact.next_follow_up);

  return (
    <div className="ledger-row flex items-center gap-3 px-1 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm text-ink">{contact.name}</span>
          <span className="shrink-0 border border-line px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide text-ink-faint">
            {RELATIONSHIP_LABEL[contact.relationship_type]}
          </span>
        </div>
        {contact.company && <p className="truncate text-xs text-ink-faint">{contact.company}</p>}
      </div>
      {nextFollowUp && (
        <span className="shrink-0 font-mono text-xs text-oxblood">Follow up {nextFollowUp}</span>
      )}
    </div>
  );
}
