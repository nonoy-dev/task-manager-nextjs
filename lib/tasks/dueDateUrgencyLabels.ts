import type { DueDateUrgency } from "@/lib/tasks/dateUtils";

export const DUE_DATE_URGENCY_LABELS: Record<
  Extract<DueDateUrgency, "overdue" | "today" | "this_week">,
  string
> = {
  overdue: "期限切れ",
  today: "今日",
  this_week: "今週",
};

export function dueDateUrgencyLabel(urgency: DueDateUrgency): string | null {
  if (urgency === "none" || urgency === "later") {
    return null;
  }
  return DUE_DATE_URGENCY_LABELS[urgency];
}
