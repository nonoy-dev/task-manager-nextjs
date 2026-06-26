import type { TaskDto, TaskPriority, TaskStatus } from "@/lib/types/task";

export type TaskMutationInput = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string;
};

export type CreateTaskInput = TaskMutationInput;
export type UpdateTaskInput = TaskMutationInput;

export const TASK_NOT_FOUND_MESSAGE = "Task not found";

const TASKS_API_PATH = "/api/tasks";

function serverTasksUrl(path = ""): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  return `${base}${TASKS_API_PATH}${path}`;
}

function clientTasksUrl(path = ""): string {
  return `${TASKS_API_PATH}${path}`;
}

function taskMutationBody(input: TaskMutationInput) {
  return {
    task: {
      title: input.title.trim(),
      description: input.description.trim() || null,
      status: input.status,
      priority: input.priority,
      due_date: input.dueDate.trim() || null,
      tags: input.tags.trim() || null,
    },
  };
}

async function mutationErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  const body = (await res.json().catch(() => null)) as {
    errors?: string[];
  } | null;
  return body?.errors?.join(", ") ?? `${fallback} (${res.status})`;
}

function fetchTasksError(status: number): Error {
  return new Error(`タスクの取得に失敗しました (${status})`);
}

async function submitTaskMutation(
  url: string,
  method: "POST" | "PATCH",
  input: TaskMutationInput,
  fallback: string,
): Promise<TaskDto> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskMutationBody(input)),
  });

  if (!res.ok) {
    throw new Error(await mutationErrorMessage(res, fallback));
  }

  return res.json();
}

export async function fetchTasks(): Promise<TaskDto[]> {
  const res = await fetch(serverTasksUrl(), { cache: "no-store" });

  if (!res.ok) {
    throw fetchTasksError(res.status);
  }

  return res.json();
}

export async function fetchTask(id: number): Promise<TaskDto> {
  const res = await fetch(serverTasksUrl(`/${id}`), { cache: "no-store" });

  if (res.status === 404) {
    throw new Error(TASK_NOT_FOUND_MESSAGE);
  }

  if (!res.ok) {
    throw fetchTasksError(res.status);
  }

  return res.json();
}

export async function createTask(input: CreateTaskInput): Promise<TaskDto> {
  return submitTaskMutation(
    clientTasksUrl(),
    "POST",
    input,
    "タスクの作成に失敗しました",
  );
}

export async function updateTask(
  id: number,
  input: UpdateTaskInput,
): Promise<TaskDto> {
  return submitTaskMutation(
    clientTasksUrl(`/${id}`),
    "PATCH",
    input,
    "タスクの更新に失敗しました",
  );
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(clientTasksUrl(`/${id}`), {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`タスクの削除に失敗しました (${res.status})`);
  }
}
