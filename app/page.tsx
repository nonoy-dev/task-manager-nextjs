import { TaskList } from "@/components/tasks/TaskList";
import { type TaskDto, tasksFromDto } from "@/lib/types/task";

async function fetchTasks(): Promise<TaskDto[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/api/tasks`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`タスクの取得に失敗しました (${res.status})`);
  }

  return res.json();
}

export default async function Home() {
  const tasks = tasksFromDto(await fetchTasks());

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">タスク一覧</h1>
      {tasks.length === 0 ? (
        <p className="mt-4 text-foreground/70">タスクがありません。</p>
      ) : (
        <TaskList tasks={tasks} />
      )}
    </main>
  );
}
