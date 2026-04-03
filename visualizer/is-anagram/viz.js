function $(id) {
  return document.getElementById(id);
}

function runAnagram(s, t) {
  const steps = [];
  const add = (payload) => steps.push(payload);

  add({
    phase: "start",
    sortS: "—",
    sortT: "—",
    i: -1,
    result: null,
    message: `Compare lengths |s|=${s.length} vs |t|=${t.length}.`,
  });

  if (s.length !== t.length) {
    add({
      phase: "done",
      sortS: "—",
      sortT: "—",
      i: -1,
      result: false,
      message: "Lengths differ — cannot be anagrams.",
    });
    return steps;
  }

  const a = [...s];
  const b = [...t];
  add({
    phase: "copy",
    sortS: a.join(""),
    sortT: b.join(""),
    i: -1,
    result: null,
    message: "Copy s and t into char arrays.",
  });

  a.sort();
  b.sort();
  add({
    phase: "sorted",
    sortS: a.join(""),
    sortT: b.join(""),
    i: -1,
    result: null,
    message: "Sort both arrays.",
  });

  for (let i = 0; i < a.length; i++) {
    add({
      phase: "cmp",
      sortS: a.join(""),
      sortT: b.join(""),
      i,
      result: null,
      message: `Check index ${i}: '${a[i]}' vs '${b[i]}'.`,
    });
    if (a[i] !== b[i]) {
      add({
        phase: "done",
        sortS: a.join(""),
        sortT: b.join(""),
        i,
        result: false,
        message: "Mismatch — not anagrams.",
      });
      return steps;
    }
  }

  add({
    phase: "done",
    sortS: a.join(""),
    sortT: b.join(""),
    i: a.length - 1,
    result: true,
    message: "All positions match — anagrams.",
  });
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
    $("message").textContent = "Enter s and t, then Run.";
    return;
  }
  $("stepLabel").textContent = `Step ${stepIndex + 1} / ${steps.length}`;
  $("message").textContent = fr.message;
  $("sortS").textContent = fr.sortS;
  $("sortT").textContent = fr.sortT;
  $("idxVal").textContent = fr.i < 0 ? "—" : String(fr.i);
  $("resultVal").textContent =
    fr.result === null ? "…" : fr.result ? "true" : "false";
  $("seek").max = String(Math.max(0, steps.length - 1));
  $("seek").value = String(stepIndex);
}

function run() {
  clearPlay();
  steps = runAnagram($("inputS").value, $("inputT").value);
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
      folder: "is-anagram",
    });
  }

  run();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
