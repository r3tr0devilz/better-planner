import { getTasks } from "@/lib/data/tasks";
import { getDomains } from "@/lib/data/domains";
import { CalendarBoard } from "./calendar-board";
import { dayKey, parseDateParam, parseMonthParam } from "./lib";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; view?: string; date?: string }>;
}) {
  const { month: monthParam, view: viewParam, date: dateParam } = await searchParams;
  const view: "month" | "day" = viewParam === "day" ? "day" : "month";

  const today = new Date();
  const selectedDate = parseDateParam(dateParam) ?? today;
  const [year, monthIndex] = parseMonthParam(monthParam) ?? [selectedDate.getFullYear(), selectedDate.getMonth()];

  const [tasks, domains] = await Promise.all([getTasks(), getDomains()]);

  return (
    <CalendarBoard
      view={view}
      year={year}
      monthIndex={monthIndex}
      selectedDateKey={dayKey(selectedDate)}
      todayKey={dayKey(today)}
      tasks={tasks}
      domains={domains}
    />
  );
}
