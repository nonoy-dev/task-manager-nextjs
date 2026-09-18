import Link from "next/link";
import {
  taskListPageHref,
  type TaskListQuery,
} from "@/lib/tasks/taskListQuery";
import type { TaskListMeta } from "@/lib/types/task";

type TaskListPaginationProps = {
  meta: TaskListMeta;
  query: TaskListQuery;
};

const controlClass = "underline-offset-2 hover:underline";
const disabledControlClass = "opacity-40";

function PaginationControl({
  href,
  enabled,
  children,
}: {
  href: string;
  enabled: boolean;
  children: string;
}) {
  if (!enabled) {
    return (
      <span aria-disabled="true" className={disabledControlClass}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={controlClass}>
      {children}
    </Link>
  );
}

export function TaskListPagination({ meta, query }: TaskListPaginationProps) {
  if (meta.total === 0 || meta.total_pages <= 1) {
    return null;
  }

  const hasPrevious = meta.page > 1;
  const hasNext = meta.page < meta.total_pages;

  return (
    <nav
      className="mt-4 flex items-center justify-center gap-4 text-sm text-foreground/80"
      aria-label="ページネーション"
    >
      <PaginationControl
        href={taskListPageHref(query, meta.page - 1)}
        enabled={hasPrevious}
      >
        前へ
      </PaginationControl>
      <p>
        {meta.page} / {meta.total_pages} ページ
      </p>
      <PaginationControl
        href={taskListPageHref(query, meta.page + 1)}
        enabled={hasNext}
      >
        次へ
      </PaginationControl>
    </nav>
  );
}
