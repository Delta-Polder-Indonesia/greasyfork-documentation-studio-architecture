import { expect, test } from "@playwright/test";

test("mode switching works correctly", async ({ page }) => {
  await page.goto("/");

  // Start in markdown mode
  await expect(page.getByTestId("editor-markdown")).toBeVisible();

  // Switch to HTML mode (exact match to avoid "Export HTML")
  await page.getByRole("button", { name: "HTML", exact: true }).click();
  await expect(page.getByTestId("editor-html")).toBeVisible();

  // Switch to Preview mode
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByTestId("preview-pane")).toBeVisible();

  // Switch back to markdown
  await page.getByRole("button", { name: "Markdown", exact: true }).click();
  await expect(page.getByTestId("editor-markdown")).toBeVisible();
});
