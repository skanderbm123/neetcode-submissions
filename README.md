# NeetCode Solutions — @skanderbm123

> Synced from [NeetCode.io](https://neetcode.io) · Repository: `neetcode-submissions-3n6ou65d`

---

## What is this?

[NeetCode](https://neetcode.io) is an interview-prep platform with curated problems and editorials. This repository holds **your submissions**, pushed here via NeetCode’s **GitHub Sync**.

On top of the synced files, this repo includes a small **local workbench**: you can **compile and test your Java submissions**, open **step-by-step visualizers** in the browser, and get **suggested fixes** when tests fail.

---

## Repository layout

Problems live under topic folders (for example `Data Structures & Algorithms`). Each problem has its own directory; every sync creates a new numbered file:

```
Data Structures & Algorithms/
  <problem-slug>/
    submission-1.java
    submission-2.java
    ...
```

The workbench always uses the **latest** `submission-N` (highest `N`) per folder when running Java checks.

---

## NeetCode GitHub Sync

1. Connect GitHub at [neetcode.io/profile/github](https://neetcode.io/profile/github).
2. **Auto-commit** — optional push on each submission (filtered by status).
3. **Bulk Sync** — backfill past solutions from the same settings page.
4. **Per-problem sync** — from submission history on a problem page.

---

## Local workbench (Java)

Requirements: **Node.js**, a **JDK** (`javac` / `java` on your `PATH`).

### Commands

| Command | Purpose |
|--------|---------|
| `npm run workbench` | Scan submissions, run Java harness tests, regenerate `visualizer/submissions-manifest.js` and `visualizer/fix-suggestions.js`. |
| `npm run workbench:serve` | Start a tiny **localhost** server so the browser can **apply** safe syntax patches (see below). |
| `npm run apply-fix -- --folder <slug> --id "<id>"` | Apply one fix from disk without the server (after `workbench` has run). |
| `npm run viz` | Serve the `visualizer/` folder (optional; you can also open the HTML files directly). |

Run `npm run workbench` after you add or change a submission you care about.

### How verification works

- Problem metadata and test harnesses: **`tools/problem-registry.json`** (per-folder) and **`tools/harnesses.mjs`** (generated `Harness.java` next to your `Solution.java` in `build/java-verify/`).
- Your file is copied **as-is**; if it has no `import` lines, the harness adds `import java.util.*;` only **inside the build copy** so LeetCode-style code still compiles locally.
- Results and paths are written into **`visualizer/submissions-manifest.js`** for the UI.

### Visualizer

- **`visualizer/index.html`** — hub: all problems with a submission, Java status, link to each viz page.
- **`visualizer/<problem>/index.html`** — per-problem page with:
  - **Java panel** — latest file path, verify log, and (on failure) **suggested fixes**.
  - **Animation** — JavaScript twin of the usual algorithm (for stepping through state); it does **not** execute your `.java` file in the browser.

### Suggested fixes

When Java verify **fails**, the workbench generates suggestions from compiler output plus **`tools/fix-catalog.json`** (short logic hints you can extend).

- **Syntax** suggestions may include an **Apply** action if the patch is mechanical (for example adding `import java.util.*;`).
- **Logic** entries are **comments only**; there is no safe automatic rewrite for arbitrary bugs.

**Apply** from the page needs **`npm run workbench:serve`** running so the page can `POST` the full file content to localhost (writes are restricted to `Data Structures & Algorithms/**/submission-*.java`). Alternatively use **`npm run apply-fix`** with the id shown in `visualizer/fix-suggestions.json`.

### Adding a new problem to the workbench

1. Ensure the folder exists under `Data Structures & Algorithms/` with `submission-*.java`.
2. Add an entry to **`tools/problem-registry.json`** (`harness` id, optional `viz` path).
3. Implement the harness in **`tools/harnesses.mjs`**.
4. Optionally add hints in **`tools/fix-catalog.json`** and a viz under **`visualizer/`** (copy an existing pair `index.html` + `viz.js`).
5. Run **`npm run workbench`**.

---

## Supported languages (NeetCode sync)

NeetCode can sync many languages. This repo’s **Java tooling** above is optional; other extensions may appear depending on your NeetCode language settings.

| Language | Extension |
|----------|-----------|
| Python | `.py` |
| JavaScript | `.js` |
| TypeScript | `.ts` |
| Java | `.java` |
| C++ | `.cpp` |
| C# | `.cs` |
| Go | `.go` |
| Rust | `.rs` |
| Kotlin | `.kt` |
| Swift | `.swift` |
| SQL | `.sql` |

---

## NeetCode settings

Manage sync at [neetcode.io/profile/github](https://neetcode.io/profile/github): auto-commit, accepted-only filter, bulk sync, repository name.

---

*NeetCode integration: [NeetCode GitHub](https://neetcode.io)*
