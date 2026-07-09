"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteTask, readApiClientError, updateTask } from "@/lib/api/tasks";
import {
  taskPriorityLabel,
  taskStatusLabel,
} from "@/lib/tasks/taskLabels";
import { valuesFromTask } from "@/lib/tasks/valuesFromTask";
import type { Task, TaskStatus } from "@/lib/types/task";

type TaskItemProps = {
  task: Task;
};

function formatDueDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("ja-JP");
}

function nextStatus(current: TaskStatus): TaskStatus {
  if (current === "todo") return "in_progress";
  if (current === "in_progress") return "done";
  return "todo";
}

export function TaskItem({ task }: TaskItemProps) {
  const router = useRouter();
  const dueDate = formatDueDate(task.dueDate);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const next = nextStatus(task.status);

  async function handleStatusToggle() {
    setStatusError(null);
    setIsUpdatingStatus(true);

    try {
      await updateTask(task.id, {
        ...valuesFromTask(task),
        status: next,
      });
      router.refresh();
    } catch (error) {
      setStatusError(
        readApiClientError(error, "ステータスの更新に失敗しました"),
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`「${task.title}」を削除しますか？`)) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteTask(task.id);
      router.refresh();
    } catch (error) {
      setDeleteError(readApiClientError(error, "タスクの削除に失敗しました"));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <li className="rounded-lg border border-foreground/10 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-medium">{task.title}</h2>
        <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs">
          {taskStatusLabel(task.status)}
        </span>
        <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-foreground/70">
          優先度: {taskPriorityLabel(task.priority)}
        </span>
      </div>
      <p className="mt-2 text-sm text-foreground/70">
        {task.description ?? "説明はありません。"}
      </p>
      {task.tagList.length > 0 && (
        <p className="mt-2 text-sm text-foreground/60">
          {task.tagList.join(" · ")}
        </p>
      )}
      {dueDate && (
        <p className="mt-2 text-sm text-foreground/60">期限: {dueDate}</p>
      )}
      {(statusError || deleteError) && (
        <p className="mt-2 text-sm text-red-600">
          {statusError ?? deleteError}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-4">
        <button
          type="button"
          disabled={isUpdatingStatus || isDeleting}
          onClick={() => {
            void handleStatusToggle();
          }}
          className="text-sm text-foreground/70 hover:text-foreground hover:underline disabled:opacity-50"
        >
          {isUpdatingStatus
            ? "更新中..."
            : `${taskStatusLabel(next)}へ`}
        </button>
        <Link
          href={`/tasks/${task.id}/edit`}
          className="text-sm text-foreground/70 hover:text-foreground hover:underline"
        >
          編集
        </Link>
        <button
          type="button"
          disabled={isDeleting || isUpdatingStatus}
          onClick={() => {
            void handleDelete();
          }}
          className="text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          {isDeleting ? "削除中..." : "削除"}
        </button>
      </div>
    </li>
  );
}
