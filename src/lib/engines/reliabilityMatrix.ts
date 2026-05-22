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

function generateLargeMarkdown(lines = 10000) {
  const chunk = "- item content for long session stability and typing benchmark\n";
  return `# Large Markdown\n\n${chunk.repeat(lines)}`;
}

function generateNestedTableMarkdown() {
  return `# Nested Table-like Structures\n\n<table><thead><tr><th>Section</th><th>Content</th></tr></thead><tbody><tr><td>Main</td><td><table><tbody><tr><td>Nested</td></tr></tbody></table></td></tr></tbody></table>`;
}

function generateLargeCodeMarkdown() {
  const codeLines = Array.from({ length: 1500 }, (_, index) => `const line${index} = ${index};`).join("\n");
  return `# Large Code\n\n\`\`\`javascript\n${codeLines}\n\`\`\``;
}

function generateMediaMarkdown() {
  return `# Media Stress\n\n${Array.from(
    { length: 12 },
    (_, i) => `<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?start=${i}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`,
  ).join("\n\n")}`;
}

function generateDetailsMarkdown() {
  return `# Details Nesting\n\n<details open><summary>Level 1</summary><details open><summary>Level 2</summary><details open><summary>Level 3</summary><p>Nested content.</p></details></details></details>`;
}

function runCase(name: string, markdown: string): ReliabilityCaseResult {
  const htmlConversion = measure(() => parserEngine.markdownToHtml(markdown));
  const markdownConversion = measure(() => parserEngine.htmlToMarkdown(htmlConversion.result.html));
  return {
    name,
    size: `${Math.round(markdown.length / 1024)} KB`,
    markdownToHtmlMs: Number(htmlConversion.duration.toFixed(2)),
    htmlToMarkdownMs: Number(markdownConversion.duration.toFixed(2)),
    warningCount: htmlConversion.result.warnings.length + markdownConversion.result.warnings.length,
  };
}

function getMemoryUsedMb() {
  const maybeMemory = performance as Performance & { memory?: { usedJSHeapSize?: number } };
  if (!maybeMemory.memory?.usedJSHeapSize) {
    return 0;
  }
  return maybeMemory.memory.usedJSHeapSize / 1024 / 1024;
}

export function runReliabilityMatrix(historyStackSize: number): ReliabilityBenchmark {
  const beforeMemory = getMemoryUsedMb();

  const undoRedoSimulation = measure(() => {
    const stack = Array.from({ length: 120 }, (_, idx) => `snapshot-${idx}`);
    const future: string[] = [];
    for (let i = 0; i < 80; i += 1) {
      const prev = stack.pop();
      if (prev) future.unshift(prev);
    }
    for (let i = 0; i < 80; i += 1) {
      const next = future.shift();
      if (next) stack.push(next);
    }
    return stack.length;
  });

  const cases: ReliabilityCaseResult[] = [
    runCase("10k+ lines", generateLargeMarkdown(10000)),
    runCase("Large markdown file", generateLargeMarkdown(12000)),
    runCase("Nested tables", generateNestedTableMarkdown()),
    runCase("Large code blocks", generateLargeCodeMarkdown()),
    runCase("Multiple iframe embeds", generateMediaMarkdown()),
    runCase("Details/summary nesting", generateDetailsMarkdown()),
    runCase("Sanitizer stress test", `${generateMediaMarkdown()}\n${generateNestedTableMarkdown()}\n<script>alert(1)</script>`),
  ];

  const afterMemory = getMemoryUsedMb();
  const runtime = getRuntimeMetrics();

  return {
    cases,
    undoRedoSimulationMs: Number(undoRedoSimulation.duration.toFixed(2)),
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
