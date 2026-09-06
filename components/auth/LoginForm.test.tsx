// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NETWORK_ERROR_MESSAGE } from "@/lib/api/errors";
import { LoginForm } from "./LoginForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

const { loginMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
}));

vi.mock("@/lib/api/sessions.client", () => ({
  login: loginMock,
}));

describe("LoginForm", () => {
  afterEach(() => {
    cleanup();
    loginMock.mockReset();
  });

  it("shows a non-field submit failure in ErrorBanner", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValueOnce(new Error(NETWORK_ERROR_MESSAGE));

    render(<LoginForm />);
    await user.type(screen.getByLabelText("メールアドレス"), "demo@example.com");
    await user.type(screen.getByLabelText("パスワード"), "password");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(screen.getByRole("alert")).toHaveTextContent(NETWORK_ERROR_MESSAGE);
  });
});
