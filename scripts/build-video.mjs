// Generates the Hyperframes project from script/scenes.json:
//   video/index.html                     root: mounts one sub-composition per scene, plus the voiceover clips
//   video/compositions/<scene-id>.html   one file per scene (background, text, graphics, animations, captions)
//   node scripts/build-video.mjs         first draft (small DRAFT tag)
//   node scripts/build-video.mjs --final no draft tag
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const S = JSON.parse(readFileSync(`${root}/script/scenes.json`, "utf8"));
const FINAL = process.argv.includes("--final");
const DRAFT_N = (() => { try { return JSON.parse(readFileSync(`${root}/draft/versions.json`, "utf8")).latest; } catch { return 1; } })();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const r2 = (n) => Math.round(n * 100) / 100;

const scenes = S.scenes;
const total = scenes[scenes.length - 1].start + scenes[scenes.length - 1].duration;
const VO_LEAD = 0.25;

const CSS = `
    :root { 
      --ink: #ffffff; 
      --accent: #4cc3d9; 
      --accent-glow: rgba(76, 195, 217, 0.4);
      --warn: #ffd166; 
      --danger: #ef476f;
      --success: #06d6a0;
      --card-bg: rgba(14, 20, 32, 0.78);
      --font: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; 
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .scene { position: absolute; inset: 0; width: 1920px; height: 1080px; overflow: hidden; font-family: var(--font); color: var(--ink); opacity: 0; }
    .bg { position: absolute; inset: -60px; background-size: cover; background-position: center; transform-origin: 50% 50%; }
    .shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,.52) 55%, rgba(0,0,0,.35) 100%), linear-gradient(0deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,0) 38%); }
    .prog { position: absolute; left: 0; top: 0; width: 1920px; height: 8px; background: var(--accent); transform-origin: 0 50%; transform: scaleX(0); z-index: 50; }
    .tag { position: absolute; top: 56px; left: 80px; padding: 8px 20px; border-radius: 8px; background: var(--accent); color: #04222a; font-weight: 800; font-size: 28px; letter-spacing: .08em; opacity: 0; z-index: 20; }
    
    .stack { position: absolute; left: 100px; top: 180px; width: 1100px; display: flex; flex-direction: column; gap: 16px; z-index: 10; }
    .stack.full { width: 1720px; }
    .stack.narrow { width: 920px; }
    h1 { font-size: 72px; line-height: 1.1; font-weight: 800; letter-spacing: -.02em; text-shadow: 0 4px 24px rgba(0,0,0,.7); opacity: 0; }
    .narrow h1 { font-size: 64px; }
    .line { font-size: 34px; line-height: 1.3; font-weight: 600; padding: 12px 24px; background: rgba(10,14,24,.75); border-left: 6px solid var(--accent); border-radius: 10px; opacity: 0; backdrop-filter: blur(8px); }

    /* Captions */
    .cap { position: absolute; left: 50%; bottom: 64px; transform: translateX(-50%); width: 1600px; text-align: center; font-size: 38px; line-height: 1.3; font-weight: 600; padding: 12px 28px; background: rgba(4,8,16,.85); border: 1px solid rgba(255,255,255,.12); border-radius: 14px; opacity: 0; z-index: 40; box-shadow: 0 10px 30px rgba(0,0,0,.6); }

    /* Side graphic container */
    .gfx-panel { position: absolute; right: 80px; top: 180px; width: 780px; height: 680px; display: flex; flex-direction: column; gap: 20px; opacity: 0; z-index: 15; }

    /* Scene 03 BAM Effect */
    .bam-box { position: absolute; right: 100px; top: 220px; width: 740px; height: 540px; background: radial-gradient(circle, rgba(239,71,111,.25) 0%, rgba(10,14,24,.85) 75%); border: 4px solid var(--danger); border-radius: 24px; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; text-align: center; box-shadow: 0 0 50px rgba(239,71,111,.4); opacity: 0; }
    .bam-badge { font-size: 72px; font-weight: 900; color: #fff; background: var(--danger); padding: 12px 36px; border-radius: 16px; letter-spacing: .05em; text-shadow: 0 4px 16px rgba(0,0,0,.5); transform: rotate(-3deg); }
    .bam-text { font-size: 36px; font-weight: 700; color: #ffd166; line-height: 1.3; }

    /* Scene 05 Cost & Timeline aesthetic leverage graphic */
    .cost-card { background: var(--card-bg); border: 2px solid rgba(255,255,255,.15); border-radius: 20px; padding: 28px; display: flex; flex-direction: column; gap: 18px; box-shadow: 0 16px 40px rgba(0,0,0,.5); }
    .fee-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: rgba(255,255,255,.05); border-radius: 12px; font-size: 30px; font-weight: 700; }
    .fee-highlight { color: var(--warn); font-size: 34px; font-weight: 800; }
    .timeline-bar { display: flex; align-items: center; justify-content: space-between; position: relative; padding: 16px 0; margin-top: 10px; }
    .tl-node { display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 2; }
    .tl-dot { width: 28px; height: 28px; border-radius: 50%; background: var(--accent); border: 4px solid #fff; box-shadow: 0 0 12px var(--accent); }
    .tl-label { font-size: 28px; font-weight: 700; color: #e0e8f0; }
    .tl-line { position: absolute; top: 30px; left: 40px; right: 40px; height: 6px; background: rgba(255,255,255,.2); z-index: 1; }
    .tl-line-fill { position: absolute; top: 30px; left: 40px; width: 0%; height: 6px; background: var(--accent); z-index: 1; }
    .leverage-pill { align-self: center; background: linear-gradient(135deg, #4cc3d9, #06d6a0); color: #04222a; font-weight: 900; font-size: 32px; padding: 12px 32px; border-radius: 30px; letter-spacing: .05em; box-shadow: 0 8px 24px rgba(76,195,217,.4); }

    /* Scene 06 Hands-on & Guardrail */
    .loop-card { background: var(--card-bg); border: 2px solid rgba(76,195,217,.3); border-radius: 20px; padding: 26px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 16px 40px rgba(0,0,0,.5); }
    .loop-flow { display: flex; align-items: center; justify-content: space-around; gap: 14px; }
    .loop-step { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 28px; font-weight: 800; text-align: center; background: rgba(255,255,255,.06); padding: 14px 20px; border-radius: 14px; flex: 1; }
    .guardrail-card { background: rgba(6,214,160,.12); border: 2px solid var(--success); border-radius: 18px; padding: 22px; display: flex; align-items: center; gap: 20px; }
    .guardrail-icon { font-size: 54px; }
    .guardrail-title { font-size: 32px; font-weight: 800; color: var(--success); }
    .guardrail-sub { font-size: 28px; color: #e0e8f0; margin-top: 4px; }

    /* Scene 07 Database & MCP */
    .db-card { background: var(--card-bg); border: 2px solid rgba(255,209,102,.4); border-radius: 20px; padding: 26px; display: flex; flex-direction: column; gap: 18px; }
    .db-header { font-size: 30px; font-weight: 800; color: var(--warn); display: flex; align-items: center; gap: 12px; }
    .db-table { display: flex; flex-direction: column; gap: 10px; background: rgba(0,0,0,.4); padding: 16px; border-radius: 12px; }
    .db-row { display: flex; justify-content: space-between; font-size: 28px; padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,.1); }
    .mcp-pill { align-self: center; background: linear-gradient(135deg, #ffd166, #ff9a51); color: #3a2a00; font-weight: 900; font-size: 28px; padding: 10px 28px; border-radius: 24px; }

    /* Scene 08 Deterministic vs Probabilistic */
    .comp-grid { display: flex; gap: 16px; width: 100%; }
    .comp-col { flex: 1; background: var(--card-bg); border-radius: 18px; padding: 20px; display: flex; flex-direction: column; gap: 12px; border: 2px solid rgba(255,255,255,.1); }
    .comp-col.det { border-color: #ea4b71; }
    .comp-col.prob { border-color: var(--accent); }
    .comp-title { font-size: 28px; font-weight: 800; }
    .det .comp-title { color: #ff6d5a; }
    .prob .comp-title { color: var(--accent); }
    .comp-desc { font-size: 28px; color: #cbd5e1; line-height: 1.3; }
    .quote-box { background: rgba(255,255,255,.08); border-left: 6px solid var(--warn); border-radius: 14px; padding: 20px; font-size: 28px; font-style: italic; color: #ffd166; line-height: 1.35; }

    /* Scene 09 Comments Callout */
    .comments-box { background: var(--card-bg); border: 2px solid var(--accent); border-radius: 20px; padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 20px; text-align: center; }
    .comments-icon { font-size: 64px; }
    .comments-prompt { font-size: 34px; font-weight: 800; color: #fff; line-height: 1.25; }
    .sub-btn { background: #ff0000; color: #fff; font-size: 32px; font-weight: 800; padding: 14px 40px; border-radius: 30px; letter-spacing: .06em; box-shadow: 0 8px 24px rgba(255,0,0,.5); }

    /* Scene 10 Skool & Disclaimer */
    .skool-panel { background: var(--card-bg); border: 2px solid #0070f3; border-radius: 22px; padding: 30px; display: flex; flex-direction: column; align-items: center; gap: 18px; text-align: center; box-shadow: 0 16px 40px rgba(0,112,243,.3); }
    .skool-logo-img { height: 75px; }
    .skool-badge { background: #0070f3; color: #fff; font-weight: 800; font-size: 32px; padding: 10px 28px; border-radius: 20px; }
    .skool-url { font-size: 28px; font-weight: 700; color: #4cc3d9; text-decoration: underline; }

    /* General Logo */
    .brand-logo { position: absolute; right: 280px; top: 50px; height: 60px; z-index: 30; opacity: 0; filter: drop-shadow(0 4px 16px rgba(0,0,0,.6)); }
    .brand-logo img { height: 100%; border-radius: 8px; }
`;

