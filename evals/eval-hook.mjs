import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const scenesData = JSON.parse(fs.readFileSync(path.join(root, "script/scenes.json"), "utf8"));
const projectSpec = JSON.parse(fs.readFileSync(path.join(root, "spec/project.json"), "utf8"));
const hookScene = scenesData.scenes[0];

console.log("=================================================");
console.log("🎣 EVAL: SCENE 01 HOOK RETENTION & CLARITY");
console.log("=================================================");

let score = 100;
const deductions = [];

// 1. Duration check: Video hooks should land within first 15 seconds
if (hookScene.duration > 20) {
  score -= 20;
  deductions.push(`Hook scene duration is ${hookScene.duration}s (recommended <= 18s).`);
}

// 2. Question or pattern interrupt in voiceover
const hasQuestion = hookScene.vo.includes("?") || hookScene.title.includes("?");
if (!hasQuestion) {
  score -= 15;
  deductions.push("Hook voiceover/title lacks a direct question or prompt for the viewer.");
}

// 3. Problem/Audience statement check
const audienceKeywords = ["director", "company", "debt", "liquidat", "close", "bounce back", "red tape"];
const voLower = hookScene.vo.toLowerCase();
const matchedKeywords = audienceKeywords.filter((k) => voLower.includes(k));
if (matchedKeywords.length < 2) {
  score -= 25;
  deductions.push(`Hook lacks strong audience keywords (matched only: ${matchedKeywords.join(", ")}).`);
}

// 4. Visual clarity & asset check
if (!hookScene.bg && !hookScene.overlay) {
  score -= 20;
  deductions.push("Hook has neither background nor overlay visuals specified.");
}

console.log(`Hook Scene: [${hookScene.id}] "${hookScene.title}"`);
console.log(`Voiceover: "${hookScene.vo.slice(0, 100)}..."`);
console.log(`Duration: ${hookScene.duration}s | Keywords identified: ${matchedKeywords.join(", ")}`);
console.log("-------------------------------------------------");
console.log(`Hook Evaluation Score: ${score}/100`);

if (deductions.length > 0) {
  console.log("Notes / Deductions:");
  deductions.forEach((d) => console.log(` - ${d}`));
}

if (score < 70) {
  console.error("❌ FAILED: Hook score is below 70.");
  process.exit(1);
} else {
  console.log("✅ PASSED: Hook criteria satisfied.");
}
