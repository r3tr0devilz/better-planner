import { AppShell } from "@/components/app-shell";
import { getNavCounts } from "@/lib/data/nav-counts";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const counts = await getNavCounts();
  return <AppShell counts={counts}>{children}</AppShell>;
}
