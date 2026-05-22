import { create } from "zustand";
import { marked } from "marked";
import TurndownService from "turndown";
import { sanitizeGreasyforkHtml } from "@/validators/greasyforkValidator";
import { defaultMarkdownTemplate } from "@/templates/defaultTemplate";
import type { ValidationWarning } from "@/types/editor";

marked.setOptions({ gfm: true, breaks: false, async: false });

const turndown = new TurndownService({
  codeBlockStyle: "fenced",
  headingStyle: "atx",
  bulletListMarker: "-",
});

function mdToHtml(md: string) {
  const raw = marked.parse(md) as string;
  return sanitizeGreasyforkHtml(raw);
}

function htmlToMd(html: string) {
  const { sanitizedHtml, warnings } = sanitizeGreasyforkHtml(html);
  const md = turndown.turndown(sanitizedHtml);
  return { markdown: md, sanitizedHtml, warnings };
}

export type EditorMode = "markdown" | "html" | "preview";

interface EditorState {
  mode: EditorMode;
  markdown: string;
  html: string;
  previewHtml: string;
  warnings: ValidationWarning[];
  sidebarOpen: boolean;

  setMode: (mode: EditorMode) => void;
  setMarkdown: (md: string) => void;
  setHtml: (html: string) => void;
  toggleSidebar: () => void;
  undo: () => void;
  redo: () => void;
}

const HISTORY_LIMIT = 80;
type Snap = { markdown: string; html: string };
const historyStack: Snap[] = [];
const futureStack: Snap[] = [];

function pushHistory(snap: Snap) {
  historyStack.push(snap);
  if (historyStack.length > HISTORY_LIMIT) historyStack.shift();
  futureStack.length = 0;
}

const initial = mdToHtml(defaultMarkdownTemplate);

export const useEditorStore = create<EditorState>((set, get) => ({
  mode: "markdown",
  markdown: defaultMarkdownTemplate,
  html: initial.sanitizedHtml,
  previewHtml: initial.sanitizedHtml,
  warnings: initial.warnings,
  sidebarOpen: true,

  setMode: (mode) => set({ mode }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  setMarkdown: (md) => {
    const prev = get();
    pushHistory({ markdown: prev.markdown, html: prev.html });
    const { sanitizedHtml, warnings } = mdToHtml(md);
    set({ markdown: md, html: sanitizedHtml, previewHtml: sanitizedHtml, warnings });
  },

  setHtml: (html) => {
    const prev = get();
    pushHistory({ markdown: prev.markdown, html: prev.html });
    const { markdown, sanitizedHtml, warnings } = htmlToMd(html);
    set({ html, markdown, previewHtml: sanitizedHtml, warnings });
  },

  undo: () => {
    const snap = historyStack.pop();
    if (!snap) return;
    const cur = get();
    futureStack.push({ markdown: cur.markdown, html: cur.html });
    const { sanitizedHtml, warnings } = mdToHtml(snap.markdown);
    set({ markdown: snap.markdown, html: snap.html, previewHtml: sanitizedHtml, warnings });
  },

  redo: () => {
    const snap = futureStack.pop();
    if (!snap) return;
    const cur = get();
    historyStack.push({ markdown: cur.markdown, html: cur.html });
    const { sanitizedHtml, warnings } = mdToHtml(snap.markdown);
    set({ markdown: snap.markdown, html: snap.html, previewHtml: sanitizedHtml, warnings });
  },
}));
