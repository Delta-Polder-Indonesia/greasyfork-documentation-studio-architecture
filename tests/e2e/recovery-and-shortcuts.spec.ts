import { expect, test } from "@playwright/test";

test("keyboard shortcuts and command palette actions stay responsive", async ({ page }) => {
  await page.goto("/");

  const markdownEditor = page.getByTestId("editor-markdown");
  await markdownEditor.fill("# Shortcut Test\n\ninitial");

  await page.keyboard.press("Control+k");
  const commandInput = page.getByPlaceholder("Type a command or search...");
  await expect(commandInput).toBeVisible();
  await commandInput.fill("show keyboard shortcuts");
  await page.keyboard.press("Enter");

  await expect(page.getByText("Keyboard Shortcuts")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.keyboard.press("Control+z");
  await page.keyboard.press("Control+y");
  await expect(page.getByTestId("preview-pane")).toContainText("Shortcut Test");
});

test("autosave recovery survives corrupted primary payload", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("editor-markdown").fill("# Recovery Test\n\nStable content");
  await page.getByTestId("editor-markdown").blur();

  await page.evaluate(() => {
    const primaryKey = "gf-doc-studio-autosave-primary-v2";
    const backupKey = "gf-doc-studio-autosave-backup-v2";
    const primary = window.localStorage.getItem(primaryKey);
    if (primary) {
      window.localStorage.setItem(backupKey, primary);
    }
    window.localStorage.setItem(primaryKey, "{corrupted-json");
  });

  await page.reload();
  await expect(page.getByText("restored from backup", { exact: false })).toBeVisible();
  await expect(page.getByTestId("editor-markdown")).toContainText("Recovery Test");
});
