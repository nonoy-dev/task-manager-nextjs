import { NETWORK_ERROR_MESSAGE } from "@/lib/api/errors";

const SESSION_API_PATH = "/api/session";

export type SessionUser = {
  id: number;
  email: string;
};

type SessionErrorBody = {
  error?: string;
};

async function sessionFetch(init: RequestInit): Promise<Response> {
  try {
    return await fetch(SESSION_API_PATH, {
      ...init,
      credentials: "include",
    });
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }
}

async function loginErrorMessage(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as SessionErrorBody | null;

  if (body?.error === "Invalid email or password") {
    return "メールアドレスまたはパスワードが正しくありません";
  }

  return body?.error ?? `ログインに失敗しました (${res.status})`;
}

export async function login(
  email: string,
  password: string,
): Promise<SessionUser> {
  const res = await sessionFetch({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(await loginErrorMessage(res));
  }

  return (await res.json()) as SessionUser;
}

export async function logout(): Promise<void> {
  const res = await sessionFetch({
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`ログアウトに失敗しました (${res.status})`);
  }
}
