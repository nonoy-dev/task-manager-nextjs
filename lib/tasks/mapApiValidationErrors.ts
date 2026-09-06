import {
  DESCRIPTION_MAX_LENGTH,
  TAGS_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  type TaskFormErrors,
} from "@/lib/tasks/validateTaskForm";

export type ApiValidationErrors = Record<string, string[]>;

const FIELD_KEY_MAP: Record<string, keyof TaskFormErrors> = {
  title: "title",
  description: "description",
  tags: "tags",
};

function messageForField(
  field: keyof TaskFormErrors,
  messages: string[],
): string | undefined {
  for (const message of messages) {
    if (message === "can't be blank") {
      if (field === "title") {
        return "タイトルは必須です";
      }
      continue;
    }

    const tooLongMatch = message.match(
      /^is too long \(maximum is (\d+) characters\)$/,
    );
    if (!tooLongMatch) {
      continue;
    }

    const max = Number(tooLongMatch[1]);
    if (field === "title" && max === TITLE_MAX_LENGTH) {
      return `タイトルは${TITLE_MAX_LENGTH}文字以内で入力してください`;
    }
    if (field === "description" && max === DESCRIPTION_MAX_LENGTH) {
      return `説明は${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`;
    }
    if (field === "tags" && max === TAGS_MAX_LENGTH) {
      return `タグは${TAGS_MAX_LENGTH}文字以内で入力してください`;
    }
  }

  return undefined;
}

export function isApiValidationErrors(
  value: unknown,
): value is ApiValidationErrors {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (messages) =>
      Array.isArray(messages) &&
      messages.every((message) => typeof message === "string"),
  );
}

export function mapApiValidationErrors(
  apiErrors: ApiValidationErrors,
): TaskFormErrors {
  const errors: TaskFormErrors = {};

  for (const [apiKey, messages] of Object.entries(apiErrors)) {
    const field = FIELD_KEY_MAP[apiKey];
    if (!field || messages.length === 0) {
      continue;
    }

    const mapped = messageForField(field, messages);
    if (mapped) {
      errors[field] = mapped;
    }
  }

  return errors;
}
