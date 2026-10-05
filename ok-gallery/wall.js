/*
==================================================
CURATE YOUR OWN GALLERY: the wall (p5.js)
==================================================

Everything on the wall is measured in inches, with y
running up from the floor. The view turns inches into
pixels (s = pixels per inch), so every work hangs at its
true size relative to the wall, the other works, and
O'Keeffe herself (5 ft 5 in).

Hangs
- Eye level: each work is centered 60 inches from the
  floor, in one row, 30 inches apart.
- Salon: works are packed close together (3 inches
  apart) around the 60-inch line, largest first.

Drag a work to rearrange it. In the eye-level hang the
row reorders as you drag; in a salon hang the work goes
where you drop it (and slides to the nearest open spot
if it would overlap another work).
==================================================
*/

const G = {
  ids: [],            // works on the wall, in hanging order
  hang: "line",       // "line" or "salon"
  wall: "#EAE3D4",
  title: "",
  intro: "",
  curator: "",
  showLabels: true,
  showFigure: true,
  showGuide: true,
  salon: {},          // id -> {x, y}: centre of the work; x relative to the cluster, y from the floor
  snap: true,         // salon: keep works apart (slide to the nearest open spot); off = free placement
  z: {},              // salon stacking order when works overlap (free placement)
  selected: null
};

const MAX_WORKS = 24;
const CENTER = 60;          // in, on center
const WALL_MIN_H = 144;     // 12 ft
const FLOOR = 16;           // floor band shown below the wall
const BASEBOARD = 4;
const M_LEFT = 36, TITLE_W = 56, TITLE_GAP = 54, M_RIGHT = 30;
const GAP_LINE = 24, GAP_SALON = 3;
const MIN_BOTTOM_LINE = 10, MIN_BOTTOM_SALON = 12;
const LABEL_W = 5, LABEL_H = 3.25, LABEL_GAP = 3;
const FIG_ZONE = 44;
const OKEEFFE_HEIGHT = 65;

const UI_FONT = '"Schibsted Grotesk", "Helvetica Neue", Helvetica, Arial, sans-serif';
const STORE_KEY = "okx-curate-gallery-v1";

let L = null;                    // current layout
let view = { s: 4, ox: 0, oy: 0 };
let tv = { s: 4, ox: 0, oy: 0 }; // target view
let userZoomed = false;
let disp = new Map();            // id -> animated {x, y, a}
let hoverId = null;
let drag = null;
let pan = null;
let frozenOffset = null;
let reduceMotion = false;
let wallChangeListeners = [];
let imgCache = new Map();
let imgStats = { ok: 0, fail: 0 };
let wrapCache = new Map();
let cnv;
let exporting = false;   // true while the saved image is drawn

/* ---------- state ---------- */

function onWallChange(fn) { wallChangeListeners.push(fn); }
function wallChanged(opts) {
  relayout();
  if (!userZoomed || (opts && opts.refit)) adjustHeight();
  if (!userZoomed || (opts && opts.refit)) fitView(false);
  saveState();
  for (const fn of wallChangeListeners) fn(opts || {});
}

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      ids: G.ids, hang: G.hang, wall: G.wall, title: G.title, intro: G.intro, curator: G.curator,
      showLabels: G.showLabels, showFigure: G.showFigure, showGuide: G.showGuide, salon: G.salon, snap: G.snap, z: G.z
    }));
  } catch (e) { /* storage unavailable: the wall just won't be remembered */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    Object.assign(G, s);
    G.ids = (G.ids || []).filter(id => WORK_BY_ID.has(id)).slice(0, MAX_WORKS);
    G.salon = G.salon || {}; G.z = G.z || {};
    if (G.snap === undefined) G.snap = true;
    return true;
  } catch (e) { return false; }
}

function wallAdd(id) {
  if (G.ids.includes(id)) return true;
  if (G.ids.length >= MAX_WORKS) return false;
  G.ids.push(id);
  if (G.hang === "salon") packSalon([id]);
  G.selected = id;
  wallChanged({ added: id });
  return true;
}

function wallRemove(id) {
  G.ids = G.ids.filter(x => x !== id);
  delete G.salon[id];
  disp.delete(id);
  if (G.selected === id) G.selected = null;
  wallChanged({ removed: id });
}

function wallClear() {
  G.ids = []; G.salon = {}; G.selected = null; disp.clear();
  userZoomed = false;
  wallChanged({ refit: true });
}

function wallMove(id, dir) {
  const i = G.ids.indexOf(id), j = i + dir;
  if (i < 0 || j < 0 || j >= G.ids.length) return;
  [G.ids[i], G.ids[j]] = [G.ids[j], G.ids[i]];
  wallChanged({ moved: id });
}

function setHang(mode) {
  if (G.hang === mode) return;
  G.hang = mode;
  if (mode === "salon") { G.salon = {}; packSalon(G.ids.slice()); }
  userZoomed = false;
  wallChanged({ refit: true });
}

function wallRehang() {
  G.salon = {};
  packSalon(G.ids.slice());
  userZoomed = false;
  wallChanged({ refit: true });
}

function wallSelect(id) { G.selected = id; for (const fn of wallChangeListeners) fn({ selected: id }); }

function setSnap(on) {
  G.snap = on;
  if (on && G.hang === "salon") {
    // tidy up: move overlapping works apart, in stacking order
    for (const id of drawOrder()) resolveSalon(id);
  }
  wallChanged({});
}

let zCounter = 0;
function bringToFront(id) {
  for (const v of Object.values(G.z)) zCounter = Math.max(zCounter, v);
  G.z[id] = ++zCounter;
}

// Works in the order they're drawn (later ones on top)
function drawOrder() {
  if (G.hang !== "salon") return G.ids.slice();
  return G.ids.slice().sort((a, b) => (G.z[a] || 0) - (G.z[b] || 0));
}

