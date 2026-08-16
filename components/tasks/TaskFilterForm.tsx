import Link from "next/link";
import { inputClass, labelClass } from "@/components/shared/form";
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from "@/lib/tasks/taskLabels";
import type { TaskListQuery } from "@/lib/tasks/taskListQuery";

type TaskFilterFormProps = {
  query: TaskListQuery;
};

export function TaskFilterForm({ query }: TaskFilterFormProps) {
  return (
    <form method="get" action="/" className="mt-4 flex flex-col gap-3">
      {query.sort ? (
        <input type="hidden" name="sort" value={query.sort} />
      ) : null}
      {query.direction ? (
        <input type="hidden" name="direction" value={query.direction} />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <label>
          <span className={labelClass}>検索</span>
          <input
            type="search"
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="タイトル・説明"
            className={inputClass}
          />
        </label>

        <label>
          <span className={labelClass}>ステータス</span>
          <select
            name="status"
            defaultValue={query.status ?? ""}
            className={inputClass}
          >
            <option value="">すべて</option>
            {TASK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>優先度</span>
          <select
            name="priority"
            defaultValue={query.priority ?? ""}
            className={inputClass}
          >
            <option value="">すべて</option>
            {TASK_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="w-fit rounded-md bg-foreground px-4 py-2 text-sm text-background"
        >
          絞り込み
        </button>
        <Link
          href="/"
          className="text-sm text-foreground/70 underline-offset-2 hover:underline"
        >
          クリア
        </Link>
      </div>
    </form>
  );
}
