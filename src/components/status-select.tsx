"use client";

import { useTransition } from "react";

export function StatusSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (value: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) => startTransition(() => onChange(e.target.value))}
      className="border border-paper-line bg-paper px-2 py-1 font-mono text-xs uppercase text-ink outline-none disabled:opacity-60"
    >
      {options.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
