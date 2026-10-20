import Link from "next/link";
import { notFound } from "next/navigation";
import { RefreshableErrorBanner } from "@/components/shared/ErrorBanner";
import { TaskEditForm } from "@/components/tasks/TaskEditForm";
import {
  isUnauthorizedError,
  readApiClientError,
} from "@/lib/api/errors";
import { fetchProjects } from "@/lib/api/projects";
import { isTaskNotFoundError } from "@/lib/api/tasks.client";
import { fetchTask } from "@/lib/api/tasks.server";
import { projectsFromDto } from "@/lib/types/project";
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

    const unauthorized = isUnauthorizedError(error);
    const message = readApiClientError(error, "タスクの取得に失敗しました");

    return (
      <main className="p-8">
        <Link
          href="/"
          className="text-sm text-foreground/70 hover:text-foreground hover:underline"
        >
          ← 一覧に戻る
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">タスク編集</h1>
        <div className="mt-4">
          <RefreshableErrorBanner
            title="タスクの取得に失敗しました"
            message={message}
            unauthorized={unauthorized}
          />
        </div>
      </main>
    );
  }

  const task = taskFromDto(taskDto);
  let projects: ReturnType<typeof projectsFromDto> = [];
  try {
    projects = projectsFromDto(await fetchProjects());
  } catch {
    projects = [];
  }

  return (
    <main className="p-8">
      <Link
        href="/"
        className="text-sm text-foreground/70 hover:text-foreground hover:underline"
      >
        ← 一覧に戻る
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">タスク編集</h1>
      <TaskEditForm task={task} projects={projects} />
    </main>
  );
}
