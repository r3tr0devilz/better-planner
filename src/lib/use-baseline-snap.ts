"use client";

import { useEffect } from "react";

const RULE_PITCH = 30; // .sheet's ruled-paper line spacing (globals.css)
const RULE_OFFSET = 32; // .sheet's background-position: 0 2rem
// If a stable page can't make this many passes settle, something about a
// particular heading's position isn't converging (sub-pixel layout-engine
// noise landing right on a modulo boundary, most likely) — stop touching
// padding entirely rather than let it fight forever. A heading a few
// pixels off the rule grid is a cosmetic miss; a page visibly jittering up
// and down with no way to stop is a real bug, and no snapping precision is
// worth risking that a second time.
const MAX_PASSES = 8;

export function useBaselineSnap() {
  useEffect(() => {
    const sheet = document.querySelector(".sheet");
    if (!sheet) return;

    let frame = 0;
    let passes = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let disabled = false;

    function snap() {
      if (disabled) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const sheetTop = sheet!.getBoundingClientRect().top;
        let wroteAnything = false;

        document.querySelectorAll<HTMLElement>("[data-snap]").forEach((el) => {
          const cs = getComputedStyle(el);
          const fontSize = parseFloat(cs.fontSize);
          const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.2;
          // el.getBoundingClientRect().top is an element's own border-box
          // top — set by normal flow (whatever comes before it), and NOT
          // moved by that same element's own padding-top (padding only
          // grows the box downward and pushes its *content* down within
          // it). An earlier version subtracted the currently-applied
          // padding here on the theory that it needed backing out; that was
          // wrong, and made each pass depend on the previous pass's answer.
          const currentPad = parseFloat(cs.paddingTop) || 0;
          const top = el.getBoundingClientRect().top - sheetTop;
          // Rounded to a whole pixel before the modulo: getBoundingClientRect
          // can return a sub-pixel-different value between two calls with
          // nothing actually different on the page (ordinary layout-engine
          // float noise), and right near a multiple-of-30 boundary that's
          // enough to flip the mod from ~0 to ~29 — a large swing in the
          // output from a fraction-of-a-pixel difference in the input.
          const baseline = Math.round(top + currentPad + (lineHeight - fontSize) / 2 + fontSize * 0.76);
          let delta = (((RULE_OFFSET - baseline) % RULE_PITCH) + RULE_PITCH) % RULE_PITCH;
          if (delta > RULE_PITCH - 0.4) delta = 0;
          if (Math.abs(delta - currentPad) < 1.5) return;
          el.style.paddingTop = `${delta.toFixed(2)}px`;
          wroteAnything = true;
        });

        // Only a real write can legitimately re-trigger the ResizeObserver
        // this runs from (a stable pass writes nothing and stays stable) —
        // so passes only need counting, and the settle timer only needs
        // arming, when this pass actually changed something.
        if (wroteAnything) {
          passes += 1;
          clearTimeout(settleTimer);
          settleTimer = setTimeout(() => {
            passes = 0;
          }, 400);
          if (passes >= MAX_PASSES) {
            disabled = true;
            ro.disconnect();
          }
        }
      });
    }

    snap();
    const ro = new ResizeObserver(snap);
    ro.observe(sheet);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
      ro.disconnect();
    };
  }, []);
}
