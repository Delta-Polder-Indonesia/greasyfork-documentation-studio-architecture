import { expect, test } from "@playwright/test";

test("long-session editing remains stable", async ({ page }) => {
  await page.goto("/");

  const markdownEditor = page.getByTestId("editor-markdown");
  await expect(markdownEditor).toBeVisible();

  const longBlock = Array.from({ length: 400 }, (_, idx) => `- item ${idx}`).join("\n");
  await markdownEditor.fill(`# Session Test\n\n${longBlock}`);
  await markdownEditor.blur();

  await expect(page.getByTestId("preview-pane")).toContainText("Session Test");

  await page.keyboard.press("Control+z");
  await page.keyboard.press("Control+y");

  await page.getByRole("button", { name: "Split" }).click();
  await page.getByRole("button", { name: "Split" }).click();
  await page.getByRole("button", { name: /Editor/ }).click();
  await page.getByRole("button", { name: /Editor/ }).click();

  await page.keyboard.press("Control+k");
  await expect(page.getByPlaceholder("Type a command or search...")).toBeVisible();
});
