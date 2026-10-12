import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DESCRIPTION_MAX_LENGTH,
  TAGS_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  validateFormValues,
  type TaskFormValues,
} from "./validateTaskForm";

const validValues: TaskFormValues = {
  title: "買い物",
  description: "牛乳を買う",
  status: "todo",
  priority: "medium",
  dueDate: "2026-06-20",
  tags: "work",
  projectId: "",
};

describe("validateFormValues", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-20T00:00:00+09:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns errors for invalid field values at boundaries", () => {
    expect(validateFormValues({ ...validValues, title: "" }).title).toBe(
      "タイトルは必須です",
    );
    expect(
      validateFormValues({
        ...validValues,
        title: "a".repeat(TITLE_MAX_LENGTH + 1),
      }).title,
    ).toBe(`タイトルは${TITLE_MAX_LENGTH}文字以内で入力してください`);
    expect(
      validateFormValues({
        ...validValues,
        description: "a".repeat(DESCRIPTION_MAX_LENGTH + 1),
      }).description,
    ).toBe(`説明は${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`);
    expect(
      validateFormValues({
        ...validValues,
        tags: "a".repeat(TAGS_MAX_LENGTH + 1),
      }).tags,
    ).toBe(`タグは${TAGS_MAX_LENGTH}文字以内で入力してください`);
    expect(
      validateFormValues({ ...validValues, dueDate: "2026-06-19" }).dueDate,
    ).toBe("期限は今日以降の日付を指定してください");
  });

  it("returns no errors for valid values", () => {
    expect(validateFormValues(validValues)).toEqual({});
  });
});
