function $(id) {
  return document.getElementById(id);
}

function escapeHtml(t) {
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}

function parseNums(text) {
  return text
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length)
    .map((x) => Number(x));
}

function runDuplicate(nums) {
  const steps = [];
  const seen = new Set();
  const push = (i, msg, done) => {
    steps.push({
      nums,
      i,
      seen: Array.from(seen).sort((a, b) => a - b),
      message: msg,
      result: done,
    });
  };

  push(-1, "Start with an empty set.", null);

  for (let i = 0; i < nums.length; i++) {
    const v = nums[i];
    push(i, `Look at index ${i}, value ${v}.`, null);
    if (seen.has(v)) {
      push(
        i,
        `${v} already in the set — duplicate found → true.`,
        true
      );
      return steps;
    }
    seen.add(v);
    push(i, `Insert ${v} into the set and continue.`, null);
  }

  push(
    nums.length - 1,
    "No duplicates seen → false.",
    false
  );
  return steps;
}

let steps = [];
let stepIndex = 0;
let playing = false;
let playTimer = null;
let speedMs = 600;

function clearPlay() {
  playing = false;
  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
  }
  $("btnPlay").textContent = "Play";
}

function render() {
  const fr = steps[stepIndex];
  if (!fr) {
    $("stepLabel").textContent = "Step — / —";
    $("message").textContent = "Edit nums and click Run.";
    return;
  }
  $("stepLabel").textContent = `Step ${stepIndex + 1} / ${steps.length}`;
  $("message").textContent = fr.message;
  $("idxVal").textContent = fr.i < 0 ? "—" : String(fr.i);

  const setEl = $("setBody");
  if (fr.seen.length === 0) {
    setEl.innerHTML =
      '<span style="color:var(--muted);font-size:0.85rem">Empty</span>';
  } else {
    setEl.innerHTML = fr.seen
      .map((n) => `<span class="chip">${escapeHtml(String(n))}</span>`)
      .join("");
  }

  const row = $("numsRow");
  row.innerHTML = "";
  for (let k = 0; k < fr.nums.length; k++) {
    const div = document.createElement("div");
    div.className = "cell";
    const box = document.createElement("div");
    box.className = "char-box wide";
    box.textContent = String(fr.nums[k]);
    if (fr.i === k) box.classList.add("idx-hl");
    const idx = document.createElement("div");
    idx.className = "idx";
    idx.textContent = k;
    div.appendChild(box);
    div.appendChild(idx);
    row.appendChild(div);
  }

  $("seek").max = String(Math.max(0, steps.length - 1));
  $("seek").value = String(stepIndex);
}

function run() {
  clearPlay();
  const nums = parseNums($("inputNums").value);
  if (nums.length === 0) {
    steps = [];
    stepIndex = 0;
    render();
    return;
  }
  steps = runDuplicate(nums);
  stepIndex = 0;
  render();
}

function go(d) {
  clearPlay();
  stepIndex = Math.max(0, Math.min(steps.length - 1, stepIndex + d));
  render();
}

function setStep(i) {
  clearPlay();
  stepIndex = Math.max(0, Math.min(steps.length - 1, i));
  render();
}

function togglePlay() {
  if (steps.length === 0) return;
  if (playing) {
    clearPlay();
    return;
  }
  playing = true;
  $("btnPlay").textContent = "Pause";
  playTimer = setInterval(() => {
    if (stepIndex >= steps.length - 1) {
      clearPlay();
      render();
      return;
    }
    stepIndex++;
    render();
  }, speedMs);
}

function setSpeed(ms, btn) {
  speedMs = ms;
  document.querySelectorAll(".speed-toggle button").forEach((b) => {
    b.classList.toggle("active", b === btn);
  });
  if (playing) {
    clearPlay();
    togglePlay();
  }
}

function init() {
  $("btnRun").addEventListener("click", run);
  $("btnPrev").addEventListener("click", () => go(-1));
  $("btnNext").addEventListener("click", () => go(1));
  $("btnPlay").addEventListener("click", togglePlay);
  $("seek").addEventListener("input", (e) => setStep(Number(e.target.value)));
  document.querySelectorAll("[data-speed]").forEach((btn) => {
    btn.addEventListener("click", () =>
      setSpeed(Number(btn.getAttribute("data-speed")), btn)
    );
  });
  document.querySelector('[data-speed="600"]')?.classList.add("active");

  if ($("workbenchRoot") && window.NeetcodeWorkbench) {
    window.NeetcodeWorkbench.mountWorkbenchPanel($("workbenchRoot"), {
      folder: "duplicate-integer",
    });
  }

  run();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
