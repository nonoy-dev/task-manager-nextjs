export const NETWORK_ERROR_MESSAGE =
  "ネットワークエラーが発生しました。接続を確認してください。";

export const UNAUTHORIZED_MESSAGE =
  "ログインの有効期限が切れているか、認証に失敗しました。再度ログインしてください。";

/** User-facing detail when the server responds with an unexpected status. */
export const SERVER_ERROR_MESSAGE =
  "しばらくしてから再試行してください。";

export function readApiClientError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof Error && error.message === UNAUTHORIZED_MESSAGE;
}
