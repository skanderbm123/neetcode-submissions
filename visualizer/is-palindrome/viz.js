function $(id) {
  return document.getElementById(id);
}

function isAlnum(ch) {
  return /[a-zA-Z0-9]/.test(ch);
}

function runPalindrome(s) {
  const steps = [];
  const push = (l, r, ok, message) => {
    steps.push({ s, left: l, right: r, ok, message });
  };

  let start = 0;
  let end = s.length - 1;
  push(start, end, true, "Initialize left = 0, right = length − 1.");

  while (start < end) {
    while (start < end && !isAlnum(s[start])) {
      push(start, end, true, `Skip non-alphanumeric at left index ${start}.`);
      start++;
    }
    while (end > start && !isAlnum(s[end])) {
      push(start, end, true, `Skip non-alphanumeric at right index ${end}.`);
      end--;
    }
    if (start >= end) break;

    const a = s[start].toLowerCase();
    const b = s[end].toLowerCase();
    push(
      start,
      end,
      a === b,
      `Compare '${s[start]}' (idx ${start}) vs '${s[end]}' (idx ${end}) → lowercased '${a}' vs '${b}'.`
    );

    if (a === b) {
      start++;
      end--;
    } else {
      push(start, end, false, "Mismatch — not a palindrome.");
      return steps;
    }
  }

  push(start, end, true, "All comparisons passed — palindrome.");
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
    $("message").textContent = "Enter s and click Run.";
    return;
  }

  $("stepLabel").textContent = `Step ${stepIndex + 1} / ${steps.length}`;
  $("message").textContent = fr.message;
  $("leftVal").textContent = fr.left < 0 ? "—" : String(fr.left);
  $("rightVal").textContent = fr.right < 0 ? "—" : String(fr.right);
  $("okVal").textContent = fr.ok ? "true" : "false";

  const row = $("strRow");
  row.innerHTML = "";
  for (let i = 0; i < fr.s.length; i++) {
    const div = document.createElement("div");
    div.className = "cell";
    const box = document.createElement("div");
    box.className = "char-box";
    const ch = fr.s[i];
    box.textContent = ch === " " ? "␠" : ch;
    if (i === fr.left) box.classList.add("left");
    if (i === fr.right) box.classList.add("right");
    const idx = document.createElement("div");
    idx.className = "idx";
    idx.textContent = i;
    div.appendChild(box);
    div.appendChild(idx);
    row.appendChild(div);
  }

  $("seek").max = String(Math.max(0, steps.length - 1));
  $("seek").value = String(stepIndex);
}

function run() {
  clearPlay();
  const s = $("inputS").value;
  steps = runPalindrome(s);
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
      folder: "is-palindrome",
    });
  }

  run();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
