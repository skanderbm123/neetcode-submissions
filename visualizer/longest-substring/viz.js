/**
 * Instrumented runners return an array of frames for the UI.
 * Mirror Java solutions in JS so the page runs without a JVM.
 */
function frame(s, left, right, maxLength, setOrMap, message, meta = {}) {
  const setArr =
    setOrMap instanceof Set
      ? Array.from(setOrMap).sort()
      : Array.isArray(setOrMap)
        ? [...setOrMap].sort()
        : [];
  return {
    s,
    left,
    right,
    maxLength,
    charset: setArr,
    message,
    mapEntries: meta.mapEntries ?? null,
  };
}

/**
 * submission-6 style: HashSet + shrink from left.
 */
function runHashSetSlidingWindow(s) {
  const steps = [];
  const set = new Set();
  let left = 0;
  let maxLength = 0;

  steps.push(
    frame(
      s,
      left,
      -1,
      maxLength,
      set,
      "Initialize max length to 0, empty charset, and left pointer at 0."
    )
  );

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    steps.push(
      frame(
        s,
        left,
        right,
        maxLength,
        set,
        `Advance right to index ${right} (character '${ch}').`
      )
    );

    while (set.has(ch)) {
      const drop = s[left];
      steps.push(
        frame(
          s,
          left,
          right,
          maxLength,
          set,
          `Charset already has '${ch}'. Remove '${drop}' at index ${left} from charset and move left forward.`,
          {}
        )
      );
      set.delete(drop);
      left++;
    }

    set.add(ch);
    maxLength = Math.max(maxLength, right - left + 1);
    steps.push(
      frame(
        s,
        left,
        right,
        maxLength,
        set,
        `Add '${ch}' to charset. Window [${left}, ${right}] has length ${
          right - left + 1
        }. maxLength = ${maxLength}.`
      )
    );
  }

  steps.push(
    frame(
      s,
      left,
      s.length - 1,
      maxLength,
      set,
      `Finished. Longest substring without repeating characters has length ${maxLength}.`
    )
  );

  return steps;
}

function mapToSortedEntries(map) {
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

/**
 * Alternative: last-index map, jump left in O(1) per duplicate.
 */
function runLastIndexMap(s) {
  const steps = [];
  const last = new Map();
  let left = 0;
  let maxLength = 0;

  steps.push(
    frame(
      s,
      left,
      -1,
      maxLength,
      [],
      "Initialize empty last-index map, left = 0, maxLength = 0.",
      { mapEntries: [] }
    )
  );

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    steps.push(
      frame(
        s,
        left,
        right,
        maxLength,
        [],
        `Process index ${right}, character '${ch}'.`,
        { mapEntries: mapToSortedEntries(last) }
      )
    );

    if (last.has(ch) && last.get(ch) >= left) {
      const prev = last.get(ch);
      left = prev + 1;
      steps.push(
        frame(
          s,
          left,
          right,
          maxLength,
          [],
          `'${ch}' was seen at index ${prev} inside the window. Jump left to ${left}.`,
          { mapEntries: mapToSortedEntries(last) }
        )
      );
    }

    last.set(ch, right);
    maxLength = Math.max(maxLength, right - left + 1);
    steps.push(
      frame(
        s,
        left,
        right,
        maxLength,
        [],
        `Record last index of '${ch}' as ${right}. maxLength = ${maxLength}.`,
        { mapEntries: mapToSortedEntries(last) }
      )
    );
  }

  steps.push(
    frame(
      s,
      left,
      s.length - 1,
      maxLength,
      [],
      `Finished. Answer is ${maxLength}.`,
      { mapEntries: mapToSortedEntries(last) }
    )
  );

  return steps;
}

const SOLUTIONS = {
  "Sliding window (HashSet — shrink from left)": runHashSetSlidingWindow,
  "Sliding window (last-index map)": runLastIndexMap,
};

function $(id) {
  return document.getElementById(id);
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
  const resEl = $("resVal");
  const csLabel = $("charsetLabel");
  const csEl = $("charsetBody");
  const mapPanel = $("mapPanel");
  const mapEl = $("mapBody");

  if (!fr) {
    stepEl.textContent = "Step — / —";
    msgEl.textContent = "Enter a string and click Run.";
    return;
  }

  stepEl.textContent = `Step ${stepIndex + 1} / ${steps.length}`;
  msgEl.textContent = fr.message;
  resEl.textContent = String(fr.maxLength);

  if (fr.mapEntries != null) {
    csLabel.textContent = "CHARSET (not used)";
    csEl.innerHTML =
      '<span style="color:var(--muted);font-size:0.85rem">—</span>';
    mapPanel.style.display = "block";
    if (fr.mapEntries.length === 0) {
      mapEl.innerHTML =
        '<span style="color:var(--muted);font-size:0.85rem">Empty</span>';
    } else {
      mapEl.innerHTML = fr.mapEntries
        .map(
          ([c, i]) =>
            `<span class="chip" title="index">${escapeHtml(c)}→${i}</span>`
        )
        .join("");
    }
  } else {
    mapPanel.style.display = "none";
    csLabel.textContent = "CHARSET";
    if (fr.charset.length === 0) {
      csEl.innerHTML =
        '<span style="color:var(--muted);font-size:0.85rem">Empty</span>';
    } else {
      csEl.innerHTML = fr.charset
        .map((c) => `<span class="chip">${escapeHtml(c)}</span>`)
        .join("");
    }
  }

  const row = $("stringRow");
  row.innerHTML = "";
  for (let i = 0; i < fr.s.length; i++) {
    const c = fr.s[i];
    const inWin =
      fr.right >= 0 && i >= fr.left && i <= fr.right;
    const div = document.createElement("div");
    div.className = "cell";
    const box = document.createElement("div");
    box.className = "char-box";
    if (inWin) box.classList.add("in-window");
    if (i === fr.left && fr.right >= 0) box.classList.add("left");
    if (i === fr.right) box.classList.add("right");
    box.textContent = c === " " ? "␠" : c;
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

function escapeHtml(t) {
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}

function run() {
  clearPlay();
  const s = $("inputS").value;
  const name = $("solution").value;
  const fn = SOLUTIONS[name];
  if (!fn) return;
  steps = fn(s);
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
  const sel = $("solution");
  Object.keys(SOLUTIONS).forEach((name) => {
    const o = document.createElement("option");
    o.value = name;
    o.textContent = name;
    sel.appendChild(o);
  });

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
      folder: "longest-substring-without-duplicates",
      vizNote:
        "Animation steps are a JS twin of your approach; Java block above is your compiled submission.",
    });
  }

  run();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