const GSAP = `<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>`;

mkdirSync(`${root}/video/compositions`, { recursive: true });
const keep = new Set(scenes.map((s) => `${s.id}.html`));
for (const f of readdirSync(`${root}/video/compositions`)) if (f.endsWith(".html") && !keep.has(f)) unlinkSync(`${root}/video/compositions/${f}`);

let rootClips = "";
let rootAudio = "";

scenes.forEach((s, i) => {
  const [head, ...lines] = s.overlay;
  const hasGfx = s.fx || s.id === "s03-goal" || s.id === "s05-cost-timeline" || s.id === "s06-exceptions" || s.id === "s07-emails" || s.id === "s08-tracking" || s.id === "s09-cta" || s.id === "s10-outro";
  // Avoid duplicate logo in s10 because s10 already embeds the skool logo directly in .skool-panel
  const logoFile = (s.logo && s.id !== "s10-outro") ? ["svg", "png", "webp", "jpg"].map((e) => `assets/logos/${s.logo}.${e}`).find((f) => existsSync(`${root}/video/${f}`)) : null;
  const voDur = s.voSeconds || s.duration - 0.5;
  const voLocal = VO_LEAD;

  // captions
  let sentences = s.vo.split(/(?<=[.?!])\s+/).filter(Boolean);
  for (let k = 0; k < sentences.length - 1; k++) if (sentences[k].split(/\s+/).length < 4) { sentences[k + 1] = `${sentences[k]} ${sentences[k + 1]}`; sentences.splice(k, 1); k--; }
  const words = sentences.map((x) => x.split(/\s+/).length);
  const wTotal = words.reduce((a, b) => a + b, 0);
  let acc = 0;
  let caps = sentences.map((x, k) => {
    const t0 = voLocal + (voDur * acc) / wTotal; acc += words[k];
    const t1 = voLocal + (voDur * acc) / wTotal;
    return { text: x, t0, t1, w: words[k] };
  });
  caps[caps.length - 1].t1 = Math.max(caps[caps.length - 1].t1, s.duration - 0.45);
  for (let k = caps.length - 1; k > 0; k--) {
    if (caps[k].t1 - caps[k].t0 < 0.5 + 0.3 * caps[k].w) {
      caps[k - 1] = { text: `${caps[k - 1].text} ${caps[k].text}`, t0: caps[k - 1].t0, t1: caps[k].t1, w: caps[k - 1].w + caps[k].w };
      caps.splice(k, 1);
    }
  }
  if (caps.length > 1 && caps[0].t1 - caps[0].t0 < 0.5 + 0.3 * caps[0].w) {
    caps[1] = { text: `${caps[0].text} ${caps[1].text}`, t0: caps[0].t0, t1: caps[1].t1, w: caps[0].w + caps[1].w };
    caps.shift();
  }

  let js = `
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#scene", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" }, 0);
${i === scenes.length - 1 ? "" : `tl.to("#scene", { opacity: 0, duration: 0.4, ease: "power1.in" }, ${r2(s.duration - 0.4)});`}
    tl.fromTo("#bg", { scale: 1, x: 0 }, { scale: 1.15, x: -40, duration: ${s.duration}, ease: "none" }, 0);
    tl.fromTo("#prog", { scaleX: 0 }, { scaleX: 1, duration: ${s.duration}, ease: "none" }, 0);
    tl.fromTo("#tag", { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.2);
    tl.fromTo("#head", { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.4);`;

  lines.forEach((_, j) => {
    const spread = 0.68;
    const t = voLocal + voDur * (0.08 + (spread * (j + 1)) / (lines.length + 0.5));
    js += `
    tl.fromTo("#l${j}", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, ${r2(Math.min(t, s.duration - 1.2))});`;
  });

  if (logoFile) {
    js += `
    tl.fromTo("#logo", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, 0.6);`;
  }

  // Finite repeats for animations
  if (s.id === "s03-goal") {
    js += `
    tl.fromTo("#bam-box", { opacity: 0, scale: 0.4, rotation: -10 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" }, 5.2);
    tl.fromTo("#bam-badge", { scale: 1 }, { scale: 1.08, repeat: 5, yoyo: true, duration: 0.8, ease: "sine.inOut" }, 5.8);`;
  } else if (s.id === "s05-cost-timeline") {
    js += `
    tl.fromTo("#gfx-panel", { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, 1.0);
    tl.fromTo("#tl-fill", { width: "0%" }, { width: "100%", duration: 6, ease: "power1.inOut" }, 3.5);
    tl.fromTo("#leverage-pill", { scale: 0.95 }, { scale: 1.05, repeat: 6, yoyo: true, duration: 1.2, ease: "sine.inOut" }, 2.0);`;
  } else if (s.id === "s06-exceptions") {
    js += `
    tl.fromTo("#gfx-panel", { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, 1.2);
    tl.fromTo("#guardrail-card", { scale: 0.95 }, { scale: 1.03, repeat: 6, yoyo: true, duration: 1.4, ease: "sine.inOut" }, 2.5);`;
  } else if (s.id === "s07-emails") {
    js += `
    tl.fromTo("#gfx-panel", { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, 1.0);
    tl.fromTo(".db-row", { opacity: 0, x: 20 }, { opacity: 1, x: 0, stagger: 0.4, duration: 0.4, ease: "power2.out" }, 2.2);`;
  } else if (s.id === "s08-tracking") {
    js += `
    tl.fromTo("#gfx-panel", { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, 1.0);
    tl.fromTo("#quote-box", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 5.0);`;
  } else if (s.id === "s09-cta") {
    js += `
    tl.fromTo("#gfx-panel", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" }, 0.8);
    tl.fromTo("#sub-btn", { scale: 1 }, { scale: 1.08, repeat: 6, yoyo: true, duration: 0.7, ease: "sine.inOut" }, 1.5);`;
  } else if (s.id === "s10-outro") {
    js += `
    tl.fromTo("#gfx-panel", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 1.0);
    tl.fromTo("#skool-badge", { scale: 0.95 }, { scale: 1.05, repeat: 6, yoyo: true, duration: 1.2, ease: "sine.inOut" }, 2.0);`;
  }

  caps.forEach((c, k) => {
    js += `
    tl.fromTo("#c${k}", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, ${r2(c.t0)});
    tl.to("#c${k}", { opacity: 0, duration: 0.2, ease: "power1.in" }, ${r2(Math.max(c.t0 + 0.3, c.t1 - 0.2))});`;
  });

  js += `
    window.__timelines["${s.id}"] = tl;
    tl.seek(0);`;

  let gfxHtml = "";
  if (s.id === "s03-goal") {
    gfxHtml = `
      <div id="bam-box" class="bam-box">
        <div id="bam-badge" class="bam-badge">💥 BAM!</div>
        <div class="bam-text">Industrial & Information Revolutions Created Unprecedented Red Tape</div>
        <div style="font-size: 28px; color: #fff; font-weight: 600;">Understand the structure first before you move</div>
      </div>`;
  } else if (s.id === "s05-cost-timeline") {
    gfxHtml = `
      <div id="gfx-panel" class="gfx-panel">
        <div id="leverage-pill" class="leverage-pill">⚡ YOU + AI = LEVERAGE</div>
        <div class="cost-card">
          <div style="font-size: 28px; font-weight: 800; color: #ffd166;">Liquidation Fees (UK Provider)</div>
          <div class="fee-row"><span>Deposit to start</span><span class="fee-highlight">£1,500</span></div>
          <div class="fee-row"><span>Balance to complete</span><span class="fee-highlight">£2,100</span></div>
          <div class="fee-row" style="border-top: 2px solid rgba(255,255,255,.2);"><span style="color: #fff;">Total Investment</span><span style="color: #06d6a0;">£3,600</span></div>
          
          <div style="font-size: 28px; font-weight: 700; color: #cbd5e1; margin-top: 6px;">Timeline Roadmap</div>
          <div class="timeline-bar">
            <div class="tl-line"></div>
            <div id="tl-fill" class="tl-line-fill"></div>
            <div class="tl-node"><div class="tl-dot"></div><div class="tl-label">2 Mo Prep</div></div>
            <div class="tl-node"><div class="tl-dot" style="background:#ffd166;"></div><div class="tl-label">Fee Paid</div></div>
            <div class="tl-node"><div class="tl-dot" style="background:#06d6a0;"></div><div class="tl-label">2 Mo Close</div></div>
          </div>
        </div>
      </div>`;
  } else if (s.id === "s06-exceptions") {
    gfxHtml = `
      <div id="gfx-panel" class="gfx-panel">
        <div class="loop-card">
          <div style="font-size: 28px; font-weight: 800; color: var(--accent);">🛠️ Not Hands-Off: Active Feedback Loop</div>
          <div class="loop-flow">
            <div class="loop-step"><span>👤</span><span>YOU</span><span style="font-size:28px;color:#06d6a0;">Inputs</span></div>
            <div style="font-size: 32px; color: var(--warn);">⇄</div>
            <div class="loop-step"><span>⚙️</span><span>SECURE & ADAPT</span><span style="font-size:28px;color:#ffd166;">Iteration</span></div>
            <div style="font-size: 32px; color: var(--warn);">⇄</div>
            <div class="loop-step"><span>🤖</span><span>AI SYSTEM</span><span style="font-size:28px;color:var(--accent);">Assistance</span></div>
          </div>
        </div>
        <div id="guardrail-card" class="guardrail-card">
          <div class="guardrail-icon">🛡️</div>
          <div>
            <div class="guardrail-title">LICENSED PRACTITIONER</div>
            <div class="guardrail-sub">Your essential security guardrail. Verify every input on your end before submitting.</div>
          </div>
        </div>
      </div>`;
  } else if (s.id === "s07-emails") {
    gfxHtml = `
      <div id="gfx-panel" class="gfx-panel">
        <div class="db-card">
          <div class="db-header"><span>🗄️</span><span>Online Records = Structured Database</span></div>
          <div class="db-table">
            <div class="db-row"><span style="color:#ffd166;">Chaser Emails</span><span>6 Reminders (Action Required)</span></div>
            <div class="db-row"><span style="color:#06d6a0;">Receipts & Slips</span><span>Logged & Timestamped</span></div>
            <div class="db-row"><span style="color:var(--accent);">Outstanding Tasks</span><span>Tracked in Writing</span></div>
          </div>
          <div class="mcp-pill">⚡ Connect Drive & Gmail over MCP to AI</div>
        </div>
      </div>`;
  } else if (s.id === "s08-tracking") {
    gfxHtml = `
      <div id="gfx-panel" class="gfx-panel">
        <div class="comp-grid">
          <div class="comp-col det">
            <div class="comp-title">⚙️ n8n (Deterministic)</div>
            <div class="comp-desc">Known rules, predictable flows, zero hallucination. Build your reliable backbone.</div>
          </div>
          <div class="comp-col prob">
            <div class="comp-title">🧠 AI (Probabilistic)</div>
            <div class="comp-desc">Adaptive reasoning, text synthesis, contextual flexibility. Build intelligence on top.</div>
          </div>
        </div>
        <div id="quote-box" class="quote-box">
          “A friend said: become like MrBeast, why show your real work?<br>
          <strong style="color: #fff; font-style: normal; display: block; margin-top: 8px;">✨ Have the honour to do what is right and share reality.”</strong>
        </div>
      </div>`;
  } else if (s.id === "s09-cta") {
    gfxHtml = `
      <div id="gfx-panel" class="gfx-panel">
        <div class="comments-box">
          <div class="comments-icon">💬</div>
          <div class="comments-prompt">Should I shoot Part 2?<br>Tell me in the comments below!</div>
          <div id="sub-btn" class="sub-btn">SUBSCRIBE</div>
        </div>
      </div>`;
  } else if (s.id === "s10-outro") {
    gfxHtml = `
      <div id="gfx-panel" class="gfx-panel">
        <div class="skool-panel">
          <img class="skool-logo-img" src="../assets/logos/skool.svg" alt="Skool logo">
          <div id="skool-badge" class="skool-badge">🚀 Delivery Pilot Community</div>
          <div style="font-size: 28px; color: #cbd5e1;">Join fellow bot builders and automation practitioners:</div>
          <div class="skool-url">https://www.skool.com/delivery-pilot-8938/</div>
        </div>
      </div>`;
  }

  const file = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <!-- GENERATED by scripts/build-video.mjs from script/scenes.json. Edit the script, not this file. -->
  ${GSAP}
  <style>${CSS}
  </style>
</head>
<body>
  <div data-composition-id="${s.id}" data-duration="${s.duration}" data-width="1920" data-height="1080">
    <div id="scene" class="scene">
      <div id="bg" class="bg" data-layout-ignore style="background-image:url(../assets/bg/${esc(s.bg || "calm")}.jpg)"></div>
      <div class="shade" data-layout-ignore></div>
      <div id="prog" class="prog"></div>
      <div id="tag" class="tag">${esc(s.label)}</div>
      ${logoFile ? `<div id="logo" class="brand-logo"><img src="../${logoFile}" alt="${esc(s.logo)} logo"></div>` : ""}
      <div class="stack${hasGfx ? " narrow" : " full"}">
        <h1 id="head">${esc(head)}</h1>
        ${lines.map((l, j) => `<p id="l${j}" class="line">${esc(l)}</p>`).join("\n        ")}
      </div>
      ${gfxHtml}
      ${caps.map((c, k) => `<div id="c${k}" class="cap">${esc(c.text)}</div>`).join("\n      ")}
    </div>
    <script>${js}
    </script>
  </div>
</body>
</html>
`;
  writeFileSync(`${root}/video/compositions/${s.id}.html`, file);

  rootClips += `
    <div id="scene-${esc(s.id)}" class="clip" data-composition-id="${esc(s.id)}" data-composition-src="compositions/${esc(s.id)}.html" data-start="${s.start}" data-duration="${s.duration}" data-track-index="0"></div>`;
  rootAudio += `
    <audio id="vo-${esc(s.id)}" src="assets/vo/${esc(s.id)}.mp3" data-start="${r2(s.start + VO_LEAD)}" data-duration="${r2(voDur)}" data-track-index="1"></audio>`;
});

const index = `<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1920, height=1080" />
  <!-- GENERATED by scripts/build-video.mjs from script/scenes.json. Edit the script, not this file. -->
  ${GSAP}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 1920px; height: 1080px; overflow: hidden; background: #000; }
    #root { position: relative; width: 1920px; height: 1080px; overflow: hidden; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    .draft { position: absolute; top: 40px; right: 60px; padding: 6px 16px; border: 3px solid #ffd166; color: #ffd166; border-radius: 8px; font-weight: 800; font-size: 28px; letter-spacing: .1em; opacity: .85; z-index: 100; }
  </style>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080" data-fps="30">${rootClips}${rootAudio}
${FINAL ? "" : `    <div id="draft-tag" class="clip draft" data-start="0" data-duration="${total}" data-track-index="2">DRAFT V${DRAFT_N}</div>`}
  </div>
  <script>
    window.__timelines = window.__timelines || {};
    const tl = gsap.timeline({ paused: true });
    window.__timelines["main"] = tl;
    tl.seek(0);
  </script>
</body>
</html>
`;
writeFileSync(`${root}/video/index.html`, index);
console.log(`wrote video/index.html + ${scenes.length} scene files in video/compositions: ${total} s (${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}), ${FINAL ? "final" : "draft v" + DRAFT_N}`);
