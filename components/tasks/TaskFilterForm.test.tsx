// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TaskFilterForm } from "./TaskFilterForm";

describe("TaskFilterForm", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a compact filter bar", () => {
    render(<TaskFilterForm query={{}} />);

    expect(screen.getByLabelText("検索")).toHaveAttribute("name", "q");
    expect(screen.getByLabelText("ステータス")).toHaveAttribute("name", "status");
    expect(screen.getByLabelText("優先度")).toHaveAttribute("name", "priority");
    expect(screen.getByLabelText("並び替え")).toHaveAttribute("name", "sort");
    expect(screen.getByLabelText("順序")).toHaveAttribute("name", "direction");
    expect(screen.getByRole("button", { name: "絞り込み" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "クリア" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("does not show tag clear UI (sidebar owns tag filters)", () => {
    render(<TaskFilterForm query={{ tag: "緊急" }} />);

    expect(screen.queryByText(/^タグ:/)).not.toBeInTheDocument();
    expect(screen.queryByText("タグ: 緊急")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "解除" })).not.toBeInTheDocument();
  });

  it("keeps the active tag in a hidden field so other filters can be submitted", () => {
    const { container } = render(
      <TaskFilterForm
        query={{ tag: "緊急", q: "会議", status: "todo", page: 2 }}
      />,
    );

    expect(container.querySelector('input[name="tag"]')).toHaveValue("緊急");
  });

  it("renders project options from props", () => {
    render(
      <TaskFilterForm
        query={{}}
        projects={[
          { id: 1, name: "Alpha" },
          { id: 2, name: "Beta" },
        ]}
      />,
    );

    const projectSelect = screen.getByLabelText("プロジェクト");
    expect(projectSelect).toHaveAttribute("name", "project");
    expect(
      within(projectSelect).getByRole("option", { name: "プロジェクト" }),
    ).toHaveValue("");
    expect(
      within(projectSelect).getByRole("option", { name: "Alpha" }),
    ).toHaveValue("1");
    expect(
      within(projectSelect).getByRole("option", { name: "Beta" }),
    ).toHaveValue("2");
  });
});
