"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { emitAsh, prefersReducedMotion, setSlipPhase, type BurnPhase } from "@/lib/burn-engine";

export type { BurnPhase };

const HOLD_MS = 5000;

/**
 * Drives one slip's tear → burn → char (undo hold) → ash → gone sequence.
 * Nothing is persisted until the sequence actually finishes uninterrupted —
 * `onCommit` fires once, right as the row is about to disappear — mirroring
 * this codebase's existing deferred-delete pattern (useUndoableDelete):
 * putting a slip out during the char hold means nothing was ever written,
 * so there's nothing to roll back. `onQuench` fires instead, to record the
 * put-out in the permanent Ash log without touching the item's real state.
 */
export function useBurn(id: string, onCommit: () => void, onQuench: () => void) {
  const [phase, setPhaseState] = useState<BurnPhase>("open");
  const elRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const onCommitRef = useRef(onCommit);
  const onQuenchRef = useRef(onQuench);
  useEffect(() => {
    onCommitRef.current = onCommit;
    onQuenchRef.current = onQuench;
  }, [onCommit, onQuench]);

  const setPhase = useCallback(
    (p: BurnPhase) => {
      setPhaseState(p);
      setSlipPhase(id, p);
    },
    [id],
  );

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const emit = useCallback((frac: number) => emitAsh(elRef.current, frac), []);

  useEffect(
    () => () => {
      clearTimers();
      setSlipPhase(id, "open");
    },
    [clearTimers, id],
  );

  const smoulder = useCallback(() => {
    clearTimers();
    setPhase("ash");
    after(160, () => emit(0.55));
    after(480, () => emit(0.7));
    after(820, () => emit(0.85));
    after(1150, () => emit(1));
    after(1950, () => {
      setPhase("gone");
      onCommitRef.current();
    });
  }, [after, clearTimers, emit, setPhase]);

  const light = useCallback(() => {
    setPhaseState((p) => {
      if (p !== "open") return p;
      clearTimers();
      setSlipPhase(id, "tear");
      if (prefersReducedMotion()) {
        after(200, smoulder);
        return "ash";
      }
      after(430, () => setPhase("burn"));
      after(640, () => emit(0.08));
      after(900, () => emit(0.19));
      after(1160, () => emit(0.3));
      after(1400, () => emit(0.4));
      after(1510, () => setPhase("char"));
      after(1510 + HOLD_MS, smoulder);
      return "tear";
    });
  }, [after, clearTimers, emit, id, setPhase, smoulder]);

  const restore = useCallback(() => {
    clearTimers();
    onQuenchRef.current();
    setPhase("quench");
    after(460, () => setPhase("open"));
  }, [after, clearTimers, setPhase]);

  const disabled = phase === "tear" || phase === "burn" || phase === "ash" || phase === "quench";
  const onPrimary = phase === "char" ? restore : phase === "open" ? light : undefined;

  return { phase, elRef, light, restore, onPrimary, disabled };
}
