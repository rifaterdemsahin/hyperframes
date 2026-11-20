import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const scenesData = JSON.parse(fs.readFileSync(path.join(root, "script/scenes.json"), "utf8"));
const scenes = scenesData.scenes;

console.log("=================================================");
console.log("📊 EVAL: VOICEOVER PACING & DENSITY ANALYSIS");
console.log("=================================================");

let totalWords = 0;
let totalVoSeconds = 0;
let anomalies = 0;

scenes.forEach((sc, idx) => {
  const words = sc.vo.trim().split(/\s+/).filter(Boolean).length;
  const dur = sc.voSeconds || sc.duration;
  const wpm = Math.round((words / dur) * 60);

  totalWords += words;
  totalVoSeconds += dur;

  let status = "✅ Optimal";
  let flag = false;

  // Modern YouTube educational/tech pacing is typically 140 - 205 WPM
  if (wpm > 210) {
    status = "⚠️ Fast (>210 WPM) - Viewer may feel rushed";
    flag = true;
  } else if (wpm < 110) {
    status = "⚠️ Slow (<110 WPM) - Viewer may lose focus";
    flag = true;
  }

  if (flag) anomalies++;

  console.log(`[Scene ${String(idx + 1).padStart(2, "0")}] ${sc.id.padEnd(8)} | ${dur.toFixed(1)}s | ${String(words).padStart(3)} words | ${String(wpm).padStart(3)} WPM | ${status}`);
});

const overallWpm = Math.round((totalWords / totalVoSeconds) * 60);
console.log("-------------------------------------------------");
console.log(`Summary: Total Words: ${totalWords} | Total VO Time: ${totalVoSeconds.toFixed(1)}s | Overall WPM: ${overallWpm}`);

if (anomalies > 3) {
  console.error(`❌ FAILED: ${anomalies} scenes have pacing anomalies that exceed thresholds.`);
  process.exit(1);
} else {
  console.log(`✅ PASSED: Pacing is balanced across production (Anomalies: ${anomalies}/10).`);
}
