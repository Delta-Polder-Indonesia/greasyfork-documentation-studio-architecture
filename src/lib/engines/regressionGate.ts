import { appVersion } from "@/app/version";
import { createCommitStyleId } from "@/lib/config/runtimeProfile";
import type { HarnessReport, RegressionSnapshot } from "@/lib/engines/automatedReliabilityHarness";
import { createHarnessSummary, toRegressionSnapshot, updateRegressionHistory } from "@/lib/engines/automatedReliabilityHarness";

const REPORT_HISTORY_KEY = "gf-doc-studio-regression-history-v1";

export interface RegressionTrend {
  direction: "improved" | "stable" | "degraded";
  delta: number;
}

function parseSnapshotHistory(raw: string | null): RegressionSnapshot[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as RegressionSnapshot[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.reliabilityScore === "number" && typeof item.generatedAt === "string" && typeof item.regressionFingerprint === "string",
    );
  } catch {
    return [];
  }
}

export function loadRegressionHistory(): RegressionSnapshot[] {
  if (typeof window === "undefined") return [];
  return parseSnapshotHistory(window.localStorage.getItem(REPORT_HISTORY_KEY));
}

export function persistRegressionReport(report: HarnessReport) {
  if (typeof window === "undefined") return;
  const history = loadRegressionHistory();
  const nextHistory = updateRegressionHistory(history, toRegressionSnapshot(report));
  window.localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(nextHistory));
}

export function detectTrend(current: HarnessReport, history: RegressionSnapshot[]): RegressionTrend {
  const prev = history[history.length - 1];
  if (!prev) {
    return { direction: "stable", delta: 0 };
  }

  const delta = Number((current.reliabilityScore - prev.reliabilityScore).toFixed(2));
  if (delta > 1.5) return { direction: "improved", delta };
  if (delta < -1.5) return { direction: "degraded", delta };
  return { direction: "stable", delta };
}

export function toSparklines(history: RegressionSnapshot[], current: HarnessReport) {
  const values = [...history.map((item) => item.reliabilityScore), current.reliabilityScore];
  const bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  return values
    .map((value) => {
      const normalized = (value - min) / range;
      const index = Math.min(bars.length - 1, Math.round(normalized * (bars.length - 1)));
      return bars[index];
    })
    .join("");
}

function formatTimestampForFilename(iso: string) {
  return iso.replace(/[:]/g, "-").replace(/\..+$/, "");
}

export function createArtifactBaseName(report: HarnessReport) {
  const environment = report.environment;
  const ts = formatTimestampForFilename(report.generatedAt);
  const version = appVersion.version.replace(/[^a-zA-Z0-9.-]/g, "-");
  const id = createCommitStyleId();
  return `reliability-report-v${version}-${environment}-${ts}-${id}`;
}

export function createArtifactFileMap(baseName: string) {
  return {
    reportJson: `reports/${baseName}.json`,
    summaryMarkdown: `reports/${baseName}.md`,
    benchmarkHistory: `benchmarks/${baseName}-history.json`,
    snapshot: `snapshots/${baseName}-snapshot.json`,
    releaseCheck: `release-checks/${baseName}-release-check.json`,
  };
}

export function createMachineReadableReport(report: HarnessReport, trend: RegressionTrend, history: RegressionSnapshot[]) {
  return JSON.stringify(
    {
      ...report,
      trend,
      history,
    },
    null,
    2,
  );
}

export function createRegressionSnapshotArtifact(report: HarnessReport) {
  return JSON.stringify(toRegressionSnapshot(report), null, 2);
}

export function createBenchmarkHistoryArtifact(history: RegressionSnapshot[]) {
  return JSON.stringify({ history }, null, 2);
}

export function createHumanReadableReport(report: HarnessReport, trend: RegressionTrend, history: RegressionSnapshot[]) {
  const sparkline = toSparklines(history, report);
  return `${createHarnessSummary(report)}\nTrend: ${trend.direction} (${trend.delta})\nReliability trend: ${sparkline}`;
}
