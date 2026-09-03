"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Mic, Plus, Square } from "lucide-react";
import { Modal } from "./modal";
import { CaptureShortcutKey } from "./capture-shortcut-key";
import { quickCaptureFor } from "@/lib/quick-capture";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** "sidebar" is the full-row .cap-btn treatment (icon + label + shortcut
 * hint) used in the desktop nav; "compact" is the original pill button,
 * kept unchanged for the mobile header — the AI batch capture flow this
 * sits beside is desktop-only by design (see chat4's "mobile: Desktop only
 * for now"), so mobile keeps the simple single-item capture it already had
 * rather than adopting the new full-row look with nowhere to put its pair. */
export function CaptureBar({ variant = "compact" }: { variant?: "sidebar" | "compact" }) {
  const router = useRouter();
  const pathname = usePathname();
  const quickTarget = quickCaptureFor(pathname);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [resultLabel, setResultLabel] = useState<string | null>(null);
  // Defaults to quick mode whenever this page has an obvious target
  // (createTask on Tasks, createNote on Library, ...); "Use AI capture
  // instead" below can drop into the free-text/voice/LLM-routed flow for a
  // single open of the modal, without changing what the page itself is.
  const [useAi, setUseAi] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSupported = typeof window !== "undefined" && getSpeechRecognition() !== null;
  const quickMode = !!quickTarget && !useAi;

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  const close = useCallback(() => {
    setOpen(false);
    setText("");
    setStatus("idle");
    setResultLabel(null);
    setUseAi(false);
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  function toggleListening() {
    const Recognition = getSpeechRecognition();
    if (!Recognition) return;

    if (listening) {
      stopListening();
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const e = event as { resultIndex: number; results: { transcript: string }[][] };
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setText(transcript);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  async function submit(source: "text" | "voice") {
    if (!text.trim()) return;
    stopListening();
    setStatus("saving");
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, source }),
      });
      if (!res.ok) throw new Error("capture failed");
      const data = (await res.json()) as { label: string };
      setResultLabel(data.label);
      setStatus("done");
      router.refresh();
      setTimeout(close, 1400);
    } catch {
      setStatus("error");
    }
  }

  /** No LLM round trip — just the current page's own createX action with
   * this one field, the same call its native "+ New X" form already makes.
   * Deterministic and fast; the trade-off is it can't pull a due date or
   * domain out of the text the way AI capture can, which is exactly what
   * "Use AI capture instead" is there for. */
  async function submitQuick() {
    if (!quickTarget || !text.trim()) return;
    stopListening();
    setStatus("saving");
    try {
      const formData = new FormData();
      formData.set(quickTarget.field, text);
      await quickTarget.action(formData);
      setResultLabel(text.trim());
      setStatus("done");
      router.refresh();
      setTimeout(close, 1400);
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // CaptureBar mounts twice at once — "sidebar" for desktop, "compact"
      // for the mobile header — each swapped in/out purely by a CSS
      // breakpoint, so both are always in the tree and both used to run
      // this same listener. Gate the shortcut to one instance (sidebar's,
      // since it's the one that's always mounted) so Cmd/Ctrl+J opens a
      // single Capture modal instead of one from each. Modal portals to
      // document.body, so sidebar's own modal still displays correctly
      // even while its CSS-hidden on a narrow viewport. Escape stays
      // unscoped — it only ever closes this instance's own (already-open)
      // modal, so there's nothing to duplicate there.
      if (variant === "sidebar" && (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, variant]);

  const captureLabel = quickTarget ? `Capture — add a ${quickTarget.kind} here` : "Capture a task or note";

  return (
    <>
      {variant === "sidebar" ? (
        <button type="button" onClick={() => setOpen(true)} data-kind="quick" className="cap-btn" aria-label={captureLabel}>
          <span className="cap-mark">+</span>
          <span>Capture</span>
          <CaptureShortcutKey />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="btn shrink-0" aria-label={captureLabel}>
          <Plus size={18} />
          <span className="hidden sm:inline">Capture</span>
        </button>
      )}

      {open && (
        <Modal onClose={close} title="Capture" className="w-full max-w-lg" panelClass="cap-panel">
          <span className="cap-perf" aria-hidden />
          {quickMode ? (
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={quickTarget!.placeholder}
              className="cap-field mt-3"
              onKeyDown={(e) => {
                if (e.key === "Enter") submitQuick();
              }}
            />
          ) : (
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Schedule a task, jot a note, log a quote…"
              rows={3}
              className="cap-field mt-3"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit("text");
              }}
            />
          )}

          {quickTarget && (
            <button
              type="button"
              onClick={() => setUseAi((v) => !v)}
              className="mt-2 text-xs font-medium text-ink-faint underline decoration-line underline-offset-2 hover:text-ink"
            >
              {quickMode ? "Use AI capture instead" : `Back to quick-add a ${quickTarget.kind}`}
            </button>
          )}

          <div role="status" aria-live="polite">
            {status === "error" && (
              <p role="alert" className="mt-2 text-sm text-vermillion">
                Couldn&apos;t save that — try again.
              </p>
            )}
            {status === "done" && resultLabel && <p className="mt-2 text-sm text-moss">Added: {resultLabel}</p>}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            {!quickMode && speechSupported ? (
              <button onClick={toggleListening} className={listening ? "btn-ink" : "btn-quiet"}>
                {listening ? <Square size={14} /> : <Mic size={14} />}
                {listening ? "Stop" : "Voice"}
              </button>
            ) : (
              <span />
            )}

            <button
              onClick={() => (quickMode ? submitQuick() : submit(listening ? "voice" : "text"))}
              disabled={status === "saving" || !text.trim()}
              className="btn-ink"
            >
              {status === "saving" ? "Saving…" : "Add"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
