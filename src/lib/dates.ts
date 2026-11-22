const DAY = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

// "2026-11-27" -> a Date in your own time zone
export function localDate(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// whole days from today to `date` (negative = in the past)
export function daysFromToday(date: Date): number {
  return Math.round((startOfDay(date) - startOfDay(new Date())) / DAY);
}

// "nov 27"
export function shortDay(date: Date): string {
  return date
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toLowerCase();
}

// "THIS WEEK", "LAST WEEK" or "EARLIER" (weeks start on Sunday)
export function weekLabel(iso: string): string {
  const today = new Date();
  const startOfThisWeek = startOfDay(today) - today.getDay() * DAY;
  const time = Date.parse(iso);
  if (time >= startOfThisWeek) return "THIS WEEK";
  if (time >= startOfThisWeek - 7 * DAY) return "LAST WEEK";
  return "EARLIER";
}
