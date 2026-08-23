"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Plus, Square, X } from "lucide-react";

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
        className="flex items-center gap-2 rounded-full bg-dawn px-4 py-2.5 font-medium text-ink shadow-lg shadow-dawn/20 transition-transform hover:scale-[1.03] active:scale-95"
        aria-label="Capture a task or note"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">Capture</span>
        <kbd className="hidden rounded bg-black/15 px-1.5 py-0.5 text-xs sm:inline">⌘J</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-24 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="glass-strong w-full max-w-lg rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-lg italic text-mist">
                Capture
              </h2>
              <button onClick={close} aria-label="Close" className="text-mist-dim hover:text-mist">
                <X size={18} />
              </button>
            </div>

            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Schedule a task, jot a note, log a quote…"
              rows={3}
              className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-mist outline-none focus-visible:ring-2 focus-visible:ring-dusk"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit("text");
              }}
            />

            {status === "error" && (
              <p role="alert" className="mt-2 text-sm text-coral">
                Couldn&apos;t save that — try again.
              </p>
            )}
            {status === "done" && resultLabel && (
              <p className="mt-2 text-sm text-sage">Added: {resultLabel}</p>
            )}

            <div className="mt-3 flex items-center justify-between">
              {speechSupported ? (
                <button
                  onClick={toggleListening}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${
                    listening ? "bg-coral text-ink" : "bg-white/10 text-mist"
                  }`}
                >
                  {listening ? <Square size={14} /> : <Mic size={14} />}
                  {listening ? "Stop" : "Voice"}
                </button>
              ) : (
                <span />
              )}

              <button
                onClick={() => submit(listening ? "voice" : "text")}
                disabled={status === "saving" || !text.trim()}
                className="rounded-lg bg-dawn px-4 py-2 text-sm font-medium text-ink disabled:opacity-40"
              >
                {status === "saving" ? "Saving…" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
