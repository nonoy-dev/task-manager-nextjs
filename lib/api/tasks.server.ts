import "server-only";

import { NETWORK_ERROR_MESSAGE, UNAUTHORIZED_MESSAGE } from "@/lib/api/errors";
import { TASK_NOT_FOUND_MESSAGE } from "@/lib/api/tasks.client";
import { SESSION_COOKIE_NAME } from "@/lib/auth/sessionCookie";
import {
  parseTaskDto,
  parseTaskDtos,
  type TaskDto,
} from "@/lib/types/task";

const TASKS_API_PATH = "/api/tasks";

function serverTasksUrl(path = ""): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  return `${base}${TASKS_API_PATH}${path}`;
}

function fetchTasksError(status: number): Error {
  if (status === 401) {
    return new Error(UNAUTHORIZED_MESSAGE);
  }
  return new Error(`タスクの取得に失敗しました (${status})`);
}

async function sessionCookieHeader(): Promise<HeadersInit | undefined> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  if (!session) {
    return undefined;
  }
  return { Cookie: `${SESSION_COOKIE_NAME}=${session.value}` };
}

async function withNetworkError(
  run: () => Promise<Response>,
): Promise<Response> {
  try {
    return await run();
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }
}

async function serverApiFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  return withNetworkError(() => fetch(url, init));
}

export async function fetchTasks(): Promise<TaskDto[]> {
  const res = await serverApiFetch(serverTasksUrl(), {
    cache: "no-store",
    headers: await sessionCookieHeader(),
  });

  if (!res.ok) {
    throw fetchTasksError(res.status);
  }

  return parseTaskDtos(await res.json());
}

export async function fetchTask(id: number): Promise<TaskDto> {
  const res = await serverApiFetch(serverTasksUrl(`/${id}`), {
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
