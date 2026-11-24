import Link from "next/link";
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
  projects?: readonly { id: number; name: string }[];
};

const SORT_LABELS: Record<TaskListSort, string> = {
  created_at: "作成日",
  due_date: "期限",
};

const DIRECTION_LABELS: Record<TaskListDirection, string> = {
  asc: "昇順",
  desc: "降順",
};

const barFieldClass =
  "rounded-md border border-foreground/20 bg-transparent px-2 py-1.5 text-sm";

export function TaskFilterForm({
  query,
  projects = [],
}: TaskFilterFormProps) {
  return (
    <form
      method="get"
      action="/"
      className="mt-4 flex flex-wrap items-center gap-2"
    >
      <input
        type="search"
        name="q"
        defaultValue={query.q ?? ""}
        placeholder="検索"
        aria-label="検索"
        className={`${barFieldClass} min-w-[10rem] flex-1`}
      />

      <select
        name="status"
        defaultValue={query.status ?? ""}
        aria-label="ステータス"
        className={barFieldClass}
      >
        <option value="">ステータス</option>
        {TASK_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        name="priority"
        defaultValue={query.priority ?? ""}
        aria-label="優先度"
        className={barFieldClass}
      >
        <option value="">優先度</option>
        {TASK_PRIORITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        name="project"
        defaultValue={query.project != null ? String(query.project) : ""}
        aria-label="プロジェクト"
        className={barFieldClass}
      >
        <option value="">プロジェクト</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>

      <select
        name="sort"
        defaultValue={query.sort ?? "created_at"}
        aria-label="並び替え"
        className={barFieldClass}
      >
        {TASK_LIST_SORTS.map((value) => (
          <option key={value} value={value}>
            {SORT_LABELS[value]}
          </option>
        ))}
      </select>

      <select
        name="direction"
        defaultValue={query.direction ?? "desc"}
        aria-label="順序"
        className={barFieldClass}
      >
        {TASK_LIST_DIRECTIONS.map((value) => (
          <option key={value} value={value}>
            {DIRECTION_LABELS[value]}
          </option>
        ))}
      </select>

      {query.tag ? <input type="hidden" name="tag" value={query.tag} /> : null}

      <button
        type="submit"
        className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background"
      >
        絞り込み
      </button>
      <Link
        href="/"
        className="text-sm text-foreground/70 underline-offset-2 hover:underline"
      >
        クリア
      </Link>
    </form>
  );
}
