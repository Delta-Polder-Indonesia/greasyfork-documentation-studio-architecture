import { htmlToGreasyforkMarkdown, markdownToGreasyforkHtml } from "@/lib/converter";

export const parserEngine = {
  markdownToHtml(markdown: string) {
    try {
      return markdownToGreasyforkHtml(markdown);
    } catch {
      return {
        html: `<pre>${escapeHtml(markdown)}</pre>`,
        warnings: [{ message: "Parser fallback aktif untuk markdown karena terjadi error internal." }],
      };
    }
  },
  htmlToMarkdown(html: string) {
    try {
      return htmlToGreasyforkMarkdown(html);
    } catch {
      return {
        markdown: html,
        sanitizedHtml: `<pre>${escapeHtml(html)}</pre>`,
        warnings: [{ message: "Parser fallback aktif untuk HTML karena terjadi error internal." }],
      };
    }
  },
};

function escapeHtml(input: string) {
  return input.replace(/[&<>\"]/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    return "&quot;";
  });
}
