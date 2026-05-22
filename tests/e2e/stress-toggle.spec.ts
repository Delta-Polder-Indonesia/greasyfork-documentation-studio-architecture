import { expect, test } from "@playwright/test";

test("rapid mode switching stays stable", async ({ page }) => {
  await page.goto("/");

  const mdBtn = page.getByRole("button", { name: "Markdown", exact: true });
  const htmlBtn = page.getByRole("button", { name: "HTML", exact: true });
  const previewBtn = page.getByRole("button", { name: "Preview", exact: true });

  for (let i = 0; i < 8; i++) {
    await htmlBtn.click();
    await previewBtn.click();
    await mdBtn.click();
  }

  // Should still be functional after stress
  await expect(page.getByTestId("editor-markdown")).toBeVisible();
});
