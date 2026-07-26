import type { TaskMutationInput } from "@/lib/api/tasks.client";

export type TaskFormValues = TaskMutationInput;

export type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>;

export const TITLE_MAX_LENGTH = 50;
export const DESCRIPTION_MAX_LENGTH = 300;
export const TAGS_MAX_LENGTH = 50;

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export type ValidateFormOptions = {
  allowPastDueDate?: boolean;
};

export function validateFormValues(
  values: TaskFormValues,
  options?: ValidateFormOptions,
): TaskFormErrors {
  const errors: TaskFormErrors = {};

  if (!values.title.trim()) {
    errors.title = "タイトルは必須です";
  } else if (values.title.length > TITLE_MAX_LENGTH) {
    errors.title = `タイトルは${TITLE_MAX_LENGTH}文字以内で入力してください`;
  }

  if (values.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `説明は${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`;
  }

  if (values.tags.length > TAGS_MAX_LENGTH) {
    errors.tags = `タグは${TAGS_MAX_LENGTH}文字以内で入力してください`;
  }

  if (
    !options?.allowPastDueDate &&
    values.dueDate &&
    values.dueDate < todayDateString()
  ) {
    errors.dueDate = "期限は今日以降の日付を指定してください";
  }

  return errors;
}
