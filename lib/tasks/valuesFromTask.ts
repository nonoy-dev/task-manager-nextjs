import type { TaskMutationInput } from "@/lib/api/tasks.client";
import type { Task } from "@/lib/types/task";

export function valuesFromTask(task: Task): TaskMutationInput {
  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    tags: task.tagList.join(","),
    projectId: task.projectId != null ? String(task.projectId) : "",
  };
}
