import type { HarnessReport } from "@/lib/engines/automatedReliabilityHarness";
import { evaluateStrictCiGate } from "@/lib/engines/strictCiGate";

export interface ReleaseChecklistStatus {
  buildPass: boolean;
  unitTestsPass: boolean;
  e2eTestsPass: boolean;
  reliabilityGatePass: boolean;
  noCriticalRegressions: boolean;
}

export interface ReleaseConfidence {
  readinessScore: number;
  confidenceScore: number;
  blockers: string[];
}

export function computeReleaseConfidence(report: HarnessReport, checklist: ReleaseChecklistStatus): ReleaseConfidence {
  const blockers: string[] = [];
  const strictGate = evaluateStrictCiGate(report);

  if (!checklist.buildPass) blockers.push("Build check failed");
  if (!checklist.unitTestsPass) blockers.push("Unit tests not passing");
  if (!checklist.e2eTestsPass) blockers.push("E2E tests not passing");
  if (!checklist.reliabilityGatePass || !report.pass) blockers.push("Reliability gate failed");
  if (!checklist.noCriticalRegressions || report.strictFailureTriggered) blockers.push("Critical scenario regression detected");
  if (!strictGate.pass) blockers.push(...strictGate.blockers);

  const readinessScore = Math.max(0, Number((report.reliabilityScore - blockers.length * 12).toFixed(2)));
  const confidenceScore = Math.max(0, Number((report.confidenceScore - blockers.length * 8).toFixed(2)));

  return {
    readinessScore,
    confidenceScore,
    blockers,
  };
}
