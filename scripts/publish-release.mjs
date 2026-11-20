#!/usr/bin/env node
// Publishes the rendered 1080p master MP4 to GitHub Releases using the GitHub CLI (gh).
// Usage: node scripts/publish-release.mjs [--draft=N] [--tag=vX.Y.Z]
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VERS = JSON.parse(readFileSync(`${root}/draft/versions.json`, "utf8"));
const S = JSON.parse(readFileSync(`${root}/script/scenes.json`, "utf8"));
const V = JSON.parse(readFileSync(`${root}/versions.json`, "utf8"));

const argDraft = (process.argv.find((a) => a.startsWith("--draft=")) || "").split("=")[1];
const draftN = Number(argDraft) || VERS.latest;
const argTag = (process.argv.find((a) => a.startsWith("--tag=")) || "").split("=")[1];
const tag = argTag || `v${V.site}`;

const masterFile = `${root}/video/renders/first-draft.mp4`;
if (!existsSync(masterFile)) {
  console.error(`Master render not found at ${masterFile}. Run render first: node scripts/render-draft.mjs`);
  process.exit(1);
}

const entry = VERS.versions.find((v) => v.n === draftN) || { label: `Draft v${draftN}`, changes: [] };
const title = `Release ${tag} · ${entry.label} (1080p Master)`;
const notes = [
  `## ${S.title} — ${entry.label}`,
  ``,
  `### Changes in this draft`,
  ...entry.changes.map((c) => `- ${c}`),
  ``,
  `### Assets Attached`,
  `- **liquidation-part1-draft-v${draftN}-1080p.mp4**: Full-quality 1080p 30fps master render (CRF 16 looks quality).`,
  ``,
  `*Published via \`scripts/publish-release.mjs\` — GitHub Releases supports up to 2 GB per file.*`
].join("\n");

const assetName = `liquidation-part1-draft-v${draftN}-1080p.mp4`;
console.log(`Publishing ${tag} to GitHub Releases with ${assetName}...`);

try {
  execFileSync("gh", [
    "release", "create", tag,
    `${masterFile}#${assetName}`,
    "--title", title,
    "--notes", notes
  ], { stdio: "inherit", cwd: root });
  console.log(`\n✅ Release ${tag} published successfully to GitHub!`);
} catch (err) {
  console.error("Failed to publish release with gh:", err.message);
  process.exit(1);
}
