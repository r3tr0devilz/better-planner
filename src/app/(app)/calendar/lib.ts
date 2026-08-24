export const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
export const WEEKDAY_LONG = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function buildWeeks(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = firstDay.getDay(); // Sunday-first

  const cells: (Date | null)[] = Array(leading).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function monthHref(view: "month" | "day", year: number, month: number) {
  return `/calendar?view=${view}&month=${year}-${String(month + 1).padStart(2, "0")}`;
}

export function dayHref(date: Date) {
  return `/calendar?view=day&date=${dayKey(date)}`;
}

export function formatTime(dueAt: string) {
  return new Date(dueAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatHour(h: number) {
  return new Date(2000, 0, 1, h).toLocaleTimeString("en-US", { hour: "numeric" });
}

export function parseMonthParam(monthParam?: string): [number, number] | null {
  if (!monthParam) return null;
  const [y, m] = monthParam.split("-").map(Number);
  return [y, m - 1];
}

export function parseDateParam(dateParam?: string): Date | null {
  if (!dateParam) return null;
  return parseDayKey(dateParam);
}