/* ---------- salon packing ---------- */

function salonRect(id, pos) {
  const w = WORK_BY_ID.get(id);
  return { id, cx: pos.x, cy: pos.y, w: w.w, h: w.h };
}

function rectsOverlap(a, b, gap) {
  return Math.abs(a.cx - b.cx) * 2 < a.w + b.w + gap * 2 - 0.001 &&
         Math.abs(a.cy - b.cy) * 2 < a.h + b.h + gap * 2 - 0.001;
}

function salonTopLimit() { return WALL_MIN_H - 10; }

function packOne(w, h, placed) {
  if (!placed.length) return { x: 0, y: Math.max(CENTER, MIN_BOTTOM_SALON + h / 2) };
  const g = GAP_SALON;
  const cands = [];
  for (const p of placed) {
    const pl = p.cx - p.w / 2, pr = p.cx + p.w / 2, pb = p.cy - p.h / 2, pt = p.cy + p.h / 2;
    const ys = [pt - h / 2, p.cy, pb + h / 2];
    const xs = [pl + w / 2, p.cx, pr - w / 2];
    for (const y of ys) { cands.push([pr + g + w / 2, y], [pl - g - w / 2, y]); }
    for (const x of xs) { cands.push([x, pt + g + h / 2], [x, pb - g - h / 2]); }
  }
  let minX = Infinity, maxX = -Infinity;
  for (const p of placed) { minX = Math.min(minX, p.cx - p.w / 2); maxX = Math.max(maxX, p.cx + p.w / 2); }
  const midX = (minX + maxX) / 2;

  for (const relax of [false, true]) {
    let best = null, bestScore = Infinity;
    for (const [x, y] of cands) {
      if (y - h / 2 < MIN_BOTTOM_SALON - 0.001) continue;
      if (!relax && y + h / 2 > salonTopLimit()) continue;
      const r = { cx: x, cy: y, w, h };
      if (placed.some(p => rectsOverlap(r, p, g))) continue;
      const dx = x - midX, dy = (y - CENTER) * 2.4;
      const score = dx * dx + dy * dy;
      if (score < bestScore) { bestScore = score; best = { x, y }; }
    }
    if (best) return best;
  }
  return { x: maxX + g + w / 2, y: Math.max(CENTER, MIN_BOTTOM_SALON + h / 2) };
}

function packSalon(newIds) {
  const placed = G.ids.filter(id => G.salon[id] && !newIds.includes(id)).map(id => salonRect(id, G.salon[id]));
  const order = newIds.slice().sort((a, b) => {
    const A = WORK_BY_ID.get(a), B = WORK_BY_ID.get(b);
    return B.w * B.h - A.w * A.h;
  });
  for (const id of order) {
    const w = WORK_BY_ID.get(id);
    const pos = packOne(w.w, w.h, placed);
    G.salon[id] = { x: pos.x, y: pos.y };
    placed.push(salonRect(id, pos));
  }
}

// After a drop: if the work overlaps another, move it to the nearest open spot.
function resolveSalon(id) {
  const me = WORK_BY_ID.get(id);
  const others = G.ids.filter(x => x !== id && G.salon[x]).map(x => salonRect(x, G.salon[x]));
  const p = G.salon[id];
  const ok = (x, y) => {
    if (y - me.h / 2 < 2) return false;
    const r = { cx: x, cy: y, w: me.w, h: me.h };
    return !others.some(o => rectsOverlap(r, o, 1));
  };
  p.x = Math.round(p.x * 2) / 2; p.y = Math.round(p.y * 2) / 2;
  if (ok(p.x, p.y)) return;
  for (let r = 1; r < 400; r += 1) {
    const n = Math.max(8, Math.round(r * 2));
    let best = null, bd = Infinity;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r;
      if (ok(x, y)) {
        const d = Math.abs(Math.sin(a)) * 1.2;   // prefer sideways nudges slightly
        if (d < bd) { bd = d; best = { x, y }; }
      }
    }
    if (best) { p.x = Math.round(best.x * 2) / 2; p.y = Math.round(best.y * 2) / 2; return; }
  }
}

/* ---------- layout ---------- */

function relayout() {
  const items = new Map();
  const labels = new Map();
  let x = M_LEFT;
  const title = { x, w: TITLE_W };
  x += TITLE_W + TITLE_GAP;
  let maxTop = 0, figX, wallW, offsetX = 0;

  if (G.hang === "line") {
    for (const id of G.ids) {
      const w = WORK_BY_ID.get(id);
      const y = Math.max(MIN_BOTTOM_LINE, CENTER - w.h / 2);
      items.set(id, { x, y, w: w.w, h: w.h });
      maxTop = Math.max(maxTop, y + w.h);
      if (G.showLabels) labels.set(id, { x: x + w.w + LABEL_GAP, y: Math.max(y, 40), w: LABEL_W, h: LABEL_H });
      x += w.w + GAP_LINE;
    }
    if (G.ids.length) x -= GAP_LINE;
  } else {
    let minL = Infinity, maxR = -Infinity;
    for (const id of G.ids) {
      const w = WORK_BY_ID.get(id), p = G.salon[id];
      if (!p) continue;
      minL = Math.min(minL, p.x - w.w / 2); maxR = Math.max(maxR, p.x + w.w / 2);
    }
    if (minL === Infinity) { minL = 0; maxR = 0; }
    offsetX = frozenOffset !== null ? frozenOffset : x - minL;
    for (const id of G.ids) {
      const w = WORK_BY_ID.get(id), p = G.salon[id];
      if (!p) continue;
      const it = { x: offsetX + p.x - w.w / 2, y: p.y - w.h / 2, w: w.w, h: w.h };
      items.set(id, it);
      maxTop = Math.max(maxTop, it.y + it.h);
    }
    x = Math.max(x, offsetX + maxR);
    // keep the wall wide enough while a work is dragged past either end
    for (const it of items.values()) x = Math.max(x, it.x + it.w);
  }

  if (G.ids.length) x += 30;
  else x += 120;   // room for the "choose works" hint
  figX = x + FIG_ZONE / 2;
  wallW = x + FIG_ZONE + M_RIGHT;
  let minX = 0;
  for (const it of items.values()) minX = Math.min(minX, it.x - M_LEFT);
  const wallH = Math.max(WALL_MIN_H, Math.ceil((maxTop + 18) / 12) * 12);

  L = { items, labels, title, figX, wallW, wallH, minX, offsetX };
  return L;
}

