import { z } from "zod";

export type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

const loginFormSchema = z.object({
  email: z.string().refine((value) => value.trim().length > 0, {
    error: "メールアドレスは必須です",
  }),
  password: z.string().refine((value) => value.trim().length > 0, {
    error: "パスワードは必須です",
  }),

});

function formErrorsFromZod(error: z.ZodError): LoginFormErrors {
  const errors: LoginFormErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string") {
      continue;
    }
    errors[key as keyof LoginFormValues] = issue.message;
  }

  return errors;
}

export function validateLoginValues(
  values: LoginFormValues,
): LoginFormErrors {
  const result = loginFormSchema.safeParse(values);
  if (result.success) {
    return {};
  }
  return formErrorsFromZod(result.error);
}
