/*
==================================================
CURATE YOUR OWN GALLERY: subject bubbles
==================================================

The drill-down bubble chart from O'Keeffe's Subjects,
redesigned for the side panel. Same hierarchy, same colors
and the same physics (pull to the centre, push apart):

  seven big groups → the Museum's categories → kinds
  (Nature → Plants → Flowers → Calla lilies …)

Clicking a bubble opens it, and the bubbles keep getting
smaller as you go down. Opening a group also narrows the
works below to that group. At the last level, clicking a
bubble chooses it. The path above the chart steps back up.

Counts are the works that can be hung here (and, when a
color is chosen, only works with that color tag), so the
bubbles resize as the color changes.

Runs as a p5 instance (the wall is the page's main sketch).
A hidden list of buttons mirrors the bubbles for keyboard
and screen-reader use.
==================================================
*/

const SUBJ_PALETTES = {
  light: { ground: "#FFFFFF", paper: "#F8F9F7", ink: "#1D2226", ink3: "#7C868D",
           cat: ["#B5533A", "#5F8446", "#3E5E9C", "#B0822F", "#7D4A7A", "#2C7C83", "#7C868D"] },
  dark:  { ground: "#141312", paper: "#1C2124", ink: "#E6E9E8", ink3: "#848E94",
           cat: ["#DB7A5E", "#8DB26F", "#7C9AD6", "#D9AE5C", "#B07AAE", "#5DB0B6", "#9AA3A9"] }
};
// Shorter names inside the bubbles only (the caption and the works list use the full name)
const SUBJ_SHORT = {
  "Architecture and built environment": "Architecture",
  "Portraits and human figures": "Portraits",
  "Human-made objects": "Objects",
  "Heliconia and bird of paradise": "Heliconia",
  "Jonquils and narcissus": "Jonquils"
};
const SUBJ_STEPS = [0, 0.18, -0.14, 0.32, -0.26, 0.44, 0.08, -0.06, 0.26, -0.2];

const SB = {
  path: [],          // child indexes from the top of SUBJECT_TREE.tree
  bubbles: [], ghosts: [], hover: null,
  counts: new Map(), // prefix ("", "1", "1.0", …) -> number of works in the current pool
  workPath: new Map(), // work id -> its leaf path string
  p: null, ready: false
};

function subjNode(path) { let n = SUBJECT_TREE.tree; for (const i of path) n = n[1][i]; return n; }
function subjKey(path) { return path.join("."); }
function subjName(path) { return path.length ? subjNode(path)[0] : "All subjects"; }

function subjCount() {
  SB.counts = new Map();
  const pool = F.color ? F.color.works : WORKS;
  for (const w of pool) {
    const lp = SB.workPath.get(w.id);
    if (lp === undefined) continue;
    const parts = lp ? lp.split(".") : [];
    let key = "";
    SB.counts.set("", (SB.counts.get("") || 0) + 1);
    for (const part of parts) { key = key ? key + "." + part : part; SB.counts.set(key, (SB.counts.get(key) || 0) + 1); }
  }
}

// does this node have any child that holds works in the current pool?
function subjHasKids(path) {
  const n = subjNode(path);
  return n[1].some((_, i) => SB.counts.get(subjKey(path.concat([i]))));
}

function subjIdsFor(path) {
  const pre = subjKey(path);
  const ids = new Set();
  for (const [id, lp] of SB.workPath) if (!pre || lp === pre || lp.startsWith(pre + ".")) ids.add(id);
  return ids;
}

// Narrow the works list to a node (or clear it at the top)
function subjSetFilter(path) {
  F.subject = path.length ? { name: subjName(path), path: path.slice(), ids: subjIdsFor(path) } : null;
  F.shown = RESULTS_PAGE;
}

function subjEnter(path, ox, oy, fromBubble) {
  const s = SB.p;
  SB.ghosts = SB.bubbles.map(b => Object.assign({}, b, { born: s.millis(), swell: b === fromBubble }));
  SB.path = path;
  SB.hover = null;
  subjBuild(ox, oy, true);
}

