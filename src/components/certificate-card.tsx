import { deleteCertificate } from "@/app/(app)/career/actions";
import { DeleteButton } from "@/components/delete-button";
import type { Certificate } from "@/lib/supabase/types";

function formatDate(d: string | null): string | null {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function CertificateCard({ certificate }: { certificate: Certificate }) {
  const earned = formatDate(certificate.earned_date);
  const expires = formatDate(certificate.expiry_date);

  return (
    <div className="card flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{certificate.title}</p>
          {certificate.issuer && <p className="truncate text-xs text-ink-faint">{certificate.issuer}</p>}
        </div>
        <DeleteButton
          confirmMessage={`Delete "${certificate.title}"? This can't be undone.`}
          label=""
          pendingLabel=""
          ariaLabel="Delete certificate"
          onDelete={deleteCertificate.bind(null, certificate.id)}
          className="-m-2.5 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint transition-colors duration-150 hover:text-vermillion"
        />
      </div>

      <p className="font-mono text-[0.65rem] uppercase tracking-wide text-ink-faint">
        {earned && `Earned ${earned}`}
        {earned && expires && " · "}
        {expires && `Expires ${expires}`}
      </p>

      {certificate.related_skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {certificate.related_skills.map((skill) => (
            <span key={skill} className="max-w-[10rem] truncate border border-line px-1.5 py-0.5 font-mono text-xs text-ink-faint">
              {skill}
            </span>
          ))}
        </div>
      )}

      {certificate.credential_link && (
        <a
          href={certificate.credential_link}
          target="_blank"
          rel="noreferrer"
          className="btn-outline mt-1 self-start px-3 py-1.5 text-xs"
        >
          Open credential
        </a>
      )}
    </div>
  );
}