/* ---------- view ---------- */

function fitTarget() {
  const pad = width < 600 ? 10 : 18;
  const totalH = L.wallH + FLOOR;
  const span = L.wallW - L.minX;
  const s = Math.min((width - pad * 2) / span, (height - pad * 2) / totalH);
  return {
    s,
    ox: (width - span * s) / 2 - L.minX * s,
    oy: (height - totalH * s) / 2 + L.wallH * s
  };
}

function fitView(instant) {
  if (!L) return;
  adjustHeight();
  tv = fitTarget();
  userZoomed = false;
  if (instant || reduceMotion) view = { ...tv };
}

function wallZoom(f, px, py) {
  if (px === undefined) { px = width / 2; py = height / 2; }
  const fit = fitTarget();
  const ns = Math.min(Math.max(view.s * f, fit.s * 0.9), 40);
  const wx = (px - view.ox) / view.s, wy = (view.oy - py) / view.s;
  view = { s: ns, ox: px - wx * ns, oy: py + wy * ns };
  tv = { ...view };
  userZoomed = ns > fit.s * 1.01;
  if (!userZoomed) fitView(false);
}

function toX(x) { return view.ox + x * view.s; }
function toY(y) { return view.oy - y * view.s; }
function fromX(px) { return (px - view.ox) / view.s; }
function fromY(py) { return (view.oy - py) / view.s; }

/* ---------- colors ---------- */

function isDarkTheme() {
  const t = document.documentElement.getAttribute("data-theme");
  if (t) return t === "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function hexLum(hex) {
  const c = hexToRgb(hex) || { r: 200, g: 200, b: 200 };
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

function shade(hex, amt) {
  const c = hexToRgb(hex) || { r: 200, g: 200, b: 200 };
  const m = v => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return `rgb(${m(c.r)},${m(c.g)},${m(c.b)})`;
}

function wallInk() { return hexLum(G.wall) > 0.33 ? [29, 27, 25] : [244, 241, 236]; }
function rgba(c, a) { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

/* ---------- images ---------- */

function imageFor(work, pxW, pxH) {
  const need = Math.max(pxW, pxH) * Math.min(window.devicePixelRatio || 1, 2);
  const bucket = need <= 220 ? 200 : need <= 450 ? 400 : need <= 900 ? 800 : 1600;
  let e = imgCache.get(work.dam);
  if (!e) { e = { best: null, loading: 0, failed: false }; imgCache.set(work.dam, e); }
  if (!e.failed && !e.loading && (!e.best || e.best.size < bucket)) {
    e.loading = bucket;
    const im = new Image();          // drawn straight to the canvas, so no CORS needed
    im.decoding = "async";
    im.onload = () => { e.best = { img: im, size: bucket }; e.loading = 0; imgStats.ok++; };
    im.onerror = () => { e.loading = 0; if (!e.best) { e.failed = true; imgStats.fail++; } };
    im.src = IIIF_URL(work.dam, bucket, bucket);
  }
  return e.best ? e.best.img : null;
}

// Stand-in when an image can't load: the work's color tags as bands.
function drawColorField(ctx, work, x, y, w, h) {
  const cols = work.colors.length ? work.colors.map(c => c.hex) : null;
  if (!cols) {
    ctx.fillStyle = "#D9D2C6"; ctx.fillRect(x, y, w, h);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.strokeStyle = "rgba(0,0,0,0.10)"; ctx.lineWidth = 1;
    const step = Math.max(5, w / 10);
    for (let k = -h; k < w; k += step) { ctx.beginPath(); ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + h, y); ctx.stroke(); }
    ctx.restore();
    return;
  }
  const n = cols.length;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = cols[i];
    const x0 = x + (w * i) / n, x1 = x + (w * (i + 1)) / n;
    ctx.fillRect(Math.floor(x0), y, Math.ceil(x1 - x0) + (i < n - 1 ? 1 : 0), h);
  }
}

/* ---------- text on the wall ---------- */

function wrapText(ctx, text, fontSpec, maxWidthIn) {
  // measure at 100 px per inch, then reuse at any scale
  const key = fontSpec + "|" + maxWidthIn + "|" + text;
  if (wrapCache.has(key)) return wrapCache.get(key);
  ctx.save();
  ctx.font = fontSpec.replace("{px}", "100px");
  const lines = [];
  for (const para of String(text).split(/\n+/)) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const t = line ? line + " " + word : word;
      if (ctx.measureText(t).width / 100 > maxWidthIn && line) { lines.push(line); line = word; }
      else line = t;
    }
    if (line) lines.push(line);
  }
  ctx.restore();
  if (wrapCache.size > 400) wrapCache.clear();
  wrapCache.set(key, lines);
  return lines;
}

