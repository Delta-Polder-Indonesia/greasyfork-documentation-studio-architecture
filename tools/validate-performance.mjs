import fs from "node:fs";

function latestReportFile() {
  const files = fs.existsSync("reports") ? fs.readdirSync("reports").filter((item) => item.endsWith(".json")) : [];
  if (!files.length) throw new Error("No JSON report artifact found in reports/");
  return `reports/${files.sort().at(-1)}`;
}

const report = JSON.parse(fs.readFileSync(latestReportFile(), "utf-8"));

if (report.benchmark.rerenderSpikeDetected) {
  throw new Error("Rerender spike detected in benchmark.");
}

if (report.benchmark.historyMemoryKb > 10_500) {
  throw new Error("History memory exceeded hard guardrail.");
}

if (report.benchmark.transactionP95Ms > 170) {
  throw new Error("Transaction p95 exceeded performance guardrail.");
}

console.log("Performance validation passed.");
