import { useEffect } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { HtmlEditor } from "@/components/editor/HtmlEditor";
import { Preview } from "@/components/preview/Preview";
import { Toaster } from "react-hot-toast";

export default function App() {
  const mode = useEditorStore((s) => s.mode);
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  return (
    <div className="flex h-screen w-full bg-[#090c13] text-slate-100">
      {sidebarOpen && <Sidebar />}

      <div className="flex min-w-0 flex-1 flex-col">
        <Toolbar />

        <main className="relative min-h-0 flex-1 overflow-hidden">
          {mode === "markdown" && <MarkdownEditor />}
          {mode === "html" && <HtmlEditor />}
          {mode === "preview" && <Preview />}
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: "#0f172a", color: "#e2e8f0", border: "1px solid #334155" },
        }}
      />
    </div>
  );
}
