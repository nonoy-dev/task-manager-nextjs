import "server-only";

import { cookies } from "next/headers";
import {
  NETWORK_ERROR_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "@/lib/api/errors";
import type { SessionUser } from "@/lib/api/sessions.client";
import { SESSION_COOKIE_NAME } from "@/lib/auth/sessionCookie";

const SESSION_API_PATH = "/api/session";

function sessionUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  return `${base}${SESSION_API_PATH}`;
}

async function sessionCookieHeader(): Promise<HeadersInit | undefined> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  if (!session) {
    return undefined;
  }
  return {
    Cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(session.value)}`,
  };
}

export async function fetchSessionUser(): Promise<SessionUser> {
  let res: Response;
  try {
    res = await fetch(sessionUrl(), {
      cache: "no-store",
      headers: await sessionCookieHeader(),
    });
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  if (res.status === 401) {
    throw new Error(UNAUTHORIZED_MESSAGE);
  }

  if (!res.ok) {
    throw new Error(`セッションの取得に失敗しました (${res.status})`);
  }

  return (await res.json()) as SessionUser;
}
