// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TaskCreateModal } from "./TaskCreateModal";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/api/tasks.client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/tasks.client")>();
  return {
    ...actual,
    createTask: vi.fn(),
  };
});

describe("TaskCreateModal", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  afterEach(() => {
    cleanup();
  });

  it("resets the create form after the modal is closed", async () => {
    const user = userEvent.setup();
    render(<TaskCreateModal existingTags={["work"]} />);

    await user.click(screen.getByRole("button", { name: "追加" }));

    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText(/タグ/), "work");
    await user.click(within(dialog).getByRole("button", { name: "作成" }));
    expect(within(dialog).getByText("タイトルは必須です")).toBeTruthy();

    await user.click(within(dialog).getByRole("button", { name: "キャンセル" }));
    await user.click(screen.getByRole("button", { name: "追加" }));

    const reopened = screen.getByRole("dialog");
    expect(within(reopened).getByLabelText(/タグ/)).toHaveValue("");
    expect(within(reopened).queryByText("タイトルは必須です")).toBeNull();
  });
});
