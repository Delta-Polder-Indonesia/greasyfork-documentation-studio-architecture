import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";

export function MarkdownEditor() {
  const markdown = useEditorStore((s) => s.markdown);
  const setMarkdown = useEditorStore((s) => s.setMarkdown);
  const [draft, setDraft] = useState(markdown);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(markdown);
  }, [markdown]);

  const commitDraft = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setMarkdown(value);
      }, 300);
    },
    [setMarkdown],
  );

  return (
    <div className="h-full p-4">
      <textarea
        data-testid="editor-markdown"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          commitDraft(e.target.value);
        }}
        onBlur={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          if (draft !== markdown) setMarkdown(draft);
        }}
        className="h-full w-full resize-none rounded-xl border border-slate-700 bg-slate-950/80 p-4 font-mono text-sm leading-relaxed text-slate-100 outline-none ring-indigo-400/40 transition focus:ring"
        style={{ maxWidth: 980, margin: "0 auto", display: "block" }}
        spellCheck
      />
    </div>
  );
}
