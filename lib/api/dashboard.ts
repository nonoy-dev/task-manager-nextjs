import "server-only";

import {
  NETWORK_ERROR_MESSAGE,
  SERVER_ERROR_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "@/lib/api/errors";
import { sessionCookieHeader } from "@/lib/auth/sessionCookieHeader";
import {
  parseDashboardResponse,
  type DashboardResponse,
} from "@/lib/types/task";

const DASHBOARD_API_PATH = "/api/dashboard";

function dashboardUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  return `${base}${DASHBOARD_API_PATH}`;
}

function fetchDashboardError(status: number): Error {
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

export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await withNetworkError(
    fetch(dashboardUrl(), {
      cache: "no-store",
      headers: await sessionCookieHeader(),
    }),
  );

  if (!res.ok) {
    throw fetchDashboardError(res.status);
  }

  return parseDashboardResponse(await res.json());
}
