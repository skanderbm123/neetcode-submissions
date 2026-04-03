/**
 * Apply a saved suggestion without the browser server.
 * Usage: node tools/apply-fix.mjs --folder longest-substring-without-duplicates --id "longest-substring-without-duplicates:add-java-util-import"
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SUGG_PATH = path.join(ROOT, "visualizer", "fix-suggestions.json");

function parseArgs() {
  const a = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--folder") out.folder = a[++i];
    else if (a[i] === "--id") out.id = a[++i];
  }
  return out;
}

function main() {
  const { folder, id } = parseArgs();
  if (!folder || !id) {
    console.error("Usage: node tools/apply-fix.mjs --folder <slug> --id <suggestion-id>");
    process.exit(1);
  }
  if (!fs.existsSync(SUGG_PATH)) {
    console.error("Missing fix-suggestions.json — run npm run workbench first.");
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(SUGG_PATH, "utf8"));
  const list = data.byFolder?.[folder];
  if (!Array.isArray(list)) {
    console.error(`No suggestions for folder "${folder}".`);
    process.exit(1);
  }
  const s = list.find((x) => x.id === id);
  if (!s || !s.applyable || !s.relPath || !s.newContent) {
    console.error(`Suggestion "${id}" not found or not applyable.`);
    process.exit(1);
  }
  const abs = path.join(ROOT, s.relPath.replace(/\//g, path.sep));
  fs.writeFileSync(abs, s.newContent, "utf8");
  console.log(`Wrote ${s.relPath}`);
}

main();