function titleBlockLines(ctx) {
  const TITLE_SIZE = 5.5, INTRO_SIZE = 0.8, CUR_SIZE = 0.7;
  const tFont = `800 {px} ${UI_FONT}`;
  const iFont = `400 {px} ${UI_FONT}`;
  const cFont = `italic 400 {px} ${UI_FONT}`;
  const out = [];
  if (!G.title.trim() && exporting) return out.concat(introAndCurator(ctx, false));
  const t = G.title.trim() || "Your exhibition title";
  // wrapText measures at 100 px per inch of type size, so the width limit is in type sizes
  const tl = wrapText(ctx, t, tFont, TITLE_W / TITLE_SIZE);
  for (const line of tl) out.push({ text: line, size: TITLE_SIZE, lh: TITLE_SIZE * 1.0, font: tFont, ghost: !G.title.trim() });
  return out.concat(introAndCurator(ctx, true));
}

function introAndCurator(ctx, afterTitle) {
  const INTRO_SIZE = 0.8, CUR_SIZE = 0.7;
  const iFont = `400 {px} ${UI_FONT}`;
  const cFont = `italic 400 {px} ${UI_FONT}`;
  const out = [];
  const intro = G.intro.trim();
  if (intro) {
    if (afterTitle) out.push({ gap: 2.2 });
    for (const line of wrapText(ctx, intro, iFont, (TITLE_W - 6) / INTRO_SIZE)) out.push({ text: line, size: INTRO_SIZE, lh: INTRO_SIZE * 1.5, font: iFont });
  }
  const cur = G.curator.trim();
  if (cur) {
    if (afterTitle || intro) out.push({ gap: intro ? 1.4 : 2.2 });
    out.push({ text: "Curated by " + cur, size: CUR_SIZE, lh: CUR_SIZE * 1.5, font: cFont });
  }
  return out;
}

function drawTitleBlock(ctx, ink) {
  const lines = titleBlockLines(ctx);
  let total = 0;
  for (const l of lines) total += l.gap || l.lh;
  let top = Math.max(CENTER + total / 2, 24 + total);
  const x = toX(L.title.x);
  let y = top;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  for (const l of lines) {
    if (l.gap) { y -= l.gap; continue; }
    y -= l.lh;
    const px = l.size * view.s;
    const baseY = toY(y + l.lh * 0.22);
    if (px < 3.5) {
      // too small to read: draw the line as a bar
      ctx.fillStyle = rgba(ink, l.ghost ? 0.12 : 0.28);
      const wIn = Math.min(TITLE_W, (l.text.length * l.size * 0.5));
      ctx.fillRect(x, baseY - px * 0.7, wIn * view.s, Math.max(1, px * 0.6));
      continue;
    }
    ctx.font = l.font.replace("{px}", px.toFixed(2) + "px");
    ctx.fillStyle = rgba(ink, l.ghost ? 0.28 : 0.92);
    if (l.size > 2) ctx.letterSpacing = (-0.03 * px).toFixed(2) + "px";
    ctx.fillText(l.text, x, baseY);
    ctx.letterSpacing = "0px";
  }
}

function drawLabel(ctx, work, r, ink) {
  const x = toX(r.x), y = toY(r.y + r.h), w = r.w * view.s, h = r.h * view.s;
  const light = hexLum(G.wall) > 0.33;
  ctx.fillStyle = light ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.92)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  const pad = 0.35 * view.s;
  const px = 0.36 * view.s;
  ctx.fillStyle = "rgba(29,27,25,0.85)";
  if (px < 4) {
    ctx.fillStyle = "rgba(29,27,25,0.3)";
    const lh = h / 6;
    for (let i = 0; i < 3; i++) ctx.fillRect(x + pad, y + pad + i * lh * 1.4, (w - pad * 2) * (i ? 0.6 : 0.9), Math.max(1, lh * 0.5));
    return;
  }
  ctx.textBaseline = "top"; ctx.textAlign = "left";
  const maxW = r.w - 0.7;
  const tl = wrapText(ctx, work.title, `italic 600 {px} ${UI_FONT}`, maxW / 0.36).slice(0, 3);
  let yy = y + pad;
  ctx.font = `italic 600 ${px.toFixed(2)}px ${UI_FONT}`;
  for (const t of tl) { ctx.fillText(t, x + pad, yy); yy += px * 1.25; }
  ctx.font = `400 ${px.toFixed(2)}px ${UI_FONT}`;
  const meta = [work.date, work.medium].filter(Boolean);
  for (const t of meta) {
    if (yy + px > y + h - pad * 0.5) break;
    const fitted = wrapText(ctx, t, `400 {px} ${UI_FONT}`, maxW / 0.36)[0] || "";
    ctx.fillText(fitted, x + pad, yy); yy += px * 1.25;
  }
}

