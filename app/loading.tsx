export default function Loading() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">タスク一覧</h1>
      <p className="mt-4 text-foreground/70">読み込み中...</p>
      <ul className="mt-4 flex flex-col gap-3" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="animate-pulse rounded-lg border border-foreground/10 p-4"
          >
            <div className="h-5 w-1/3 rounded bg-foreground/10" />
            <div className="mt-3 h-4 w-full rounded bg-foreground/5" />
            <div className="mt-2 h-4 w-2/3 rounded bg-foreground/5" />
          </li>
        ))}
      </ul>
    </main>
  );
}
