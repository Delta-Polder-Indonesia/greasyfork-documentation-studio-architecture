import { expect, test } from "@playwright/test";

test("editor renders and accepts input", async ({ page }) => {
  await page.goto("/");

  const editor = page.getByTestId("editor-markdown");
  await expect(editor).toBeVisible();

  await editor.fill("# Test Document\n\nHello world");
  await editor.blur();

  // Switch to preview via exact match
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  const preview = page.getByTestId("preview-pane");
  await expect(preview).toBeVisible();
  await expect(preview).toContainText("Test Document");
});

test("undo redo works via keyboard", async ({ page }) => {
  await page.goto("/");

  const editor = page.getByTestId("editor-markdown");
  await editor.fill("original text");
  await editor.blur();

  await editor.fill("modified text");
  await editor.blur();

  await page.keyboard.press("Control+z");
  await page.waitForTimeout(400);

  const value = await editor.inputValue();
  expect(value).toContain("original");
});
