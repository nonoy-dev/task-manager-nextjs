// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
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

    await user.type(screen.getByLabelText("タグ（カンマ区切り）"), "ur");

    expect(screen.getByRole("option", { name: "urgent" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "work" }),
    ).not.toBeInTheDocument();
  });

  it("replaces only the last token when a suggestion is chosen", async () => {
    const user = userEvent.setup();

    render(
      <ControlledTagsField
        initialValue="a, ur"
        existingTags={["work", "urgent"]}
      />,
    );

    await user.click(screen.getByRole("option", { name: "urgent" }));

    expect(screen.getByLabelText("タグ（カンマ区切り）")).toHaveValue(
      "a,urgent",
    );
    expect(
      screen.queryByRole("option", { name: "urgent" }),
    ).not.toBeInTheDocument();
  });

  it("selects a suggestion with arrow keys and Enter", async () => {
    const user = userEvent.setup();

    render(
      <ControlledTagsField existingTags={["work", "urgent", "personal"]} />,
    );

    const input = screen.getByLabelText("タグ（カンマ区切り）");
    await user.type(input, "w");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(input).toHaveValue("work");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
