import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function loginAsDemo(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("メールアドレス").fill("demo@example.com");
  await page.getByLabel("パスワード").fill("password");
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page.getByRole("heading", { name: "タスク一覧" })).toBeVisible();
  await expect(page.getByRole("button", { name: "追加" })).toBeVisible();
}

export async function openTaskCreateModal(page: Page): Promise<void> {
  await page.getByRole("button", { name: "追加" }).click();
  await expect(page.getByRole("heading", { name: "タスク作成" })).toBeVisible();
}
