import "server-only";

import {
  NETWORK_ERROR_MESSAGE,
  SERVER_ERROR_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "@/lib/api/errors";
import { TASK_NOT_FOUND_MESSAGE } from "@/lib/api/tasks.client";
import { sessionCookieHeader } from "@/lib/auth/sessionCookieHeader";
import {
  taskListQueryString,
  type TaskListQuery,
} from "@/lib/tasks/taskListQuery";
import {
  parseTaskDto,
  parseTaskListResponse,
  type TaskDto,
  type TaskListResponse,
} from "@/lib/types/task";

const TASKS_API_PATH = "/api/tasks";

function tasksUrl(path = "", query: TaskListQuery = {}): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const qs = taskListQueryString(query);
  const url = `${base}${TASKS_API_PATH}${path}`;
  return qs ? `${url}?${qs}` : url;
}

function fetchTasksError(status: number): Error {
  if (status === 401) {
    return new Error(UNAUTHORIZED_MESSAGE);
  }
  return new Error(SERVER_ERROR_MESSAGE);
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
  return withNetworkError(fetch(url, init));
}

export async function fetchTasks(
  query: TaskListQuery = {},
): Promise<TaskListResponse> {
  const res = await apiFetch(tasksUrl("", query), {
    cache: "no-store",
    headers: await sessionCookieHeader(),
  });

  if (!res.ok) {
    throw fetchTasksError(res.status);
  }

  return parseTaskListResponse(await res.json());
}

export async function fetchTask(id: number): Promise<TaskDto> {
  const res = await apiFetch(tasksUrl(`/${id}`), {
    cache: "no-store",
    headers: await sessionCookieHeader(),
  });

  if (res.status === 404) {
    throw new Error(TASK_NOT_FOUND_MESSAGE);
  }

  if (!res.ok) {
    throw fetchTasksError(res.status);
  }

  return parseTaskDto(await res.json());
}
