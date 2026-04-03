/**
 * Scans Data Structures & Algorithms / each folder / submission-N.java,
 * runs Java harnesses for problems in problem-registry.json,
 * writes visualizer/submissions-manifest.js (loadable from file://).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { harnessBodies } from "./harnesses.mjs";
import { buildAllFixSuggestions } from "./fix-engine.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DSA = path.join(ROOT, "Data Structures & Algorithms");
const VISUALIZER = path.join(ROOT, "visualizer");
const REGISTRY_PATH = path.join(__dirname, "problem-registry.json");
const MANIFEST_PATH = path.join(VISUALIZER, "submissions-manifest.js");
const FIX_JS_PATH = path.join(VISUALIZER, "fix-suggestions.js");
const FIX_JSON_PATH = path.join(VISUALIZER, "fix-suggestions.json");
const BUILD_VERIFY = path.join(ROOT, "build", "java-verify");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function titleCaseFolder(name) {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function scanSubmissions() {
  const out = [];
  if (!fs.existsSync(DSA)) return out;
  for (const ent of fs.readdirSync(DSA, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const dir = path.join(DSA, ent.name);
    const files = fs
      .readdirSync(dir)
      .filter((f) => /^submission-\d+\.java$/i.test(f));
    if (files.length === 0) continue;
    const submissions = files
      .map((f) => {
        const m = f.match(/submission-(\d+)\.java/i);
        return {
          name: f,
          number: Number(m[1]),
          relPath: path.relative(ROOT, path.join(dir, f)).replace(/\\/g, "/"),
          absPath: path.join(dir, f),
        };
      })
      .sort((a, b) => a.number - b.number);
    const latest = submissions[submissions.length - 1];
    out.push({
      folder: ent.name,
      displayName: titleCaseFolder(ent.name),
      submissions,
      latest,
    });
  }
  out.sort((a, b) => a.folder.localeCompare(b.folder));
  return out;
}

function findJavac() {
  const r = spawnSync("javac", ["-version"], { encoding: "utf-8" });
  if (r.error && r.error.code === "ENOENT") return null;
  return "javac";
}

function runJavaHarness(folder, latestAbs, harnessKey) {
  const body = harnessBodies[harnessKey];
  if (!body) {
    return {
      ok: false,
      log: `No harness template for "${harnessKey}"`,
    };
  }

  const slug = folder.replace(/[^a-zA-Z0-9_-]/g, "_");
  const work = path.join(BUILD_VERIFY, slug);
  fs.mkdirSync(work, { recursive: true });

  const solutionDest = path.join(work, "Solution.java");
  const raw = fs.readFileSync(latestAbs, "utf8");
  const withImports = /^(\s*import\s+)/m.test(raw)
    ? raw
    : `import java.util.*;\n\n${raw}`;
  fs.writeFileSync(solutionDest, withImports, "utf8");

  const harnessPath = path.join(work, "Harness.java");
  fs.writeFileSync(harnessPath, body, "utf8");

  const compile = spawnSync(
    "javac",
    ["-encoding", "UTF-8", "-d", work, "Solution.java", "Harness.java"],
    { cwd: work, encoding: "utf-8" }
  );

  if (compile.status !== 0) {
    const err = (compile.stdout || "") + (compile.stderr || "");
    return { ok: false, log: err.trim() || "javac failed" };
  }

  const run = spawnSync("java", ["-cp", work, "Harness"], {
    cwd: ROOT,
    encoding: "utf-8",
  });

  if (run.status !== 0) {
    const err = (run.stdout || "") + (run.stderr || "");
    return { ok: false, log: err.trim() || "java Harness failed" };
  }

  return { ok: true, log: (run.stdout || "").trim() || "All tests passed." };
}

function main() {
  const registry = readJson(REGISTRY_PATH);
  const javac = findJavac();
  const scanned = scanSubmissions();
  const generatedAt = new Date().toISOString();

  const problems = scanned.map((p) => {
    const reg = registry[p.folder] || {};
    const harnessId = reg.harness || null;
    const viz = reg.viz || null;

    let verify = null;
    if (!javac) {
      verify = {
        ranAt: generatedAt,
        ok: false,
        skipped: true,
        log: "javac not found on PATH. Install a JDK and re-run: node tools/update-workbench.mjs",
      };
    } else if (!harnessId) {
      verify = {
        ranAt: generatedAt,
        ok: true,
        skipped: true,
        log: "No harness in problem-registry.json for this folder yet.",
      };
    } else if (!harnessBodies[harnessId]) {
      verify = {
        ranAt: generatedAt,
        ok: false,
        skipped: true,
        log: `Registry references unknown harness id "${harnessId}".`,
      };
    } else {
      verify = {
        ranAt: generatedAt,
        ok: false,
        skipped: false,
        log: "",
      };
      const res = runJavaHarness(p.folder, p.latest.absPath, harnessId);
      verify.ok = res.ok;
      verify.log = res.log;
    }

    return {
      folder: p.folder,
      displayName: p.displayName,
      submissions: p.submissions.map(({ name, number, relPath }) => ({
        name,
        number,
        relPath,
      })),
      latest: {
        name: p.latest.name,
        number: p.latest.number,
        relPath: p.latest.relPath,
      },
      harness: harnessId,
      viz,
      verify,
    };
  });

  const payload = {
    generatedAt,
    problems,
  };

  const js = `// Generated by tools/update-workbench.mjs — do not edit by hand
window.__NEETCODE_WORKBENCH__ = ${JSON.stringify(payload, null, 2)};
`;
  fs.mkdirSync(VISUALIZER, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, js, "utf8");

  const fixPayload = buildAllFixSuggestions(problems, ROOT);
  const fixJs = `// Generated by tools/update-workbench.mjs — do not edit by hand
window.__FIX_SUGGESTIONS__ = ${JSON.stringify(fixPayload)};
`;
  fs.writeFileSync(FIX_JS_PATH, fixJs, "utf8");
  fs.writeFileSync(FIX_JSON_PATH, JSON.stringify(fixPayload, null, 2), "utf8");

  console.log(`Wrote ${path.relative(ROOT, MANIFEST_PATH)}`);
  console.log(`Wrote ${path.relative(ROOT, FIX_JS_PATH)}`);
  console.log(`Problems: ${problems.length}`);

  const failed = problems.filter((x) => x.verify && !x.verify.skipped && !x.verify.ok);
  if (failed.length) {
    console.log(`Java verify FAILED (${failed.length}):`);
    for (const f of failed) {
      console.log(`- ${f.folder} (${f.latest.name})`);
      console.log(f.verify.log.split("\n").slice(0, 8).join("\n"));
    }
    process.exitCode = 1;
  } else {
    const ran = problems.filter((x) => x.verify && !x.verify.skipped && x.verify.ok);
    console.log(`Java verify OK: ${ran.length} problem(s) with harness.`);
  }
}

main();
