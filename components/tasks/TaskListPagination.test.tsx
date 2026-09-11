// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TaskListPagination } from "./TaskListPagination";

describe("TaskListPagination", () => {
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
});