/* ---------- O'Keeffe for scale ---------- */
// Profile silhouette traced from a photograph (shared with O'Keeffe to Scale), facing left toward the works.
// Points are in inches: [from her centre line, above the floor].
const OKEEFFE_OUTLINE = [[2.22,65],[2.93,64.6],[2.93,64.5],[3.43,64.09],[3.73,63.99],[4.54,63.18],[4.95,62.98],[5.45,62.48],[6.36,61.87],[7.17,61.16],[7.37,60.76],[7.37,60.26],[6.96,59.75],[6.76,59.35],[6.86,59.25],[6.76,59.15],[7.87,57.63],[8.48,56.52],[8.98,56.12],[8.78,55.92],[8.48,55.92],[8.07,56.12],[7.77,56.12],[7.47,56.32],[7.17,56.32],[6.86,56.52],[6.56,56.52],[5.85,56.93],[5.55,56.93],[5.45,56.82],[5.45,56.02],[4.95,55.31],[4.95,54.91],[4.74,54.5],[4.14,54.1],[4.54,53.49],[5.65,51.17],[5.75,49.36],[5.85,49.25],[5.85,47.94],[5.75,47.84],[5.75,47.54],[5.85,47.44],[5.85,45.52],[5.75,45.42],[5.75,44.41],[5.65,44.31],[5.65,44.01],[5.75,43.91],[5.75,43.6],[5.65,43.5],[5.65,42.69],[5.55,42.59],[5.55,42.19],[5.45,42.09],[5.45,40.68],[5.35,40.57],[5.45,40.17],[5.05,39.87],[4.95,39.97],[4.74,39.87],[4.74,39.26],[4.44,39.16],[4.34,38.96],[4.44,38.86],[4.44,38.35],[4.64,38.15],[4.84,37.45],[5.65,35.93],[5.75,35.53],[5.95,35.33],[5.95,35.02],[6.06,34.92],[6.16,34.22],[6.26,34.11],[6.26,33.61],[6.36,33.51],[6.36,32.7],[6.26,32.6],[6.26,30.89],[6.36,30.78],[6.36,29.98],[6.46,29.88],[6.46,29.17],[6.56,29.07],[6.66,25.74],[6.76,25.64],[6.76,23.92],[6.86,23.82],[6.86,23.21],[6.96,23.11],[6.96,22.51],[7.07,22.41],[7.07,21.4],[7.17,21.3],[7.17,20.59],[7.27,20.49],[7.27,18.47],[7.17,18.37],[7.17,17.97],[6.86,17.66],[6.46,16.65],[6.46,15.95],[6.36,15.85],[6.36,14.23],[6.26,14.13],[6.36,13.93],[6.36,12.62],[6.26,12.52],[6.26,10.4],[6.16,10.3],[6.16,9.69],[6.06,9.59],[5.45,9.69],[5.25,9.49],[5.25,8.48],[5.15,8.38],[5.15,7.97],[5.05,7.87],[5.05,5.25],[5.15,5.15],[5.25,4.44],[5.65,3.73],[5.75,2.93],[5.85,2.83],[5.85,1.61],[5.55,0.91],[5.55,0],[-1.21,0],[-1.51,0.3],[-1.51,0.81],[-1.41,0.91],[-1.41,1.11],[-0.91,1.61],[-1.11,1.82],[-1.51,2.02],[-1.72,2.02],[-2.02,2.22],[-3.13,2.42],[-3.13,3.03],[-3.03,3.23],[-2.73,3.43],[-1.82,3.43],[-1.72,3.53],[-1.31,3.53],[-1.21,3.63],[-0.5,3.73],[-0.2,4.14],[0.2,4.34],[0.5,4.34],[1.01,4.64],[1.41,4.64],[1.61,4.95],[1.61,5.45],[1.72,5.55],[1.72,6.46],[1.61,6.56],[1.61,7.67],[1.51,7.77],[1.51,8.48],[1.41,8.58],[1.41,9.49],[1.21,9.79],[-0,9.79],[-0.4,9.49],[-1.01,9.49],[-1.11,9.39],[-4.54,9.39],[-4.84,9.59],[-5.45,9.59],[-5.95,9.79],[-6.06,10.3],[-6.16,10.4],[-6.26,13.63],[-6.36,13.73],[-6.36,15.34],[-6.46,15.44],[-6.46,17.56],[-6.56,17.66],[-6.56,23.01],[-6.46,23.11],[-6.46,25.64],[-6.36,25.74],[-6.26,29.07],[-6.16,29.17],[-6.16,30.28],[-6.06,30.38],[-6.06,31.19],[-5.95,31.29],[-5.95,32.1],[-5.85,32.2],[-5.85,33.31],[-5.75,33.41],[-5.75,34.22],[-5.65,34.32],[-5.65,35.12],[-5.55,35.23],[-5.45,36.74],[-5.35,36.84],[-5.35,37.24],[-5.25,37.34],[-5.15,37.95],[-4.34,39.57],[-4.24,40.17],[-4.14,40.27],[-4.14,40.68],[-4.24,40.78],[-4.24,40.98],[-4.74,41.58],[-5.55,42.09],[-5.85,42.39],[-6.36,42.59],[-6.66,42.59],[-7.17,43.1],[-7.27,43.1],[-7.57,43.7],[-7.77,43.91],[-7.97,43.91],[-7.97,44.11],[-8.07,44.21],[-8.07,44.51],[-7.87,44.81],[-7.87,45.02],[-7.97,45.12],[-8.18,45.12],[-8.28,45.02],[-8.58,44.31],[-9.08,44.31],[-9.08,44.61],[-9.39,44.81],[-9.39,45.32],[-7.87,46.93],[-7.27,46.93],[-7.17,47.03],[-6.96,47.03],[-6.36,47.64],[-6.36,47.74],[-5.15,49.15],[-5.25,50.06],[-5.65,51.17],[-5.65,51.78],[-5.45,52.28],[-5.25,52.38],[-5.15,52.69],[-4.44,53.39],[-4.44,53.49],[-4.14,53.7],[-3.63,53.7],[-3.33,53.9],[-2.93,53.9],[-2.42,53.49],[-1.92,53.39],[-1.61,53.7],[-1.61,53.9],[-1.41,54.1],[-1.11,54.7],[-1.11,54.91],[-1.51,55.21],[-1.61,55.41],[-2.02,55.61],[-1.92,55.71],[-2.42,56.22],[-2.62,56.22],[-3.03,56.52],[-3.03,57.03],[-2.83,57.33],[-2.83,57.73],[-2.73,57.83],[-2.62,58.64],[-2.52,58.74],[-2.52,58.94],[-2.73,59.15],[-2.93,59.65],[-2.52,60.05],[-1.82,60.46],[-1.41,60.86],[-1.31,61.27],[-1.72,61.67],[-3.33,62.68],[-4.14,63.49],[-4.14,63.99],[-4.04,64.09],[-3.53,64.19],[-3.43,64.09],[-2.93,63.99],[-2.32,63.59],[-2.12,63.59],[-1.31,63.18],[-0.91,63.18],[-0.81,63.08],[-0.3,62.98],[0.1,63.28],[1.72,65]];
const OKEEFFE_GAPS = [[[-5.15,47.74],[-5.25,47.74],[-5.45,47.54],[-5.45,47.44],[-5.95,46.73],[-5.65,46.43],[-5.55,46.43],[-5.25,46.02],[-5.15,46.13],[-5.15,47.44],[-5.05,47.54]],[[-0.81,53.19],[-1.11,53.19],[-1.31,53.09],[-2.12,52.38],[-2.12,51.68],[-2.02,51.58],[-2.02,51.07],[-2.32,50.57],[-2.42,50.06],[-2.83,49.36],[-2.83,47.54],[-2.73,47.44],[-2.52,47.44],[-1.92,48.04],[-1.92,48.35],[-1.82,48.55],[-1.61,48.65],[-1.01,49.96],[-1.11,50.57],[-1.51,51.37],[-1.51,52.08],[-1.21,52.38],[-0.81,52.38],[-0.71,52.18],[-0.71,51.78],[-0.5,51.48],[-0.3,51.58],[-0.3,51.78],[-0.1,51.98],[-0.2,52.18],[-0.2,52.48],[-0.4,52.69],[-0.5,52.59],[-0.71,52.59],[-0.71,53.09]]];
let figurePath = null;

