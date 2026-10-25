type PageLoadingProps = {
  title: string;
  message?: string;
  variant?: "list" | "form";
  showBackPlaceholder?: boolean;
  itemCount?: number;
};

function ListSkeleton({ itemCount }: { itemCount: number }) {
  return (
    <ul className="mt-4 flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: itemCount }).map((_, i) => (
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
  );
}

function FormSkeleton({ itemCount }: { itemCount: number }) {
  return (
    <div className="mt-6 flex max-w-lg flex-col gap-4" aria-hidden="true">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 w-20 rounded bg-foreground/10" />
          <div className="mt-2 h-10 w-full rounded border border-foreground/10 bg-foreground/5" />
        </div>
      ))}
      <div className="mt-2 flex gap-3 animate-pulse">
        <div className="h-9 w-16 rounded-md bg-foreground/10" />
        <div className="h-9 w-24 rounded-md bg-foreground/5" />
      </div>
    </div>
  );
}

export function PageLoading({
  title,
  message = "読み込み中...",
  variant = "list",
  showBackPlaceholder = false,
  itemCount,
}: PageLoadingProps) {
  const count = itemCount ?? (variant === "form" ? 5 : 3);

  return (
    <main className="p-8">
      {showBackPlaceholder ? (
        <div
          className="h-4 w-24 animate-pulse rounded bg-foreground/10"
          aria-hidden="true"
        />
      ) : null}
      <h1
        className={
          showBackPlaceholder
            ? "mt-4 text-2xl font-semibold"
            : "text-2xl font-semibold"
        }
      >
        {title}
      </h1>
      <p className="mt-4 text-foreground/70">{message}</p>
      {variant === "form" ? (
        <FormSkeleton itemCount={count} />
      ) : (
        <ListSkeleton itemCount={count} />
      )}
    </main>
  );
}
