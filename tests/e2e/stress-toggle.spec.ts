import { expect, test } from "@playwright/test";

test("fullscreen and split toggles survive repeated stress cycles", async ({ page }) => {
  await page.goto("/");

  const splitButton = page.getByRole("button", { name: "Split" });
  const editorFullscreenButton = page.getByRole("button", { name: /Editor/ });
  const previewFullscreenButton = page.getByRole("button", { name: /Preview/ });

  for (let i = 0; i < 6; i += 1) {
    await splitButton.click();
    await editorFullscreenButton.click();
    await editorFullscreenButton.click();
    await previewFullscreenButton.click();
    await previewFullscreenButton.click();
  }

  await expect(page.getByTestId("editor-markdown")).toBeVisible();
});
