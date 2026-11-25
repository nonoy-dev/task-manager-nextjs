import { RefreshableErrorBanner } from "@/components/shared/ErrorBanner";
import { TaskCreateModal } from "@/components/tasks/TaskCreateModal";
import { TaskFilterForm } from "@/components/tasks/TaskFilterForm";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskListPagination } from "@/components/tasks/TaskListPagination";
import { TaskTagSidebar } from "@/components/tasks/TaskTagSidebar";
import {
  isUnauthorizedError,
  readApiClientError,
} from "@/lib/api/errors";
import { fetchProjects } from "@/lib/api/projects";
import { fetchTasks } from "@/lib/api/tasks.server";
import {
  hasTaskListFilters,
  parseTaskListQuery,
  type TaskListSearchParams,
} from "@/lib/tasks/taskListQuery";
import { projectsFromDto } from "@/lib/types/project";
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
  let projects: ReturnType<typeof projectsFromDto> = [];

  try {
    const response = await fetchTasks(query);
    tasks = tasksFromDto(response.tasks);
    meta = response.meta;
  } catch (error) {
    unauthorized = isUnauthorizedError(error);
    listError = readApiClientError(error, "タスクの取得に失敗しました");
  }

  if (!unauthorized) {
    try {
      projects = projectsFromDto(await fetchProjects());
    } catch {
      projects = [];
    }
  }

  return (
    <main className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">タスク一覧</h1>
        {!unauthorized ? (
          <TaskCreateModal
            projects={projects}
            existingTags={meta?.tag_counts.map((tag) => tag.name) ?? []}
          />
        ) : null}
      </div>
      {!unauthorized ? (
        <TaskFilterForm query={query} projects={projects} />
      ) : null}
      {listError ? (
        <div className="mt-4">
          <RefreshableErrorBanner
            title="タスクの取得に失敗しました"
            message={listError}
            unauthorized={unauthorized}
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-row gap-4">
          {meta && meta.tag_counts.length > 0 ? (
            <div className="w-36 shrink-0 sm:w-40">
              <TaskTagSidebar tags={meta.tag_counts} listQuery={query} />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <TaskList
              tasks={tasks}
              hasFilters={hasTaskListFilters(query)}
              listQuery={query}
            />
            {meta ? <TaskListPagination meta={meta} query={query} /> : null}
          </div>
        </div>
      )}
    </main>
  );
}
