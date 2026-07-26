"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FormDateField,
  FormSelect,
  FormTextArea,
  FormTextField,
} from "@/components/shared/form";
import { readApiClientError } from "@/lib/api/errors";
import { updateTask } from "@/lib/api/tasks.client";
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from "@/lib/tasks/taskLabels";
import {
  DESCRIPTION_MAX_LENGTH,
  TAGS_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  todayDateString,
  validateFormValues,
  type TaskFormErrors,
  type TaskFormValues,
} from "@/lib/tasks/validateTaskForm";
import { valuesFromTask } from "@/lib/tasks/valuesFromTask";
import type { Task } from "@/lib/types/task";

type TaskEditFormProps = {
  task: Task;
};

export function TaskEditForm({ task }: TaskEditFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<TaskFormValues>(() =>
    valuesFromTask(task),
  );
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateFormValues(values, { allowPastDueDate: true });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await updateTask(task.id, values);
      router.push("/");
    } catch (error) {
      setSubmitError(readApiClientError(error, "タスクの更新に失敗しました"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="mt-4 rounded-lg border border-foreground/10 p-4"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-4">
        <FormTextField
          label="タイトル"
          value={values.title}
          maxLength={TITLE_MAX_LENGTH}
          error={errors.title}
          onChange={(title) => {
            setValues((prev) => ({ ...prev, title }));
            setErrors((prev) => ({ ...prev, title: undefined }));
          }}
        />

        <FormTextArea
          label="説明"
          value={values.description}
          maxLength={DESCRIPTION_MAX_LENGTH}
          error={errors.description}
          onChange={(description) => {
            setValues((prev) => ({ ...prev, description }));
            setErrors((prev) => ({ ...prev, description: undefined }));
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            label="ステータス"
            value={values.status}
            options={TASK_STATUS_OPTIONS}
            onChange={(status) =>
              setValues((prev) => ({ ...prev, status }))
            }
          />

          <FormSelect
            label="優先度"
            value={values.priority}
            options={TASK_PRIORITY_OPTIONS}
            onChange={(priority) =>
              setValues((prev) => ({ ...prev, priority }))
            }
          />
        </div>

        <FormDateField
          label="期限"
          value={values.dueDate}
          min={todayDateString()}
          error={errors.dueDate}
          onChange={(dueDate) => {
            setValues((prev) => ({ ...prev, dueDate }));
            setErrors((prev) => ({ ...prev, dueDate: undefined }));
          }}
        />

        <FormTextField
          label="タグ（カンマ区切り）"
          value={values.tags}
          maxLength={TAGS_MAX_LENGTH}
          placeholder="work,urgent"
          error={errors.tags}
          onChange={(tags) => {
            setValues((prev) => ({ ...prev, tags }));
            setErrors((prev) => ({ ...prev, tags: undefined }));
          }}
        />

        {submitError && (
          <p className="text-sm text-red-600">{submitError}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-fit rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
          >
            {isSubmitting ? "更新中..." : "更新"}
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/5"
          >
            キャンセル
          </Link>
        </div>
      </div>
    </form>
  );
}
