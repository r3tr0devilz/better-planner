"use client";

import { useEffect, useState } from "react";
import { ROW_HEIGHT } from "./constants";

/**
 * Live "current time" line for the day timeline. Renders nothing until
 * mounted (avoids an SSR/client hydration mismatch over "now"), and nothing
 * at all unless the timeline being viewed is actually today's.
 */
export function NowLine({ dateKey }: { dateKey: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    function tick() {
      const d = new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      setNow(key === dateKey ? d : null);
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [dateKey]);

  if (!now) return null;

  const top = ((now.getHours() * 60 + now.getMinutes()) / 60) * ROW_HEIGHT;

  return (
    <div className="pointer-events-none absolute inset-x-0 z-10" style={{ top }}>
      <span className="absolute -left-1.5 -top-[5px] h-2.5 w-2.5 rounded-full bg-vermillion" aria-hidden />
      <div className="h-px bg-vermillion" />
    </div>
  );
}
