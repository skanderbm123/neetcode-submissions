function $(id) {
  return document.getElementById(id);
}

function parseWords(text) {
  return text
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length);
}

function signature(w) {
  return [...w].sort().join("");
}

function formatMap(map) {
  const keys = Array.from(map.keys()).sort();
  if (keys.length === 0) return "(empty)";
  return keys
    .map((k) => {
      const vals = map.get(k).join(", ");
      return `${k} → [ ${vals} ]`;
    })
    .join("\n");
}

function runGroupAnagrams(words) {
  const steps = [];
  const map = new Map();

  const push = (i, word, key, msg) => {
    steps.push({
      words,
      highlight: i,
      key: key ?? "—",
      mapText: formatMap(map),
      message: msg,
    });
  };

  push(-1, "", null, "Start with an empty map.");

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const key = signature(w);
    push(i, w, key, `Word "${w}" → sorted key "${key}".`);

    if (!map.has(key)) map.set(key, []);
    map.get(key).push(w);
    push(
      i,
      w,
      key,
      `Append to list for key "${key}". Current groups:\n${formatMap(map)}`
    );
  }

  push(
    words.length - 1,
    "",
    "—",
    `Done. Return ${map.size} group(s).`
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
    $("message").textContent = "Enter comma-separated words, then Run.";
    return;
  }
  $("stepLabel").textContent = `Step ${stepIndex + 1} / ${steps.length}`;
  $("message").textContent = fr.message;
  $("keyVal").textContent = fr.key;
  $("idxVal").textContent =
    fr.highlight < 0 ? "—" : String(fr.highlight);
  $("mapBlock").textContent = fr.mapText;

  const row = $("wordsRow");
  row.innerHTML = "";
  for (let j = 0; j < fr.words.length; j++) {
    const div = document.createElement("div");
    div.className = "cell";
    const box = document.createElement("div");
    box.className = "char-box wide";
    box.textContent = fr.words[j];
    if (fr.highlight === j) box.classList.add("idx-hl");
    const idx = document.createElement("div");
    idx.className = "idx";
    idx.textContent = j;
    div.appendChild(box);
    div.appendChild(idx);
    row.appendChild(div);
  }

  $("seek").max = String(Math.max(0, steps.length - 1));
  $("seek").value = String(stepIndex);
}

function run() {
  clearPlay();
  const words = parseWords($("inputStrs").value);
  if (words.length === 0) {
    steps = [];
    stepIndex = 0;
    render();
    return;
  }
  steps = runGroupAnagrams(words);
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
      folder: "anagram-groups",
    });
  }

  run();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
