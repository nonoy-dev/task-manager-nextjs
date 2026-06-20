import type { TaskDto, TaskPriority, TaskStatus } from "@/lib/types/task";

export type CreateTaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string;
};

function createTaskBody(input: CreateTaskInput) {
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

function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
}

export async function fetchTasks(): Promise<TaskDto[]> {
  const res = await fetch(`${apiBaseUrl()}/api/tasks`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`タスクの取得に失敗しました (${res.status})`);
  }

  return res.json();
}

export async function fetchTask(id: number): Promise<TaskDto> {
  const res = await fetch(`${apiBaseUrl()}/api/tasks/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    throw new Error("Task not found");
  }

  if (!res.ok) {
    throw new Error(`タスクの取得に失敗しました (${res.status})`);
  }

  return res.json();
}

export async function createTask(input: CreateTaskInput): Promise<TaskDto> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createTaskBody(input)),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      errors?: string[];
    } | null;
    const message =
      body?.errors?.join(", ") ??
      `タスクの作成に失敗しました (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}
