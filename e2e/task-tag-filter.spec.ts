import { expect, test } from "@playwright/test";
import { loginAsDemo, openTaskCreateModal } from "./helpers";

test("filters the task list from a tag link and clears only that tag", async ({
  page,
}) => {
  const stamp = Date.now();
  const networkTitle = `E2E network ${stamp}`;
  const workTitle = `E2E work ${stamp}`;

  await loginAsDemo(page);

  await openTaskCreateModal(page);
  await page.getByLabel("タイトル").fill(networkTitle);
  await page.getByLabel("タグ").fill("network");
  await page.getByRole("button", { name: "作成" }).click();
  await expect(page.getByRole("heading", { name: networkTitle })).toBeVisible();

  await openTaskCreateModal(page);
  await page.getByLabel("タイトル").fill(workTitle);
  await page.getByLabel("タグ").fill("work, urgent");
  await page.getByRole("button", { name: "作成" }).click();
  await expect(page.getByRole("heading", { name: workTitle })).toBeVisible();

  const workItem = page.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: workTitle }),
  });
  await workItem.getByRole("link", { name: "work", exact: true }).click();

  const workChip = page.getByRole("complementary").getByRole("link", {
    name: /^work /,
  });
  await expect(workChip).toHaveAttribute("aria-current", "true");
  expect(new URL(page.url()).searchParams.get("tag")).toBe("work");
  await expect(page.getByRole("heading", { name: workTitle })).toBeVisible();
  await expect(page.getByRole("heading", { name: networkTitle })).toHaveCount(0);

  await page.getByLabel("検索").fill(workTitle);
  await page.getByRole("button", { name: "絞り込み" }).click();

  const filtered = new URL(page.url()).searchParams;
  expect(filtered.get("tag")).toBe("work");
  expect(filtered.get("q")).toBe(workTitle);
  await expect(page.getByRole("heading", { name: workTitle })).toBeVisible();
  await expect(page.getByRole("heading", { name: networkTitle })).toHaveCount(0);

  await page
    .getByRole("complementary")
    .getByRole("link", { name: /^work / })
    .click();
  await expect(page).toHaveURL((url) => {
    const params = new URL(url).searchParams;
    return params.get("tag") == null && params.get("q") === workTitle;
  });
  await expect(
    page.getByRole("complementary").getByRole("link", { name: /^work / }),
  ).not.toHaveAttribute("aria-current");
  await expect(page.getByRole("heading", { name: workTitle })).toBeVisible();
  await expect(page.getByRole("heading", { name: networkTitle })).toHaveCount(0);

  await page.getByRole("link", { name: "クリア" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: networkTitle })).toBeVisible();
  await expect(page.getByRole("heading", { name: workTitle })).toBeVisible();
});
