import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
  }),
}));

import {
  NETWORK_ERROR_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "./errors";
import {
  createTask,
  TaskFieldValidationError,
  TASK_NOT_FOUND_MESSAGE,
  taskMutationBody,
} from "./tasks.client";
import { fetchTask, fetchTasks } from "./tasks.server";

const sampleInput = {
  title: "買い物",
  description: "",
  status: "todo" as const,
  priority: "medium" as const,
  dueDate: "",
  tags: "",
  projectId: "",
};

function mockResponse(status: number, body?: unknown): Response {
  return new Response(body !== undefined ? JSON.stringify(body) : null, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("task API fetch errors", () => {
  it("fetchTask throws TASK_NOT_FOUND_MESSAGE on 404", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(404));

    await expect(fetchTask(99)).rejects.toThrow(TASK_NOT_FOUND_MESSAGE);
  });

  it("createTask throws UNAUTHORIZED_MESSAGE on 401", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(401));

    await expect(createTask(sampleInput)).rejects.toThrow(UNAUTHORIZED_MESSAGE);
  });

  it("createTask throws NETWORK_ERROR_MESSAGE when fetch rejects", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    await expect(createTask(sampleInput)).rejects.toThrow(NETWORK_ERROR_MESSAGE);
  });

  it("createTask throws TaskFieldValidationError on keyed 422", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        mockResponse(422, {
          errors: {
            title: ["can't be blank"],
          },
        }),
      ),
    );

    const error = await createTask(sampleInput).catch((value) => value);
    expect(error).toBeInstanceOf(TaskFieldValidationError);
    expect(error).toMatchObject({
      fieldErrors: {
        title: "タイトルは必須です",
      },
    });
  });

  it("createTask throws fallback message on unmapped keyed 422", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        mockResponse(422, {
          errors: {
            status: ["is invalid"],
          },
        }),
      ),
    );

    await expect(createTask(sampleInput)).rejects.toThrow(
      "タスクの作成に失敗しました (422)",
    );
  });

  it("createTask sends credentials with the request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse(201, {
        id: 1,
        title: "買い物",
        description: null,
        status: "todo",
        priority: "medium",
        due_date: null,
        tags: null,
        project_id: null,
        project: null,
        created_at: "2026-07-14T00:00:00.000Z",
        updated_at: "2026-07-14T00:00:00.000Z",
      }),
    );

    await createTask(sampleInput);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tasks",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
  });

  it("fetchTask does not send credentials", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse(200, {
        id: 99,
        title: "買い物",
        description: null,
        status: "todo",
        priority: "medium",
        due_date: null,
        tags: null,
        project_id: null,
        project: null,
        created_at: "2026-07-14T00:00:00.000Z",
        updated_at: "2026-07-14T00:00:00.000Z",
      }),
    );

    await fetchTask(99);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/tasks/99"),
      expect.not.objectContaining({
        credentials: "include",
      }),
    );
  });

  it("fetchTasks appends the list query to the request URL", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse(200, {
        tasks: [],
        meta: { page: 1, per_page: 20, total: 0, total_pages: 0 },
      }),
    );

    await fetchTasks({ q: "foo", project: 3 });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/tasks?q=foo&project=3"),
      expect.objectContaining({
        cache: "no-store",
      }),
    );
  });

  it("fetchTasks returns parsed tasks and meta", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse(200, {
        tasks: [
          {
            id: 1,
            title: "買い物",
            description: null,
            status: "todo",
            priority: "medium",
            due_date: null,
            tags: null,
            project_id: null,
            project: null,
            created_at: "2026-07-14T00:00:00.000Z",
            updated_at: "2026-07-14T00:00:00.000Z",
          },
        ],
        meta: { page: 2, per_page: 20, total: 21, total_pages: 2 },
      }),
    );

    await expect(fetchTasks({ page: 2 })).resolves.toEqual({
      tasks: [
        {
          id: 1,
          title: "買い物",
          description: null,
          status: "todo",
          priority: "medium",
          due_date: null,
          tags: null,
          project_id: null,
          project: null,
          created_at: "2026-07-14T00:00:00.000Z",
          updated_at: "2026-07-14T00:00:00.000Z",
        },
      ],
      meta: { page: 2, per_page: 20, total: 21, total_pages: 2 },
    });
  });
});

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
        projectId: "3",
      }),
    ).toEqual({
      task: {
        title: "買い物",
        description: null,
        status: "todo",
        priority: "medium",
        due_date: "2026-06-20",
        tags: "work,urgent",
        project_id: 3,
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
        projectId: "",
      }),
    ).toEqual({
      task: {
        title: "メモ",
        description: null,
        status: "done",
        priority: "low",
        due_date: null,
        tags: null,
        project_id: null,
      },
    });
  });
});