// (Re)build the bubbles for the current level, keeping positions of ones that stay
function subjBuild(ox, oy, fresh) {
  const s = SB.p;
  const node = subjNode(SB.path);
  const top = SB.path.length ? SB.path[0] : -1;
  const old = fresh ? new Map() : new Map(SB.bubbles.map(b => [b.k, b]));
  const W = s.width, H = s.height;
  SB.bubbles = [];
  node[1].forEach((kid, k) => {
    const n = SB.counts.get(subjKey(SB.path.concat([k]))) || 0;
    if (!n) return;
    const prev = old.get(k);
    SB.bubbles.push(prev ? Object.assign(prev, { n }) : {
      k, n, label: kid[0], ci: SB.path.length ? top : k, shade: SB.path.length ? k : 0,
      x: (ox ?? W / 2) + s.random(-24, 24), y: (oy ?? H / 2) + s.random(-24, 24), r: 1, vx: 0, vy: 0
    });
  });
  subjTargets();
  if (reduceMotionSubj()) { SB.bubbles.forEach(b => { b.r = b.tr; }); subjSettle(240); }
  subjDom();
}

function reduceMotionSubj() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

function subjTargets() {
  const s = SB.p, B = SB.bubbles;
  const total = B.reduce((a, b) => a + b.n, 0) || 1;
  const k = Math.sqrt((s.width - 12) * (s.height - 12) * 0.5 / (Math.PI * total));
  const cap = Math.min(s.width, s.height) * (B.length === 1 ? 0.34 : 0.3);
  B.forEach(b => { b.tr = Math.min(cap, Math.max(7, Math.sqrt(b.n) * k)); });
}

// physics from O'Keeffe's Subjects: pull toward the centre, push apart where bubbles overlap
function subjSettle(iter) {
  const s = SB.p, B = SB.bubbles;
  const cx = s.width / 2, cy = s.height / 2;
  for (let it = 0; it < iter; it++) {
    for (const b of B) { b.vx += (cx - b.x) * 0.0028; b.vy += (cy - b.y) * 0.004; }
    for (let i = 0; i < B.length; i++) {
      for (let j = i + 1; j < B.length; j++) {
        const a = B[i], b = B[j];
        let dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy) || 0.01;
        const m = a.r + b.r + 3;
        if (d < m) { const push = (m - d) / d * 0.5; dx *= push; dy *= push; a.x -= dx; a.y -= dy; b.x += dx; b.y += dy; }
      }
    }
    for (const b of B) {
      b.vx *= 0.82; b.vy *= 0.82; b.x += b.vx; b.y += b.vy;
      b.x = Math.min(Math.max(b.x, b.r + 3), s.width - b.r - 3);
      b.y = Math.min(Math.max(b.y, b.r + 3), s.height - b.r - 3);
    }
  }
}

function subjPalette() {
  const t = document.documentElement.getAttribute("data-theme");
  const dark = t ? t === "dark" : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return dark ? SUBJ_PALETTES.dark : SUBJ_PALETTES.light;
}

function subjShade(b, P) {
  const s = SB.p;
  const c = s.color(P.cat[Math.max(0, b.ci)]);
  if (!SB.path.length) return c;
  // siblings step lighter and darker around the parent's color
  const st = SUBJ_STEPS[b.shade % SUBJ_STEPS.length];
  return st >= 0 ? s.lerpColor(c, s.color(P.paper), st) : s.lerpColor(c, s.color(P.ink), -st);
}

function subjIsSelected(b) {
  return F.subject && subjKey(F.subject.path) === subjKey(SB.path.concat([b.k]));
}

function subjClick(b) {
  const p = SB.path.concat([b.k]);
  if (subjHasKids(p)) {
    subjSetFilter(p);
    subjEnter(p, b.x, b.y, b);
  } else {
    // last level: choose (or un-choose) this group without opening it
    subjSetFilter(subjIsSelected(b) ? SB.path : p);
    subjDom();
  }
  renderResults();
}

function subjGoTo(depth) {
  const p = SB.path.slice(0, depth);
  subjSetFilter(p);
  subjEnter(p, SB.p.width / 2, SB.p.height / 2, null);
  renderResults();
}

/* ---------- DOM: path, caption, hidden buttons ---------- */

