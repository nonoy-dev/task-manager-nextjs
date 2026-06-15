import type { Task } from "@/lib/types/task";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
};

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="mt-4 text-foreground/70">タスクはまだありません。</p>
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
