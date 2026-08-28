"use client";

import { useRouter } from "next/navigation";
import { DeleteButton } from "./delete-button";
import { deferredDelete } from "@/lib/use-undoable-delete";

/** Delete-and-navigate-away, on the same undo contract as every in-place
 * list delete: no blocking confirm(), the real server delete is deferred
 * ~5s behind an undo toast that survives the navigation (Sonner's Toaster
 * lives in the root layout). Undo just cancels the timer — since nothing
 * was actually deleted, the item is simply still there on the page you
 * land on. */
export function RedirectDeleteButton({
  id,
  label,
  deleteFn,
  redirectTo,
  buttonLabel = "Delete",
  className,
}: {
  id: string;
  label: string;
  deleteFn: (id: string) => Promise<void>;
  redirectTo: string;
  buttonLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <DeleteButton
      confirmMessage=""
      skipConfirm
      label={buttonLabel}
      ariaLabel={`Delete ${label}`}
      onDelete={() => {
        deferredDelete(deleteFn, id, label);
        router.push(redirectTo);
        return Promise.resolve();
      }}
      className={className}
    />
  );
}
