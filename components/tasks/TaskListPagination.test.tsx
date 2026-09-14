// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TaskListPagination } from "./TaskListPagination";

describe("TaskListPagination", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders the current page label when there are multiple pages", () => {
    render(
      <TaskListPagination
        query={{}}
        meta={{ page: 2, per_page: 20, total: 21, total_pages: 2 }}
      />,
    );

    expect(screen.getByLabelText("ページネーション")).toBeInTheDocument();
    expect(screen.getByText("2 / 2 ページ")).toBeInTheDocument();
  });

  it("hides when there is at most one page", () => {
    const { container } = render(
      <TaskListPagination
        query={{}}
        meta={{ page: 1, per_page: 20, total: 5, total_pages: 1 }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("hides when there are no tasks", () => {
    const { container } = render(
      <TaskListPagination
        query={{}}
        meta={{ page: 1, per_page: 20, total: 0, total_pages: 0 }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("links previous and next while preserving filters", () => {
    render(
      <TaskListPagination
        query={{ q: "Rails", status: "todo", page: 2 }}
        meta={{ page: 2, per_page: 20, total: 45, total_pages: 3 }}
      />,
    );

    expect(screen.getByRole("link", { name: "前へ" })).toHaveAttribute(
      "href",
      "/?q=Rails&status=todo",
    );
    expect(screen.getByRole("link", { name: "次へ" })).toHaveAttribute(
      "href",
      "/?q=Rails&status=todo&page=3",
    );
  });

  it("disables previous on the first page", () => {
    render(
      <TaskListPagination
        query={{ q: "Rails" }}
        meta={{ page: 1, per_page: 20, total: 25, total_pages: 2 }}
      />,
    );

    expect(screen.queryByRole("link", { name: "前へ" })).not.toBeInTheDocument();
    expect(screen.getByText("前へ")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: "次へ" })).toHaveAttribute(
      "href",
      "/?q=Rails&page=2",
    );
  });

  it("disables next on the last page", () => {
    render(
      <TaskListPagination
        query={{ q: "Rails", page: 2 }}
        meta={{ page: 2, per_page: 20, total: 25, total_pages: 2 }}
      />,
    );

    expect(screen.getByRole("link", { name: "前へ" })).toHaveAttribute(
      "href",
      "/?q=Rails",
    );
    expect(screen.queryByRole("link", { name: "次へ" })).not.toBeInTheDocument();
    expect(screen.getByText("次へ")).toHaveAttribute("aria-disabled", "true");
  });
});
