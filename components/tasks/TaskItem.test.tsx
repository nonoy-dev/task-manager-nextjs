// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Task } from "@/lib/types/task";
import { TaskItem } from "./TaskItem";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/api/tasks.client", () => ({
  deleteTask: vi.fn(),
  updateTask: vi.fn(),
}));

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: "Sample task",
    description: null,
    status: "todo",
    priority: "medium",
    dueDate: null,
    tagList: [],
    projectId: null,
    project: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("TaskItem due-date urgency badges", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-20T00:00:00+09:00"));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows the overdue badge", () => {
    render(<TaskItem task={makeTask({ dueDate: "2026-08-19" })} />);

    expect(screen.getByText("期限切れ")).toBeInTheDocument();
  });

  it("shows the today badge", () => {
    render(<TaskItem task={makeTask({ dueDate: "2026-08-20" })} />);

    expect(screen.getByText("今日")).toBeInTheDocument();
  });

  it("shows the this-week badge", () => {
    render(<TaskItem task={makeTask({ dueDate: "2026-08-22" })} />);

    expect(screen.getByText("今週")).toBeInTheDocument();
  });

  it("links each tag to that tag filter and keeps the other list filters", () => {
    render(
      <TaskItem
        task={makeTask({ tagList: ["work", "urgent"] })}
        listQuery={{ q: "会議", status: "todo", page: 2 }}
      />,
    );

    expect(screen.getByRole("link", { name: "work" })).toHaveAttribute(
      "href",
      "/?q=%E4%BC%9A%E8%AD%B0&status=todo&tag=work",
    );
    expect(screen.getByRole("link", { name: "urgent" })).toHaveAttribute(
      "href",
      "/?q=%E4%BC%9A%E8%AD%B0&status=todo&tag=urgent",
    );
  });

  it("hides urgency badges when the task is done", () => {
    render(
      <TaskItem
        task={makeTask({ dueDate: "2026-08-19", status: "done" })}
      />,
    );

    expect(screen.queryByText("期限切れ")).not.toBeInTheDocument();
    expect(screen.queryByText("今日")).not.toBeInTheDocument();
    expect(screen.queryByText("今週")).not.toBeInTheDocument();
    expect(screen.getByText("期限: 2026/8/19")).toBeInTheDocument();
  });
});
