const API_BASE = process.env.INTEGRATION_API_URL ?? "http://localhost:3000";
const SESSION_COOKIE = "_backend_session";

let sessionCookie: string | undefined;

export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

function setCookieLines(res: Response): string[] {
  const getSetCookie = res.headers.getSetCookie?.bind(res.headers);
  if (getSetCookie) {
    const lines = getSetCookie();
    if (lines.length > 0) {
      return lines;
    }
  }

  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

function storeSessionFromResponse(res: Response): void {
  for (const line of setCookieLines(res)) {
    const match = line.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
    if (match) {
      sessionCookie = `${SESSION_COOKIE}=${match[1]}`;
      return;
    }
  }
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (sessionCookie) {
    headers.set("Cookie", sessionCookie);
  }

  const res = await fetch(apiUrl(path), { ...init, headers });
  storeSessionFromResponse(res);
  return res;
}

export async function login(
  email: string,
  password: string,
): Promise<Response> {
  sessionCookie = undefined;
  return apiFetch("/api/session", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
