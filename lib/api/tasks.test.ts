import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createTask,
  fetchTask,
  NETWORK_ERROR_MESSAGE,
  TASK_NOT_FOUND_MESSAGE,
  taskMutationBody,
} from "./tasks";

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

  it("createTask throws API validation errors on 422", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse(422, { errors: ["Title can't be blank"] }),
    );

    await expect(createTask(sampleInput)).rejects.toThrow("Title can't be blank");
  });

  it("createTask throws NETWORK_ERROR_MESSAGE when fetch rejects", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    await expect(createTask(sampleInput)).rejects.toThrow(NETWORK_ERROR_MESSAGE);
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
