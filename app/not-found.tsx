import Link from "next/link";

export default function NotFound() {
  return (
    <main className="p-8">
      <p className="text-sm font-medium text-foreground/50">404</p>
      <h1 className="mt-2 text-2xl font-semibold">ページが見つかりません</h1>
      <p className="mt-4 text-foreground/70">
        お探しのタスクは存在しないか、URL が正しくない可能性があります。
      </p>
      <Link
        href="/"
        className="mt-4 inline-block text-sm text-foreground/70 hover:text-foreground hover:underline"
      >
        ← 一覧に戻る
      </Link>
    </main>
  );
}
