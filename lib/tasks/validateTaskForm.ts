import type { TaskMutationInput } from "@/lib/api/tasks.client";
import { todayDateString } from "@/lib/tasks/dateUtils";
import {
  taskPrioritySchema,
  taskStatusSchema,
} from "@/lib/types/task";
import { z } from "zod";

export { todayDateString };

export type TaskFormValues = TaskMutationInput;

export type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>;

export const TITLE_MAX_LENGTH = 50;
export const DESCRIPTION_MAX_LENGTH = 300;
export const TAGS_MAX_LENGTH = 50;

export type ValidateFormOptions = {
  allowPastDueDate?: boolean;
};

const taskFormFieldsSchema = z.object({
  title: z
    .string()
    .refine((value) => value.trim().length > 0, {
      error: "タイトルは必須です",
    })
    .refine((value) => value.length <= TITLE_MAX_LENGTH, {
      error: `タイトルは${TITLE_MAX_LENGTH}文字以内で入力してください`,
    }),
  description: z.string().refine(
    (value) => value.length <= DESCRIPTION_MAX_LENGTH,
    {
      error: `説明は${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`,
    },
  ),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  dueDate: z.string(),
  tags: z.string().refine((value) => value.length <= TAGS_MAX_LENGTH, {
    error: `タグは${TAGS_MAX_LENGTH}文字以内で入力してください`,
  }),
  projectId: z.string(),
});

function taskFormSchema(options?: ValidateFormOptions) {
  return taskFormFieldsSchema.superRefine((values, ctx) => {
    if (
      options?.allowPastDueDate ||
      !values.dueDate ||
      values.dueDate >= todayDateString()
    ) {
      return;
    }

    ctx.addIssue({
      code: "custom",
      path: ["dueDate"],
      message: "期限は今日以降の日付を指定してください",
    });
  });
}

function formErrorsFromZod(error: z.ZodError): TaskFormErrors {
  const errors: TaskFormErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string" || errors[key as keyof TaskFormValues]) {
      continue;
    }
    errors[key as keyof TaskFormValues] = issue.message;
  }

  return errors;
}

export function validateFormValues(
  values: TaskFormValues,
  options?: ValidateFormOptions,
): TaskFormErrors {
  const result = taskFormSchema(options).safeParse(values);
  if (result.success) {
    return {};
  }
  return formErrorsFromZod(result.error);
}
