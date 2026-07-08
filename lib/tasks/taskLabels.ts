import type { TaskPriority, TaskStatus } from "@/lib/types/task";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = (
  Object.entries(TASK_STATUS_LABELS) as [TaskStatus, string][]
).map(([value, label]) => ({ value, label }));

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = (
  Object.entries(TASK_PRIORITY_LABELS) as [TaskPriority, string][]
).map(([value, label]) => ({ value, label }));

export function taskStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_LABELS[status];
}

export function taskPriorityLabel(priority: TaskPriority): string {
  return TASK_PRIORITY_LABELS[priority];
}
