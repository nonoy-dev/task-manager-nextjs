import { RefreshableErrorBanner } from "@/components/shared/ErrorBanner";
import { TaskCreateForm } from "@/components/tasks/TaskCreateForm";
import { TaskFilterForm } from "@/components/tasks/TaskFilterForm";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskListPagination } from "@/components/tasks/TaskListPagination";
import {
  isUnauthorizedError,
  readApiClientError,
} from "@/lib/api/errors";
import { fetchTasks } from "@/lib/api/tasks.server";
import {
  hasTaskListFilters,
  parseTaskListQuery,
  type TaskListSearchParams,
} from "@/lib/tasks/taskListQuery";
import {
  type Task,
  type TaskListMeta,
  tasksFromDto,
} from "@/lib/types/task";

type HomeProps = {
  searchParams: Promise<TaskListSearchParams>;
};

export default async function Home({ searchParams }: HomeProps) {
  const query = parseTaskListQuery(await searchParams);
  let tasks: Task[] = [];
  let meta: TaskListMeta | null = null;
  let listError: string | null = null;
  let unauthorized = false;

  try {
    const response = await fetchTasks(query);
    tasks = tasksFromDto(response.tasks);
    meta = response.meta;
  } catch (error) {
    unauthorized = isUnauthorizedError(error);
    listError = readApiClientError(error, "タスクの取得に失敗しました");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">タスク一覧</h1>
      {!unauthorized && (
        <>
          <TaskFilterForm query={query} />
          <div className="mt-4">
            <TaskCreateForm />
          </div>
        </>
      )}
      {listError ? (
        <div className="mt-4">
          <RefreshableErrorBanner
            title="一覧の取得に失敗しました"
            message={listError}
            unauthorized={unauthorized}
          />
        </div>
      ) : (
        <>
          <TaskList tasks={tasks} hasFilters={hasTaskListFilters(query)} />
          {meta ? <TaskListPagination meta={meta} query={query} /> : null}
        </>
      )}
    </main>
  );
}
