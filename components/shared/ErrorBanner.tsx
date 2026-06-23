"use client";

import { useRouter } from "next/navigation";

type ErrorBannerProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  onDismiss?: () => void;
};

export function ErrorBanner({
  title,
  message,
  onRetry,
  retryLabel = "再試行",
  onDismiss,
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
      {(onRetry != null || onDismiss != null) && (
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
          {onDismiss != null && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-sm text-red-600 hover:underline"
            >
              閉じる
            </button>
          )}
        </div>
      )}
    </div>
  );
}

type RefreshableErrorBannerProps = {
  title?: string;
  message: string;
};

export function RefreshableErrorBanner({
  title,
  message,
}: RefreshableErrorBannerProps) {
  const router = useRouter();

  return (
    <ErrorBanner
      title={title}
      message={message}
      onRetry={() => router.refresh()}
    />
  );
}
