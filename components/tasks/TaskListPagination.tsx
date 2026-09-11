import type { TaskListQuery } from "@/lib/tasks/taskListQuery";
import type { TaskListMeta } from "@/lib/types/task";

type TaskListPaginationProps = {
  meta: TaskListMeta;
  query: TaskListQuery;
};

export function TaskListPagination({ meta }: TaskListPaginationProps) {
  if (meta.total === 0 || meta.total_pages <= 1) {
    return null;
  }

  return (
    <nav
      className="mt-4 flex items-center justify-center gap-4 text-sm text-foreground/80"
      aria-label="ページネーション"
    >
      <p>
        {meta.page} / {meta.total_pages} ページ
      </p>
    </nav>
  );
}
