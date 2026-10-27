import { EmptyState } from "@/components/shared/EmptyState";
import type { Task } from "@/lib/types/task";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
  hasFilters?: boolean;
};

export function TaskList({ tasks, hasFilters = false }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        className="mt-4"
        message={
          hasFilters
            ? "条件に一致するタスクはありません。"
            : "タスクはまだありません。"
        }
      />
    );
  }

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
