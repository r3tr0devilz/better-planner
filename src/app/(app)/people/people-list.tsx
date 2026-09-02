"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { FilterBar } from "@/components/filter-bar";
import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/empty-state";
import { useUndoableDelete } from "@/lib/use-undoable-delete";
import { useUrlState } from "@/lib/use-url-state";
import { deletePersonInPlace } from "./actions";
import type { Person } from "@/lib/supabase/types";

function formatBirthday(birthday: string | null): string | null {
  if (!birthday) return null;
  const [, month, day] = birthday.split("-");
  return new Date(2000, Number(month) - 1, Number(day)).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Days until the next occurrence of this birthday (0 = today), and
 * whether that's within the 30-day window the prototype's lit candle marks
 * ("A lit candle marks a birthday inside the next thirty days"). */
function daysUntil(birthday: string | null): { days: number; soon: boolean } | null {
  if (!birthday) return null;
  const [, month, day] = birthday.split("-").map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day);
  const days = Math.round((next.getTime() - today.getTime()) / DAY_MS);
  return { days, soon: days <= 30 };
}

function dueText(days: number): string {
  if (days === 0) return "TODAY";
  if (days === 1) return "TOMORROW";
  return `IN ${days}D`;
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

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Users}
            message={search.trim() === "" ? "No one here yet — add someone above." : "No one matches this search."}
          />
        </div>
      ) : (
        <div className="mt-4 border-t border-line">
          {filtered.map((person) => {
            const until = daysUntil(person.birthday);
            return (
              <div key={person.id} className="group flex items-center gap-3.5 border-b border-line py-2.5">
                <span className="flex w-3 shrink-0 justify-center">
                  <span className="candle" data-lit={until?.soon ?? false} />
                </span>
                <Link href={`/people/${person.id}`} className="min-w-0 flex-1 truncate text-sm text-ink hover:underline">
                  {person.name}
                </Link>
                {person.birthday && (
                  <span className="shrink-0 font-mono text-[10px] tracking-wide text-ink-faint">{formatBirthday(person.birthday)}</span>
                )}
                {until && (
                  <span className="w-16 shrink-0 text-right font-mono text-[10px] tracking-wide" data-soon={until.soon}>
                    {dueText(until.days)}
                  </span>
                )}
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
                  className="flex h-7 w-7 shrink-0 items-center justify-center text-ink-faint/60 opacity-0 transition-colors duration-150 hover:text-vermillion group-hover:opacity-100"
                  iconSize={13}
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
