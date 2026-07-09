export default function Loading() {
  return (
    <main className="p-8">
      <div
        className="h-4 w-24 animate-pulse rounded bg-foreground/10"
        aria-hidden="true"
      />
      <h1 className="mt-4 text-2xl font-semibold">タスク編集</h1>
      <p className="mt-4 text-foreground/70">読み込み中...</p>
      <div
        className="mt-6 flex max-w-lg flex-col gap-4"
        aria-hidden="true"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 w-20 rounded bg-foreground/10" />
            <div className="mt-2 h-10 w-full rounded border border-foreground/10 bg-foreground/5" />
          </div>
        ))}
        <div className="mt-2 flex gap-3">
          <div className="h-9 w-16 animate-pulse rounded-md bg-foreground/10" />
          <div className="h-9 w-24 animate-pulse rounded-md bg-foreground/5" />
        </div>
      </div>
    </main>
  );
}
