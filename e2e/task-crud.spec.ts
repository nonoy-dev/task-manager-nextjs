import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

test("shows an error when login fails", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("メールアドレス").fill("demo@example.com");
  await page.getByLabel("パスワード").fill("wrong-password");
  await page.getByRole("button", { name: "ログイン" }).click();

  await expect(
    page.getByRole("alert").filter({
      hasText: "メールアドレスまたはパスワードが正しくありません",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
});

test("logs out and returns to the login page", async ({ page }) => {
  await loginAsDemo(page);

  await page.getByRole("button", { name: "ログアウト" }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  await expect(page.getByRole("button", { name: "ログアウト" })).toHaveCount(0);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "タスク作成" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "ログアウト" })).toHaveCount(0);
});

test("logs in, creates, updates, and deletes a task", async ({ page }) => {
  const title = `E2E CRUD ${Date.now()}`;
  const updatedTitle = `${title} updated`;

  await loginAsDemo(page);

  await page.getByLabel("タイトル").fill(title);
  await page.getByRole("button", { name: "作成" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { name: title }) })
    .getByRole("link", { name: "編集" })
    .click();
  await expect(page.getByRole("heading", { name: "タスク編集" })).toBeVisible();

  await page.getByLabel("タイトル").fill(updatedTitle);
  await page.getByRole("button", { name: "更新" }).click();
  await expect(
    page.getByRole("heading", { name: updatedTitle }),
  ).toBeVisible();

  page.once("dialog", (dialog) => {
    void dialog.accept();
  });
  await page
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { name: updatedTitle }) })
    .getByRole("button", { name: "削除" })
    .click();
  await expect(
    page.getByRole("heading", { name: updatedTitle }),
  ).toHaveCount(0);
});
