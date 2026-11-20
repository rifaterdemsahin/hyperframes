import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { requestHandler } from "../server.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

class MockResponse extends EventEmitter {
  constructor() {
    super();
    this.statusCode = 200;
    this.headers = {};
    this.bodyChunks = [];
    this.headersSent = false;
  }

  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value;
  }

  getHeader(name) {
    return this.headers[name.toLowerCase()];
  }

  writeHead(statusCode, headers = {}) {
    this.statusCode = statusCode;
    for (const [k, v] of Object.entries(headers)) {
      this.setHeader(k, v);
    }
    this.headersSent = true;
    return this;
  }

  write(chunk) {
    if (chunk) this.bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return true;
  }

  end(chunk) {
    if (chunk) this.write(chunk);
    this.emit("finish");
    return this;
  }

  get body() {
    return Buffer.concat(this.bodyChunks).toString("utf8");
  }

  get bodyBuffer() {
    return Buffer.concat(this.bodyChunks);
  }
}

function createMockRequest({ method = "GET", url = "/", headers = {}, body = "" } = {}) {
  const stream = new Readable({
    read() {
      if (body) {
        this.push(Buffer.from(body));
      }
      this.push(null);
    },
  });
  stream.method = method;
  stream.url = url;
  stream.headers = { host: "localhost:30080", ...headers };
  return stream;
}

test("Server requestHandler: Health endpoint", async () => {
  const req = createMockRequest({ method: "GET", url: "/api/health" });
  const res = new MockResponse();

  await requestHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.getHeader("access-control-allow-origin"), "*");
  const data = JSON.parse(res.body);
  assert.equal(data.status, "ok");
  assert.equal(data.app, "hyperframes-review");
  assert.equal(data.version, JSON.parse(fs.readFileSync(path.join(root, "versions.json"), "utf8")).site, "health reports the live site version");
  assert.equal(data.latestDraft, JSON.parse(fs.readFileSync(path.join(root, "draft/versions.json"), "utf8")).latest);
});

test("Server requestHandler: CORS preflight (OPTIONS)", async () => {
  const req = createMockRequest({ method: "OPTIONS", url: "/api/verification" });
  const res = new MockResponse();

  await requestHandler(req, res);
  assert.equal(res.statusCode, 204);
  assert.equal(res.getHeader("access-control-allow-origin"), "*");
  assert.ok(res.getHeader("access-control-allow-methods").includes("POST"));
});

test("Server requestHandler: Azure config endpoint", async () => {
  const req = createMockRequest({ method: "GET", url: "/api/azure-config" });
  const res = new MockResponse();

  await requestHandler(req, res);
  assert.equal(res.statusCode, 200);
  const data = JSON.parse(res.body);
  assert.ok("configured" in data);
  assert.equal(data.container, "liquidation-notes");
});

test("Server requestHandler: HTTP 206 Partial Content range streaming for MP4", async () => {
  const req = createMockRequest({
    method: "GET",
    url: "/draft/v9/video.mp4",
    headers: { range: "bytes=0-100" },
  });
  const res = new MockResponse();

  await new Promise(async (resolve) => {
    res.on("finish", resolve);
    await requestHandler(req, res);
    // Allow stream piping to complete
    setTimeout(resolve, 300);
  });

  assert.equal(res.statusCode, 206, "Must return HTTP 206 Partial Content for range requests");
  assert.equal(res.getHeader("accept-ranges"), "bytes");
  assert.equal(res.getHeader("content-type"), "video/mp4");
  const contentRange = res.getHeader("content-range");
  assert.ok(contentRange && contentRange.startsWith("bytes 0-100/"), `Expected Content-Range starting with 'bytes 0-100/', got ${contentRange}`);
  assert.equal(res.getHeader("content-length"), 101);
});

test("Server requestHandler: Automatic video fallback for unrendered draft versions", async () => {
  // Request /draft/v99/video.mp4 which does not exist; server should fall back to the newest rendered draft
  const req = createMockRequest({
    method: "GET",
    url: "/draft/v99/video.mp4",
    headers: { range: "bytes=0-50" },
  });
  const res = new MockResponse();

  await new Promise(async (resolve) => {
    res.on("finish", resolve);
    await requestHandler(req, res);
    setTimeout(resolve, 300);
  });

  assert.equal(res.statusCode, 206);
  assert.equal(res.getHeader("content-type"), "video/mp4");
  assert.equal(res.getHeader("x-draft-video-requested"), "v99");
  const rendered = fs.readdirSync(path.join(root, "draft"))
    .map((d) => /^v(\d+)$/.exec(d)).filter(Boolean).map((m) => +m[1])
    .filter((n) => fs.existsSync(path.join(root, `draft/v${n}/video.mp4`)));
  assert.equal(res.getHeader("x-draft-video-fallback"), `v${Math.max(...rendered)}`);
  assert.equal(res.getHeader("content-length"), 51);
});

test("Server requestHandler: 404 for non-existent non-draft file", async () => {
  const req = createMockRequest({ method: "GET", url: "/non-existent-file-xyz.html" });
  const res = new MockResponse();

  await requestHandler(req, res);
  assert.equal(res.statusCode, 404);
});

test("Server requestHandler: never serves dotfiles or dot-folders (.env, .git)", async () => {
  for (const url of ["/.env", "/.git/config", "/video/.hyperframes/x", "/%2e%2e/etc/passwd"]) {
    const req = createMockRequest({ method: "GET", url });
    const res = new MockResponse();
    await requestHandler(req, res);
    assert.ok([403, 404].includes(res.statusCode), `${url} must not be served, got ${res.statusCode}`);
  }
});
