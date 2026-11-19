"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="p-8">
      <ErrorBanner
        title="ページの表示に失敗しました"
        message="しばらくしてから再試行してください。"
        onRetry={() => retry()}
      />
      <Link
        href="/"
        className="mt-4 inline-block text-sm text-foreground/70 hover:text-foreground hover:underline"
      >
        ← 一覧に戻る
      </Link>
    </main>
  );
}
