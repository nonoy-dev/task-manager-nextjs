import { describe, expect, it } from "vitest";
import {
  INVALID_TASK_DTO_MESSAGE,
  parseDashboardResponse,
  parseTaskDto,
  parseTaskListResponse,
  taskFromDto,
  tasksFromDto,
  type TaskDto,
} from "./task";

const sampleDto: TaskDto = {
  id: 1,
  title: "買い物",
  description: "牛乳を買う",
  status: "todo",
  priority: "medium",
  due_date: "2026-06-16",
  tags: "work, urgent",
  project_id: null,
  project: null,
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
      projectId: null,
      project: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
  });

  it("maps nested project fields", () => {
    const dto: TaskDto = {
      ...sampleDto,
      project_id: 3,
      project: { id: 3, name: "Alpha" },
    };

    expect(taskFromDto(dto)).toMatchObject({
      projectId: 3,
      project: { id: 3, name: "Alpha" },
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

describe("parseTaskDto", () => {
  it("returns a validated TaskDto", () => {
    expect(parseTaskDto(sampleDto)).toEqual(sampleDto);
  });

  it("throws when the API response shape is invalid", () => {
    expect(() => parseTaskDto({ id: "1", title: "買い物" })).toThrow(
      INVALID_TASK_DTO_MESSAGE,
    );
  });
});

describe("parseTaskListResponse", () => {
  const sampleMeta = {
    page: 1,
    per_page: 20,
    total: 1,
    total_pages: 1,
  };

  it("returns validated tasks and meta", () => {
    expect(
      parseTaskListResponse({
        tasks: [sampleDto],
        meta: sampleMeta,
      }),
    ).toEqual({
      tasks: [sampleDto],
      meta: sampleMeta,
    });
  });

  it("accepts an empty tasks list with zero total_pages", () => {
    expect(
      parseTaskListResponse({
        tasks: [],
        meta: {
          page: 1,
          per_page: 20,
          total: 0,
          total_pages: 0,
        },
      }),
    ).toEqual({
      tasks: [],
      meta: {
        page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0,
      },
    });
  });

  it("throws when the paginated response shape is invalid", () => {
    expect(() => parseTaskListResponse([sampleDto])).toThrow(
      INVALID_TASK_DTO_MESSAGE,
    );
    expect(() =>
      parseTaskListResponse({
        tasks: [sampleDto],
        meta: { page: 1, per_page: 20, total: 1 },
      }),
    ).toThrow(INVALID_TASK_DTO_MESSAGE);
  });
});

describe("parseDashboardResponse", () => {
  it("returns validated overdue, due_today, and meta", () => {
    expect(
      parseDashboardResponse({
        overdue: [sampleDto],
        due_today: [],
        meta: { overdue: 1, due_today: 0 },
      }),
    ).toEqual({
      overdue: [sampleDto],
      due_today: [],
      meta: { overdue: 1, due_today: 0 },
    });
  });

  it("accepts empty attention lists with zero meta", () => {
    expect(
      parseDashboardResponse({
        overdue: [],
        due_today: [],
        meta: { overdue: 0, due_today: 0 },
      }),
    ).toEqual({
      overdue: [],
      due_today: [],
      meta: { overdue: 0, due_today: 0 },
    });
  });

  it("throws when the dashboard response shape is invalid", () => {
    expect(() => parseDashboardResponse({ overdue: [] })).toThrow(
      INVALID_TASK_DTO_MESSAGE,
    );
    expect(() =>
      parseDashboardResponse({
        overdue: [sampleDto],
        due_today: [],
        meta: { overdue: 1 },
      }),
    ).toThrow(INVALID_TASK_DTO_MESSAGE);
  });
});
