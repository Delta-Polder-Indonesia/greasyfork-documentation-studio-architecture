import { spawnSync } from "node:child_process";

const task = process.argv[2];

const map = {
  "validate:release": "tools/validate-release.mjs",
  "validate:reliability": "tools/validate-reliability.mjs",
  "validate:performance": "tools/validate-performance.mjs",
  "validate:artifacts": "tools/validate-artifacts.mjs",
};

if (!task || !(task in map)) {
  console.error("Usage: node tools/run-validation.mjs <validate:release|validate:reliability|validate:performance|validate:artifacts>");
  process.exit(1);
}

const result = spawnSync("node", [map[task]], { stdio: "inherit" });
process.exit(result.status ?? 1);
