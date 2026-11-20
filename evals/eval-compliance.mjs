import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const project = JSON.parse(fs.readFileSync(path.join(root, "spec/project.json"), "utf8"));
const scenesData = JSON.parse(fs.readFileSync(path.join(root, "script/scenes.json"), "utf8"));
const scenes = scenesData.scenes;

console.log("=================================================");
console.log("⚖️ EVAL: EDITORIAL & REGULATORY COMPLIANCE");
console.log("=================================================");

let violations = 0;

// Rule 1: Legal Disclaimer presence
console.log("1. Checking Disclaimer Requirement...");
if (!project.disclaimer || project.disclaimer.length < 20) {
  console.error(" ❌ VIOLATION: Project disclaimer is missing or too short.");
  violations++;
} else {
  // Check if disclaimer is referenced in script scenes or outro
  const disclaimerInScript = scenes.some(
    (s) => (s.vo && s.vo.toLowerCase().includes("disclaimer")) || (s.overlay && JSON.stringify(s.overlay).toLowerCase().includes("disclaimer"))
  );
  if (!disclaimerInScript) {
    console.log(" ⚠️ Warning: Disclaimer not visibly mentioned in scenes.json overlay/vo.");
  } else {
    console.log(" ✅ Disclaimer configured and placed in script.");
  }
}

// Rule 2: Single Call to Action
console.log("2. Checking Single Call to Action...");
if (!project.singleCallToAction || project.singleCallToAction.length < 5) {
  console.error(" ❌ VIOLATION: Single CTA is not defined.");
  violations++;
} else {
  console.log(` ✅ Single CTA verified: "${project.singleCallToAction}"`);
}

// Rule 3: AI Framing (AI as Support, Not Replacement)
console.log("3. Checking AI Professional Framing...");
const fullVoiceover = scenes.map((s) => s.vo).join(" ").toLowerCase();
const forbiddenClaims = [
  "ai replaces your accountant",
  "ai replaces the liquidator",
  "you don't need a professional",
  "100% automated liquidation without a human",
];
const foundForbidden = forbiddenClaims.filter((claim) => fullVoiceover.includes(claim));
if (foundForbidden.length > 0) {
  console.error(` ❌ VIOLATION: Script contains forbidden AI replacement claims: ${foundForbidden.join(", ")}`);
  violations++;
} else {
  console.log(" ✅ Script frames AI properly as professional tool/support.");
}

// Rule 4: Real Footage & Asset Integrity
console.log("4. Checking Asset Quality & Real Footage Integrity...");
let scenesMissingAssets = 0;
scenes.forEach((s) => {
  if (!s.bg && !s.realAsset && !s.overlay) {
    scenesMissingAssets++;
  }
});
if (scenesMissingAssets > 0) {
  console.error(` ❌ VIOLATION: ${scenesMissingAssets} scenes have zero visual assets mapped.`);
  violations++;
} else {
  console.log(" ✅ All scenes have background or overlay assets defined.");
}

console.log("-------------------------------------------------");
if (violations > 0) {
  console.error(`❌ FAILED: ${violations} compliance violations detected.`);
  process.exit(1);
} else {
  console.log("✅ PASSED: All editorial and regulatory rules validated.");
}
