import { AppShell } from "@/components/app-shell";
import { getNavCounts } from "@/lib/data/nav-counts";
import { getDomains } from "@/lib/data/domains";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [counts, domains] = await Promise.all([getNavCounts(), getDomains()]);
  return (
    <AppShell counts={counts} domains={domains}>
      {children}
    </AppShell>
  );
}
