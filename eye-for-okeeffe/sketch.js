// ============================================================
// sketch.js
//
// p5 does two jobs here:
// 1. Reads every work's composition in the background
//    (composition.js on a small IIIF image).
// 2. Draws each round's pair of works, and on the reveal,
//    animates the computer's marks onto both.
// ============================================================


let museumData;

let pairImages = [null, null];   // p5.Images for the current round
let pairRound = null;
let revealStart = -1;
let theme = {};
const imageCache = new Map();
const reduceMotion =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Background reading
let readQueue = [];
let reading = 0;
const READ_AT_ONCE = 4;
let readFailures = new Set();
let unsavedReads = 0;
let statsAt = 0;


// ============================================================
// preload / setup
// ============================================================

function preload() {
  museumData = loadJSON("paintings.json");
}

function setup() {
  const holder = document.getElementById("canvas-container");
  const c = createCanvas(600, 400);
  c.parent(holder);
  c.elt.setAttribute("role", "img");
  c.elt.setAttribute("aria-label", "Two works by Georgia O'Keeffe, side by side");
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  textFont("Public Sans");
  noLoop();

  readTheme();
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => { readTheme(); redraw(); });
  }

  prepareWorks(parsePaintingRecords(museumData));
  loadCachedAnalyses();
  setupUI();

  fetch("compositions.json")
    .then(r => (r.ok ? r.json() : null))
    .catch(() => null)
    .then(data => {
      if (data && data.version === ANALYSIS_VERSION && data.analyses) {
        for (const k in data.analyses) if (!analyses[k]) analyses[k] = data.analyses[k];
      }
      computeStats();
      statsAt = Object.keys(analyses).length;
      updateReady();
      startReading();
    });
}

function readTheme() {
  const css = getComputedStyle(document.documentElement);
  const get = n => css.getPropertyValue(n).trim() || null;
  theme = {
    ground: get("--ground") || "#EEF0EE",
    ink3: get("--ink3") || "#7C868D",
    accent: get("--g") || "#A3302A"
  };
}


// ============================================================
// Layout
// ============================================================

function sideBySide() {
  const holder = document.getElementById("canvas-container");
  return (holder.clientWidth || 600) >= 620;
}

function stageResized() {
  const holder = document.getElementById("canvas-container");
  const w = holder.clientWidth || 600;
  let h;
  if (sideBySide()) h = Math.round(Math.max(300, Math.min(540, window.innerHeight * 0.58, w * 0.6)));
  else h = Math.round(Math.min(760, w * 1.6));
  resizeCanvas(w, h);
  document.querySelector(".captions").classList.toggle("stacked", !sideBySide());
  redraw();
}

function windowResized() {
  if (screen === "play") stageResized();
}

// Two slots, side by side or stacked
function slots() {
  const gap = 16, pad = 14;
  if (sideBySide()) {
    const sw = (width - pad * 2 - gap) / 2;
    return [
      { x: pad, y: pad, w: sw, h: height - pad * 2 },
      { x: pad + sw + gap, y: pad, w: sw, h: height - pad * 2 }
    ];
  }
  const sh = (height - pad * 2 - gap) / 2;
  return [
    { x: pad, y: pad, w: width - pad * 2, h: sh },
    { x: pad, y: pad + sh + gap, w: width - pad * 2, h: sh }
  ];
}

function fitIn(img, s) {
  const k = Math.min(s.w / img.width, s.h / img.height);
  const w = img.width * k, h = img.height * k;
  return { x: s.x + (s.w - w) / 2, y: s.y + (s.h - h) / 2, w, h };
}


// ============================================================
// A round's pair
// ============================================================

function showPair(round, onReady) {
  pairRound = round;
  pairImages = [null, null];
  revealStart = -1;
  redraw();

  let got = 0;
  const done = () => {
    got++;
    if (got === 2 && pairRound === round) {
      loop();             // fade in
      fadeStart = millis();
      onReady();
    }
  };
  [round.a, round.b].forEach((w, i) => {
    getImage(w, img => {
      if (pairRound !== round) return;
      pairImages[i] = img;
      done();
    }, () => {
      // If an image won't load, show a blank slot rather than stall.
      if (pairRound !== round) return;
      pairImages[i] = "missing";
      done();
    });
  });
}

function preloadRound(i) {
  if (!game || !game.rounds[i]) return;
  getImage(game.rounds[i].a, () => {}, () => {});
  getImage(game.rounds[i].b, () => {}, () => {});
}

function getImage(work, ok, fail) {
  if (imageCache.has(work.key)) { ok(imageCache.get(work.key)); return; }
  loadImage(displayImageURL(work, 900), img => {
    imageCache.set(work.key, img);
    if (imageCache.size > 8) imageCache.delete(imageCache.keys().next().value);
    ok(img);
  }, fail);
}

function startReveal() {
  revealStart = millis();
  loop();
}

let fadeStart = 0;


// ============================================================
// draw
// ============================================================

