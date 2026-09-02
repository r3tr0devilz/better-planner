"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { NAV_GROUPS, NAV_NUMERALS, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "./nav-items";
import { CaptureBar } from "./capture-bar";
import { AiCaptureButton } from "./ai-capture-button";
import { AshCanvas } from "./ash-canvas";
import { useBaselineSnap } from "@/lib/use-baseline-snap";
import type { Domain } from "@/lib/supabase/types";

export type NavCounts = Record<string, number>;

export function AppShell({ children, counts, domains }: { children: React.ReactNode; counts: NavCounts; domains: Domain[] }) {
  const pathname = usePathname();
  let numeral = 0;
  useBaselineSnap();

  return (
    <div id="app-root" className="flex min-h-screen flex-col md:flex-row">
      <AshCanvas />

      <a
        href="#main-content"
        className="fixed left-2 top-2 z-50 -translate-y-16 rounded-md bg-oxblood px-4 py-2 text-sm font-semibold text-panel transition-transform duration-150 focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* Desktop: the sidebar reads as a ledger index — roman numerals and
          hairline rules, not icons — grouped into "The day" (what's still
          open) and "The record" (what's kept). See DESIGN.md's Layout
          section for the 224px column this replaces 1:1. */}
      <aside className="card sticky top-0 z-40 hidden h-screen w-56 shrink-0 flex-col justify-between rounded-none border-y-0 border-l-0 p-5 md:flex">
        <div>
          <Link href="/today" className="font-[family-name:var(--font-display)] text-xl font-bold uppercase tracking-tight text-ink">
            Better Planner
          </Link>
          <nav aria-label="Main" className="mt-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="nav-group">{group.label}</p>
                <div className="flex flex-col border-t border-ink">
                  {group.items.map(({ href, label }) => {
                    const active = pathname.startsWith(href);
                    const roman = NAV_NUMERALS[numeral++];
                    return (
                      <Link key={href} href={href} className="nav-btn" data-active={active}>
                        <span className="nav-num">{roman}</span>
                        <span className="flex-1">{label}</span>
                        <span className="nav-count">{counts[href.slice(1)] || ""}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          <CaptureBar variant="sidebar" />
          <AiCaptureButton domains={domains} />
        </div>
      </aside>

      <header className="card sticky top-0 z-40 flex items-center justify-between rounded-none border-x-0 border-t-0 px-4 py-3 md:hidden">
        <Link href="/today" className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-tight text-ink">
          Better Planner
        </Link>
        <CaptureBar />
      </header>

      <main id="main-content" tabIndex={-1} className="sheet min-w-0 flex-1 px-4 py-6 pb-24 focus:outline-none md:px-8 md:py-8 md:pb-8">
        {children}
      </main>

      <nav
        aria-label="Primary"
        className="card fixed inset-x-0 bottom-0 z-40 flex items-center justify-around rounded-none border-x-0 border-b-0 py-2 md:hidden"
      >
        {PRIMARY_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] transition-colors duration-150 ${
                active ? "text-oxblood" : "text-ink-faint"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
        <Link
          href="/more"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] transition-colors duration-150 ${
            SECONDARY_NAV_ITEMS.some(({ href }) => pathname.startsWith(href)) || pathname === "/more"
              ? "text-oxblood"
              : "text-ink-faint"
          }`}
        >
          <MoreHorizontal size={20} />
          More
        </Link>
      </nav>
    </div>
  );
}
