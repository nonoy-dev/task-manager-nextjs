import { expect, test } from "@playwright/test";
import { loginAsDemo } from "./helpers";

test("filters the task list by search query", async ({ page }) => {
  const title = `E2E Filter ${Date.now()}`;

  await loginAsDemo(page);

  await page.getByLabel("タイトル").fill(title);
  await page.getByRole("button", { name: "作成" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page.getByLabel("検索").fill(`missing-${Date.now()}`);
  await page.getByRole("button", { name: "絞り込み" }).click();
  await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("q")).toMatch(/^missing-/);

  await page.getByLabel("検索").fill(title);
  await page.getByRole("button", { name: "絞り込み" }).click();
  expect(new URL(page.url()).searchParams.get("q")).toBe(title);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page.getByRole("link", { name: "クリア" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
});

test("applies sort and direction to the list URL", async ({ page }) => {
  await loginAsDemo(page);

  await page.getByLabel("並び替え").selectOption("due_date");
  await page.getByLabel("順序").selectOption("asc");
  await page.getByRole("button", { name: "絞り込み" }).click();

  const params = new URL(page.url()).searchParams;
  expect(params.get("sort")).toBe("due_date");
  expect(params.get("direction")).toBe("asc");
  await expect(page.getByLabel("並び替え")).toHaveValue("due_date");
  await expect(page.getByLabel("順序")).toHaveValue("asc");
});
