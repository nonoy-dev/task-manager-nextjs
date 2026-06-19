import { describe, expect, it } from "vitest";
import { taskFromDto, type TaskDto } from "./task";

describe("taskFromDto", () => {
  it("converts snake_case DTO fields to camelCase Task and parses tags", () => {
    const dto: TaskDto = {
      id: 1,
      title: "買い物",
      description: "牛乳を買う",
      status: "todo",
      priority: "medium",
      due_date: "2026-06-16",
      tags: "work, urgent",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
    };

    expect(taskFromDto(dto)).toEqual({
      id: 1,
      title: "買い物",
      description: "牛乳を買う",
      status: "todo",
      priority: "medium",
      dueDate: "2026-06-16",
      tagList: ["work", "urgent"],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
  });
});
