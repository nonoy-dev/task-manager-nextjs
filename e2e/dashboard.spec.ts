import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

test("opens the dashboard attention lists after login", async ({ page }) => {
  await loginAsDemo(page);

  await page.getByRole("navigation", { name: "メイン" }).getByRole("link", {
    name: "ダッシュボード",
  }).click();

  await expect(page.getByRole("heading", { name: "要対応" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /期限切れ/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /今日が期限/ })).toBeVisible();
});
