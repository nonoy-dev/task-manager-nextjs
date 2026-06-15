import { TaskList } from "@/components/tasks/TaskList";
import { fetchTasks } from "@/lib/api/tasks";
import { tasksFromDto } from "@/lib/types/task";

export default async function Home() {
  const tasks = tasksFromDto(await fetchTasks());

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">タスク一覧</h1>
      <TaskList tasks={tasks} />
    </main>
  );
}
