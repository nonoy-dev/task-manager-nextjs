type TaskDto = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
};

async function fetchTasks(): Promise<TaskDto[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/api/tasks`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`タスクの取得に失敗しました (${res.status})`);
  }

  return res.json();
}

export default async function Home() {
  const tasks = await fetchTasks();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">タスク一覧</h1>
      {tasks.length === 0 ? (
        <p className="mt-4 text-foreground/70">タスクがありません。</p>
      ) : (
        <ul className="mt-4 list-disc space-y-2 pl-6">
          {tasks.map((task) => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
