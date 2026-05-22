import { Code2, Eye, FileText, PanelLeft, Redo2, Undo2, Download } from "lucide-react";
import toast from "react-hot-toast";
import { useEditorStore, type EditorMode } from "@/store/useEditorStore";
import { Button } from "@/components/ui/button";
import { downloadTextFile } from "@/utils/file";

const modes: { value: EditorMode; label: string; icon: typeof FileText }[] = [
  { value: "markdown", label: "Markdown", icon: FileText },
  { value: "html", label: "HTML", icon: Code2 },
  { value: "preview", label: "Preview", icon: Eye },
];

export function Toolbar() {
  const mode = useEditorStore((s) => s.mode);
  const setMode = useEditorStore((s) => s.setMode);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);

  return (
    <header className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/80 px-3 py-2 backdrop-blur">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} title="Toggle docs sidebar">
        <PanelLeft className={`h-4 w-4 ${sidebarOpen ? "text-slate-100" : "text-slate-500"}`} />
      </Button>

      <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900 p-1">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              mode === m.value ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <m.icon className="h-3.5 w-3.5" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="mx-1 h-6 w-px bg-slate-700" />

      <Button variant="ghost" size="icon" onClick={undo} title="Undo (Ctrl+Z)">
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={redo} title="Redo (Ctrl+Y)">
        <Redo2 className="h-4 w-4" />
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const { markdown } = useEditorStore.getState();
            downloadTextFile("greasyfork-doc.md", markdown, "text/markdown;charset=utf-8");
            toast.success("Markdown exported");
          }}
        >
          <Download className="h-4 w-4" />
          Export MD
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const { html } = useEditorStore.getState();
            downloadTextFile("greasyfork-doc.html", html, "text/html;charset=utf-8");
            toast.success("HTML exported");
          }}
        >
          <Download className="h-4 w-4" />
          Export HTML
        </Button>
      </div>
    </header>
  );
}
