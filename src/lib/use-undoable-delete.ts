"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const UNDO_WINDOW_MS = 5000;

/**
 * Deletes that can be undone: the item leaves the UI immediately, but the
 * real server delete is deferred until the undo window closes. Undo just
 * cancels the pending timer — nothing was ever actually deleted, so there's
 * no restore/re-insert to get wrong (no lost child rows, no new id).
 */
export function useUndoableDelete(deleteFn: (id: string) => Promise<void>) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const unhide = useCallback((ids: string[]) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }, []);

  const runDelete = useCallback(
    (id: string, label: string) => {
      timers.current.delete(id);
      deleteFn(id).catch(() => {
        unhide([id]);
        toast.error(`Couldn't delete ${label}.`);
      });
    },
    [deleteFn, unhide],
  );

  /** Single-item delete, its own toast. */
  const requestDelete = useCallback(
    (id: string, label: string) => {
      setHiddenIds((prev) => new Set(prev).add(id));
      timers.current.set(
        id,
        setTimeout(() => runDelete(id, label), UNDO_WINDOW_MS),
      );

      toast(`Deleted ${label}`, {
        duration: UNDO_WINDOW_MS,
        action: {
          label: "Undo",
          onClick: () => {
            const pending = timers.current.get(id);
            if (pending) {
              clearTimeout(pending);
              timers.current.delete(id);
            }
            unhide([id]);
          },
        },
      });
    },
    [runDelete, unhide],
  );

  /** Several items at once (a bulk selection) collapsed into one toast and
   * one Undo that restores all of them together, instead of stacking a
   * separate toast per row. */
  const requestDeleteMany = useCallback(
    (items: { id: string; label: string }[], noun = "item") => {
      if (items.length === 0) return;
      const ids = items.map((i) => i.id);
      setHiddenIds((prev) => {
        const next = new Set(prev);
        for (const id of ids) next.add(id);
        return next;
      });

      for (const { id, label } of items) {
        timers.current.set(
          id,
          setTimeout(() => runDelete(id, label), UNDO_WINDOW_MS),
        );
      }

      toast(`Deleted ${items.length} ${noun}${items.length === 1 ? "" : "s"}`, {
        duration: UNDO_WINDOW_MS,
        action: {
          label: "Undo",
          onClick: () => {
            for (const id of ids) {
              const pending = timers.current.get(id);
              if (pending) {
                clearTimeout(pending);
                timers.current.delete(id);
              }
            }
            unhide(ids);
          },
        },
      });
    },
    [runDelete, unhide],
  );

  return { hiddenIds, requestDelete, requestDeleteMany };
}

/**
 * For a delete that navigates away immediately (a detail page redirecting
 * to its list) rather than hiding a row in place — same deferred-delete +
 * undo-toast contract, just without hiddenIds to manage since the page
 * itself is about to change. Call this, then navigate; if the item was
 * never actually deleted (Undo), it's simply still there when the list
 * page loads.
 */
export function deferredDelete(deleteFn: (id: string) => Promise<void>, id: string, label: string) {
  const timer = setTimeout(() => {
    deleteFn(id).catch(() => toast.error(`Couldn't delete ${label}.`));
  }, UNDO_WINDOW_MS);

  toast(`Deleted ${label}`, {
    duration: UNDO_WINDOW_MS,
    action: {
      label: "Undo",
      onClick: () => clearTimeout(timer),
    },
  });
}
