import type { Task } from "@/lib/types/task";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: Task[];
};

export function TaskList({ tasks }: TaskListProps) {
  return (
    <ul className="mt-4 flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
