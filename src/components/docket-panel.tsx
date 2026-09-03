import { Fragment, type ReactNode } from "react";
import { Modal } from "@/components/modal";

/**
 * The shared "case file" shell for a record's detail view — a vertical
 * spine tab (title + kind, matching the binder-tab rail's own
 * writing-mode: vertical-rl treatment) beside a scrollable body the caller
 * fills with its own facts/notes/actions. Reuses Modal's focus-trap/portal/
 * Escape machinery in headerless mode rather than reimplementing it — see
 * modal.tsx's headerless prop.
 */
export function DocketPanel({
  onClose,
  spineLabel,
  spineKind,
  children,
}: {
  onClose: () => void;
  spineLabel: string;
  spineKind: string;
  children: ReactNode;
}) {
  return (
    <Modal onClose={onClose} title={spineLabel} headerless centered panelClass="wrap-panel" className="max-w-md p-0">
      <span className="wrap-spine" aria-hidden>
        <span>{spineLabel}</span>
        <span>{spineKind}</span>
      </span>
      <span className="wrap-fold" aria-hidden />
      <div className="wrap-body">{children}</div>
    </Modal>
  );
}

/** The facts list every docket uses — a definition-list of label/value
 * pairs, matching .facts-dl. Pass plain text for a read-only fact, or a
 * form field for an editable one. */
export function DocketFacts({ facts }: { facts: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="facts-dl mt-4">
      {facts.map((f) => (
        <Fragment key={f.label}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
