"use client";

import { useState } from "react";
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

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "未着手" },
  { value: "in_progress", label: "進行中" },
  { value: "done", label: "完了" },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
];

const labelClass = "block text-sm font-medium";
const inputClass =
  "mt-1 w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm";
const inputErrorClass = "border-red-500";

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

function fieldClass(hasError: boolean): string {
  return hasError ? `${inputClass} ${inputErrorClass}` : inputClass;
}

export function TaskCreateForm() {
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
        <label>
          <span className={labelClass}>タイトル</span>
          <input
            type="text"
            className={fieldClass(Boolean(errors.title))}
            value={values.title}
            maxLength={TITLE_MAX_LENGTH}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, title: event.target.value }));
              setErrors((prev) => ({ ...prev, title: undefined }));
            }}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </label>

        <label>
          <span className={labelClass}>説明</span>
          <textarea
            className={fieldClass(Boolean(errors.description))}
            rows={3}
            value={values.description}
            maxLength={DESCRIPTION_MAX_LENGTH}
            onChange={(event) => {
              setValues((prev) => ({
                ...prev,
                description: event.target.value,
              }));
              setErrors((prev) => ({ ...prev, description: undefined }));
            }}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className={labelClass}>ステータス</span>
            <select
              className={inputClass}
              value={values.status}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  status: event.target.value as TaskStatus,
                }))
              }
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className={labelClass}>優先度</span>
            <select
              className={inputClass}
              value={values.priority}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  priority: event.target.value as TaskPriority,
                }))
              }
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          <span className={labelClass}>期限</span>
          <input
            type="date"
            className={fieldClass(Boolean(errors.dueDate))}
            value={values.dueDate}
            min={todayDateString()}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, dueDate: event.target.value }));
              setErrors((prev) => ({ ...prev, dueDate: undefined }));
            }}
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
          )}
        </label>

        <label>
          <span className={labelClass}>タグ（カンマ区切り）</span>
          <input
            type="text"
            className={fieldClass(Boolean(errors.tags))}
            placeholder="work,urgent"
            value={values.tags}
            maxLength={TAGS_MAX_LENGTH}
            onChange={(event) => {
              setValues((prev) => ({ ...prev, tags: event.target.value }));
              setErrors((prev) => ({ ...prev, tags: undefined }));
            }}
          />
          {errors.tags && (
            <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
          )}
        </label>

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
