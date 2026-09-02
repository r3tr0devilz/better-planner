"use client";

// Incense Ledger: the shared runtime behind every burnable row (tasks,
// routines, checklist items) — a singleton ash-particle system + a page-dim
// level, both driven by whichever slips are currently mid-burn anywhere on
// the page. Lives outside React (a plain external store) because the ash
// canvas and the dim overlay are drawn once, globally, not per-row; the
// per-row animation state itself lives in useBurn (use-burn.ts).

export type BurnPhase = "open" | "tear" | "burn" | "char" | "quench" | "ash" | "gone";
export type DimState = "off" | "soft" | "on";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  decay: number;
  seed: number;
  hot: boolean;
};

const phases = new Map<string, BurnPhase>();
const dimListeners = new Set<() => void>();
let dimSnapshot: DimState = "off";

function recomputeDim() {
  let hot = false;
  let soft = false;
  for (const phase of phases.values()) {
    if (phase === "tear" || phase === "burn" || phase === "ash") hot = true;
    else if (phase === "char" || phase === "quench") soft = true;
  }
  const next: DimState = hot ? "on" : soft ? "soft" : "off";
  if (next !== dimSnapshot) {
    dimSnapshot = next;
    dimListeners.forEach((fn) => fn());
  }
}

export function setSlipPhase(id: string, phase: BurnPhase) {
  if (phase === "open" || phase === "gone") phases.delete(id);
  else phases.set(id, phase);
  recomputeDim();
}

export function subscribeDim(fn: () => void): () => void {
  dimListeners.add(fn);
  return () => dimListeners.delete(fn);
}

export function getDimSnapshot(): DimState {
  return dimSnapshot;
}

export function getDimServerSnapshot(): DimState {
  return "off";
}

// ── ash particles ───────────────────────────────────────────────────────
let canvas: HTMLCanvasElement | null = null;
let particles: Particle[] = [];
let raf = 0;

export function registerCanvas(el: HTMLCanvasElement | null) {
  canvas = el;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function emitAsh(el: HTMLElement | null, frac: number) {
  if (!el || prefersReducedMotion()) return;
  const r = el.getBoundingClientRect();
  const x0 = r.left;
  const y0 = r.top;
  const count = 46;
  const frontX = frac >= 1 ? 0 : r.width * (1 - frac);
  for (let i = 0; i < count; i++) {
    const band = Math.min(r.width - frontX, frac >= 1 ? r.width : 90);
    const x = x0 + frontX + Math.random() * Math.max(band, 8);
    particles.push({
      x,
      y: y0 + Math.random() * r.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -(0.22 + Math.random() * 0.5),
      r: 0.6 + Math.random() * 1.7,
      life: 1,
      decay: 0.006 + Math.random() * 0.012,
      seed: Math.random() * 6.28,
      hot: Math.random() < (frac >= 1 ? 0.1 : 0.34),
    });
  }
  ensureLoop();
}

function draw() {
  if (canvas) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (particles.length) {
        const t = performance.now() / 1000;
        const next: Particle[] = [];
        for (const p of particles) {
          p.life -= p.decay;
          if (p.life <= 0) continue;
          p.x += p.vx + Math.sin(t * 1.4 + p.seed) * 0.22;
          p.y += p.vy;
          p.vy -= 0.0032;
          next.push(p);
        }
        particles = next;
        for (const p of particles) {
          const a = Math.max(0, Math.min(1, p.life));
          ctx.globalAlpha = a * (p.hot ? 0.92 : 0.6);
          ctx.fillStyle = p.hot ? "#ff8a3d" : "#6b6055";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * (0.5 + p.life * 0.5), 0, 6.283);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }
  }
  if (particles.length) {
    raf = requestAnimationFrame(draw);
  } else {
    raf = 0;
  }
}

function ensureLoop() {
  if (!raf) raf = requestAnimationFrame(draw);
}
