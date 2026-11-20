import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const testFiles = [
  "tests/spec.test.mjs",
  "tests/syntax.test.mjs",
  "tests/review-state.test.mjs",
  "tests/server.test.mjs",
];

console.log("🧪 RUNNING COMPREHENSIVE TEST SUITE...");
let allPassed = true;

for (const tf of testFiles) {
  console.log(`\n▶ [TEST] ${tf}`);
  const res = spawnSync(process.execPath, ["--test", path.join(root, tf)], {
    stdio: "inherit",
    cwd: root,
  });
  if (res.status !== 0) {
    allPassed = false;
    console.error(`❌ Failed: ${tf}`);
  }
}

if (!allPassed) {
  console.error("\n❌ TEST SUITE FAILED.");
  process.exit(1);
} else {
  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
}
