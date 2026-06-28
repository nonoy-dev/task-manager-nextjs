import { describe, expect, it } from "vitest";
import { taskMutationBody } from "./tasks";

describe("taskMutationBody", () => {
  it("serializes TaskMutationInput to Rails request body", () => {
    expect(
      taskMutationBody({
        title: " 買い物 ",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "2026-06-20",
        tags: "work,urgent",
      }),
    ).toEqual({
      task: {
        title: "買い物",
        description: null,
        status: "todo",
        priority: "medium",
        due_date: "2026-06-20",
        tags: "work,urgent",
      },
    });
  });

  it("converts blank optional fields to null", () => {
    expect(
      taskMutationBody({
        title: "メモ",
        description: "   ",
        status: "done",
        priority: "low",
        dueDate: "",
        tags: "",
      }),
    ).toEqual({
      task: {
        title: "メモ",
        description: null,
        status: "done",
        priority: "low",
        due_date: null,
        tags: null,
      },
    });
  });
});
