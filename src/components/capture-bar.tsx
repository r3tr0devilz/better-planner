"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Plus, Square } from "lucide-react";
import { Modal } from "./modal";
import { CaptureShortcutKey } from "./capture-shortcut-key";

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
  const [open, setOpen] = useState(false);
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
    setOpen(false);
    setText("");
    setStatus("idle");
    setResultLabel(null);
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <>
      {variant === "sidebar" ? (
        <button type="button" onClick={() => setOpen(true)} data-kind="quick" className="cap-btn" aria-label="Capture a task or note">
          <span className="cap-mark">+</span>
          <span>Capture</span>
          <CaptureShortcutKey />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="btn shrink-0" aria-label="Capture a task or note">
          <Plus size={18} />
          <span className="hidden sm:inline">Capture</span>
        </button>
      )}

      {open && (
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
