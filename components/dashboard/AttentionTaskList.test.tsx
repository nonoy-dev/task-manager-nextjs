// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Task } from "@/lib/types/task";
import { AttentionTaskList } from "./AttentionTaskList";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    title: "Attention task",
    description: null,
    status: "todo",
    priority: "medium",
    dueDate: "2026-08-19",
    tagList: [],
    projectId: null,
    project: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("AttentionTaskList", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows EmptyState when there are no tasks", () => {
    render(
      <AttentionTaskList
        title="期限切れ"
        count={0}
        tasks={[]}
        emptyMessage="期限切れのタスクはありません。"
      />,
    );

    expect(
      screen.getByRole("heading", { name: /期限切れ/ }),
    ).toHaveTextContent("(0)");
    expect(
      screen.getByText("期限切れのタスクはありません。"),
    ).toBeInTheDocument();
  });

  it("lists tasks with edit links and due dates", () => {
    render(
      <AttentionTaskList
        title="今日まで"
        count={1}
        tasks={[makeTask({ id: 7, title: "Ship it", dueDate: "2026-08-20" })]}
        emptyMessage="今日が期限のタスクはありません。"
      />,
    );

    expect(
      screen.getByRole("heading", { name: /今日まで/ }),
    ).toHaveTextContent("(1)");
    expect(screen.getByRole("link", { name: /Ship it/ })).toHaveAttribute(
      "href",
      "/tasks/7/edit",
    );
    expect(screen.getByText("期限: 2026/8/20")).toBeInTheDocument();
  });
});
