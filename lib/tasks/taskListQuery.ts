import {
  taskPrioritySchema,
  taskStatusSchema,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types/task";

export const TASK_LIST_SORTS = ["created_at", "due_date"] as const;
export const TASK_LIST_DIRECTIONS = ["asc", "desc"] as const;

export type TaskListSort = (typeof TASK_LIST_SORTS)[number];
export type TaskListDirection = (typeof TASK_LIST_DIRECTIONS)[number];

export type TaskListQuery = {
  q?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sort?: TaskListSort;
  direction?: TaskListDirection;
};

export type TaskListSearchParams = {
  q?: string | string[];
  status?: string | string[];
  priority?: string | string[];
  sort?: string | string[];
  direction?: string | string[];
};

const QUERY_KEY_ORDER = [
  "q",
  "status",
  "priority",
  "sort",
  "direction",
] as const;

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function isTaskListSort(value: string): value is TaskListSort {
  return (TASK_LIST_SORTS as readonly string[]).includes(value);
}

function isTaskListDirection(value: string): value is TaskListDirection {
  return (TASK_LIST_DIRECTIONS as readonly string[]).includes(value);
}

export function parseTaskListQuery(
  params: TaskListSearchParams = {},
): TaskListQuery {
  const query: TaskListQuery = {};

  const q = firstParam(params.q).trim();
  if (q) {
    query.q = q;
  }

  const status = taskStatusSchema.safeParse(firstParam(params.status).trim());
  if (status.success) {
    query.status = status.data;
  }

  const priority = taskPrioritySchema.safeParse(
    firstParam(params.priority).trim(),
  );
  if (priority.success) {
    query.priority = priority.data;
  }

  const sort = firstParam(params.sort).trim();
  if (isTaskListSort(sort)) {
    query.sort = sort;
  }

  const direction = firstParam(params.direction).trim().toLowerCase();
  if (isTaskListDirection(direction)) {
    query.direction = direction;
  }

  return query;
}

export function taskListQuerySearchParams(
  query: TaskListQuery,
): URLSearchParams {
  const search = new URLSearchParams();

  for (const key of QUERY_KEY_ORDER) {
    const value = query[key];
    if (value) {
      search.set(key, value);
    }
  }

  return search;
}

export function taskListQueryString(query: TaskListQuery): string {
  return taskListQuerySearchParams(query).toString();
}
