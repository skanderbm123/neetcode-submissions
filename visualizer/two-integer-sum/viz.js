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

function mapSortedEntries(map) {
  return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
}

function runTwoSum(nums, target) {
  const steps = [];
  const map = new Map();
  const push = (i, message, done = null) => {
    steps.push({
      nums,
      target,
      i,
      mapEntries: mapSortedEntries(map),
      message,
      result: done,
    });
  };

  push(-1, "Start with an empty map. For each index i, check if target − nums[i] exists in the map.");

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    push(i, `i = ${i}, nums[i] = ${nums[i]}, need complement = ${need}.`, null);
    if (map.has(need)) {
      const j = map.get(need);
      push(
        i,
        `Map contains ${need} at index ${j}. Return [${j}, ${i}].`,
        [j, i]
      );
      return steps;
    }
    map.set(nums[i], i);
    push(
      i,
      `Store pair (${nums[i]} → index ${i}) in the map and continue.`,
      null
    );
  }

  push(
    nums.length - 1,
    "No pair sums to target (for this visualization we still stop here).",
    []
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

function currentFrame() {
  return steps[stepIndex] ?? null;
}

function render() {
  const fr = currentFrame();
  const stepEl = $("stepLabel");
  const msgEl = $("message");
  const targetEl = $("targetVal");
  const idxEl = $("idxVal");
  const mapEl = $("mapBody");
  const row = $("numsRow");

  if (!fr) {
    stepEl.textContent = "Step — / —";
    msgEl.textContent = "Edit nums and target, then Run.";
    return;
  }

  stepEl.textContent = `Step ${stepIndex + 1} / ${steps.length}`;
  msgEl.textContent = fr.message;
  targetEl.textContent = String(fr.target);
  idxEl.textContent = fr.i < 0 ? "—" : String(fr.i);

  if (fr.mapEntries.length === 0) {
    mapEl.innerHTML =
      '<span style="color:var(--muted);font-size:0.85rem">Empty</span>';
  } else {
    mapEl.innerHTML = fr.mapEntries
      .map(
        ([v, i]) =>
          `<span class="chip">${escapeHtml(String(v))}→${i}</span>`
      )
      .join("");
  }

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
  const target = Number($("inputTarget").value);
  if (nums.length === 0 || Number.isNaN(target)) {
    steps = [];
    stepIndex = 0;
    render();
    return;
  }
  steps = runTwoSum(nums, target);
  stepIndex = 0;
  render();
}

function go(delta) {
  clearPlay();
  stepIndex = Math.max(0, Math.min(steps.length - 1, stepIndex + delta));
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
  const mid = document.querySelector('[data-speed="600"]');
  if (mid) mid.classList.add("active");

  const wbRoot = $("workbenchRoot");
  if (wbRoot && window.NeetcodeWorkbench) {
    window.NeetcodeWorkbench.mountWorkbenchPanel(wbRoot, {
      folder: "two-integer-sum",
    });
  }

  run();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
