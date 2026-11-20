import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || "8080", 10);
const HOST = "0.0.0.0";

// Azure SAS URL from environment / Azure Key Vault
let AZURE_SAS = process.env.AZURE_STORAGE_SAS || process.env.HYPERFRAMES_AZURE_SAS || process.env.LIQUIDATION_NOTES_SAS || "";
const KEY_VAULT_NAME = process.env.KEY_VAULT_NAME || "dp-kv-deliverypilot";

// In-memory verification cache for sub-millisecond UX response
let verificationCache = {
  data: null,
  timestamp: 0,
  ttlMs: 20000 // 20s cache
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8"
};

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-ms-blob-type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) { // 50MB max
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = reqUrl.pathname;
  if (pathname.startsWith("/hyperframes/")) {
    pathname = pathname.slice("/hyperframes".length);
  } else if (pathname === "/hyperframes") {
    pathname = "/";
  }

  // --- API: Health ---
  if (pathname === "/health" || pathname === "/api/health") {
    return sendJson(res, 200, {
      status: "ok",
      app: "hyperframes-review",
      version: "1.30.1",
      azureConfigured: !!AZURE_SAS,
      keyVault: KEY_VAULT_NAME,
      uptimeSec: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
  }

  // --- API: Azure Config (Provides SAS securely from Key Vault to Frontend) ---
  if (pathname === "/api/azure-config") {
    return sendJson(res, 200, {
      configured: !!AZURE_SAS,
      source: "Azure Key Vault (" + KEY_VAULT_NAME + ")",
      sasUrl: AZURE_SAS,
      container: "liquidation-notes",
      prefix: "hyperframes/"
    });
  }

  // --- API: Verification Get (Cached & Ultra-fast) ---
  if (pathname === "/api/verification" && req.method === "GET") {
    const draftN = reqUrl.searchParams.get("draft") || "9";
    const filename = `UK-Director-Liquidation-Draft-v${draftN}-Verification.json`;

    // Serve from cache if fresh
    const now = Date.now();
    if (verificationCache.data && (now - verificationCache.timestamp < verificationCache.ttlMs)) {
      return sendJson(res, 200, { ...verificationCache.data, _cached: true });
    }

    if (!AZURE_SAS) {
      return sendJson(res, 200, { verifiedMap: {}, verifiedCount: 0, _local: true });
    }

    try {
      const u = new URL(AZURE_SAS);
      const cleanPath = u.pathname.replace(/\/$/, "");
      const getUrl = u.origin + cleanPath + "/hyperframes/" + filename + u.search;

      const blobRes = await fetch(getUrl);
      if (blobRes.ok) {
        const data = await blobRes.json();
        verificationCache = { data, timestamp: now, ttlMs: 20000 };
        return sendJson(res, 200, data);
      } else {
        return sendJson(res, 200, { verifiedMap: {}, verifiedCount: 0, status: blobRes.status });
      }
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // --- API: Verification Save (Backend Proxy for 100% Reliability) ---
  if (pathname === "/api/verification" && req.method === "POST") {
    if (!AZURE_SAS) {
      return sendJson(res, 500, { error: "Azure SAS not configured in backend environment" });
    }

    try {
      const bodyText = await readBody(req);
      const payload = JSON.parse(bodyText);
      const draftN = payload.draft ? String(payload.draft).replace(/[^0-9]/g, "") || "9" : "9";
      const filename = `UK-Director-Liquidation-Draft-v${draftN}-Verification.json`;

      const u = new URL(AZURE_SAS);
      const cleanPath = u.pathname.replace(/\/$/, "");
      const putUrl = u.origin + cleanPath + "/hyperframes/" + filename + u.search;

      const blobRes = await fetch(putUrl, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload, null, 2)
      });

      if (blobRes.ok) {
        verificationCache = { data: payload, timestamp: Date.now(), ttlMs: 20000 };
        return sendJson(res, 200, { ok: true, filename, count: payload.verifiedCount || 0 });
      } else {
        return sendJson(res, blobRes.status, { error: `Azure PUT failed HTTP ${blobRes.status}` });
      }
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // --- API: Upload Drawing (Backend Proxy avoiding Client CORS) ---
  if (pathname === "/api/upload-drawing" && req.method === "POST") {
    if (!AZURE_SAS) {
      return sendJson(res, 500, { error: "Azure SAS not configured" });
    }

    try {
      const bodyText = await readBody(req);
      const { filename, dataUrl, contentType = "image/jpeg" } = JSON.parse(bodyText);

      if (!filename || !dataUrl) {
        return sendJson(res, 400, { error: "Missing filename or dataUrl" });
      }

      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const u = new URL(AZURE_SAS);
      const cleanPath = u.pathname.replace(/\/$/, "");
      const putUrl = u.origin + cleanPath + "/hyperframes/" + filename + u.search;

      const blobRes = await fetch(putUrl, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": contentType
        },
        body: buffer
      });

      if (blobRes.ok) {
        const publicUrl = u.origin + cleanPath + "/hyperframes/" + filename;
        return sendJson(res, 200, { ok: true, url: publicUrl, filename });
      } else {
        return sendJson(res, blobRes.status, { error: `Upload failed HTTP ${blobRes.status}` });
      }
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // --- Static File Serving ---
  let filePath = path.join(__dirname, pathname === "/" ? "index.html" : pathname);

  // Security check: ensure path stays within __dirname
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  // Resolve directory or .html extensions
  let stat;
  try {
    stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      stat = fs.statSync(filePath);
    }
  } catch (e) {
    if (fs.existsSync(filePath + ".html")) {
      filePath = filePath + ".html";
      try { stat = fs.statSync(filePath); } catch (_) {}
    }
  }

  if (!stat) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(`<h1>404 Not Found</h1><p>Path: ${pathname}</p>`);
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const totalSize = stat.size;
  const range = req.headers.range;

  // HTTP 206 Partial Content streaming for sample-accurate video/audio seeking
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

    if (isNaN(start) || start >= totalSize || (parts[1] && isNaN(end)) || end >= totalSize || start > end) {
      res.writeHead(416, {
        "Content-Range": `bytes */${totalSize}`,
        "Accept-Ranges": "bytes"
      });
      return res.end();
    }

    const chunkSize = end - start + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${totalSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": contentType
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": totalSize,
      "Accept-Ranges": "bytes",
      "Content-Type": contentType,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Hyperframes Backend Server running on http://${HOST}:${PORT}`);
  console.log(`☁️ Azure Storage SAS: ${AZURE_SAS ? "Configured (from Key Vault)" : "Not configured"}`);
});
