// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { TaskTagsField } from "./TaskTagsField";

function ControlledTagsField({
  existingTags,
  initialValue = "",
}: {
  existingTags: readonly string[];
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <TaskTagsField
      value={value}
      existingTags={existingTags}
      onChange={setValue}
    />
  );
}

describe("TaskTagsField", () => {
  afterEach(() => {
    cleanup();
  });

  it("lists prefix suggestions for the last tag token", async () => {
    const user = userEvent.setup();

    render(
      <ControlledTagsField existingTags={["work", "urgent", "personal"]} />,
    );

    await user.type(screen.getByLabelText("タグ"), "ur");

    expect(screen.getByRole("button", { name: "urgent" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "work" }),
    ).not.toBeInTheDocument();
  });

  it("shows confirmed tags as chips and keeps only the draft in the input", () => {
    render(
      <ControlledTagsField
        initialValue="work,urgent,"
        existingTags={["work", "urgent"]}
      />,
    );

    expect(screen.getByRole("button", { name: "workを削除" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "urgentを削除" })).toBeTruthy();
    expect(screen.getByLabelText("タグ")).toHaveValue("");
  });

  it("replaces only the last token when a suggestion is chosen", async () => {
    const user = userEvent.setup();

    render(
      <ControlledTagsField
        initialValue="a,ur"
        existingTags={["work", "urgent"]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "urgent" }));

    expect(screen.getByLabelText("タグ")).toHaveValue("");
    expect(screen.getByRole("button", { name: "aを削除" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "urgentを削除" })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "urgent" }),
    ).not.toBeInTheDocument();
  });

  it("selects a suggestion with arrow keys and Enter", async () => {
    const user = userEvent.setup();

    render(
      <ControlledTagsField existingTags={["work", "urgent", "personal"]} />,
    );

    const input = screen.getByLabelText("タグ");
    await user.type(input, "w");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(input).toHaveValue("");
    expect(screen.getByRole("button", { name: "workを削除" })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "work" }),
    ).not.toBeInTheDocument();
  });

  it("keeps Enter and comma on the typed draft until a suggestion is highlighted", async () => {
    const user = userEvent.setup();

    render(
      <ControlledTagsField existingTags={["work", "urgent", "personal"]} />,
    );

    const input = screen.getByLabelText("タグ");
    await user.type(input, "w{Enter}");

    expect(screen.getByRole("button", { name: "wを削除" })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "workを削除" }),
    ).not.toBeInTheDocument();

    await user.type(input, "ur,");

    expect(screen.getByRole("button", { name: "urを削除" })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "urgentを削除" }),
    ).not.toBeInTheDocument();
  });

  it("does not keep a suggestion highlighted after the previous tag was chosen", async () => {
    const user = userEvent.setup();

    render(
      <ControlledTagsField existingTags={["work", "urgent", "personal"]} />,
    );

    const input = screen.getByLabelText("タグ");
    await user.type(input, "w");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(screen.getByRole("button", { name: "workを削除" })).toBeTruthy();

    await user.type(input, "p{Enter}");

    expect(screen.getByRole("button", { name: "pを削除" })).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "personalを削除" }),
    ).not.toBeInTheDocument();
  });

  it("does not leave the typed draft after a suggestion is applied", async () => {
    const user = userEvent.setup();

    render(
      <ControlledTagsField existingTags={["work", "urgent", "personal"]} />,
    );

    const input = screen.getByLabelText("タグ");
    await user.type(input, "p");
    await user.keyboard("{ArrowDown}{Enter}");

    fireEvent.change(input, { target: { value: "p" } });

    expect(screen.getByRole("button", { name: "personalを削除" })).toBeTruthy();
    expect(input).toHaveValue("");
    expect(
      screen.queryByRole("button", { name: "pを削除" }),
    ).not.toBeInTheDocument();
  });

  it("removes a confirmed chip with its delete button", async () => {
    const user = userEvent.setup();

    render(
      <ControlledTagsField
        initialValue="work,urgent,"
        existingTags={["work", "urgent"]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "workを削除" }));

    expect(
      screen.queryByRole("button", { name: "workを削除" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "urgentを削除" })).toBeTruthy();
  });

  it("confirms the draft as a chip when comma is typed", async () => {
    const user = userEvent.setup();

    render(<ControlledTagsField existingTags={[]} />);

    const input = screen.getByLabelText("タグ");
    await user.type(input, "work,");

    expect(input).toHaveValue("");
    expect(screen.getByRole("button", { name: "workを削除" })).toBeTruthy();
  });

  it("confirms the draft as a chip when Enter is pressed", async () => {
    const user = userEvent.setup();

    render(<ControlledTagsField existingTags={[]} />);

    const input = screen.getByLabelText("タグ");
    await user.type(input, "home{Enter}");

    expect(input).toHaveValue("");
    expect(screen.getByRole("button", { name: "homeを削除" })).toBeTruthy();
  });

  it("shows a short hint separate from the placeholder", () => {
    render(<ControlledTagsField existingTags={[]} />);

    expect(screen.getByLabelText("タグ")).toBeTruthy();
    expect(screen.getByPlaceholderText("work,urgent")).toBeTruthy();
    expect(
      screen.getByText("カンマまたは Enter で追加。↑↓で候補"),
    ).toBeTruthy();
  });

  it("keeps Tab on the input instead of moving into suggestion buttons", async () => {
    const user = userEvent.setup();

    render(
      <ControlledTagsField existingTags={["work", "urgent", "personal"]} />,
    );

    const input = screen.getByLabelText("タグ");
    await user.type(input, "w");
    expect(screen.getByRole("button", { name: "work" })).toHaveAttribute(
      "tabindex",
      "-1",
    );

    await user.tab();
    expect(input).not.toHaveFocus();
    expect(screen.getByRole("button", { name: "work" })).not.toHaveFocus();
  });
});
