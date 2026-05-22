import fs from "node:fs";
import path from "node:path";

const requiredDirectories = ["reports", "benchmarks", "snapshots", "release-checks"];

function ensureLatestFile(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Missing directory: ${dir}`);
  }
  const files = fs.readdirSync(dir).filter((item) => item.includes("reliability-report-v"));
  if (!files.length) {
    throw new Error(`No artifacts found in ${dir}`);
  }
  return path.join(dir, files.sort().at(-1));
}

for (const dir of requiredDirectories) {
  ensureLatestFile(dir);
}

console.log("Artifacts validation passed.");
