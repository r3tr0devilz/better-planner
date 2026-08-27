"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Mic, Plus, Square } from "lucide-react";
import { Modal } from "./modal";

function subscribeNoop() {
  return () => {};
}
function getIsMac() {
  return /Mac|iPhone|iPad/.test(navigator.userAgent);
}
function getIsMacServerSnapshot() {
  return false;
}

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

export function CaptureBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [resultLabel, setResultLabel] = useState<string | null>(null);
  const isMac = useSyncExternalStore(subscribeNoop, getIsMac, getIsMacServerSnapshot);
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
      <button
        onClick={() => setOpen(true)}
        className="btn shrink-0"
        aria-label="Capture a task or note"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">Capture</span>
        <kbd
          className="hidden items-center rounded-sm border border-panel/45 bg-panel/10 px-2 py-1 font-mono text-[0.68rem] font-semibold uppercase leading-none tracking-[0.04em] text-panel/85 sm:inline-flex"
          title={isMac ? "Cmd+J" : "Ctrl+J"}
        >
          {isMac ? "Cmd+J" : "Ctrl+J"}
        </kbd>
      </button>

      {open && (
        <Modal onClose={close} title="Capture">
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Schedule a task, jot a note, log a quote…"
            rows={3}
            className="field mt-3"
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

          <div className="mt-3 flex items-center justify-between">
            {speechSupported ? (
              <button onClick={toggleListening} className={listening ? "btn py-1.5" : "btn-outline py-1.5"}>
                {listening ? <Square size={14} /> : <Mic size={14} />}
                {listening ? "Stop" : "Voice"}
              </button>
            ) : (
              <span />
            )}

            <button
              onClick={() => submit(listening ? "voice" : "text")}
              disabled={status === "saving" || !text.trim()}
              className="btn py-2"
            >
              {status === "saving" ? "Saving…" : "Add"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
