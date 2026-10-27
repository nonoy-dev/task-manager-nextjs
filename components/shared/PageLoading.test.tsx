// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PageLoading } from "./PageLoading";

describe("PageLoading", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the title and default loading message", () => {
    render(<PageLoading title="タスク一覧" />);

    expect(
      screen.getByRole("heading", { name: "タスク一覧" }),
    ).toBeInTheDocument();
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("renders a custom message when provided", () => {
    render(<PageLoading title="要対応" message="しばらくお待ちください" />);

    expect(screen.getByText("しばらくお待ちください")).toBeInTheDocument();
  });
});
