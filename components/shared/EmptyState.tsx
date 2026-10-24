type EmptyStateProps = {
  title?: string;
  message: string;
  className?: string;
};

export function EmptyState({ title, message, className }: EmptyStateProps) {
  return (
    <div className={className}>
      {title != null ? (
        <p className="text-sm font-medium text-foreground/80">{title}</p>
      ) : null}
      <p
        className={
          title != null ? "mt-1 text-foreground/70" : "text-foreground/70"
        }
      >
        {message}
      </p>
    </div>
  );
}
