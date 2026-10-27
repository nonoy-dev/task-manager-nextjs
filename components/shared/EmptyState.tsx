type EmptyStateProps = {
  message: string;
  className?: string;
};

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div className={className}>
      <p className="text-foreground/70">{message}</p>
    </div>
  );
}
