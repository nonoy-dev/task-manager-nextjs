"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormTextField } from "@/components/shared/form";
import { readApiClientError } from "@/lib/api/errors";
import { login } from "@/lib/api/sessions.client";

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginFormErrors = {
  email?: string;
  password?: string;
};

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

function validateLoginValues(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!values.email.trim()) {
    errors.email = "メールアドレスは必須です";
  }

  if (!values.password) {
    errors.password = "パスワードは必須です";
  }

  return errors;
}

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateLoginValues(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await login(values.email.trim(), values.password);
      router.push("/");
      router.refresh();
    } catch (error) {
      setSubmitError(readApiClientError(error, "ログインに失敗しました"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-foreground/10 p-4"
      noValidate
      onSubmit={handleSubmit}
    >
      <h1 className="text-lg font-medium">ログイン</h1>

      <div className="mt-4 flex flex-col gap-4">
        <FormTextField
          label="メールアドレス"
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          placeholder="demo@example.com"
          error={errors.email}
          onChange={(email) => {
            setValues((prev) => ({ ...prev, email }));
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
        />

        <FormTextField
          label="パスワード"
          type="password"
          name="password"
          autoComplete="current-password"
          value={values.password}
          error={errors.password}
          onChange={(password) => {
            setValues((prev) => ({ ...prev, password }));
            setErrors((prev) => ({ ...prev, password: undefined }));
          }}
        />

        {submitError && (
          <p className="text-sm text-red-600">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
        >
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </button>
      </div>
    </form>
  );
}
