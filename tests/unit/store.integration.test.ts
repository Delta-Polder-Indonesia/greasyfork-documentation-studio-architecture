import { describe, expect, it, beforeEach } from "vitest";
import { useEditorStore } from "@/store/useEditorStore";

function resetEditorStore() {
  useEditorStore.setState((state) => ({
    ...state,
    doc: {
      html: "<p>initial</p>",
      markdown: "initial",
      lastEdited: "markdown",
    },
    history: [],
    future: [],
    previewHtml: "<p>initial</p>",
    warnings: [],
    activeTransactionId: null,
  }));
}

describe("editor store integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetEditorStore();
  });

  it("batches history snapshots in same transaction", () => {
    const store = useEditorStore.getState();

    store.setMarkdownContent("first", { transactionId: "tx-1" });
    store.setMarkdownContent("second", { transactionId: "tx-1" });
    store.setMarkdownContent("third", { transactionId: "tx-1" });

    expect(useEditorStore.getState().history).toHaveLength(1);
  });

  it("maintains undo redo integrity", () => {
    const store = useEditorStore.getState();
    store.setMarkdownContent("v1", { transactionId: "tx-a" });
    store.setMarkdownContent("v2", { transactionId: "tx-b" });
    store.undo();

    expect(useEditorStore.getState().doc.markdown).toContain("v1");
    store.redo();
    expect(useEditorStore.getState().doc.markdown).toContain("v2");
  });

  it("keeps preview sanitized after HTML update", () => {
    const store = useEditorStore.getState();
    store.setHtmlContent('<p>Hello</p><script>alert("x")</script>', "html", { transactionId: "tx-html" });

    const state = useEditorStore.getState();
    expect(state.previewHtml).toContain("<p>Hello</p>");
    expect(state.previewHtml).not.toContain("<script>");
  });
});