function subjDom() {
  const crumbs = $("#subj-crumbs");
  if (!crumbs) return;
  const names = ["All subjects"].concat(SB.path.map((_, i) => subjName(SB.path.slice(0, i + 1))));
  crumbs.innerHTML = names.map((nm, i) => i === names.length - 1
    ? `<span aria-current="true">${esc(nm)}</span>`
    : `<button type="button" data-depth="${i}">${esc(nm)}</button><span class="sep" aria-hidden="true">›</span>`).join("");

  const list = $("#subj-buttons");
  list.innerHTML = SB.bubbles.slice().sort((a, b) => b.n - a.n).map(b => {
    const p = SB.path.concat([b.k]);
    const opens = subjHasKids(p);
    return `<li><button type="button" data-k="${b.k}" aria-pressed="${subjIsSelected(b) ? "true" : "false"}">${esc(b.label)}, ${b.n} ${b.n === 1 ? "work" : "works"}${opens ? ", opens smaller groups" : ""}</button></li>`;
  }).join("");
  subjCaption();
}

function subjCaption() {
  const cap = $("#bubble-caption");
  if (!cap) return;
  const b = SB.hover;
  const colorNote = F.color ? ` tagged ${esc(F.color.label)}` : "";
  if (b) {
    const opens = subjHasKids(SB.path.concat([b.k]));
    cap.innerHTML = `<b>${esc(b.label)}</b> · ${b.n} ${b.n === 1 ? "work" : "works"}${colorNote} · ${opens ? "click to open" : subjIsSelected(b) ? "click to clear" : "click to choose"}`;
    return;
  }
  if (!SB.bubbles.length) { cap.textContent = F.color ? `No works tagged ${F.color.label} here. Step back up to see more.` : ""; return; }
  if (!SB.path.length) cap.innerHTML = `Seven big groups${colorNote ? ", counting works" + colorNote : ""}. Click a bubble to open it and narrow the works below.`;
  else if (SB.path.length >= 2) cap.innerHTML = `Groups at this level were worked out with AI from titles and are a draft for curatorial review.`;
  else cap.innerHTML = `The Museum's subject categories within <b>${esc(subjName(SB.path))}</b>.`;
}

/* ---------- the p5 sketch ---------- */

function subjSketch(s) {
  SB.p = s;   // setup can run inside the p5 constructor, before it returns
  s.setup = () => {
    const box = $("#subject-bubbles");
    const w = box.clientWidth || 320;
    s.createCanvas(w, subjHeight(w)).parent(box);
    s.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
    s.canvas.setAttribute("aria-hidden", "true");
    SB.ready = true;
    subjCount();
    subjBuild(w / 2, s.height / 2, true);
  };
  s.draw = () => {
    const P = subjPalette();
    s.background(P.ground);
    const B = SB.bubbles;
    const rm = reduceMotionSubj();
    for (const b of B) b.r += (b.tr - b.r) * (rm ? 1 : 0.16);
    subjSettle(3);

    // ghosts of the previous level: the clicked bubble swells, the rest shrink away
    const now = s.millis();
    SB.ghosts = SB.ghosts.filter(g => now - g.born < 380);
    for (const g of SB.ghosts) {
      const t = (now - g.born) / 380;
      const c = subjShade(g, P); c.setAlpha(255 * (1 - t) * (g.swell ? 0.5 : 0.85));
      s.noStroke(); s.fill(c);
      s.circle(g.x, g.y, 2 * (g.swell ? g.r * (1 + t * 2.4) : g.r * (1 - t)));
    }

    let over = null;
    if (s.mouseX >= 0 && s.mouseX <= s.width && s.mouseY >= 0 && s.mouseY <= s.height) {
      for (const b of B) if (Math.hypot(s.mouseX - b.x, s.mouseY - b.y) < b.r) over = b;
    }
    if (!SB.focusK && over !== SB.hover) { SB.hover = over; subjCaption(); }

    for (const b of B) {
      const c = subjShade(b, P);
      s.noStroke(); s.fill(c); s.circle(b.x, b.y, b.r * 2);
      const sel = subjIsSelected(b);
      if (b === SB.hover || sel) {
        s.noFill(); s.stroke(P.ink); s.strokeWeight(sel ? 2.5 : 1.5);
        s.circle(b.x, b.y, b.r * 2 + (sel ? 7 : 5)); s.noStroke();
      }
      if (b.r > 21) subjLabel(b, c);
    }
    s.cursor(SB.hover ? s.HAND : s.ARROW);
  };
  s.mousePressed = () => {
    if (s.mouseX < 0 || s.mouseX > s.width || s.mouseY < 0 || s.mouseY > s.height) return;
    // hit-test here too, so taps work without a hover first
    let hit = null;
    for (const b of SB.bubbles) if (Math.hypot(s.mouseX - b.x, s.mouseY - b.y) < b.r) hit = b;
    if (hit) { subjClick(hit); return false; }
  };
  s.windowResized = () => subjResize();
}

