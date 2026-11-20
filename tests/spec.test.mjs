import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

test("spec/project.json is valid and contains core production metadata", () => {
  const pPath = path.join(root, "spec/project.json");
  assert.ok(fs.existsSync(pPath), "spec/project.json exists");
  const project = JSON.parse(fs.readFileSync(pPath, "utf8"));

  assert.ok(project.title && project.title.length > 5, "title must be non-empty");
  assert.ok(project.owner, "owner must be defined");
  assert.ok(project.audience, "audience must be defined");
  assert.ok(project.goal, "goal must be defined");
  assert.ok(project.singleCallToAction, "singleCallToAction must be defined");
  assert.ok(project.disclaimer, "disclaimer must be defined");
  assert.ok(Array.isArray(project.rules) && project.rules.length > 0, "rules must be non-empty list");
  assert.ok(Array.isArray(project.acceptance) && project.acceptance.length > 0, "acceptance criteria must be defined");
  assert.ok(Array.isArray(project.decisions), "decisions array must exist");
});

test("script/scenes.json contains contiguous, valid scenes", () => {
  const sPath = path.join(root, "script/scenes.json");
  assert.ok(fs.existsSync(sPath), "script/scenes.json exists");
  const data = JSON.parse(fs.readFileSync(sPath, "utf8"));

  assert.ok(Array.isArray(data.scenes) && data.scenes.length > 0, "scenes array must exist and be non-empty");
  assert.ok(typeof data.totalSecondsApprox === "number" && data.totalSecondsApprox > 0, "totalSecondsApprox is positive");

  let accumulated = 0;
  data.scenes.forEach((sc, i) => {
    assert.ok(sc.id, `scene ${i} must have id`);
    assert.ok(sc.title, `scene ${i} must have title`);
    assert.ok(typeof sc.duration === "number" && sc.duration > 0, `scene ${sc.id} duration must be positive`);
    assert.ok(typeof sc.vo === "string" && sc.vo.trim().length > 0, `scene ${sc.id} must have voiceover text`);
    if (typeof sc.voSeconds === "number") {
      assert.ok(sc.voSeconds <= sc.duration + 0.5, `scene ${sc.id} voiceover (${sc.voSeconds}s) fits in slot duration (${sc.duration}s)`);
    }
    accumulated += sc.duration;
  });

  assert.ok(Math.abs(accumulated - data.totalSecondsApprox) < 1.0, "total duration matches sum of scene durations");
});

test("spec/menu.json targets existing pages on disk", () => {
  const mPath = path.join(root, "spec/menu.json");
  assert.ok(fs.existsSync(mPath), "spec/menu.json exists");
  const menu = JSON.parse(fs.readFileSync(mPath, "utf8"));

  assert.ok(Array.isArray(menu.stages) && menu.stages.length >= 4, "menu has minimum stages");
  for (const st of menu.stages) {
    assert.ok(st.label, "stage has label");
    assert.ok(Array.isArray(st.items), "stage has items array");
    for (const item of st.items) {
      if (item.href && !item.href.startsWith("http")) {
        const filePath = path.join(root, item.href.split("?")[0]);
        assert.ok(fs.existsSync(filePath), `Menu item href '${item.href}' must exist on disk at ${filePath}`);
      }
    }
  }
});

test("versions.json has valid semver and dependencies integrity", () => {
  const vPath = path.join(root, "versions.json");
  assert.ok(fs.existsSync(vPath), "versions.json exists");
  const v = JSON.parse(fs.readFileSync(vPath, "utf8"));

  assert.match(v.site, /^\d+\.\d+\.\d+$/, "site version must follow semver format");
  assert.ok(v.pages && typeof v.pages === "object", "pages map exists");
  assert.ok(v.pages["review.html"], "review.html tracked in versions.json");
  assert.ok(v.pages["index.html"], "index.html tracked in versions.json");
});

test("the latest draft in draft/versions.json has actually been rendered", () => {
  const vers = JSON.parse(fs.readFileSync(path.join(root, "draft/versions.json"), "utf8"));
  const mp4 = path.join(root, `draft/v${vers.latest}/video.mp4`);
  assert.ok(
    fs.existsSync(mp4),
    `draft/versions.json says latest is v${vers.latest} but draft/v${vers.latest}/video.mp4 is missing: run node scripts/render-draft.mjs --version=${vers.latest}. The review page would silently play an older draft.`
  );
});

test("recommendations.html has been reviewed against a recent draft", () => {
  // The page is hand-written; it stalled at Draft v2 for 9 drafts. Fail when it falls more than 2 drafts behind.
  const html = fs.readFileSync(path.join(root, "recommendations.html"), "utf8");
  const m = html.match(/data-reviewed-draft="(\d+)"/);
  assert.ok(m, "recommendations.html needs data-reviewed-draft on <main>");
  const latest = JSON.parse(fs.readFileSync(path.join(root, "draft/versions.json"), "utf8")).latest;
  assert.ok(latest - Number(m[1]) <= 2, `recommendations.html was last reviewed against Draft v${m[1]} but the latest is v${latest}: rescan the project, update the page and data-reviewed-draft`);
});
