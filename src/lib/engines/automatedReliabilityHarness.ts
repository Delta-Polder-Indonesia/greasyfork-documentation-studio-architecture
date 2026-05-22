import {
  reliabilityBaseline,
  type ReliabilityThresholds,
  type ScenarioKey,
  type Severity,
} from "@/data/reliabilityBaseline";
import { runReliabilityMatrix, type ReliabilityBenchmark } from "@/lib/engines/reliabilityMatrix";
import { createCommitStyleId, getEnvironmentProfile, type RuntimeEnvironment } from "@/lib/config/runtimeProfile";

export interface HarnessScenarioResult {
  key: ScenarioKey;
  scenario: string;
  pass: boolean;
  metric: number;
  threshold: number;
  baseline: number;
  detail: string;
  weight: number;
  severity: Severity;
  warningLevel: "ok" | "warn" | "critical";
}

export interface BuildHealth {
  score: number;
  grade: "A" | "B" | "C" | "D";
}

export interface BenchmarkDelta {
  typingP95Delta: number;
  previewP95Delta: number;
  transactionP95Delta: number;
  memoryGrowthDelta: number;
}

export interface HarnessReport {
  benchmark: ReliabilityBenchmark;
  pass: boolean;
  passedCount: number;
  failedCount: number;
  scenarios: HarnessScenarioResult[];
  regressions: string[];
  reliabilityScore: number;
  confidenceScore: number;
  buildHealth: BuildHealth;
  summary: string;
  generatedAt: string;
  environment: RuntimeEnvironment;
  strictFailureTriggered: boolean;
  flakyDetected: boolean;
  regressionFingerprint: string;
  benchmarkDelta: BenchmarkDelta;
  unstableBenchmarkDetected: boolean;
}

export interface RegressionSnapshot {
  generatedAt: string;
  reliabilityScore: number;
  confidenceScore: number;
  buildHealthScore: number;
  typingP95: number;
  previewP95: number;
  transactionP95: number;
  memoryGrowthMb: number;
  regressionFingerprint: string;
  environment: RuntimeEnvironment;
}

const SNAPSHOT_HISTORY_LIMIT = 30;

function averageNumber(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((acc, item) => acc + item, 0) / values.length;
}

