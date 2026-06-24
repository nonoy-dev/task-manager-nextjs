"use client";

import type { ErrorInfo } from "next/error";
import Link from "next/link";
import { useEffect } from "react";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

export default function Error({ error, unstable_retry }: ErrorInfo) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="p-8">
      <ErrorBanner
        title="ページの表示に失敗しました"
        message={error.message}
        onRetry={() => unstable_retry()}
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
