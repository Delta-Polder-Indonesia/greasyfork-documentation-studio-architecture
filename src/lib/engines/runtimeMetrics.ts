import { getEnvironmentProfile } from "@/lib/config/runtimeProfile";

interface RuntimeMetrics {
  editorRenderCount: number;
  previewRenderCount: number;
  lastTypingLatencyMs: number;
  lastPreviewRenderMs: number;
  lastTransactionMs: number;
  historyMemoryKb: number;
  typingLatencySeries: number[];
  previewRenderSeries: number[];
  transactionSeries: number[];
  rerenderSpikeDetected: boolean;
}

const SERIES_LIMIT = 120;

function pushSeriesValue(series: number[], value: number) {
  if (!getEnvironmentProfile().instrumentationEnabled) return;
  series.push(value);
  if (series.length > SERIES_LIMIT) {
    series.shift();
  }
}

const metrics: RuntimeMetrics = {
  editorRenderCount: 0,
  previewRenderCount: 0,
  lastTypingLatencyMs: 0,
  lastPreviewRenderMs: 0,
  lastTransactionMs: 0,
  historyMemoryKb: 0,
  typingLatencySeries: [],
  previewRenderSeries: [],
  transactionSeries: [],
  rerenderSpikeDetected: false,
};

let renderWindowStart = Date.now();
let renderWindowCount = 0;

function trackRenderWindow() {
  const now = Date.now();
  if (now - renderWindowStart > 1500) {
    renderWindowStart = now;
    renderWindowCount = 0;
  }
  renderWindowCount += 1;
  if (renderWindowCount > 280) {
    metrics.rerenderSpikeDetected = true;
  }
}

export function trackEditorRender() {
  if (!getEnvironmentProfile().instrumentationEnabled) return;
  metrics.editorRenderCount += 1;
  trackRenderWindow();
}

export function trackPreviewRender() {
  if (!getEnvironmentProfile().instrumentationEnabled) return;
  metrics.previewRenderCount += 1;
  trackRenderWindow();
}

export function trackTypingLatency(latencyMs: number) {
  if (!getEnvironmentProfile().instrumentationEnabled) return;
  metrics.lastTypingLatencyMs = latencyMs;
  pushSeriesValue(metrics.typingLatencySeries, latencyMs);
}

export function trackPreviewRenderTime(durationMs: number) {
  if (!getEnvironmentProfile().instrumentationEnabled) return;
  metrics.lastPreviewRenderMs = durationMs;
  pushSeriesValue(metrics.previewRenderSeries, durationMs);
}

export function trackTransactionDuration(durationMs: number) {
  if (!getEnvironmentProfile().instrumentationEnabled) return;
  metrics.lastTransactionMs = durationMs;
  pushSeriesValue(metrics.transactionSeries, durationMs);
}

export function trackHistoryMemoryUsage(historyBytes: number) {
  if (!getEnvironmentProfile().instrumentationEnabled) return;
  metrics.historyMemoryKb = Number((historyBytes / 1024).toFixed(2));
}

export function resetRuntimeMetrics() {
  metrics.editorRenderCount = 0;
  metrics.previewRenderCount = 0;
  metrics.lastTypingLatencyMs = 0;
  metrics.lastPreviewRenderMs = 0;
  metrics.lastTransactionMs = 0;
  metrics.historyMemoryKb = 0;
  metrics.typingLatencySeries = [];
  metrics.previewRenderSeries = [];
  metrics.transactionSeries = [];
  metrics.rerenderSpikeDetected = false;
  renderWindowStart = Date.now();
  renderWindowCount = 0;
}

export function getRuntimeMetrics() {
  return { ...metrics };
}
