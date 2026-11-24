// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TaskTagSidebar } from "./TaskTagSidebar";

describe("TaskTagSidebar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders nothing when there are no tags", () => {
    const { container } = render(
      <TaskTagSidebar tags={[]} listQuery={{}} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("links each tag to that filter and shows counts", () => {
    render(
      <TaskTagSidebar
        tags={[
          { name: "work", count: 2 },
          { name: "urgent", count: 1 },
        ]}
        listQuery={{ q: "会議", status: "todo" }}
      />,
    );

    expect(screen.getByRole("heading", { name: "タグ" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "urgent 1" })).toHaveAttribute(
      "href",
      "/?q=%E4%BC%9A%E8%AD%B0&status=todo&tag=urgent",
    );
    expect(screen.getByRole("link", { name: "work 2" })).toHaveAttribute(
      "href",
      "/?q=%E4%BC%9A%E8%AD%B0&status=todo&tag=work",
    );
  });

  it("marks the active tag and links it to clear only that tag", () => {
    render(
      <TaskTagSidebar
        tags={[
          { name: "work", count: 2 },
          { name: "urgent", count: 1 },
        ]}
        listQuery={{ tag: "work", q: "会議" }}
      />,
    );

    const active = screen.getByRole("link", { name: "work 2" });
    expect(active).toHaveAttribute("aria-current", "true");
    expect(active).toHaveAttribute("href", "/?q=%E4%BC%9A%E8%AD%B0");
    expect(
      screen.getByRole("link", { name: "urgent 1" }),
    ).not.toHaveAttribute("aria-current");
  });
});
