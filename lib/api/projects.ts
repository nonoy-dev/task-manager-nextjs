import "server-only";

import { NETWORK_ERROR_MESSAGE, UNAUTHORIZED_MESSAGE } from "@/lib/api/errors";
import { sessionCookieHeader } from "@/lib/auth/sessionCookieHeader";
import {
  parseProjectDtos,
  type ProjectDto,
} from "@/lib/types/project";

const PROJECTS_API_PATH = "/api/projects";

function projectsUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  return `${base}${PROJECTS_API_PATH}`;
}

function fetchProjectsError(status: number): Error {
  if (status === 401) {
    return new Error(UNAUTHORIZED_MESSAGE);
  }
  return new Error(`プロジェクトの取得に失敗しました (${status})`);
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

export async function fetchProjects(): Promise<ProjectDto[]> {
  const res = await withNetworkError(
    fetch(projectsUrl(), {
      cache: "no-store",
      headers: await sessionCookieHeader(),
    }),
  );

  if (!res.ok) {
    throw fetchProjectsError(res.status);
  }

  return parseProjectDtos(await res.json());
}
