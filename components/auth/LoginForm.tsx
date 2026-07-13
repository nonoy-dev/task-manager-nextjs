"use client";

import { useState } from "react";
import { FormTextField } from "@/components/shared/form";

type LoginFormValues = {
  email: string;
  password: string;
};

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>(initialValues);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
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
          onChange={(email) => setValues((prev) => ({ ...prev, email }))}
        />

        <FormTextField
          label="パスワード"
          type="password"
          name="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(password) => setValues((prev) => ({ ...prev, password }))}
        />

        <button
          type="submit"
          className="w-fit rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
        >
          ログイン
        </button>
      </div>
    </form>
  );
}
