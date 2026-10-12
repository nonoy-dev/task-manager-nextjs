import { describe, expect, it } from "vitest";
import {
  mapApiValidationErrors,
  isApiValidationErrors,
} from "./mapApiValidationErrors";

describe("isApiValidationErrors", () => {
  it("returns true for attribute-keyed error objects", () => {
    expect(
      isApiValidationErrors({ title: ["can't be blank"] }),
    ).toBe(true);
  });

  it("returns false for string arrays and other shapes", () => {
    expect(isApiValidationErrors(["can't be blank"])).toBe(false);
    expect(isApiValidationErrors(null)).toBe(false);
    expect(isApiValidationErrors({ title: "can't be blank" })).toBe(false);
  });
});

describe("mapApiValidationErrors", () => {
  it("maps blank and length errors to Japanese field messages", () => {
    expect(
      mapApiValidationErrors({
        title: ["can't be blank"],
        description: ["is too long (maximum is 300 characters)"],
        tags: ["is too long (maximum is 50 characters)"],
      }),
    ).toEqual({
      title: "タイトルは必須です",
      description: "説明は300文字以内で入力してください",
      tags: "タグは50文字以内で入力してください",
    });
  });

  it("maps title length errors", () => {
    expect(
      mapApiValidationErrors({
        title: ["is too long (maximum is 50 characters)"],
      }),
    ).toEqual({
      title: "タイトルは50文字以内で入力してください",
    });
  });

  it("maps invalid project_id errors", () => {
    expect(
      mapApiValidationErrors({
        project_id: ["is invalid"],
      }),
    ).toEqual({
      projectId: "プロジェクトの指定が正しくありません",
    });
  });

  it("ignores unknown attributes and unmappable messages", () => {
    expect(
      mapApiValidationErrors({
        due_date: ["is invalid"],
        status: ["is invalid"],
        title: ["has already been taken"],
      }),
    ).toEqual({});
  });
});