function drawFigure(ctx, ink, floorInk, uiPx) {
  if (!figurePath) {
    figurePath = new Path2D();
    for (const poly of [OKEEFFE_OUTLINE, ...OKEEFFE_GAPS]) {
      poly.forEach(([x, y], i) => (i ? figurePath.lineTo(x, y) : figurePath.moveTo(x, y)));
      figurePath.closePath();
    }
  }
  if (OKEEFFE_HEIGHT * view.s < 16) return;
  ctx.save();
  ctx.translate(toX(L.figX), toY(0));
  ctx.scale(view.s, -view.s);
  ctx.fillStyle = rgba(ink, 0.30);
  ctx.fill(figurePath, "evenodd");
  ctx.restore();
  uiPx = uiPx || 11;
  if (FLOOR * view.s >= uiPx + 4) {
    ctx.font = `500 ${uiPx}px ${UI_FONT}`;
    ctx.fillStyle = floorInk;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const label = "Georgia O'Keeffe, 5 ft 5 in";
    const half = ctx.measureText(label).width / 2;
    const lx = Math.max(toX(L.minX) + half + 6, Math.min(toX(L.figX), toX(L.wallW) - half - 6));
    ctx.fillText(label, lx, toY(-FLOOR / 2));
  }
}

/* ---------- p5 ---------- */

function setup() {
  const holder = document.getElementById("wall-holder");
  const w = holder.clientWidth || 800;
  cnv = createCanvas(w, canvasHeightFor(w));
  cnv.parent(holder);
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = cnv.elt;
  el.setAttribute("tabindex", "0");
  el.setAttribute("role", "img");
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerup", onPointerUp);
  el.addEventListener("pointercancel", onPointerUp);
  el.addEventListener("pointerleave", () => { if (!drag) hoverId = null; });
  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("keydown", onKey);

  if (window.ResizeObserver) new ResizeObserver(() => sizeCanvas()).observe(holder);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => wrapCache.clear());

  relayout();
  fitView(true);
  if (typeof onSketchReady === "function") onSketchReady();
}

function canvasHeightFor(w) {
  return Math.round(Math.max(300, Math.min(620, w * (w < 600 ? 0.82 : 0.56))));
}

function wantedHeight(w) {
  // fit the canvas to the wall's proportions, within limits
  if (!L) return canvasHeightFor(w);
  const pad = w < 600 ? 10 : 18;
  const span = L.wallW - L.minX, totalH = L.wallH + FLOOR;
  const h = (w - pad * 2) * totalH / span + pad * 2 + 24;
  return Math.round(Math.max(w < 600 ? 230 : 300, Math.min(canvasHeightFor(w), h)));
}

function adjustHeight() {
  if (typeof width === "undefined" || !cnv) return;
  const h = wantedHeight(width);
  if (Math.abs(h - height) > 6) resizeCanvas(width, h);
}

function sizeCanvas() {
  const holder = document.getElementById("wall-holder");
  const w = holder.clientWidth;
  if (!w || (Math.abs(w - width) < 1)) return;
  resizeCanvas(w, userZoomed ? height : wantedHeight(w));
  if (!userZoomed) fitView(true);
}

function windowResized() { sizeCanvas(); }

function draw() {
  if (!L) return;
  const k = reduceMotion ? 1 : 0.22;
  view.s += (tv.s - view.s) * k; view.ox += (tv.ox - view.ox) * k; view.oy += (tv.oy - view.oy) * k;
  drawScene(drawingContext, width, height, null);
}

