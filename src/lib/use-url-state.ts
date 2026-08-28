"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * A useState-like string value backed by the URL's query string, so a
 * filter or search term survives a refresh and can be shared/bookmarked —
 * the URL is the source of truth, not a duplicate piece of local state.
 * Uses router.replace (not push) so typing doesn't spam browser history.
 */
export function useUrlState(key: string, defaultValue = ""): [string, (next: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  const setValue = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "" || next === defaultValue) params.delete(key);
      else params.set(key, next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [key, defaultValue, pathname, router, searchParams],
  );

  return [value, setValue];
}
