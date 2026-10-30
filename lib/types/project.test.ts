import { describe, expect, it } from "vitest";
import {
  INVALID_PROJECT_DTO_MESSAGE,
  parseProjectDto,
  parseProjectDtos,
  projectFromDto,
  projectsFromDto,
  type ProjectDto,
} from "./project";

const sampleDto: ProjectDto = {
  id: 1,
  name: "Alpha",
  user_id: 10,
  created_at: "2026-07-14T00:00:00.000Z",
  updated_at: "2026-07-14T00:00:00.000Z",
};

describe("projectFromDto", () => {
  it("converts snake_case DTO fields to camelCase Project", () => {
    expect(projectFromDto(sampleDto)).toEqual({
      id: 1,
      name: "Alpha",
      userId: 10,
      createdAt: "2026-07-14T00:00:00.000Z",
      updatedAt: "2026-07-14T00:00:00.000Z",
    });
  });
});

describe("projectsFromDto", () => {
  it("maps each DTO in the array to a Project", () => {
    const dtos: ProjectDto[] = [
      sampleDto,
      { ...sampleDto, id: 2, name: "Beta" },
    ];

    expect(projectsFromDto(dtos)).toEqual([
      projectFromDto(sampleDto),
      projectFromDto(dtos[1]),
    ]);
  });
});

describe("parseProjectDto", () => {
  it("returns a validated ProjectDto", () => {
    expect(parseProjectDto(sampleDto)).toEqual(sampleDto);
  });

  it("throws when the API response shape is invalid", () => {
    expect(() => parseProjectDto({ id: "1", name: "Alpha" })).toThrow(
      "データの形式が不正です",
    );
  });
});

describe("parseProjectDtos", () => {
  it("returns a validated list", () => {
    expect(parseProjectDtos([sampleDto])).toEqual([sampleDto]);
  });

  it("accepts an empty list", () => {
    expect(parseProjectDtos([])).toEqual([]);
  });

  it("throws when the list shape is invalid", () => {
    expect(() => parseProjectDtos({ id: 1 })).toThrow(
      INVALID_PROJECT_DTO_MESSAGE,
    );
  });
});
