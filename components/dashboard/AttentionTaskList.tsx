import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDueDate } from "@/lib/tasks/dateUtils";
import type { Task } from "@/lib/types/task";

type AttentionTaskListProps = {
  title: string;
  count: number;
  tasks: Task[];
  emptyMessage: string;
};

export function AttentionTaskList({
  title,
  count,
  tasks,
  emptyMessage,
}: AttentionTaskListProps) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">
        {title}
        <span className="ml-2 text-base font-normal text-foreground/60">
          ({count})
        </span>
      </h2>
      {tasks.length === 0 ? (
        <EmptyState className="mt-3" message={emptyMessage} />
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {tasks.map((task) => {
            const dueDate = formatDueDate(task.dueDate);

            return (
              <li key={task.id}>
                <Link
                  href={`/tasks/${task.id}/edit`}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-foreground/10 px-4 py-3 hover:bg-foreground/5"
                >
                  <span className="font-medium">{task.title}</span>
                  {dueDate ? (
                    <span className="text-sm text-foreground/60">
                      期限: {dueDate}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
