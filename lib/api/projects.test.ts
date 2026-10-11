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
import { fetchProjects } from "@/lib/api/projects";
import { INVALID_PROJECT_DTO_MESSAGE } from "@/lib/types/project";

function mockResponse(status: number, body?: unknown): Response {
  return new Response(body !== undefined ? JSON.stringify(body) : null, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const sampleProject = {
  id: 1,
  name: "Alpha",
  user_id: 10,
  created_at: "2026-07-14T00:00:00.000Z",
  updated_at: "2026-07-14T00:00:00.000Z",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchProjects", () => {
  it("returns parsed projects", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse(200, [sampleProject]),
    );

    await expect(fetchProjects()).resolves.toEqual([sampleProject]);
  });

  it("requests GET /api/projects with no-store", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse(200, []),
    );

    await fetchProjects();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/projects"),
      expect.objectContaining({
        cache: "no-store",
      }),
    );
  });

  it("throws UNAUTHORIZED_MESSAGE on 401", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse(401));

    await expect(fetchProjects()).rejects.toThrow(UNAUTHORIZED_MESSAGE);
  });

  it("throws NETWORK_ERROR_MESSAGE when fetch rejects", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    await expect(fetchProjects()).rejects.toThrow(NETWORK_ERROR_MESSAGE);
  });

  it("throws INVALID_PROJECT_DTO_MESSAGE when the body is invalid", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      mockResponse(200, { id: 1 }),
    );

    await expect(fetchProjects()).rejects.toThrow(INVALID_PROJECT_DTO_MESSAGE);
  });
});
