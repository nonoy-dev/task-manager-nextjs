export const NETWORK_ERROR_MESSAGE =
  "ネットワークエラーが発生しました。接続を確認してください。";

export function readApiClientError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
