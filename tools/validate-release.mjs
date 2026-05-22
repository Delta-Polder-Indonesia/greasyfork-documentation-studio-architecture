import fs from "node:fs";

function latestReleaseCheck() {
  const files = fs.existsSync("release-checks") ? fs.readdirSync("release-checks").filter((item) => item.endsWith(".json")) : [];
  if (!files.length) throw new Error("No release-check artifact found in release-checks/");
  return `release-checks/${files.sort().at(-1)}`;
}

const releaseCheck = JSON.parse(fs.readFileSync(latestReleaseCheck(), "utf-8"));

if (!releaseCheck.strictGate?.pass) {
  const blockers = (releaseCheck.strictGate?.blockers ?? []).join(", ");
  throw new Error(`Release gate blocked: ${blockers}`);
}

if (releaseCheck.corruptedSnapshotDetected) {
  throw new Error("Release blocked: corrupted snapshot detected.");
}

if (!releaseCheck.recoveryTestPass) {
  throw new Error("Release blocked: recovery test failed.");
}

console.log("Release validation passed.");
