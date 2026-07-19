import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createTask,
  fetchTask,
  NETWORK_ERROR_MESSAGE,
  TASK_NOT_FOUND_MESSAGE,
  UNAUTHORIZED_MESSAGE,
  taskMutationBody,
} from "./tasks";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
  }),
}));

const sampleInput = {
  title: "買い物",
  description: "",
  status: "todo" as const,
  priority: "medium" as const,
  dueDate: "",
  tags: "",
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
