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
import type { TaskPriority, TaskStatus } from "@/lib/types/task";

type FormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  tags: "",
};

const TITLE_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 300;
const TAGS_MAX_LENGTH = 50;

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function validateFormValues(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.title.trim()) {
    errors.title = "タイトルは必須です";
  } else if (values.title.length > TITLE_MAX_LENGTH) {
    errors.title = `タイトルは${TITLE_MAX_LENGTH}文字以内で入力してください`;
  }

  if (values.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `説明は${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`;
  }

  if (values.tags.length > TAGS_MAX_LENGTH) {
    errors.tags = `タグは${TAGS_MAX_LENGTH}文字以内で入力してください`;
  }

  if (values.dueDate && values.dueDate < todayDateString()) {
    errors.dueDate = "期限は今日以降の日付を指定してください";
  }

  return errors;
}

export function TaskCreateForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
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
