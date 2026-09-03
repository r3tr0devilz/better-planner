"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Mic, Plus, Square } from "lucide-react";
import { Modal } from "./modal";
import { CaptureShortcutKey } from "./capture-shortcut-key";
import { quickCaptureFor, openQuickCapture } from "@/lib/quick-capture";

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
  const targets = quickCaptureFor(pathname);
  // "ai" is the original free-text/voice/LLM-parsed modal, unchanged, shown
  // only on pages with no quick-capture target of their own. "picker" is a
  // bare "which one" chip list for pages with more than one target — no
  // text field, no LLM, just opening the real form once you've said which.
  // A single-target page never shows either: one click opens straight
  // through to that page's own form (see handleClick).
  const [modalMode, setModalMode] = useState<"ai" | "picker" | null>(null);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [resultLabel, setResultLabel] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSupported = typeof window !== "undefined" && getSpeechRecognition() !== null;

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  const close = useCallback(() => {
    setModalMode(null);
    setText("");
    setStatus("idle");
    setResultLabel(null);
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  function handleClick() {
    if (targets.length === 0) {
      setModalMode("ai");
    } else if (targets.length === 1) {
      openQuickCapture(targets[0].key);
    } else {
      setModalMode("picker");
    }
  }

  function pick(key: string) {
    openQuickCapture(key);
    setModalMode(null);
  }

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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // CaptureBar mounts twice at once — "sidebar" for desktop, "compact"
      // for the mobile header — each swapped in/out purely by a CSS
      // breakpoint, so both are always in the tree and both used to run
      // this same listener. Gate the shortcut to one instance (sidebar's,
      // since it's the one that's always mounted) so Cmd/Ctrl+J triggers
      // Capture exactly once instead of once per instance. Escape stays
      // unscoped — it only ever closes this instance's own (already-open)
      // modal, so there's nothing to duplicate there.
      if (variant === "sidebar" && (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
        handleClick();
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [close, variant, targets.length]);

  const captureLabel =
    targets.length === 1
      ? `Capture — add a ${targets[0].label.toLowerCase()} here`
      : targets.length > 1
        ? "Capture — choose what to add here"
        : "Capture a task or note";

  return (
    <>
      {variant === "sidebar" ? (
        <button type="button" onClick={handleClick} data-kind="quick" className="cap-btn" aria-label={captureLabel}>
          <span className="cap-mark">+</span>
          <span>Capture</span>
          <CaptureShortcutKey />
        </button>
      ) : (
        <button onClick={handleClick} className="btn shrink-0" aria-label={captureLabel}>
          <Plus size={18} />
          <span className="hidden sm:inline">Capture</span>
        </button>
      )}

      {modalMode === "picker" && (
        <Modal onClose={close} title="Capture" className="w-full max-w-sm" panelClass="cap-panel">
          <span className="cap-perf" aria-hidden />
          <p className="mt-3 text-xs text-ink-faint">What would you like to add?</p>
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="What to add">
            {targets.map((t) => (
              <button key={t.key} type="button" onClick={() => pick(t.key)} className="cap-kind">
                {t.label}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {modalMode === "ai" && (
        <Modal onClose={close} title="Capture" className="w-full max-w-lg" panelClass="cap-panel">
          <span className="cap-perf" aria-hidden />
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

          <div role="status" aria-live="polite">
            {status === "error" && (
              <p role="alert" className="mt-2 text-sm text-vermillion">
                Couldn&apos;t save that — try again.
              </p>
            )}
            {status === "done" && resultLabel && <p className="mt-2 text-sm text-moss">Added: {resultLabel}</p>}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            {speechSupported ? (
              <button onClick={toggleListening} className={listening ? "btn-ink" : "btn-quiet"}>
                {listening ? <Square size={14} /> : <Mic size={14} />}
                {listening ? "Stop" : "Voice"}
              </button>
            ) : (
              <span />
            )}

            <button
              onClick={() => submit(listening ? "voice" : "text")}
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
