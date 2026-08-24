import Link from "next/link";
import { SECONDARY_NAV_ITEMS } from "@/components/nav-items";

export default function MorePage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase tracking-tight text-ink">More</h1>
      <div className="mt-6 flex flex-col gap-2">
        {SECONDARY_NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="hoverable card flex items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-stone">
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
