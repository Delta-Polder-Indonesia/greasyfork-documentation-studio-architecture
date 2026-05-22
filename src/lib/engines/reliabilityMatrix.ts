import { parserEngine } from "@/lib/engines/parserEngine";
import { getRuntimeMetrics } from "@/lib/engines/runtimeMetrics";

export interface ReliabilityCaseResult {
  name: string;
  size: string;
  markdownToHtmlMs: number;
  htmlToMarkdownMs: number;
  warningCount: number;
}

export interface ReliabilityBenchmark {
  cases: ReliabilityCaseResult[];
  undoRedoSimulationMs: number;
  typingLatencyMs: number;
  typingLatencyP95Ms: number;
  typingLatencyAvgMs: number;
  previewRenderTimingMs: number;
  previewRenderP95Ms: number;
  transactionTimingMs: number;
  transactionP95Ms: number;
  historyMemoryKb: number;
  rerenderCount: number;
  rerenderSpikeDetected: boolean;
  historyStackSize: number;
  memoryGrowthMb: number;
}

function percentile(values: number[], percentileRank: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((percentileRank / 100) * sorted.length) - 1);
  return sorted[index] ?? 0;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((acc, item) => acc + item, 0) / values.length;
}

function measure<T>(fn: () => T) {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
}

function generateMarkdown(lines = 500) {
  const chunk = "- item content for benchmark\n";
  return `# Markdown Benchmark\n\n${chunk.repeat(lines)}`;
}

function generateNestedTable() {
  return `<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td><table><tbody><tr><td>nested</td></tr></tbody></table></td></tr></tbody></table>`;
}

function generateCodeBlock() {
  const lines = Array.from({ length: 200 }, (_, i) => `const v${i} = ${i};`).join("\n");
  return `# Code\n\n\`\`\`javascript\n${lines}\n\`\`\``;
}

function generateMedia() {
  return Array.from(
    { length: 4 },
    (_, i) => `<iframe src="https://www.youtube.com/embed/abc?start=${i}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`,
  ).join("\n\n");
}

function generateDetails() {
  return `<details open><summary>L1</summary><details open><summary>L2</summary><p>Content</p></details></details>`;
}

function runCase(name: string, markdown: string): ReliabilityCaseResult {
  const htmlConversion = measure(() => parserEngine.markdownToHtml(markdown));
  const mdConversion = measure(() => parserEngine.htmlToMarkdown(htmlConversion.result.html));
  return {
    name,
    size: `${Math.round(markdown.length / 1024)} KB`,
    markdownToHtmlMs: Number(htmlConversion.duration.toFixed(2)),
    htmlToMarkdownMs: Number(mdConversion.duration.toFixed(2)),
    warningCount: htmlConversion.result.warnings.length + mdConversion.result.warnings.length,
  };
}

function getMemoryUsedMb() {
  const mem = performance as Performance & { memory?: { usedJSHeapSize?: number } };
  if (!mem.memory?.usedJSHeapSize) return 0;
  return mem.memory.usedJSHeapSize / 1024 / 1024;
}

export function runReliabilityMatrix(historyStackSize: number): ReliabilityBenchmark {
  const beforeMemory = getMemoryUsedMb();

  const undoRedoSim = measure(() => {
    const stack = Array.from({ length: 80 }, (_, i) => `snap-${i}`);
    const future: string[] = [];
    for (let i = 0; i < 40; i++) { const p = stack.pop(); if (p) future.unshift(p); }
    for (let i = 0; i < 40; i++) { const n = future.shift(); if (n) stack.push(n); }
    return stack.length;
  });

  const cases: ReliabilityCaseResult[] = [
    runCase("Markdown file", generateMarkdown(500)),
    runCase("Large markdown file", generateMarkdown(1500)),
    runCase("Nested tables", generateNestedTable()),
    runCase("Large code blocks", generateCodeBlock()),
    runCase("Multiple iframe embeds", generateMedia()),
    runCase("Details/summary nesting", generateDetails()),
    runCase("Sanitizer stress test", `${generateMedia()}\n${generateNestedTable()}\n<script>alert(1)</script>`),
  ];

  const afterMemory = getMemoryUsedMb();
  const runtime = getRuntimeMetrics();

  return {
    cases,
    undoRedoSimulationMs: Number(undoRedoSim.duration.toFixed(2)),
    typingLatencyMs: Number(runtime.lastTypingLatencyMs.toFixed(2)),
    typingLatencyP95Ms: Number(percentile(runtime.typingLatencySeries, 95).toFixed(2)),
    typingLatencyAvgMs: Number(average(runtime.typingLatencySeries).toFixed(2)),
    previewRenderTimingMs: Number(runtime.lastPreviewRenderMs.toFixed(2)),
    previewRenderP95Ms: Number(percentile(runtime.previewRenderSeries, 95).toFixed(2)),
    transactionTimingMs: Number(runtime.lastTransactionMs.toFixed(2)),
    transactionP95Ms: Number(percentile(runtime.transactionSeries, 95).toFixed(2)),
    historyMemoryKb: Number(runtime.historyMemoryKb.toFixed(2)),
    rerenderCount: runtime.editorRenderCount + runtime.previewRenderCount,
    rerenderSpikeDetected: runtime.rerenderSpikeDetected,
    historyStackSize,
    memoryGrowthMb: Number(Math.max(0, afterMemory - beforeMemory).toFixed(2)),
  };
}
