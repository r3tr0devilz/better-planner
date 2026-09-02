"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { getDimServerSnapshot, getDimSnapshot, registerCanvas, subscribeDim } from "@/lib/burn-engine";

/**
 * The one shared surface every burning slip draws onto: a fixed full-page
 * canvas for drifting ash particles, plus the page-dim scrim that deepens
 * while something is mid-burn. Mount once, high in the tree (AppShell) —
 * see src/lib/burn-engine.ts for the singleton particle/dim state this
 * reads, which every useBurn() instance anywhere on the page feeds into.
 */
export function AshCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dim = useSyncExternalStore(subscribeDim, getDimSnapshot, getDimServerSnapshot);

  useEffect(() => {
    registerCanvas(canvasRef.current);
    return () => registerCanvas(null);
  }, []);

  return (
    <>
      <div className="burn-dim" data-dim={dim} aria-hidden />
      <canvas ref={canvasRef} className="ash-canvas" aria-hidden />
    </>
  );
}
