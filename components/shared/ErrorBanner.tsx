"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type ErrorBannerProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  loginHref?: string;
};

export function ErrorBanner({
  title,
  message,
  onRetry,
  retryLabel = "再試行",
  loginHref,
}: ErrorBannerProps) {
  return (
    <div
      className="rounded-lg border border-red-600/30 bg-red-600/10 p-4"
      role="alert"
    >
      {title != null && (
        <p className="text-sm font-medium text-red-600">{title}</p>
      )}
      <p className="mt-1 text-sm text-red-600">{message}</p>
      {(onRetry != null || loginHref != null) && (
        <div className="mt-3 flex flex-wrap gap-3">
          {onRetry != null && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md border border-red-600/30 px-3 py-1.5 text-sm text-red-600 hover:bg-red-600/10"
            >
              {retryLabel}
            </button>
          )}
          {loginHref != null && (
            <Link
              href={loginHref}
              className="rounded-md border border-red-600/30 px-3 py-1.5 text-sm text-red-600 hover:bg-red-600/10"
            >
              ログインへ
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

type RefreshableErrorBannerProps = {
  title?: string;
  message: string;
  unauthorized?: boolean;
};

export function RefreshableErrorBanner({
  title,
  message,
  unauthorized = false,
}: RefreshableErrorBannerProps) {
  const router = useRouter();

  return (
    <ErrorBanner
      title={unauthorized ? "ログインが必要です" : title}
      message={message}
      onRetry={unauthorized ? undefined : () => router.refresh()}
      loginHref={unauthorized ? "/login" : undefined}
    />
  );
}
