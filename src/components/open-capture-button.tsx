"use client";

/** Triggers the same shortcut CaptureBar already listens for on window, so
 * an empty-state CTA can open Capture without lifting its open-state up. */
function openCapture() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "j", ctrlKey: true, bubbles: true }));
}

export function OpenCaptureButton({ label = "Capture first item" }: { label?: string }) {
  return (
    <button type="button" onClick={openCapture} className="btn-outline mt-2 px-3 py-1.5 text-xs">
      {label}
    </button>
  );
}
