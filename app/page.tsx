import { RefreshableErrorBanner } from "@/components/shared/ErrorBanner";
import { TaskCreateForm } from "@/components/tasks/TaskCreateForm";
import { TaskList } from "@/components/tasks/TaskList";
import {
  isUnauthorizedError,
  readApiClientError,
} from "@/lib/api/errors";
import { fetchTasks } from "@/lib/api/tasks.server";
import { type Task, tasksFromDto } from "@/lib/types/task";

export default async function Home() {
  let tasks: Task[] = [];
  let listError: string | null = null;
  let unauthorized = false;

  try {
    tasks = tasksFromDto(await fetchTasks());
  } catch (error) {
    unauthorized = isUnauthorizedError(error);
    listError = readApiClientError(error, "タスクの取得に失敗しました");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">タスク一覧</h1>
      {!unauthorized && (
        <div className="mt-4">
          <TaskCreateForm />
        </div>
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
        <TaskList tasks={tasks} />
      )}
    </main>
  );
}
