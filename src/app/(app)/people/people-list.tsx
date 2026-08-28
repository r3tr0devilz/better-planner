"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FilterBar } from "@/components/filter-bar";
import { DeleteButton } from "@/components/delete-button";
import { useUndoableDelete } from "@/lib/use-undoable-delete";
import { useUrlState } from "@/lib/use-url-state";
import { deletePersonInPlace } from "./actions";
import type { Person } from "@/lib/supabase/types";

function formatBirthday(birthday: string | null): string | null {
  if (!birthday) return null;
  const [, month, day] = birthday.split("-");
  return new Date(2000, Number(month) - 1, Number(day)).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PeopleList({ people }: { people: Person[] }) {
  const [search, setSearch] = useUrlState("q");
  const { hiddenIds, requestDelete } = useUndoableDelete(deletePersonInPlace);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return people.filter((p) => {
      if (hiddenIds.has(p.id)) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [people, search, hiddenIds]);

  return (
    <>
      <div className="mt-6">
        <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search people…" />
      </div>

      <div className="ledger mt-4">
        {filtered.map((person) => (
          <div key={person.id} className="ledger-row flex items-center gap-3 px-1 py-3">
            <Link href={`/people/${person.id}`} className="hoverable flex min-w-0 flex-1 items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-ink">{person.name}</span>
              {person.birthday && <span className="shrink-0 font-mono text-xs text-ink-faint">{formatBirthday(person.birthday)}</span>}
            </Link>
            <DeleteButton
              confirmMessage={`Delete "${person.name}"? This also removes everything logged about them. This can't be undone.`}
              label=""
              pendingLabel=""
              ariaLabel={`Delete "${person.name}"`}
              onDelete={() => {
                requestDelete(person.id, `"${person.name}"`);
                return Promise.resolve();
              }}
              skipConfirm
              className="-m-3 flex h-11 w-11 shrink-0 items-center justify-center text-ink-faint/60 transition-colors duration-150 hover:text-vermillion"
              iconSize={14}
            />
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-3 text-sm text-ink-faint">
            {search.trim() === "" ? "No one here yet — add someone above." : "No one matches this search."}
          </p>
        )}
      </div>
    </>
  );
}
