/**
 * Builds human-readable + optionally applicable fix suggestions from verify logs + source.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url)); // for CATALOG_PATH
const CATALOG_PATH = path.join(__dirname, "fix-catalog.json");

function readCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
}

function slugId(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/**
 * @param {{ folder: string, relPath: string, absPath: string, verifyLog: string, verifySkipped: boolean, verifyOk: boolean }} opts
 */
export function buildFixSuggestions(opts) {
  const {
    folder,
    relPath,
    absPath,
    verifyLog,
    verifySkipped,
    verifyOk,
  } = opts;

  if (verifyOk || verifySkipped) return [];

  let source = "";
  try {
    source = fs.readFileSync(absPath, "utf8");
  } catch {
    return [];
  }

  const log = (verifyLog || "").replace(/\r/g, "");
  const out = [];
  const seenApply = new Set();

  const push = (s) => {
    if (s.applyable && s.relPath && s.newContent) {
      const key = `${s.relPath}::${s.newContent}`;
      if (seenApply.has(key)) return;
      seenApply.add(key);
    }
    out.push(s);
  };

  // --- Syntax: missing java.util imports (matches local compile of LeetCode-style code) ---
  const utilTypes =
    /symbol:\s*class (Map|HashMap|List|ArrayList|Set|HashSet|Arrays|Collections|Deque|Queue|Stack|PriorityQueue)\b/;
  if (/cannot find symbol/.test(log) && utilTypes.test(log)) {
    const hasImport = /^\s*import\s+java\.util\./m.test(source);
    if (!hasImport) {
      push({
        id: `${folder}:add-java-util-import`,
        title: "Add `import java.util.*;`",
        detail:
          "Your file uses Map/List/Set/etc. without imports. LeetCode adds them automatically; local `javac` needs this line at the top (after `package`, if any).",
        category: "syntax",
        applyable: true,
        relPath,
        newContent: `import java.util.*;\n\n${source.replace(/^\uFEFF/, "").trimStart()}`,
      });
    }
  }

  // --- Syntax: common javac messages (comment-only suggestions) ---
  const lines = log.split("\n");
  for (const line of lines) {
    const m = line.match(/^Solution\.java:(\d+):\s*error:\s*(.+)$/);
    if (!m) continue;
    const [, lineNo, msg] = m;
    if (/reached end of file while parsing/.test(msg)) {
      push({
        id: `${folder}:eof-parse:${lineNo}`,
        title: `Brace or semicolon issue near line ${lineNo}`,
        detail:
          "The compiler hit EOF while still expecting `}`, `)`, or `;`. Count braces on that line and the previous few lines — often a missing `}` on a loop or method.",
        category: "syntax",
        applyable: false,
      });
    }
    if (/not a statement/.test(msg) || /illegal start of expression/.test(msg)) {
      push({
        id: `${folder}:stmt:${lineNo}`,
        title: `Statement error at line ${lineNo}`,
        detail:
          "Check the previous line for a missing semicolon, or an extra `}` that closed the method too early.",
        category: "syntax",
        applyable: false,
      });
    }
  }

  // --- Logic: catalog patterns (regex on full log) ---
  const catalog = readCatalog();
  const pack = catalog[folder];
  if (pack && Array.isArray(pack.patterns)) {
    for (const p of pack.patterns) {
      try {
        const re = new RegExp(p.regex);
        if (!re.test(log)) continue;
        push({
          id: `${folder}:logic:${slugId(p.title)}`,
          title: p.title,
          detail: p.detail,
          category: "logic",
          applyable: false,
        });
      } catch {
        /* bad regex in catalog */
      }
    }
  }

  // --- Logic: harness assertion failures ---
  if (/FAIL\s+\w+/.test(log) || /RuntimeException:\s*FAIL/.test(log)) {
    const failLine = lines.find((l) => l.includes("FAIL"));
    if (failLine && !out.some((s) => s.category === "logic" && s.detail?.includes(failLine))) {
      push({
        id: `${folder}:harness-failure`,
        title: "One or more test assertions failed",
        detail: `Harness output includes: ${failLine.trim()}. Compare that case by hand with a known-good answer (e.g. NeetCode / LeetCode editorial).`,
        category: "logic",
        applyable: false,
      });
    }
  }

  return out;
}

/**
 * @returns {{ generatedAt: string, byFolder: Record<string, ReturnType<typeof buildFixSuggestions>> }}
 */
export function buildAllFixSuggestions(problemRows, rootDir) {
  const byFolder = {};
  const generatedAt = new Date().toISOString();

  for (const row of problemRows) {
    const v = row.verify;
    if (!v || v.skipped || v.ok) continue;
    const absPath = path.join(rootDir, row.latest.relPath.replace(/\//g, path.sep));
    const list = buildFixSuggestions({
      folder: row.folder,
      relPath: row.latest.relPath,
      absPath,
      verifyLog: v.log,
      verifySkipped: v.skipped,
      verifyOk: v.ok,
    });
    if (list.length) byFolder[row.folder] = list;
  }

  return { generatedAt, byFolder };
}
