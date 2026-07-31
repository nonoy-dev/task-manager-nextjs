import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/sessionCookie";

export async function sessionCookieHeader(): Promise<
  HeadersInit | undefined
> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  if (!session) {
    return undefined;
  }
  return {
    Cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(session.value)}`,
  };
}
