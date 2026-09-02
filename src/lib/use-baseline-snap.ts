"use client";

import { useEffect } from "react";

const RULE_PITCH = 30; // .sheet's ruled-paper line spacing (globals.css)
const RULE_OFFSET = 32; // .sheet's background-position: 0 2rem

/**
 * Snaps every `data-snap`-tagged heading so its text baseline lands exactly
 * on the .sheet's ruled-paper grid, like handwriting sitting on a line
 * rather than floating between two. There's no real per-font ascent metric
 * available from CSS, so this approximates the baseline's position within
 * the line box the same way the original prototype measure pass did: 0.76
 * of the font size down from the top of a centered line box.
 *
 * Mounted once (in AppShell) rather than per-page: it watches .sheet itself
 * via ResizeObserver, so any layout shift — a slip burning away, capture
 * adding a row, a filter changing what's rendered — re-triggers it
 * automatically, without every page having to enumerate its own
 * "what changed" dependency list.
 */
export function useBaselineSnap() {
  useEffect(() => {
    const sheet = document.querySelector(".sheet");
    if (!sheet) return;

    let frame = 0;
    function snap() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const sheetTop = sheet!.getBoundingClientRect().top;
        document.querySelectorAll<HTMLElement>("[data-snap]").forEach((el) => {
          const cs = getComputedStyle(el);
          const fontSize = parseFloat(cs.fontSize);
          const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.2;
          // Read against the padding-less position — el.offsetTop minus its
          // own current padding-top isolates "where would this sit with no
          // snap applied", so the measurement doesn't feed its own last
          // correction back into itself.
          const currentPad = parseFloat(cs.paddingTop) || 0;
          const top = el.getBoundingClientRect().top - sheetTop - currentPad;
          const baseline = top + (lineHeight - fontSize) / 2 + fontSize * 0.76;
          let delta = (((RULE_OFFSET - baseline) % RULE_PITCH) + RULE_PITCH) % RULE_PITCH;
          if (delta > RULE_PITCH - 0.4) delta = 0;
          el.style.paddingTop = `${delta.toFixed(2)}px`;
        });
      });
    }

    snap();
    const ro = new ResizeObserver(snap);
    ro.observe(sheet);
    window.addEventListener("resize", snap);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", snap);
    };
  }, []);
}
