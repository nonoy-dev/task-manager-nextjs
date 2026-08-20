const jstFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
});

export function todayDateString(now: Date = new Date()): string {
  return jstFormatter.format(now);
}

export function dateStringFromIso(iso: string): string {
  return jstFormatter.format(new Date(iso));
}

function calendarDaysBetween(from: string, to: string): number {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.round((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
}

export const DUE_DATE_URGENCIES = [
  "none",
  "overdue",
  "today",
  "this_week",
  "later",
] as const;

export type DueDateUrgency = (typeof DUE_DATE_URGENCIES)[number];

export function classifyDueDateUrgency(
  dueDate: string | null | undefined,
  now: Date = new Date(),
): DueDateUrgency {
  if (!dueDate) {
    return "none";
  }

  const today = todayDateString(now);
  const due = dateStringFromIso(dueDate);
  const daysUntilDue = calendarDaysBetween(today, due);

  if (daysUntilDue < 0) {
    return "overdue";
  }
  if (daysUntilDue === 0) {
    return "today";
  }
  if (daysUntilDue <= 6) {
    return "this_week";
  }
  return "later";
}
