"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { CaptureBar } from "./capture-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="glass sticky top-0 z-40 hidden h-screen w-56 shrink-0 flex-col justify-between p-5 md:flex">
        <div>
          <Link href="/today" className="font-[family-name:var(--font-display)] text-xl italic text-mist">
            Better Planner
          </Link>
          <nav className="mt-8 flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-white/10 text-mist" : "text-mist-dim hover:text-mist"
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

      <header className="glass sticky top-0 z-40 flex items-center justify-between px-4 py-3 md:hidden">
        <Link href="/today" className="font-[family-name:var(--font-display)] text-lg italic text-mist">
          Better Planner
        </Link>
        <CaptureBar />
      </header>

      <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">{children}</main>

      <nav className="glass fixed inset-x-0 bottom-0 z-40 flex items-center justify-around py-2 md:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] ${
                active ? "text-dawn" : "text-mist-dim"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
