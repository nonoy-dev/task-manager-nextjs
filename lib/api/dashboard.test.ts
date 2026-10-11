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
import { fetchDashboard } from "@/lib/api/dashboard";
import { INVALID_TASK_DTO_MESSAGE } from "@/lib/types/task";

function mockResponse(status: number, body?: unknown): Response {
  return new Response(body !== undefined ? JSON.stringify(body) : null, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const sampleTask = {
  id: 1,
  title: "Overdue task",
  description: null,
  status: "todo" as const,
  priority: "high" as const,
  due_date: "2026-09-19",
  tags: null,
  project_id: null,
  project: null,
  created_at: "2026-07-14T00:00:00.000Z",
  updated_at: "2026-07-14T00:00:00.000Z",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchDashboard", () => {
  it("returns parsed overdue, due_today, and meta", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse(200, {
        overdue: [sampleTask],
        due_today: [],
        meta: { overdue: 1, due_today: 0 },
      }),
    );

    await expect(fetchDashboard()).resolves.toEqual({
      overdue: [sampleTask],
      due_today: [],
      meta: { overdue: 1, due_today: 0 },
    });
  });

  it("requests GET /api/dashboard with no-store", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse(200, {
        overdue: [],
        due_today: [],
        meta: { overdue: 0, due_today: 0 },
      }),
    );

    await fetchDashboard();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/dashboard"),
      expect.objectContaining({
        cache: "no-store",
      }),
    );
  });

  it("throws UNAUTHORIZED_MESSAGE on 401", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(401));

    await expect(fetchDashboard()).rejects.toThrow(UNAUTHORIZED_MESSAGE);
  });

  it("throws NETWORK_ERROR_MESSAGE when fetch rejects", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    await expect(fetchDashboard()).rejects.toThrow(NETWORK_ERROR_MESSAGE);
  });

  it("throws INVALID_TASK_DTO_MESSAGE when the body shape is invalid", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse(200, { overdue: [] }),
    );

    await expect(fetchDashboard()).rejects.toThrow(INVALID_TASK_DTO_MESSAGE);
  });
});
