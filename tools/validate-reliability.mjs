import fs from "node:fs";

function latestReportFile() {
  const files = fs.existsSync("reports") ? fs.readdirSync("reports").filter((item) => item.endsWith(".json")) : [];
  if (!files.length) throw new Error("No JSON report artifact found in reports/");
  return `reports/${files.sort().at(-1)}`;
}

const report = JSON.parse(fs.readFileSync(latestReportFile(), "utf-8"));

if (!report.pass) {
  throw new Error("Reliability gate failed.");
}

if (report.strictFailureTriggered) {
  throw new Error("Critical regression triggered strict failure.");
}

if (report.flakyDetected && report.environment === "ci") {
  throw new Error("Flaky detection is not allowed in CI strict mode.");
}

console.log("Reliability validation passed.");