function subjHeight(w) { return Math.round(Math.max(230, Math.min(300, w * 0.82))); }

function subjResize() {
  const s = SB.p, box = $("#subject-bubbles");
  if (!s || !box || !box.clientWidth || Math.abs(box.clientWidth - s.width) < 1) return;
  s.resizeCanvas(box.clientWidth, subjHeight(box.clientWidth));
  subjTargets();
}

function subjLabel(b, c) {
  // drawn with the canvas API directly so the type gets a real fallback stack
  const s = SB.p, ctx = s.drawingContext;
  const lum = s.red(c) * 0.299 + s.green(c) * 0.587 + s.blue(c) * 0.114;
  const ink = lum > 150 ? "29,34,38" : "255,255,255";
  const size = Math.max(10.5, Math.min(14, b.r / 4.4));
  const stack = '"Schibsted Grotesk","Helvetica Neue",Helvetica,Arial,sans-serif';
  ctx.save();
  ctx.font = `700 ${size}px ${stack}`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const maxW = b.r * 1.55, words = (SUBJ_SHORT[b.label] || b.label).split(" "), lines = [];
  let line = "";
  for (const wd of words) { const t = line ? line + " " + wd : wd; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = wd; } else line = t; }
  if (line) lines.push(line);
  const lh = size * 1.12, showN = b.r > 28;
  const fits = lines.length * lh + (showN ? size : 0) <= b.r * 1.55 && lines.every(l => ctx.measureText(l).width <= b.r * 1.8);
  if (fits) {   // otherwise the caption names it
    let y = b.y - (lines.length * lh + (showN ? size * 0.95 : 0)) / 2 + lh / 2;
    ctx.fillStyle = `rgb(${ink})`;
    for (const l of lines) { ctx.fillText(l, b.x, y); y += lh; }
    if (showN) {
      ctx.font = `400 ${Math.max(10, size * 0.8)}px ${stack}`;
      ctx.fillStyle = `rgba(${ink},0.8)`;
      ctx.fillText(b.n.toLocaleString(), b.x, y + 1);
    }
  }
  ctx.restore();
}

/* ---------- called from ui.js ---------- */

function initSubjectBubbles() {
  SB.workPath = new Map();
  for (const w of WORKS) {
    const lp = SUBJECT_TREE.paths[w.id];
    if (lp !== undefined) SB.workPath.set(w.id, lp);
  }
  $("#subj-crumbs").addEventListener("click", e => {
    const b = e.target.closest("button[data-depth]"); if (b) subjGoTo(+b.dataset.depth);
  });
  const list = $("#subj-buttons");
  list.addEventListener("click", e => {
    const b = e.target.closest("button[data-k]"); if (!b) return;
    const bub = SB.bubbles.find(x => x.k === +b.dataset.k);
    if (bub) { subjClick(bub); requestAnimationFrame(() => { const f = list.querySelector("button"); if (f) f.focus(); }); }
  });
  list.addEventListener("focusin", e => {
    const b = e.target.closest("button[data-k]"); if (!b) return;
    SB.focusK = true; SB.hover = SB.bubbles.find(x => x.k === +b.dataset.k) || null; subjCaption();
  });
  list.addEventListener("focusout", () => { SB.focusK = false; SB.hover = null; subjCaption(); });
  new p5(subjSketch);
}

// The panel was shown, resized, or the color changed: refresh counts and sizes.
function renderSubjectBubbles() {
  if (!SB.ready) return;
  subjResize();
  subjCount();
  // if the current level has nothing left (after a color change), step up until something shows
  while (SB.path.length && !SB.counts.get(subjKey(SB.path))) SB.path = SB.path.slice(0, -1);
  subjBuild(null, null, false);
}

// Back to the top (used when the subject filter is cleared or the visitor starts over)
function resetSubjectBubbles() {
  if (!SB.ready) return;
  subjCount();
  subjEnter([], SB.p.width / 2, SB.p.height / 2, null);
}
