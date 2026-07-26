import { NETWORK_ERROR_MESSAGE, UNAUTHORIZED_MESSAGE } from "@/lib/api/errors";
import {
  parseTaskDto,
  type TaskDto,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types/task";

export type TaskMutationInput = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string;
};

export const TASK_NOT_FOUND_MESSAGE = "Task not found";

const TASKS_API_PATH = "/api/tasks";

export function isTaskNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.message === TASK_NOT_FOUND_MESSAGE;
}

function tasksUrl(path = ""): string {
  return `${TASKS_API_PATH}${path}`;
}

export function taskMutationBody(input: TaskMutationInput) {
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
  if (res.status === 401) {
    return UNAUTHORIZED_MESSAGE;
  }

  const body = (await res.json().catch(() => null)) as {
    errors?: string[];
  } | null;
  return body?.errors?.join(", ") ?? `${fallback} (${res.status})`;
}

async function withNetworkError(
  promise: Promise<Response>,
): Promise<Response> {
  try {
    return await promise;
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }
}

async function apiFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  return withNetworkError(
    fetch(url, {
      ...init,
      credentials: "include",
    }),
  );
}

async function submitTaskMutation(
  url: string,
  method: "POST" | "PATCH",
  input: TaskMutationInput,
  fallback: string,
): Promise<TaskDto> {
  const res = await apiFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskMutationBody(input)),
  });

  if (!res.ok) {
    throw new Error(await mutationErrorMessage(res, fallback));
  }

  return parseTaskDto(await res.json());
}

export async function createTask(input: TaskMutationInput): Promise<TaskDto> {
  return submitTaskMutation(
    tasksUrl(),
    "POST",
    input,
    "タスクの作成に失敗しました",
  );
}

export async function updateTask(
  id: number,
  input: TaskMutationInput,
): Promise<TaskDto> {
  return submitTaskMutation(
    tasksUrl(`/${id}`),
    "PATCH",
    input,
    "タスクの更新に失敗しました",
  );
}

export async function deleteTask(id: number): Promise<void> {
  const res = await apiFetch(tasksUrl(`/${id}`), {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      await mutationErrorMessage(res, "タスクの削除に失敗しました"),
    );
  }
}
