/**
 * Local-only HTTP server so the browser can write submission files when you click Apply.
 * Run: npm run workbench:serve
 */
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.WORKBENCH_PORT || 3847);

function safeResolve(rel) {
  const normalized = rel.replace(/\\/g, "/");
  if (normalized.includes("..")) return null;
  if (!/^Data Structures & Algorithms\/[^/]+\/submission-\d+\.java$/i.test(normalized)) {
    return null;
  }
  const abs = path.normalize(path.join(ROOT, normalized));
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, root: ROOT }));
    return;
  }

  if (req.method === "POST" && req.url === "/apply") {
    let body = "";
    req.on("data", (c) => {
      body += c;
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        const { relPath, content } = data;
        if (typeof relPath !== "string" || typeof content !== "string") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: "relPath and content required" }));
          return;
        }
        const abs = safeResolve(relPath);
        if (!abs) {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              ok: false,
              error: "Path must be Data Structures & Algorithms/<folder>/submission-N.java",
            })
          );
          return;
        }
        fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, content, "utf8");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, wrote: relPath }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: String(e.message || e) }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Workbench apply server http://127.0.0.1:${PORT}`);
  console.log("POST /apply { relPath, content } — only submission-*.java under Data Structures & Algorithms");
});
