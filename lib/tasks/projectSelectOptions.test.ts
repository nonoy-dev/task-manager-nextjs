import { describe, expect, it } from "vitest";
import { projectSelectOptions } from "./projectSelectOptions";

describe("projectSelectOptions", () => {
  it("puts unassigned first, then projects by given order", () => {
    expect(
      projectSelectOptions([
        { id: 2, name: "Beta" },
        { id: 1, name: "Alpha" },
      ]),
    ).toEqual([
      { value: "", label: "未分類" },
      { value: "2", label: "Beta" },
      { value: "1", label: "Alpha" },
    ]);
  });

  it("returns only unassigned when there are no projects", () => {
    expect(projectSelectOptions([])).toEqual([
      { value: "", label: "未分類" },
    ]);
  });
});
