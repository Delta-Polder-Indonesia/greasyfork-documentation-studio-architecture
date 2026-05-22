import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";

export function HtmlEditor() {
  const html = useEditorStore((s) => s.html);
  const setHtml = useEditorStore((s) => s.setHtml);
  const [draft, setDraft] = useState(html);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(html);
  }, [html]);

  const commitDraft = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setHtml(value);
      }, 300);
    },
    [setHtml],
  );

  return (
    <div className="h-full p-4">
      <textarea
        data-testid="editor-html"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          commitDraft(e.target.value);
        }}
        onBlur={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          if (draft !== html) setHtml(draft);
        }}
        className="h-full w-full resize-none rounded-xl border border-slate-700 bg-slate-950/80 p-4 font-mono text-sm leading-relaxed text-slate-100 outline-none ring-indigo-400/40 transition focus:ring"
        style={{ maxWidth: 980, margin: "0 auto", display: "block" }}
      />
    </div>
  );
}
