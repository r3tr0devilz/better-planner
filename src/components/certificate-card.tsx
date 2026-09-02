"use client";

import { deleteCertificate } from "@/app/(app)/career/actions";
import { DeleteButton } from "@/components/delete-button";
import type { Certificate } from "@/lib/supabase/types";

function formatDate(d: string | null): string | null {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** A row3 row for the Career > Certificates list. No edit action exists for
 * certificates anywhere in this app (only create/delete), so this row's
 * only interaction beyond delete is opening the credential link, if any —
 * the whole row becomes that link rather than adding a separate control. */
export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const earned = formatDate(certificate.earned_date);

  const nameCell = (
    <div className="min-w-0">
      <span className="truncate text-sm text-ink">{certificate.title}</span>
      {certificate.related_skills.length > 0 && (
        <p className="truncate text-xs text-ink-faint">{certificate.related_skills.join(", ")}</p>
      )}
    </div>
  );

  return (
    <div className="row3">
      {certificate.credential_link ? (
        <a href={certificate.credential_link} target="_blank" rel="noreferrer" className="min-w-0">
          {nameCell}
        </a>
      ) : (
        nameCell
      )}
      <span className="font-mono text-[10px] tracking-wide text-ink-faint">{certificate.issuer || "—"}</span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="tag">{earned ?? "Unearned"}</span>
        <DeleteButton
          confirmMessage={`Delete "${certificate.title}"? This can't be undone.`}
          label=""
          pendingLabel=""
          ariaLabel="Delete certificate"
          onDelete={deleteCertificate.bind(null, certificate.id)}
          className="flex h-7 w-7 shrink-0 items-center justify-center text-ink-faint/60 transition-colors duration-150 hover:text-vermillion"
          iconSize={13}
        />
      </span>
    </div>
  );
}
