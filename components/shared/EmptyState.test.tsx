// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the message", () => {
    render(<EmptyState message="タスクはまだありません。" />);

    expect(screen.getByText("タスクはまだありません。")).toBeInTheDocument();
  });
});
