import type { Task } from "@/lib/types/task";

type TaskItemProps = {
  task: Task;
};

const statusLabels: Record<Task["status"], string> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
};

const priorityLabels: Record<Task["priority"], string> = {
  low: "低",
  medium: "中",
  high: "高",
};

function formatDueDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("ja-JP");
}

export function TaskItem({ task }: TaskItemProps) {
  const dueDate = formatDueDate(task.dueDate);

  return (
    <li className="rounded-lg border border-foreground/10 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-medium">{task.title}</h2>
        <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs">
          {statusLabels[task.status]}
        </span>
        <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-foreground/70">
          優先度: {priorityLabels[task.priority]}
        </span>
      </div>
      <p className="mt-2 text-sm text-foreground/70">
        {task.description ?? "説明はありません。"}
      </p>
      {task.tagList.length > 0 && (
        <p className="mt-2 text-sm text-foreground/60">
          {task.tagList.join(" · ")}
        </p>
      )}
      {dueDate && (
        <p className="mt-2 text-sm text-foreground/60">期限: {dueDate}</p>
      )}
    </li>
  );
}
