// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskCreateForm } from "./TaskCreateForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/api/tasks.client", () => ({
  createTask: vi.fn(),
}));

describe("TaskCreateForm", () => {
  it("shows validation error when title is empty", async () => {
    const user = userEvent.setup();

    render(<TaskCreateForm />);
    await user.click(screen.getByRole("button", { name: "作成" }));

    expect(screen.getByText("タイトルは必須です")).toBeInTheDocument();
  });
});
