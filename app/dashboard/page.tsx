import { AttentionTaskList } from "@/components/dashboard/AttentionTaskList";
import { RefreshableErrorBanner } from "@/components/shared/ErrorBanner";
import { fetchDashboard } from "@/lib/api/dashboard";
import {
  isUnauthorizedError,
  readApiClientError,
} from "@/lib/api/errors";
import { tasksFromDto, type Task } from "@/lib/types/task";

export default async function DashboardPage() {
  let overdue: Task[] = [];
  let dueToday: Task[] = [];
  let overdueCount = 0;
  let dueTodayCount = 0;
  let listError: string | null = null;
  let unauthorized = false;

  try {
    const response = await fetchDashboard();
    overdue = tasksFromDto(response.overdue);
    dueToday = tasksFromDto(response.due_today);
    overdueCount = response.meta.overdue;
    dueTodayCount = response.meta.due_today;
  } catch (error) {
    unauthorized = isUnauthorizedError(error);
    listError = readApiClientError(
      error,
      "ダッシュボードの取得に失敗しました",
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">要対応</h1>
      {listError ? (
        <div className="mt-4">
          <RefreshableErrorBanner
            title="ダッシュボードの取得に失敗しました"
            message={listError}
            unauthorized={unauthorized}
          />
        </div>
      ) : (
        <>
          <AttentionTaskList
            title="期限切れ"
            count={overdueCount}
            tasks={overdue}
            emptyMessage="期限切れのタスクはありません。"
          />
          <AttentionTaskList
            title="今日が期限"
            count={dueTodayCount}
            tasks={dueToday}
            emptyMessage="今日が期限のタスクはありません。"
          />
        </>
      )}
    </main>
  );
}
