// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NETWORK_ERROR_MESSAGE } from "@/lib/api/errors";
import type { Task } from "@/lib/types/task";
import { TaskEditForm } from "./TaskEditForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

const { updateTaskMock } = vi.hoisted(() => ({
  updateTaskMock: vi.fn(),
}));

vi.mock("@/lib/api/tasks.client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/tasks.client")>();
  return {
    ...actual,
    updateTask: updateTaskMock,
  };
});

const sampleTask: Task = {
  id: 1,
  title: "買い物",
  description: null,
  status: "todo",
  priority: "medium",
  dueDate: null,
  tagList: [],
  projectId: null,
  project: null,
  createdAt: "2026-07-14T00:00:00.000Z",
  updatedAt: "2026-07-14T00:00:00.000Z",
};

describe("TaskEditForm", () => {
  afterEach(() => {
    cleanup();
    updateTaskMock.mockReset();
  });

  it("shows a non-field submit failure in ErrorBanner", async () => {
    const user = userEvent.setup();
    updateTaskMock.mockRejectedValueOnce(new Error(NETWORK_ERROR_MESSAGE));

    render(<TaskEditForm task={sampleTask} />);
    await user.click(screen.getByRole("button", { name: "更新" }));

    expect(screen.getByRole("alert")).toHaveTextContent(NETWORK_ERROR_MESSAGE);
  });
});
