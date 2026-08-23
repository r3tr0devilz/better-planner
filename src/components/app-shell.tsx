"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { NAV_ITEMS, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "./nav-items";
import { CaptureBar } from "./capture-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="card sticky top-0 z-40 hidden h-screen w-56 shrink-0 flex-col justify-between border-y-0 border-l-0 p-5 md:flex">
        <div>
          <Link href="/today" className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
            Better Planner
          </Link>
          <nav className="mt-8 flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                    active ? "bg-paper text-ink" : "text-ink-faint hover:text-ink"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <CaptureBar />
      </aside>

      <header className="card sticky top-0 z-40 flex items-center justify-between border-x-0 border-t-0 px-4 py-3 md:hidden">
        <Link href="/today" className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
          Better Planner
        </Link>
        <CaptureBar />
      </header>

      <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>

      <nav className="card fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-x-0 border-b-0 py-2 md:hidden">
        {PRIMARY_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] ${
                active ? "text-stamp-red" : "text-ink-faint"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
        <Link
          href="/more"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] ${
            SECONDARY_NAV_ITEMS.some(({ href }) => pathname.startsWith(href)) || pathname === "/more"
              ? "text-stamp-red"
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
