import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskEditForm } from "@/components/tasks/TaskEditForm";
import { fetchTask, isTaskNotFoundError } from "@/lib/api/tasks";
import { taskFromDto } from "@/lib/types/task";

type TaskEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TaskEditPage({ params }: TaskEditPageProps) {
  const { id } = await params;
  const taskId = Number(id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    notFound();
  }

  let taskDto;
  try {
    taskDto = await fetchTask(taskId);
  } catch (error) {
    if (isTaskNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const task = taskFromDto(taskDto);

  return (
    <main className="p-8">
      <Link
        href="/"
        className="text-sm text-foreground/70 hover:text-foreground hover:underline"
      >
        ← 一覧に戻る
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">タスク編集</h1>
      <TaskEditForm task={task} />
    </main>
  );
}
