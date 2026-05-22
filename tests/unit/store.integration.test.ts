import { describe, expect, it, beforeEach } from "vitest";
import { useEditorStore } from "@/store/useEditorStore";

function resetStore() {
  useEditorStore.setState({
    markdown: "initial",
    html: "<p>initial</p>",
    previewHtml: "<p>initial</p>",
    warnings: [],
  });
}

describe("editor store integration", () => {
  beforeEach(() => {
    resetStore();
  });

  it("updates markdown and syncs html", () => {
    const store = useEditorStore.getState();
    store.setMarkdown("# Hello");

    const state = useEditorStore.getState();
    expect(state.markdown).toBe("# Hello");
    expect(state.html).toContain("<h1>");
    expect(state.previewHtml).toContain("<h1>");
  });

  it("maintains undo redo integrity", () => {
    const store = useEditorStore.getState();
    store.setMarkdown("v1");
    store.setMarkdown("v2");

    store.undo();
    expect(useEditorStore.getState().markdown).toBe("v1");

    store.redo();
    expect(useEditorStore.getState().markdown).toBe("v2");
  });

  it("keeps preview sanitized after HTML update", () => {
    const store = useEditorStore.getState();
    store.setHtml('<p>Hello</p><script>alert("x")</script>');

    const state = useEditorStore.getState();
    expect(state.previewHtml).toContain("Hello");
    expect(state.previewHtml).not.toContain("<script>");
  });
});
