import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runAutomatedReliabilityHarness } from "@/lib/engines/automatedReliabilityHarness";
import {
  createArtifactBaseName,
  createArtifactFileMap,
  createBenchmarkHistoryArtifact,
  createHumanReadableReport,
  createMachineReadableReport,
  createRegressionSnapshotArtifact,
} from "@/lib/engines/regressionGate";
import { evaluateStrictCiGate } from "@/lib/engines/strictCiGate";

describe("artifact generation", () => {
  it("writes standardized reliability artifacts", () => {
    const report = runAutomatedReliabilityHarness(44);
    const trend = { direction: "stable" as const, delta: 0 };
    const baseName = createArtifactBaseName(report);
    const files = createArtifactFileMap(baseName);

    const paths = Object.values(files);
    for (const filePath of paths) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    fs.writeFileSync(files.reportJson, createMachineReadableReport(report, trend, []), "utf-8");
    fs.writeFileSync(files.summaryMarkdown, createHumanReadableReport(report, trend, []), "utf-8");
    fs.writeFileSync(files.benchmarkHistory, createBenchmarkHistoryArtifact([]), "utf-8");
    fs.writeFileSync(files.snapshot, createRegressionSnapshotArtifact(report), "utf-8");
    fs.writeFileSync(
      files.releaseCheck,
      JSON.stringify({
        strictGate: evaluateStrictCiGate(report),
        generatedAt: report.generatedAt,
        corruptedSnapshotDetected: false,
        recoveryTestPass: true,
      }),
      "utf-8",
    );

    expect(fs.existsSync(files.reportJson)).toBe(true);
    expect(fs.existsSync(files.releaseCheck)).toBe(true);
  });
});
