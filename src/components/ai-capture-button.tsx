"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import { CaptureShortcutKey } from "./capture-shortcut-key";
import { threadIndexFor } from "@/lib/domain-threads";
import type { Domain } from "@/lib/supabase/types";
import type { CaptureResult } from "@/lib/capture/schema";

type Stage = "idle" | "reading" | "review" | "committing";

/** An in-review candidate: the parsed item, whether it's still checked to
 * be kept, and a stable id (index-based — the array only exists for the
 * lifetime of one review session, nothing about it is persisted yet). */
type ReviewItem = { id: number; item: CaptureResult; on: boolean };

function dueLabel(dueAt: string | null): string {
  if (!dueAt) return "NO DUE DATE";
  const d = new Date(dueAt);
  const today = new Date();
  const diffDays = Math.round((d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86_400_000);
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "TOMORROW";
  if (diffDays > 1 && diffDays <= 6) return d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  return new Date(dueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

/** "AI capture" (⌘⇧J / ⊞⇧J) — paste a paragraph, get back every distinct
 * item it describes as a reviewable list before anything is written. The
 * batch counterpart to CaptureBar's single-item quick capture: see
 * src/lib/capture/parse.ts's parseCaptureBatch and the two /api/capture/batch
 * routes (preview vs. commit) this drives. */
export function AiCaptureButton({ domains }: { domains: Domain[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [text, setText] = useState("");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setStage("idle");
    setText("");
    setItems([]);
    setError(null);
  }, []);

  async function readIt() {
    if (!text.trim()) return;
    setStage("reading");
    setError(null);
    try {
      const res = await fetch("/api/capture/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("read failed");
      const data = (await res.json()) as { items: CaptureResult[] };
      setItems(data.items.map((item, id) => ({ id, item, on: true })));
      setStage("review");
    } catch {
      setError("Couldn't read that — try again.");
      setStage("idle");
    }
  }

  function toggle(id: number) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, on: !r.on } : r)));
  }

  const keptCount = items.filter((r) => r.on).length;

  async function cutSlips() {
    const kept = items.filter((r) => r.on).map((r) => r.item);
    if (kept.length === 0) return;
    setStage("committing");
    setError(null);
    try {
      const res = await fetch("/api/capture/batch/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, items: kept }),
      });
      if (!res.ok) throw new Error("commit failed");
      router.refresh();
      close();
    } catch {
      setError("Couldn't save those — try again.");
      setStage("review");
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} data-kind="ai" className="cap-btn" aria-label="AI capture — paste text to extract multiple tasks">
        <span className="cap-mark">≡</span>
        <span>AI capture</span>
        <CaptureShortcutKey shift />
      </button>
      <p className="mt-1.5 font-mono text-[10px] leading-relaxed tracking-wide text-ink-faint">Paste notes; it cuts the slips.</p>

      {open && (
        <Modal onClose={close} title="AI capture" className="w-full max-w-2xl" panelClass="cap-panel">
          <span className="cap-perf" aria-hidden />

          {stage === "idle" && (
            <>
              <p className="mt-2 text-sm text-ink-faint">
                Paste a paragraph, a meeting note, an email. It reads the text and cuts a slip for every task it finds.
              </p>
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Anya wants the print run photographed before Friday, and I still owe Northline the scope revision. Also: cancel the storage plan and book the dentist."
                className="cap-field cap-area mt-3"
              />
              {error && (
                <p role="alert" className="mt-2 text-sm text-vermillion">
                  {error}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="font-mono text-[10px] tracking-wide text-ink-faint">{text.length} characters</span>
                <span className="flex gap-2">
                  <button type="button" onClick={close} className="btn-quiet">
                    Cancel
                  </button>
                  <button type="button" onClick={readIt} disabled={!text.trim()} className="btn-ink">
                    Read it
                  </button>
                </span>
              </div>
            </>
          )}

          {stage === "reading" && (
            <>
              <div className="read-line" aria-hidden>
                <span />
              </div>
              <p className="font-mono text-[10px] tracking-[0.12em] text-vermillion">READING THE TEXT…</p>
              <p className="mt-4 max-h-36 overflow-hidden text-sm leading-relaxed text-ink-faint">{text}</p>
            </>
          )}

          {(stage === "review" || stage === "committing") && (
            <>
              <p className="mt-1 font-mono text-[10px] tracking-wide text-ink-faint">
                {items.length === 0 ? "No tasks found in that text." : `Found ${items.length} — ${keptCount} kept`}
              </p>
              <div className="mt-3 flex flex-col gap-1.5">
                {items.map(({ id, item, on }) => {
                  const domain = domains.find((d) => d.name.toLowerCase() === item.domain_name?.toLowerCase());
                  const threadIndex = threadIndexFor(domain?.id ?? null, domains);
                  return (
                    <div key={id} className="prop-row" data-on={on} data-thread={threadIndex >= 0 ? threadIndex : undefined}>
                      <button type="button" onClick={() => toggle(id)} aria-label={`${on ? "Drop" : "Keep"} "${item.title}"`} className="slip-check" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink">{item.title}</p>
                        <p className="mt-0.5 font-mono text-[10px] tracking-wide text-ink-faint">
                          {dueLabel(item.due_at)} · {domain?.name.toUpperCase() ?? item.kind.replace("_", " ").toUpperCase()}
                        </p>
                      </div>
                      <span className="proj-edge" />
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <p className="border border-line py-5 text-center font-mono text-[11px] tracking-wide text-ink-faint">
                    No tasks found in that text.
                  </p>
                )}
              </div>
              {error && (
                <p role="alert" className="mt-2 text-sm text-vermillion">
                  {error}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <button type="button" onClick={() => setStage("idle")} className="btn-quiet">
                  Edit the text
                </button>
                <span className="flex gap-2">
                  <button type="button" onClick={close} className="btn-quiet">
                    Discard
                  </button>
                  <button type="button" onClick={cutSlips} disabled={keptCount === 0 || stage === "committing"} className="btn-ink">
                    {stage === "committing" ? "Cutting…" : `Cut ${keptCount} slip${keptCount === 1 ? "" : "s"}`}
                  </button>
                </span>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