function stdDev(values: number[]) {
  if (values.length < 2) return 0;
  const mean = averageNumber(values);
  const variance = averageNumber(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function aggregateBenchmarks(benchmarks: ReliabilityBenchmark[]): ReliabilityBenchmark {
  const caseNames = benchmarks[0]?.cases.map((item) => item.name) ?? [];

  const aggregatedCases = caseNames.map((name) => {
    const related = benchmarks.map((benchmark) => benchmark.cases.find((item) => item.name === name)).filter(Boolean);
    if (!related.length) {
      return {
        name,
        size: "0 KB",
        markdownToHtmlMs: 0,
        htmlToMarkdownMs: 0,
        warningCount: 0,
      };
    }

    return {
      name,
      size: related[0]?.size ?? "0 KB",
      markdownToHtmlMs: Number(averageNumber(related.map((item) => item?.markdownToHtmlMs ?? 0)).toFixed(2)),
      htmlToMarkdownMs: Number(averageNumber(related.map((item) => item?.htmlToMarkdownMs ?? 0)).toFixed(2)),
      warningCount: Math.round(averageNumber(related.map((item) => item?.warningCount ?? 0))),
    };
  });

  return {
    cases: aggregatedCases,
    undoRedoSimulationMs: Number(averageNumber(benchmarks.map((item) => item.undoRedoSimulationMs)).toFixed(2)),
    typingLatencyMs: Number(averageNumber(benchmarks.map((item) => item.typingLatencyMs)).toFixed(2)),
    typingLatencyP95Ms: Number(averageNumber(benchmarks.map((item) => item.typingLatencyP95Ms)).toFixed(2)),
    typingLatencyAvgMs: Number(averageNumber(benchmarks.map((item) => item.typingLatencyAvgMs)).toFixed(2)),
    previewRenderTimingMs: Number(averageNumber(benchmarks.map((item) => item.previewRenderTimingMs)).toFixed(2)),
    previewRenderP95Ms: Number(averageNumber(benchmarks.map((item) => item.previewRenderP95Ms)).toFixed(2)),
    transactionTimingMs: Number(averageNumber(benchmarks.map((item) => item.transactionTimingMs)).toFixed(2)),
    transactionP95Ms: Number(averageNumber(benchmarks.map((item) => item.transactionP95Ms)).toFixed(2)),
    historyMemoryKb: Number(averageNumber(benchmarks.map((item) => item.historyMemoryKb)).toFixed(2)),
    rerenderCount: Math.round(averageNumber(benchmarks.map((item) => item.rerenderCount))),
    rerenderSpikeDetected: benchmarks.some((item) => item.rerenderSpikeDetected),
    historyStackSize: Math.round(averageNumber(benchmarks.map((item) => item.historyStackSize))),
    memoryGrowthMb: Number(averageNumber(benchmarks.map((item) => item.memoryGrowthMb)).toFixed(2)),
  };
}

function evaluateScenario(input: {
  key: ScenarioKey;
  benchmarkValue: number;
  detail: string;
  thresholds: ReliabilityThresholds;
}): HarnessScenarioResult {
  const baseline = input.thresholds.scenarios[input.key];
  const dynamicThreshold = Math.max(
    baseline.maxThresholdMs,
    baseline.baselineMs * 1.2,
    baseline.baselineMs + Math.max(10, baseline.baselineMs * 0.2),
  );
  const pass = input.benchmarkValue <= dynamicThreshold;

  let warningLevel: "ok" | "warn" | "critical" = "ok";
  if (!pass && baseline.severity === "critical") {
    warningLevel = "critical";
  } else if (!pass) {
    warningLevel = "warn";
  } else if (input.benchmarkValue > baseline.baselineMs * 1.12) {
    warningLevel = "warn";
  }

  return {
    key: input.key,
    scenario: baseline.label,
    pass,
    metric: Number(input.benchmarkValue.toFixed(2)),
    threshold: Number(dynamicThreshold.toFixed(2)),
    baseline: baseline.baselineMs,
    detail: input.detail,
    weight: baseline.weight,
    severity: baseline.severity,
    warningLevel,
  };
}

function scoreFromScenarios(scenarios: HarnessScenarioResult[]) {
  const totalWeight = scenarios.reduce((acc, item) => acc + item.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedScore = scenarios.reduce((acc, item) => {
    const scenarioScore = item.pass ? 100 : item.severity === "critical" ? 0 : 55;
    return acc + scenarioScore * item.weight;
  }, 0);

  return Number((weightedScore / totalWeight).toFixed(2));
}

function buildHealthFromScore(score: number): BuildHealth {
  if (score >= 92) return { score, grade: "A" };
  if (score >= 82) return { score, grade: "B" };
  if (score >= 70) return { score, grade: "C" };
  return { score, grade: "D" };
}

function detectFlaky(benchmarks: ReliabilityBenchmark[]) {
  if (benchmarks.length < 2) return false;
  const profile = getEnvironmentProfile();
  const typingValues = benchmarks.map((item) => item.typingLatencyP95Ms || item.typingLatencyMs);
  const previewValues = benchmarks.map((item) => item.previewRenderP95Ms || item.previewRenderTimingMs);
  const txValues = benchmarks.map((item) => item.transactionP95Ms || item.transactionTimingMs);

  const typingVarRatio = stdDev(typingValues) / Math.max(1, averageNumber(typingValues));
  const previewVarRatio = stdDev(previewValues) / Math.max(1, averageNumber(previewValues));
  const txVarRatio = stdDev(txValues) / Math.max(1, averageNumber(txValues));

  return Math.max(typingVarRatio, previewVarRatio, txVarRatio) > profile.flakyVarianceTolerance;
}

function detectUnstableBenchmark(benchmarks: ReliabilityBenchmark[], thresholds: ReliabilityThresholds) {
  if (benchmarks.length < 2) return false;
  const typingValues = benchmarks.map((item) => item.typingLatencyP95Ms || item.typingLatencyMs);
  const previewValues = benchmarks.map((item) => item.previewRenderP95Ms || item.previewRenderTimingMs);
  const txValues = benchmarks.map((item) => item.transactionP95Ms || item.transactionTimingMs);

  return (
    stdDev(typingValues) > thresholds.maxNegativeDeltaMs ||
    stdDev(previewValues) > thresholds.maxNegativeDeltaMs ||
    stdDev(txValues) > thresholds.maxNegativeDeltaMs
  );
}

function createBenchmarkDelta(benchmark: ReliabilityBenchmark, previous?: RegressionSnapshot): BenchmarkDelta {
  if (!previous) {
    return {
      typingP95Delta: 0,
      previewP95Delta: 0,
      transactionP95Delta: 0,
      memoryGrowthDelta: 0,
    };
  }

  return {
    typingP95Delta: Number((benchmark.typingLatencyP95Ms - previous.typingP95).toFixed(2)),
    previewP95Delta: Number((benchmark.previewRenderP95Ms - previous.previewP95).toFixed(2)),
    transactionP95Delta: Number((benchmark.transactionP95Ms - previous.transactionP95).toFixed(2)),
    memoryGrowthDelta: Number((benchmark.memoryGrowthMb - previous.memoryGrowthMb).toFixed(2)),
  };
}

function detectRegressions(benchmark: ReliabilityBenchmark, thresholds: ReliabilityThresholds, scenarios: HarnessScenarioResult[]) {
  const regressions: string[] = [];

  if (benchmark.typingLatencyP95Ms > thresholds.maxTypingLatencyP95Ms) {
    regressions.push("Typing latency p95 exceeded baseline threshold.");
  }
  if (benchmark.previewRenderP95Ms > thresholds.maxPreviewRenderP95Ms) {
    regressions.push("Preview render p95 exceeded baseline threshold.");
  }
  if (benchmark.transactionP95Ms > thresholds.maxTransactionP95Ms) {
    regressions.push("Transaction commit p95 exceeded baseline threshold.");
  }
  if (benchmark.historyMemoryKb > thresholds.maxHistoryMemoryKb) {
    regressions.push("History memory usage exceeded baseline threshold.");
  }
  if (benchmark.memoryGrowthMb > thresholds.maxMemoryGrowthMb) {
    regressions.push("Memory growth exceeded baseline threshold.");
  }
  if (benchmark.rerenderCount > thresholds.maxRerenderCount) {
    regressions.push("Rerender count exceeded stress threshold.");
  }
  if (benchmark.rerenderSpikeDetected) {
    regressions.push("Rerender spike detection guard triggered.");
  }

  const criticalFailure = scenarios.some((item) => !item.pass && item.severity === "critical");
  if (criticalFailure) {
    regressions.push("At least one critical scenario failed.");
  }

  return regressions;
}

function confidenceFromReport(score: number, flakyDetected: boolean, regressionsCount: number) {
  let confidence = score;
  if (flakyDetected) confidence -= 18;
  confidence -= regressionsCount * 6;
  return Math.max(0, Number(confidence.toFixed(2)));
}

function createFingerprint(report: {
  benchmark: ReliabilityBenchmark;
  environment: RuntimeEnvironment;
  regressionsCount: number;
}) {
  const payload = [
    report.environment,
    report.benchmark.typingLatencyP95Ms,
    report.benchmark.previewRenderP95Ms,
    report.benchmark.transactionP95Ms,
    report.benchmark.memoryGrowthMb,
    report.regressionsCount,
  ].join("|");
  let hash = 0;
  for (let i = 0; i < payload.length; i += 1) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  return `rg-${Math.abs(hash)}-${createCommitStyleId()}`;
}

export function runAutomatedReliabilityHarness(
  historyStackSize: number,
  thresholds: ReliabilityThresholds = reliabilityBaseline,
  previousSnapshot?: RegressionSnapshot,
): HarnessReport {
  const profile = getEnvironmentProfile();
  const samples = Array.from({ length: profile.sampleRuns }, () => runReliabilityMatrix(historyStackSize));
  const benchmark = aggregateBenchmarks(samples);
  const flakyDetected = detectFlaky(samples);
  const unstableBenchmarkDetected = detectUnstableBenchmark(samples, thresholds);

  const hugeMarkdownCase = benchmark.cases.find((item) => item.name === "Large markdown file") ?? benchmark.cases[0];
  const sanitizeCase = benchmark.cases.find((item) => item.name === "Sanitizer stress test") ?? benchmark.cases[0];
  const pasteCase = benchmark.cases.find((item) => item.name === "Large code blocks") ?? benchmark.cases[0];

  const scenarios = [
    evaluateScenario({
      key: "typing_stress",
      benchmarkValue: benchmark.typingLatencyP95Ms || benchmark.typingLatencyMs,
      detail: "p95 typing latency across interactive session",
      thresholds,
    }),
    evaluateScenario({
      key: "huge_markdown",
      benchmarkValue: Math.max(hugeMarkdownCase.markdownToHtmlMs, hugeMarkdownCase.htmlToMarkdownMs),
      detail: `conversion throughput for ${hugeMarkdownCase.name}`,
      thresholds,
    }),
    evaluateScenario({
      key: "rapid_undo_redo",
      benchmarkValue: benchmark.undoRedoSimulationMs,
      detail: "undo/redo loop responsiveness",
      thresholds,
    }),
    evaluateScenario({
      key: "sanitize_loops",
      benchmarkValue: sanitizeCase.htmlToMarkdownMs + sanitizeCase.markdownToHtmlMs,
      detail: "repeated sanitization and parse round-trip",
      thresholds,
    }),
    evaluateScenario({
      key: "massive_paste",
      benchmarkValue: pasteCase.markdownToHtmlMs,
      detail: "large block paste conversion timing",
      thresholds,
    }),
    evaluateScenario({
      key: "preview_rerender_stress",
      benchmarkValue: benchmark.previewRenderP95Ms || benchmark.previewRenderTimingMs,
      detail: "preview render under repeated updates",
      thresholds,
    }),
    evaluateScenario({
      key: "autosave_recovery",
      benchmarkValue: benchmark.transactionP95Ms || benchmark.transactionTimingMs,
      detail: "transaction timing representative for autosave recovery cycle",
      thresholds,
    }),
  ];

  const regressions = detectRegressions(benchmark, thresholds, scenarios);
  if (flakyDetected) {
    regressions.push("Flaky detection guard triggered due to high sample variance.");
  }
  if (unstableBenchmarkDetected) {
    regressions.push("Unstable benchmark detection triggered due to wide timing spread.");
  }

  const reliabilityScore = scoreFromScenarios(scenarios);
  const confidenceScore = confidenceFromReport(reliabilityScore, flakyDetected, regressions.length);
  const buildHealth = buildHealthFromScore(reliabilityScore);
  const strictFailureTriggered = profile.strictCriticalFailures && scenarios.some((item) => !item.pass && item.severity === "critical");
  const minimumScoreFailure = reliabilityScore < thresholds.minReliabilityScore || confidenceScore < thresholds.minConfidenceScore;

  const softWarningFailures = scenarios.filter((item) => !item.pass && item.severity === "non_critical").length;
  const failedCount =
    strictFailureTriggered || !profile.allowSoftWarnings
      ? scenarios.filter((item) => !item.pass).length + regressions.length + (minimumScoreFailure ? 1 : 0)
      : regressions.length + (minimumScoreFailure ? 1 : 0);
  const pass = strictFailureTriggered
    ? false
    : profile.allowSoftWarnings
      ? regressions.length === 0 && !minimumScoreFailure
      : failedCount === 0 && !flakyDetected;

  const benchmarkDelta = createBenchmarkDelta(benchmark, previousSnapshot);
  const regressionFingerprint = createFingerprint({
    benchmark,
    environment: profile.environment,
    regressionsCount: regressions.length,
  });

  return {
    benchmark,
    pass,
    passedCount: scenarios.filter((item) => item.pass).length,
    failedCount,
    scenarios,
    regressions,
    reliabilityScore,
    confidenceScore,
    buildHealth,
    summary: `${buildHealth.grade} health (${buildHealth.score}) | confidence ${confidenceScore} | soft warnings ${softWarningFailures}`,
    generatedAt: new Date().toISOString(),
    environment: profile.environment,
    strictFailureTriggered,
    flakyDetected,
    regressionFingerprint,
    benchmarkDelta,
    unstableBenchmarkDetected,
  };
}

export function toRegressionSnapshot(report: HarnessReport): RegressionSnapshot {
  return {
    generatedAt: report.generatedAt,
    reliabilityScore: report.reliabilityScore,
    confidenceScore: report.confidenceScore,
    buildHealthScore: report.buildHealth.score,
    typingP95: report.benchmark.typingLatencyP95Ms,
    previewP95: report.benchmark.previewRenderP95Ms,
    transactionP95: report.benchmark.transactionP95Ms,
    memoryGrowthMb: report.benchmark.memoryGrowthMb,
    regressionFingerprint: report.regressionFingerprint,
    environment: report.environment,
  };
}

export function updateRegressionHistory(history: RegressionSnapshot[], next: RegressionSnapshot) {
  const merged = [...history, next];
  if (merged.length > SNAPSHOT_HISTORY_LIMIT) {
    return merged.slice(merged.length - SNAPSHOT_HISTORY_LIMIT);
  }
  return merged;
}

export function createHarnessSummary(report: HarnessReport) {
  const criticalCount = report.scenarios.filter((item) => item.warningLevel === "critical").length;
  const nonCriticalCount = report.scenarios.filter((item) => item.warningLevel === "warn").length;
  return [
    `Reliability Report ${report.generatedAt}`,
    `Environment: ${report.environment}`,
    `Status: ${report.pass ? "PASS" : "FAIL"}`,
    `Score: ${report.reliabilityScore}`,
    `Confidence: ${report.confidenceScore}`,
    `Build Health: ${report.buildHealth.grade} (${report.buildHealth.score})`,
    `Fingerprint: ${report.regressionFingerprint}`,
    `Critical warnings: ${criticalCount}`,
    `Non-critical warnings: ${nonCriticalCount}`,
    `Regressions: ${report.regressions.length}`,
  ].join("\n");
}
