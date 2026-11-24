import { EmptyState } from "@/components/shared/EmptyState";
import type { TaskListQuery } from "@/lib/tasks/taskListQuery";
import type { Task } from "@/lib/types/task";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
  hasFilters?: boolean;
  listQuery?: TaskListQuery;
};

export function TaskList({
  tasks,
  hasFilters = false,
  listQuery = {},
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        message={
          hasFilters
            ? "条件に一致するタスクはありません。"
            : "タスクはまだありません。"
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} listQuery={listQuery} />
      ))}
    </ul>
  );
}
