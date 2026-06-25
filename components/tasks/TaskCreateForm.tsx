"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FormDateField,
  FormSelect,
  FormTextArea,
  FormTextField,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from "@/components/tasks/form";
import { createTask } from "@/lib/api/tasks";
import {
  DESCRIPTION_MAX_LENGTH,
  TAGS_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  todayDateString,
  validateFormValues,
  type TaskFormErrors,
  type TaskFormValues,
} from "@/lib/tasks/validateTaskForm";

const initialValues: TaskFormValues = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  tags: "",
};

export function TaskCreateForm() {
  const router = useRouter();
  const [values, setValues] = useState<TaskFormValues>(initialValues);
  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateFormValues(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await createTask(values);
      setValues(initialValues);
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "タスクの作成に失敗しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-foreground/10 p-4"
      noValidate
      onSubmit={handleSubmit}
    >
      <h2 className="text-lg font-medium">タスク作成</h2>

      <div className="mt-4 flex flex-col gap-4">
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
        >
          {isSubmitting ? "作成中..." : "作成"}
        </button>
      </div>
    </form>
  );
}
