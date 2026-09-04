// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FormDateField } from "./FormDateField";
import { FormTextArea } from "./FormTextArea";
import { FormTextField } from "./FormTextField";

describe("form field accessibility", () => {
  afterEach(() => {
    cleanup();
  });

  it("marks FormTextField invalid and describes it with the error text", () => {
    render(
      <FormTextField
        label="タイトル"
        value=""
        error="タイトルは必須です"
        onChange={vi.fn()}
      />,
    );

    const field = screen.getByRole("textbox", { name: /タイトル/ });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("タイトルは必須です");
  });

  it("does not mark FormTextField invalid when there is no error", () => {
    render(
      <FormTextField label="タイトル" value="買い物" onChange={vi.fn()} />,
    );

    const field = screen.getByRole("textbox", { name: "タイトル" });
    expect(field).not.toHaveAttribute("aria-invalid");
    expect(field).not.toHaveAccessibleDescription();
  });

  it("marks FormTextArea invalid and describes it with the error text", () => {
    render(
      <FormTextArea
        label="説明"
        value=""
        error="説明は300文字以内で入力してください"
        onChange={vi.fn()}
      />,
    );

    const field = screen.getByRole("textbox", { name: /説明/ });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(
      "説明は300文字以内で入力してください",
    );
  });

  it("marks FormDateField invalid and describes it with the error text", () => {
    render(
      <FormDateField
        label="期限"
        value="2026-06-19"
        error="期限は今日以降の日付を指定してください"
        onChange={vi.fn()}
      />,
    );

    const field = screen.getByLabelText(/期限/);
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(
      "期限は今日以降の日付を指定してください",
    );
  });
});
