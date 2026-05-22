export type EditorMode = "visual" | "html" | "markdown" | "preview";

export type EditingSource = "visual" | "html" | "markdown";

export type FullscreenTarget = "none" | "editor" | "preview";

export interface EditorDocument {
  html: string;
  markdown: string;
  lastEdited: EditingSource;
}

export interface EditorPreferences {
  focusMode: boolean;
  typewriterMode: boolean;
  centeredLayout: boolean;
  activeLineHighlight: boolean;
  smoothScroll: boolean;
  zoom: number;
  fontSize: number;
  lineHeight: number;
}

export interface HistorySnapshot {
  html: string;
  markdown: string;
  lastEdited: EditingSource;
}

export interface ValidationWarning {
  message: string;
  tag?: string;
  attribute?: string;
}

export interface TextSelection {
  start: number;
  end: number;
}

export interface EditorSelections {
  html: TextSelection;
  markdown: TextSelection;
  visual: TextSelection;
}

export interface EditorScrollPositions {
  html: number;
  markdown: number;
  visual: number;
  preview: number;
}

export interface TransactionMeta {
  transactionId?: string;
  forceSnapshot?: boolean;
}
