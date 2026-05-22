import { expect, test } from "@playwright/test";

test("rapid mode switching stays stable", async ({ page }) => {
  await page.goto("/");

  const mdButton = page.getByRole("button", { name: "Markdown" });
  const htmlButton = page.getByRole("button", { name: "HTML" });
  const previewButton = page.getByRole("button", { name: "Preview" });

  for (let i = 0; i < 8; i++) {
    await htmlButton.click();
    await previewButton.click();
    await mdButton.click();
  }

  // Should still be functional after stress
  await expect(page.getByTestId("editor-markdown")).toBeVisible();
});
