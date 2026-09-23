const jstFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
});

export function todayDateString(): string {
  return jstFormatter.format(new Date());
}

export function formatDueDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return `${year}/${month}/${day}`;
}

function calendarDaysBetween(from: string, to: string): number {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return (toUtc - fromUtc) / (1000 * 60 * 60 * 24);
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
  dueDate: string | null,
): DueDateUrgency {
  if (dueDate === null) {
    return "none";
  }

  const today = todayDateString();
  const daysUntilDue = calendarDaysBetween(today, dueDate);

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
