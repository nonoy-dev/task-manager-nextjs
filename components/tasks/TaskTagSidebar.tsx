import Link from "next/link";
import {
  taskListHrefWithoutTag,
  taskListTagHref,
  type TaskListQuery,
} from "@/lib/tasks/taskListQuery";
import type { TaskTagCount } from "@/lib/types/task";

type TaskTagSidebarProps = {
  tags: readonly TaskTagCount[];
  listQuery: TaskListQuery;
};

export function TaskTagSidebar({ tags, listQuery }: TaskTagSidebarProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="タグ"
      className="rounded-lg border border-foreground/10 p-3"
    >
      <h2 className="text-sm font-medium">タグ</h2>
      <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto lg:max-h-[28rem]">
        {tags.map((tag) => {
          const active = listQuery.tag === tag.name;

          return (
            <li key={tag.name}>
              <Link
                href={
                  active
                    ? taskListHrefWithoutTag(listQuery)
                    : taskListTagHref(listQuery, tag.name)
                }
                aria-current={active ? "true" : undefined}
                aria-label={`${tag.name} ${tag.count}`}
                className={
                  active
                    ? "flex items-center justify-between gap-2 rounded-md bg-foreground px-2 py-1.5 text-sm text-background"
                    : "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
                }
              >
                <span aria-hidden="true">{tag.name}</span>
                <span
                  aria-hidden="true"
                  className={active ? "text-background/80" : "text-foreground/50"}
                >
                  {tag.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
