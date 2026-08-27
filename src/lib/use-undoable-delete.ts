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

  const requestDelete = useCallback(
    (id: string, label: string) => {
      setHiddenIds((prev) => new Set(prev).add(id));

      const timer = setTimeout(() => {
        timers.current.delete(id);
        deleteFn(id).catch(() => {
          setHiddenIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          toast.error(`Couldn't delete ${label}.`);
        });
      }, UNDO_WINDOW_MS);
      timers.current.set(id, timer);

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
            setHiddenIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          },
        },
      });
    },
    [deleteFn],
  );

  return { hiddenIds, requestDelete };
}
