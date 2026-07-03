import { describe, expect, it } from "vitest";
import { taskFromDto, tasksFromDto, type TaskDto } from "./task";

const sampleDto: TaskDto = {
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

describe("taskFromDto", () => {
  it("converts snake_case DTO fields to camelCase Task and parses tags", () => {
    expect(taskFromDto(sampleDto)).toEqual({
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

describe("tasksFromDto", () => {
  it("maps each DTO in the array to a Task", () => {
    const dtos: TaskDto[] = [
      sampleDto,
      {
        ...sampleDto,
        id: 2,
        title: "メモ",
        tags: null,
      },
    ];

    expect(tasksFromDto(dtos)).toEqual([
      taskFromDto(sampleDto),
      taskFromDto(dtos[1]),
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(tasksFromDto([])).toEqual([]);
  });
});
