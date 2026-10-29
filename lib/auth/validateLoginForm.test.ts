import { describe, expect, it } from "vitest";
import { validateLoginValues } from "./validateLoginForm";

describe("validateLoginValues", () => {
  it("returns errors when email or password is missing", () => {
    expect(validateLoginValues({ email: "", password: "password" }).email).toBe(
      "メールアドレスは必須です",
    );
    expect(validateLoginValues({ email: "   ", password: "password" }).email).toBe(
      "メールアドレスは必須です",
    );
    expect(
      validateLoginValues({ email: "demo@example.com", password: "" }).password,
    ).toBe("パスワードは必須です");
  });

  it("returns no errors for non-empty email and password", () => {
    expect(
      validateLoginValues({
        email: "demo@example.com",
        password: "password",
      }),
    ).toEqual({});
  });
});
