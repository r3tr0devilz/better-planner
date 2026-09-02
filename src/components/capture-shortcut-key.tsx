"use client";

import { useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}
function getIsMac() {
  return /Mac|iPhone|iPad/.test(navigator.userAgent);
}
function getIsMacServerSnapshot() {
  return false;
}

/** The four-pane Windows-key glyph from the design (chat6: "this is a
 * Windows native website" — the user's own machine). Only actually shown on
 * Windows; Mac keeps the plain "Cmd" text it already had, rather than
 * showing the wrong OS's key. */
function WinMark() {
  return (
    <svg className="win-mark" viewBox="0 0 10 10" aria-label="Windows key" role="img">
      <path d="M0 1.35 4.3.72v3.86H0z" />
      <path d="M5.25.58 10 0v4.58H5.25z" />
      <path d="M0 5.42h4.3v3.86L0 8.65z" />
      <path d="M5.25 5.42H10V10l-4.75-.58z" />
    </svg>
  );
}

/** Shortcut hint shown in a .cap-btn's trailing .cap-key slot — e.g. ⊞ J or
 * ⊞ ⇧ J on Windows, Cmd J / Cmd ⇧ J on Mac. */
export function CaptureShortcutKey({ shift = false }: { shift?: boolean }) {
  const isMac = useSyncExternalStore(subscribeNoop, getIsMac, getIsMacServerSnapshot);
  return (
    <span className="cap-key">
      {isMac ? <span>Cmd</span> : <WinMark />}
      {shift && <span>⇧</span>}
      <span>J</span>
    </span>
  );
}
