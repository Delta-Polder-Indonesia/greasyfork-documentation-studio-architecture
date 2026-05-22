import { marked } from "marked";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { validatorEngine } from "@/lib/engines/validatorEngine";
import type { ValidationWarning } from "@/types/editor";

marked.setOptions({
  gfm: true,
  breaks: false,
  async: false,
});

const turndown = new TurndownService({
  codeBlockStyle: "fenced",
  headingStyle: "atx",
  bulletListMarker: "-",
  emDelimiter: "_",
});

turndown.use(gfm);

// Keep these tags as raw HTML to preserve GreasyFork-specific structures.
turndown.keep(["iframe", "details", "summary", "video", "table", "thead", "tbody", "tr", "th", "td", "time"]);

export function markdownToGreasyforkHtml(markdown: string): { html: string; warnings: ValidationWarning[] } {
  const rawHtml = marked.parse(markdown) as string;
  const { sanitizedHtml, warnings } = validatorEngine.sanitize(rawHtml);
  return { html: sanitizedHtml, warnings };
}

export function htmlToGreasyforkMarkdown(html: string): { markdown: string; sanitizedHtml: string; warnings: ValidationWarning[] } {
  const { sanitizedHtml, warnings } = validatorEngine.sanitize(html);
  const markdown = turndown.turndown(sanitizedHtml);
  return {
    markdown,
    sanitizedHtml,
    warnings,
  };
}
