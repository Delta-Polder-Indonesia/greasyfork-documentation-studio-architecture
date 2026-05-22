import { reliabilityBaseline } from "@/data/reliabilityBaseline";
import type { HarnessReport } from "@/lib/engines/automatedReliabilityHarness";

export interface StrictGateResult {
  pass: boolean;
  blockers: string[];
}

export function evaluateStrictCiGate(report: HarnessReport): StrictGateResult {
  const blockers: string[] = [];

  if (report.environment === "ci") {
    if (report.strictFailureTriggered) {
      blockers.push("Critical scenario regression detected.");
    }
    if (report.flakyDetected) {
      blockers.push("Flaky detection triggered in CI strict mode.");
    }
    if (report.unstableBenchmarkDetected) {
      blockers.push("Unstable benchmark detected in CI strict mode.");
    }
  }

  if (report.confidenceScore < reliabilityBaseline.minConfidenceScore) {
    blockers.push(`Confidence score below threshold (${reliabilityBaseline.minConfidenceScore}).`);
  }
  if (report.reliabilityScore < reliabilityBaseline.minReliabilityScore) {
    blockers.push(`Reliability score below threshold (${reliabilityBaseline.minReliabilityScore}).`);
  }

  if (report.benchmarkDelta.typingP95Delta > reliabilityBaseline.maxNegativeDeltaMs) {
    blockers.push("Typing p95 degraded beyond delta threshold.");
  }
  if (report.benchmarkDelta.previewP95Delta > reliabilityBaseline.maxNegativeDeltaMs) {
    blockers.push("Preview p95 degraded beyond delta threshold.");
  }
  if (report.benchmarkDelta.transactionP95Delta > reliabilityBaseline.maxNegativeDeltaMs) {
    blockers.push("Transaction p95 degraded beyond delta threshold.");
  }

  return {
    pass: blockers.length === 0,
    blockers,
  };
}
