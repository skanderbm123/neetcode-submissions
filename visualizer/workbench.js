/**
 * Reads window.__NEETCODE_WORKBENCH__ from submissions-manifest.js
 * Reads window.__FIX_SUGGESTIONS__ from fix-suggestions.js
 */
const DEFAULT_APPLY_SERVER = "http://127.0.0.1:3847";

function getWorkbench() {
  return typeof window !== "undefined" && window.__NEETCODE_WORKBENCH__
    ? window.__NEETCODE_WORKBENCH__
    : null;
}

function getFixPack() {
  return typeof window !== "undefined" && window.__FIX_SUGGESTIONS__
    ? window.__FIX_SUGGESTIONS__
    : null;
}

function problemByFolder(folder) {
  const wb = getWorkbench();
  if (!wb || !wb.problems) return null;
  return wb.problems.find((p) => p.folder === folder) || null;
}

function renderVerifyBadge(verify) {
  if (!verify) {
    return '<span class="badge skip">No manifest</span>';
  }
  if (verify.skipped) {
    return '<span class="badge skip">Skipped</span>';
  }
  return verify.ok
    ? '<span class="badge ok">Java OK</span>'
    : '<span class="badge fail">Java FAIL</span>';
}

function escapeHtml(t) {
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}

function fixesForFolder(folder) {
  const pack = getFixPack();
  const list = pack?.byFolder?.[folder];
  return Array.isArray(list) ? list : [];
}

function renderFixSuggestionsHtml(folder) {
  const list = fixesForFolder(folder);
  if (!list.length) return "";

  let h = `<div class="fix-suggestions"><h3>Suggested fixes</h3>`;
  h += `<p class="meta">Auto-detected from the last <code>npm run workbench</code>. <strong>Syntax</strong> items may offer one-click apply; <strong>logic</strong> items are guidance only (no safe automatic patch).</p>`;

  for (const s of list) {
    const cat = escapeHtml(s.category || "note");
    h += `<div class="fix-card">`;
    h += `<div class="fix-card-head"><span class="fix-cat ${cat}">${cat}</span><strong>${escapeHtml(
      s.title
    )}</strong></div>`;
    h += `<p class="fix-detail">${escapeHtml(s.detail)}</p>`;
    if (s.applyable && s.relPath && s.newContent) {
      h += `<button type="button" class="fix-apply" data-folder="${escapeHtml(
        folder
      )}" data-id="${escapeHtml(s.id)}">Apply to file</button>`;
      h += `<button type="button" class="fix-copy-cli" data-folder="${escapeHtml(
        folder
      )}" data-id="${escapeHtml(s.id)}">Copy CLI apply</button>`;
      h += `<p class="fix-apply-note">One-click apply needs the local server: <code>npm run workbench:serve</code> (then click Apply).</p>`;
    }
    h += `</div>`;
  }
  h += `</div>`;
  return h;
}

async function tryApplyFix(folder, id) {
  const list = fixesForFolder(folder);
  const s = list.find((x) => x.id === id);
  if (!s || !s.applyable || !s.relPath || !s.newContent) return;

  const url =
    (typeof localStorage !== "undefined" &&
      localStorage.getItem("workbenchApplyServer")) ||
    DEFAULT_APPLY_SERVER;

  try {
    const r = await fetch(`${url.replace(/\/$/, "")}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relPath: s.relPath, content: s.newContent }),
    });
    const j = await r.json().catch(() => ({}));
    if (j.ok) {
      window.alert(
        `Saved: ${s.relPath}\n\nRun "npm run workbench" again to re-verify.`
      );
    } else {
      window.alert(
        (j && j.error) ||
          `Apply failed (${r.status}). Is "npm run workbench:serve" running?`
      );
    }
  } catch (e) {
    window.alert(
      `Could not reach ${url}.\n\nStart the apply server in another terminal:\nnpm run workbench:serve\n\nOr run:\nnpm run apply-fix -- --folder ${folder} --id "${id}"`
    );
  }
}

function copyCliCommand(folder, id) {
  const cmd = `npm run apply-fix -- --folder ${folder} --id "${id}"`;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(cmd);
    window.alert(`Copied to clipboard:\n${cmd}`);
  } else {
    window.prompt("Copy this command:", cmd);
  }
}

function bindFixButtons(root) {
  root.querySelectorAll("button.fix-apply").forEach((btn) => {
    btn.addEventListener("click", () => {
      const folder = btn.getAttribute("data-folder");
      const id = btn.getAttribute("data-id");
      if (folder && id) tryApplyFix(folder, id);
    });
  });
  root.querySelectorAll("button.fix-copy-cli").forEach((btn) => {
    btn.addEventListener("click", () => {
      const folder = btn.getAttribute("data-folder");
      const id = btn.getAttribute("data-id");
      if (folder && id) copyCliCommand(folder, id);
    });
  });
}

/**
 * @param {HTMLElement} root
 * @param {object} opts
 * @param {string} opts.folder - problem folder slug (registry key)
 * @param {string} opts.vizNote - optional extra paragraph
 */
function mountWorkbenchPanel(root, opts) {
  if (!root) return;
  const p = problemByFolder(opts.folder);
  const wb = getWorkbench();

  const when =
    wb && wb.generatedAt
      ? new Date(wb.generatedAt).toLocaleString()
      : "never";

  let html = `<div class="workbench">`;
  html += `<h2>Your Java submission</h2>`;
  html += `<div class="meta">Manifest generated: ${escapeHtml(
    when
  )} · Run <code>npm run workbench</code> from the repo root after you add or change submissions.</div>`;

  if (!p) {
    html += `<p>No entry for folder <code>${escapeHtml(
      opts.folder
    )}</code> in manifest. Run <code>npm run workbench</code>.</p>`;
    html += `</div>`;
    root.innerHTML = html;
    return;
  }

  html += `<p><strong>Latest file:</strong> <span class="file-path">${escapeHtml(
    p.latest.relPath
  )}</span> (submission ${p.latest.number})</p>`;
  html += `<p>${renderVerifyBadge(p.verify)}`;
  if (p.harness) {
    html += ` <span class="meta">Harness: ${escapeHtml(p.harness)}</span>`;
  }
  html += `</p>`;

  if (p.verify && p.verify.log) {
    html += `<pre>${escapeHtml(p.verify.log)}</pre>`;
  }

  if (opts.vizNote) {
    html += `<p class="meta">${opts.vizNote}</p>`;
  }

  if (p.verify && !p.verify.skipped && !p.verify.ok) {
    html += renderFixSuggestionsHtml(opts.folder);
  }

  html += `</div>`;
  root.innerHTML = html;
  bindFixButtons(root);
}

window.NeetcodeWorkbench = {
  getWorkbench,
  getFixPack,
  problemByFolder,
  mountWorkbenchPanel,
  fixesForFolder,
  tryApplyFix,
};
