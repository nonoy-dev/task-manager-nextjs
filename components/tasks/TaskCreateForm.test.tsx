// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskFieldValidationError } from "@/lib/api/tasks.client";
import { TaskCreateForm } from "./TaskCreateForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

const { createTaskMock } = vi.hoisted(() => ({
  createTaskMock: vi.fn(),
}));

vi.mock("@/lib/api/tasks.client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/tasks.client")>();
  return {
    ...actual,
    createTask: createTaskMock,
  };
});

describe("TaskCreateForm", () => {
  afterEach(() => {
    cleanup();
    createTaskMock.mockReset();
  });

  it("shows validation error when title is empty", async () => {
    const user = userEvent.setup();

    render(<TaskCreateForm />);
    await user.click(screen.getByRole("button", { name: "作成" }));

    expect(screen.getByText("タイトルは必須です")).toBeInTheDocument();
  });

  it("shows API field validation errors under the matching fields", async () => {
    const user = userEvent.setup();
    createTaskMock.mockRejectedValueOnce(
      new TaskFieldValidationError({
        title: "タイトルは50文字以内で入力してください",
      }),
    );

    render(<TaskCreateForm />);
    await user.type(screen.getByLabelText("タイトル"), "サーバー側エラー");
    await user.click(screen.getByRole("button", { name: "作成" }));

    expect(
      screen.getByText("タイトルは50文字以内で入力してください"),
    ).toBeInTheDocument();
    expect(createTaskMock).toHaveBeenCalledOnce();
  });
});