// Draws the wall. ex = null for the live canvas; for the saved image, ex = {images, numbers, bg}
// (uses the global view, so the export swaps it in temporarily).
function drawScene(ctx, W, H, ex) {
  const dark = !ex && isDarkTheme();
  ctx.fillStyle = ex ? ex.bg : (dark ? "#1F1D1B" : "#F2F0EC");
  ctx.fillRect(0, 0, W, H);
  const ink = wallInk();

  // wall, baseboard, floor
  const wx0 = toX(L.minX), wx1 = toX(L.wallW), wyTop = toY(L.wallH), wyFloor = toY(0);
  ctx.fillStyle = G.wall; ctx.fillRect(wx0, wyTop, wx1 - wx0, wyFloor - wyTop);
  ctx.fillStyle = shade(G.wall, hexLum(G.wall) > 0.33 ? -0.10 : 0.10);
  ctx.fillRect(wx0, toY(BASEBOARD), wx1 - wx0, BASEBOARD * view.s);
  const floorCol = dark ? "#3A3530" : "#B3A898";
  ctx.fillStyle = floorCol; ctx.fillRect(wx0, wyFloor, wx1 - wx0, FLOOR * view.s);
  ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(wx0, wyFloor, wx1 - wx0, Math.max(1, 0.4 * view.s));
  const floorInk = dark ? "rgba(239,237,234,0.75)" : "rgba(29,27,25,0.72)";
  const uiPx = ex ? ex.uiPx : 11;

  // 60-inch line
  if (G.showGuide) {
    ctx.save();
    ctx.strokeStyle = rgba(ink, 0.32); ctx.lineWidth = ex ? 2 : 1; ctx.setLineDash(ex ? [12, 10] : [6, 5]);
    const gy = Math.round(toY(CENTER)) + 0.5;
    const gx0 = toX(L.title.x + TITLE_W + 2);   // the line starts after the title wall
    ctx.beginPath(); ctx.moveTo(gx0, gy); ctx.lineTo(wx1, gy); ctx.stroke();
    ctx.restore();
    ctx.font = `600 ${uiPx}px ${UI_FONT}`; ctx.fillStyle = rgba(ink, 0.6);
    ctx.textAlign = "left"; ctx.textBaseline = "bottom";
    const room = (TITLE_GAP - 4) * view.s - 6;
    let gl = G.hang === "line" ? "60 in on center" : "60 in";
    if (ctx.measureText(gl).width > room) gl = "60 in";
    if (ctx.measureText(gl).width <= room) ctx.fillText(gl, gx0 + 4, gy - 3);
  }

  drawTitleBlock(ctx, ink);

  // works
  const order = drawOrder().filter(id => !drag || ex || id !== drag.id);
  if (drag && !ex) order.push(drag.id);
  const numbers = [];
  for (const id of order) {
    const t = L.items.get(id);
    if (!t) continue;
    let d;
    if (ex) d = { x: t.x, y: t.y, a: 1 };
    else {
      d = disp.get(id);
      if (!d) { d = { x: t.x, y: t.y + (reduceMotion ? 0 : 6), a: reduceMotion ? 1 : 0 }; disp.set(id, d); }
      if (drag && drag.id === id && drag.moved) {
        d.x = drag.x; d.y = G.hang === "line" ? t.y : drag.y;
        if (G.hang === "line") d.y += (t.y - d.y) * 0.3;
      } else {
        const kk = reduceMotion ? 1 : 0.25;
        d.x += (t.x - d.x) * kk; d.y += (t.y - d.y) * kk;
      }
      d.a = Math.min(1, d.a + (reduceMotion ? 1 : 0.08));
    }
    const work = WORK_BY_ID.get(id);
    const rx = toX(d.x), ry = toY(d.y + t.h), rw = t.w * view.s, rh = t.h * view.s;
    if (rx > W + 50 || rx + rw < -50) continue;

    ctx.save();
    ctx.globalAlpha = d.a;
    const lifted = !ex && drag && drag.id === id && drag.moved;
    ctx.shadowColor = `rgba(0,0,0,${lifted ? 0.38 : 0.26})`;
    ctx.shadowBlur = Math.max(2, (lifted ? 3 : 1.4) * view.s);
    ctx.shadowOffsetY = Math.max(1, (lifted ? 1.2 : 0.5) * view.s);
    ctx.fillStyle = "#E9E4DA";
    ctx.fillRect(rx, ry, rw, rh);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = d.a;
    const img = ex ? ex.images.get(id) : imageFor(work, rw, rh);
    if (img && img.naturalWidth) {
      const ia = img.naturalWidth / img.naturalHeight, ra = t.w / t.h;
      if (Math.abs(ia / ra - 1) < 0.08) ctx.drawImage(img, rx, ry, rw, rh);
      else if (ia > ra) { const h2 = rw / ia; ctx.drawImage(img, rx, ry + (rh - h2) / 2, rw, h2); }
      else { const w2 = rh * ia; ctx.drawImage(img, rx + (rw - w2) / 2, ry, w2, rh); }
    } else {
      drawColorField(ctx, work, rx, ry, rw, rh);
    }
    ctx.restore();

    if (!ex && (G.selected === id || hoverId === id)) {
      ctx.save();
      ctx.strokeStyle = G.selected === id ? (hexLum(G.wall) > 0.33 ? "#B8432A" : "#F0A58F") : rgba(ink, 0.55);
      ctx.lineWidth = G.selected === id ? 2 : 1;
      const o = G.selected === id ? 4 : 3;
      ctx.strokeRect(rx - o, ry - o, rw + o * 2, rh + o * 2);
      ctx.restore();
    }

    if (G.hang === "line" && G.showLabels && !(drag && !ex && drag.id === id && drag.moved)) {
      const lb = L.labels.get(id);
      if (lb) drawLabel(ctx, work, { x: d.x + t.w + LABEL_GAP, y: lb.y, w: lb.w, h: lb.h }, ink);
    }
    if (ex && ex.numbers) numbers.push({ n: G.ids.indexOf(id) + 1, x: rx, y: ry + rh });
  }

  // checklist numbers on the saved image, drawn last so none are covered
  for (const nb of numbers) {
    // a small square just below the work's lower-left corner, so it never covers the image
    const sz = Math.round(uiPx * 1.5), gap = Math.round(uiPx * 0.35);
    ctx.fillStyle = "#171615"; ctx.fillRect(nb.x, nb.y + gap, sz, sz);
    ctx.fillStyle = "#FFFFFF"; ctx.font = `700 ${Math.round(uiPx * 0.95)}px ${UI_FONT}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(nb.n), nb.x + sz / 2, nb.y + gap + sz / 2 + 1);
  }

  if (!G.ids.length && !ex) {
    ctx.font = `500 ${W < 600 ? 13 : 15}px ${UI_FONT}`;
    ctx.fillStyle = rgba(ink, 0.6);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const hx = toX(L.title.x + TITLE_W + TITLE_GAP + 60);
    ctx.fillText(W < 600 ? "Choose works below" : "Choose works to hang them here", hx, toY(CENTER + 14));
  }

  if (G.showFigure) drawFigure(ctx, ink, floorInk, uiPx);
}

/* ---------- interaction ---------- */

function localPoint(e) {
  const r = cnv.elt.getBoundingClientRect();
  return [e.clientX - r.left, e.clientY - r.top];
}

function hitTest(px, py) {
  const order = drawOrder().reverse();
  for (const id of order) {
    const t = L.items.get(id), d = disp.get(id) || t;
    if (!t) continue;
    const x = toX(d.x), y = toY(d.y + t.h), w = t.w * view.s, h = t.h * view.s;
    const slop = w < 14 || h < 14 ? 5 : 0;
    if (px >= x - slop && px <= x + w + slop && py >= y - slop && py <= y + h + slop) return id;
  }
  return null;
}

function onPointerDown(e) {
  const [px, py] = localPoint(e);
  const id = hitTest(px, py);
  if (id !== null) {
    const t = L.items.get(id), d = disp.get(id) || t;
    drag = { id, px, py, gx: fromX(px) - d.x, gy: fromY(py) - d.y, x: d.x, y: d.y, moved: false };
    if (G.hang === "salon") frozenOffset = L.offsetX;
    cnv.elt.setPointerCapture(e.pointerId);
    if (G.selected !== id) wallSelect(id);
    e.preventDefault();
  } else {
    pan = { px, py, ox: view.ox, oy: view.oy, moved: false };
    cnv.elt.setPointerCapture(e.pointerId);
  }
}

function onPointerMove(e) {
  const [px, py] = localPoint(e);
  if (drag) {
    if (!drag.moved && Math.hypot(px - drag.px, py - drag.py) < 4) return;
    drag.moved = true;
    const t = L.items.get(drag.id);
    drag.x = fromX(px) - drag.gx;
    drag.y = Math.max(0, fromY(py) - drag.gy);
    if (G.hang === "line") {
      const c = drag.x + t.w / 2;
      const others = G.ids.filter(x => x !== drag.id);
      let idx = 0;
      for (const o of others) { const r = L.items.get(o); if (r.x + r.w / 2 < c) idx++; }
      const cur = G.ids.indexOf(drag.id);
      if (idx !== cur) {
        others.splice(idx, 0, drag.id);
        G.ids = others;
        relayout();
      }
    } else {
      G.salon[drag.id] = { x: drag.x + t.w / 2 - frozenOffset, y: drag.y + t.h / 2 };
      relayout();
    }
    cnv.elt.style.cursor = "grabbing";
    return;
  }
  if (pan) {
    if (Math.hypot(px - pan.px, py - pan.py) > 3) pan.moved = true;
    if (userZoomed && pan.moved) {
      view.ox = pan.ox + (px - pan.px); view.oy = pan.oy + (py - pan.py);
      tv = { ...view };
      cnv.elt.style.cursor = "grabbing";
    }
    return;
  }
  const id = hitTest(px, py);
  hoverId = id;
  cnv.elt.style.cursor = id !== null ? "grab" : (userZoomed ? "move" : "default");
}

function onPointerUp(e) {
  if (drag) {
    const wasMoved = drag.moved, id = drag.id;
    if (G.hang === "salon" && wasMoved) { if (G.snap) resolveSalon(id); else bringToFront(id); }
    drag = null;
    frozenOffset = null;
    cnv.elt.style.cursor = "grab";
    if (wasMoved) wallChanged({ moved: id });
  } else if (pan) {
    if (!pan.moved && G.selected !== null) wallSelect(null);
    pan = null;
    cnv.elt.style.cursor = "default";
  }
}

function onWheel(e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    const [px, py] = localPoint(e);
    wallZoom(Math.exp(-e.deltaY * 0.01), px, py);
  } else if (userZoomed) {
    e.preventDefault();
    view.ox -= e.deltaX || (e.shiftKey ? e.deltaY : 0);
    view.oy -= e.shiftKey ? 0 : e.deltaY;
    tv = { ...view };
  }
}

function onKey(e) {
  const id = G.selected;
  if (e.key === "+" || e.key === "=") { wallZoom(1.4); e.preventDefault(); return; }
  if (e.key === "-") { wallZoom(1 / 1.4); e.preventDefault(); return; }
  if (e.key === "0") { fitView(false); e.preventDefault(); return; }
  if (id === null) return;
  const step = e.shiftKey ? 6 : 1;
  if (e.key === "Delete" || e.key === "Backspace") { wallRemove(id); e.preventDefault(); return; }
  if (G.hang === "line") {
    if (e.key === "ArrowLeft") { wallMove(id, -1); e.preventDefault(); }
    if (e.key === "ArrowRight") { wallMove(id, 1); e.preventDefault(); }
  } else {
    const p = G.salon[id];
    if (!p) return;
    const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
    const dy = e.key === "ArrowUp" ? step : e.key === "ArrowDown" ? -step : 0;
    if (dx || dy) {
      e.preventDefault();
      p.x += dx; p.y = Math.max(G.ids && WORK_BY_ID.get(id).h / 2, p.y + dy);
      if (G.snap) resolveSalon(id);
      wallChanged({ moved: id });
    }
  }
}
