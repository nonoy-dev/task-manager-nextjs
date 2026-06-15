import type { TaskDto } from "@/lib/types/task";

export async function fetchTasks(): Promise<TaskDto[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const res = await fetch(`${baseUrl}/api/tasks`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`タスクの取得に失敗しました (${res.status})`);
  }

  return res.json();
}