function draw() {
  clear();
  background(theme.ground);

  if (!pairRound) { noLoop(); return; }
  const S = slots();

  if (!pairImages[0] || !pairImages[1]) {
    noStroke(); fill(theme.ink3); textAlign(CENTER, CENTER); textSize(16);
    text("Loading the next pair…", width / 2, height / 2);
    noLoop();
    return;
  }

  const fade = reduceMotion ? 1 : constrain((millis() - fadeStart) / 350, 0, 1);
  let animating = fade < 1;

  for (let i = 0; i < 2; i++) {
    const img = pairImages[i];
    if (img === "missing") continue;
    const r = fitIn(img, S[i]);
    noStroke(); fill(0, 0, 0, 22 * fade); rect(r.x + 4, r.y + 5, r.w, r.h);
    drawingContext.globalAlpha = fade;
    image(img, r.x, r.y, r.w, r.h);
    drawingContext.globalAlpha = 1;

    if (revealStart >= 0) {
      const t = reduceMotion ? 1 : constrain((millis() - revealStart - i * 180) / 800, 0, 1);
      if (t < 1) animating = true;
      const a = analyses[(i === 0 ? pairRound.a : pairRound.b).key];
      if (a) drawMarks(r, a, i === 0 ? "a" : "b", t);
    }
  }

  if (!animating) noLoop();
}


// The computer's marks, growing in.
function drawMarks(r, a, who, t) {
  const ctx = drawingContext;
  const accent = color(theme.accent);
  const dark = color(22, 26, 29);
  const halo = color(255, 255, 255, 220);
  const ink = who === "a" ? accent : dark;
  const e = easeOutBack(t);
  const e2 = easeOutCubic(t);

  push();
  noFill();

  // Balance: center square, arrow growing toward the visual center
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  const vx = r.x + a.visualCenterX * r.w, vy = r.y + a.visualCenterY * r.h;
  const ex = lerp(cx, vx, e2), ey = lerp(cy, vy, e2);
  rectMode(CENTER);
  stroke(halo); strokeWeight(4); rect(cx, cy, 10, 10);
  stroke(dark); strokeWeight(1.5); rect(cx, cy, 10, 10);
  if (dist(cx, cy, vx, vy) > 9) {
    if (who === "b") ctx.setLineDash([7, 5]);
    stroke(halo); strokeWeight(5); line(cx, cy, ex, ey);
    stroke(ink); strokeWeight(2.2); line(cx, cy, ex, ey);
    ctx.setLineDash([]);
    if (t > 0.5) {
      const ang = atan2(vy - cy, vx - cx);
      push();
      translate(ex, ey); rotate(ang);
      stroke(halo); strokeWeight(3); fill(ink);
      triangle(0, 0, -11, -5.5, -11, 5.5);
      noStroke(); triangle(0, 0, -11, -5.5, -11, 5.5);
      pop();
    }
  }
  rectMode(CORNER);

  // Where the eye lands: ring pops in
  const fx = r.x + a.focalX * r.w, fy = r.y + a.focalY * r.h;
  const d = constrain(Math.min(r.w, r.h) * 0.14, 28, 60) * Math.max(0, e);
  noFill();
  stroke(halo); strokeWeight(6); circle(fx, fy, d);
  if (who === "b") ctx.setLineDash([8, 5]);
  stroke(ink); strokeWeight(2.8); circle(fx, fy, d);
  ctx.setLineDash([]);

  // Main direction badge
  if (t > 0.3) {
    const s = 34, bx = r.x + 8, by = r.y + 8;
    const alpha = constrain((t - 0.3) / 0.4, 0, 1);
    noStroke(); fill(255, 255, 255, 225 * alpha);
    rect(bx, by, s, s, 6);
    stroke(22, 26, 29, 255 * alpha); strokeWeight(2);
    const angles = { "horizontal": 0, "vertical": HALF_PI, "diagonal /": -QUARTER_PI, "diagonal \\": QUARTER_PI };
    push();
    translate(bx + s / 2, by + s / 2);
    rotate(angles[a.dominantDirection] || 0);
    const size = s * 0.56, gap = size * 0.34;
    for (const off of [-gap, 0, gap]) line(-size / 2, off, size / 2, off);
    pop();
  }

  pop();
}

function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }


// ============================================================
// Reading compositions in the background
// ============================================================

function startReading() {
  readQueue = works.filter(w => !analyses[w.key]).map(w => w.key);
  shuffle(readQueue);     // a spread of works early, so first games vary
  pumpReading();
}

function pumpReading() {
  while (reading < READ_AT_ONCE && readQueue.length > 0) {
    const key = readQueue.shift();
    if (analyses[key] || readFailures.has(key)) continue;
    readWork(worksByKey.get(key));
  }
  if (reading === 0 && readQueue.length === 0) finishReading();
}

function readWork(work) {
  reading++;
  loadImage(analysisImageURL(work), img => {
    reading--;
    try {
      analyses[work.key] = copyFingerprint(analyzeComposition(img));
      unsavedReads++;
    } catch (e) {
      readFailures.add(work.key);
    }
    afterRead();
    pumpReading();
  }, () => {
    reading--;
    readFailures.add(work.key);
    afterRead();
    pumpReading();
  });
}

function afterRead() {
  const n = Object.keys(analyses).length;
  if (unsavedReads >= 25) { saveCachedAnalyses(); unsavedReads = 0; }
  if ([30, 80, 160, 260].some(m => statsAt < m && n >= m)) {
    statsAt = n;
    computeStats();
  }
  updateReady();
}

function finishReading() {
  if (unsavedReads > 0) { saveCachedAnalyses(); unsavedReads = 0; }
  computeStats();
  updateReady();
}
