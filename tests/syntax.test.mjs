import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const htmlFiles = [
  "index.html",
  "review.html",
  "first-draft.html",
  "script.html",
  "master-spec.html",
  "gaps.html",
  "publish.html",
  "performance.html",
  "changes.html",
  "changelog.html",
];

for (const file of htmlFiles) {
  test(`HTML & JS Syntax Check: ${file}`, () => {
    const filePath = path.join(root, file);
    assert.ok(fs.existsSync(filePath), `${file} should exist`);
    const content = fs.readFileSync(filePath, "utf8");

    // Extract inline <script> tags that don't have src
    const scriptRegex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let scriptIndex = 0;
    while ((match = scriptRegex.exec(content)) !== null) {
      const code = match[1];
      if (!code.trim()) continue;
      scriptIndex++;
      try {
        // Compile to test syntax without executing side effects
        new vm.Script(code, { filename: `${file}:inline-script-${scriptIndex}` });
      } catch (err) {
        assert.fail(`SyntaxError in ${file} script #${scriptIndex}: ${err.message}`);
      }
    }
  });
}
