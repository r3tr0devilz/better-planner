import { AppShell } from "@/components/app-shell";
import { getNavCounts } from "@/lib/data/nav-counts";
import { getDomains } from "@/lib/data/domains";
import { getTasks } from "@/lib/data/tasks";
import { getBurnedThisWeek } from "@/lib/data/burn";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [counts, domains, tasks, burnedThisWeek] = await Promise.all([
    getNavCounts(),
    getDomains(),
    getTasks(),
    getBurnedThisWeek(),
  ]);
  return (
    <AppShell counts={counts} domains={domains} tasks={tasks} burnedThisWeek={burnedThisWeek}>
      {children}
    </AppShell>
  );
}
