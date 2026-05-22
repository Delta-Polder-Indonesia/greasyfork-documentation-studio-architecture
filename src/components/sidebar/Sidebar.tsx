import { ChevronDown, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { tagDocs } from "@/data/tagDocs";
import { useEditorStore } from "@/store/useEditorStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const [query, setQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ Headings: true, "Text Blocks": true });
  const mode = useEditorStore((s) => s.mode);
  const setMarkdown = useEditorStore((s) => s.setMarkdown);
  const setHtml = useEditorStore((s) => s.setHtml);
  const markdown = useEditorStore((s) => s.markdown);
  const html = useEditorStore((s) => s.html);

  const grouped = useMemo(() => {
    const q = query.toLowerCase();
    const filtered = tagDocs.filter(
      (d) => d.tag.includes(q) || d.description.toLowerCase().includes(q) || d.attributes.some((a) => a.includes(q)),
    );
    return filtered.reduce<Record<string, typeof tagDocs>>((acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    }, {});
  }, [query]);

  const insertSnippet = (snippet: string) => {
    if (mode === "markdown") {
      setMarkdown(markdown + "\n" + snippet);
    } else {
      setHtml(html + "\n" + snippet);
    }
  };

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <aside className="flex h-full w-[340px] flex-col border-r border-slate-800 bg-slate-950/90">
      <div className="border-b border-slate-800 px-3 py-3">
        <p className="text-sm font-semibold text-slate-100">GreasyFork Tags</p>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tags..." className="pl-9" />
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {Object.entries(grouped).map(([cat, docs]) => {
          const isOpen = openCategories[cat] ?? true;
          return (
            <div key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-2 text-left text-sm text-slate-200"
              >
                <span>{cat} <span className="text-slate-500">({docs.length})</span></span>
                <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="mt-2 space-y-2">
                  {docs.map((doc) => (
                    <div key={doc.tag} className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">&lt;{doc.tag}&gt;</p>
                          <p className="text-xs text-slate-400">{doc.description}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => insertSnippet(doc.snippet)}>
                          <Plus className="h-3.5 w-3.5" /> Insert
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {doc.attributes.length ? doc.attributes.map((a) => <Badge key={a}>{a}</Badge>) : <Badge>no attrs</Badge>}
                      </div>
                      <div className="mt-2 rounded-md bg-black/40 p-2 font-mono text-xs text-slate-300">{doc.example}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
