import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const evalFiles = [
  "evals/eval-pacing.mjs",
  "evals/eval-hook.mjs",
  "evals/eval-compliance.mjs",
];

console.log("📈 RUNNING AUTOMATED PRODUCTION EVALUATIONS...");
let allPassed = true;

for (const ef of evalFiles) {
  console.log(`\n▶ [EVAL] ${ef}`);
  const res = spawnSync(process.execPath, [path.join(root, ef)], {
    stdio: "inherit",
    cwd: root,
  });
  if (res.status !== 0) {
    allPassed = false;
    console.error(`❌ Eval Failed: ${ef}`);
  }
}

if (!allPassed) {
  console.error("\n❌ ONE OR MORE EVALUATIONS FAILED.");
  process.exit(1);
} else {
  console.log("\n🌟 ALL EVALUATIONS PASSED METRICS!");
}
