import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import { useEditorStore } from "@/store/useEditorStore";
import { Badge } from "@/components/ui/badge";

export function Preview() {
  const previewHtml = useEditorStore((s) => s.previewHtml);
  const warnings = useEditorStore((s) => s.warnings);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    Prism.highlightAllUnder(ref.current);
  }, [previewHtml]);

  return (
    <div className="h-full overflow-auto px-6 py-5">
      <div className="mx-auto mb-3 flex max-w-4xl items-center justify-between">
        <p className="text-sm text-slate-300">Preview — Sanitized GreasyFork HTML</p>
        <Badge className={warnings.length ? "border-amber-700 text-amber-300" : "border-emerald-700 text-emerald-300"}>
          {warnings.length ? `${warnings.length} warning` : "Validator pass"}
        </Badge>
      </div>

      <div
        ref={ref}
        className="prose prose-invert mx-auto max-w-4xl rounded-xl border border-slate-700 bg-slate-950/70 px-8 py-8"
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />

      {warnings.length > 0 && (
        <div className="mx-auto mt-4 max-w-4xl space-y-1 rounded-xl border border-amber-700/40 bg-amber-950/20 p-4 text-xs text-amber-100">
          {warnings.slice(0, 12).map((w, i) => (
            <p key={`${w.message}-${i}`}>- {w.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}
