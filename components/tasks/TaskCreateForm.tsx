"use client";

import { useState } from "react";
import type { TaskPriority, TaskStatus } from "@/lib/types/task";

type FormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string;
};

const initialValues: FormValues = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  tags: "",
};

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

export function TaskCreateForm() {
  const [values, setValues] = useState<FormValues>(initialValues);

  return (
    <form
      className="rounded-lg border border-foreground/10 p-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <h2 className="text-lg font-medium">タスク作成</h2>

      <div className="mt-4 flex flex-col gap-4">
        <label>
          <span className={labelClass}>タイトル</span>
          <input
            type="text"
            className={inputClass}
            value={values.title}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, title: event.target.value }))
            }
          />
        </label>

        <label>
          <span className={labelClass}>説明</span>
          <textarea
            className={inputClass}
            rows={3}
            value={values.description}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, description: event.target.value }))
            }
          />
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
            className={inputClass}
            value={values.dueDate}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, dueDate: event.target.value }))
            }
          />
        </label>

        <label>
          <span className={labelClass}>タグ（カンマ区切り）</span>
          <input
            type="text"
            className={inputClass}
            placeholder="work,urgent"
            value={values.tags}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, tags: event.target.value }))
            }
          />
        </label>

        <button
          type="submit"
          className="w-fit rounded-md bg-foreground px-4 py-2 text-sm text-background"
        >
          作成
        </button>
      </div>
    </form>
  );
}
