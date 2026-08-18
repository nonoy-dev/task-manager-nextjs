import Link from "next/link";
import { inputClass, labelClass } from "@/components/shared/form";
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from "@/lib/tasks/taskLabels";
import {
  TASK_LIST_DIRECTIONS,
  TASK_LIST_SORTS,
  type TaskListDirection,
  type TaskListQuery,
  type TaskListSort,
} from "@/lib/tasks/taskListQuery";

type TaskFilterFormProps = {
  query: TaskListQuery;
};

const SORT_LABELS: Record<TaskListSort, string> = {
  created_at: "作成日",
  due_date: "期限",
};

const DIRECTION_LABELS: Record<TaskListDirection, string> = {
  asc: "昇順",
  desc: "降順",
};

export function TaskFilterForm({ query }: TaskFilterFormProps) {
  return (
    <form method="get" action="/" className="mt-4 flex flex-col gap-3">
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

      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className={labelClass}>並び替え</span>
          <select
            name="sort"
            defaultValue={query.sort ?? "created_at"}
            className={inputClass}
          >
            {TASK_LIST_SORTS.map((value) => (
              <option key={value} value={value}>
                {SORT_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>順序</span>
          <select
            name="direction"
            defaultValue={query.direction ?? "desc"}
            className={inputClass}
          >
            {TASK_LIST_DIRECTIONS.map((value) => (
              <option key={value} value={value}>
                {DIRECTION_LABELS[value]}
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
