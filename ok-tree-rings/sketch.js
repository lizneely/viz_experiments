// O'Keeffe in Tree Rings
// O'Keeffe Experiments, Georgia O'Keeffe Museum (prototype, October 2026)
//
// Two records that were never meant to meet:
//   nm593.csv   Ring widths of Douglas-firs at Echo Amphitheater, near Ghost Ranch
//               (International Tree-Ring Data Bank site NM593, via NOAA). 1.0 = an average year.
//   works.json  1,265 works by Georgia O'Keeffe from Access O'Keeffe, with dates and subjects.
//
// The sketch draws one ring for every year from 1887 (her birth, at the center)
// to 1986 (her death, at the bark), and puts each work on the ring for its year.

const FIRST = 1887;
const LAST = 1986;

// ---------- data ----------
let ringTable, worksJSON;
let years = [];          // 1887 ... 1986
let ringIndex = {};      // year -> ring-width index
let works = [];
let rankOf = {};         // year -> 1 (narrowest) ... 100 (widest)

// ---------- state ----------
let year = 1929;
let filterKey = "all";
let hoverYear = null;
let showSpan = false;    // year label: show works dated to a span instead of one year
let page = 0;            // year label: page of thumbnails
let wood;                // the cross-section, drawn once into a p5.Graphics
let bounds = [];         // ring boundary radii, from the pith out
let dotPos = {};         // work id -> [x, y] on the disc
let L = {};              // layout
let hits = [];           // clickable areas, rebuilt every frame
let tip = null;          // tooltip text
let thumbs = new Map();  // work id -> p5.Image | "loading" | "failed"
let imagesBlocked = false;
let UI_FONT = "sans-serif";   // switches to Schibsted Grotesk once it loads
let P;                   // palette for the current theme
let dragging = false;

const FILTERS = [
  { key: "all", label: "All subjects" },
  { key: "Landscapes", label: "Landscapes" },
  { key: "Trees", label: "Trees" },
  { key: "Plants, Flowers, and Leaves", label: "Plants, Flowers, and Leaves" },
  { key: "Bones", label: "Bones" },
  { key: "Abstractions", label: "Abstractions" }
];

// Life events (from general knowledge; to be checked against the Museum's chronology)
const EVENTS = {
  1887: ["Born November 15 on a farm near Sun Prairie, Wisconsin."],
  1905: ["Studies at the Art Institute of Chicago."],
  1907: ["Studies at the Art Students League in New York."],
  1908: ["Sees drawings by Auguste Rodin at Alfred Stieglitz's gallery, 291."],
  1912: ["Begins teaching art in the public schools of Amarillo, Texas."],
  1915: ["Makes her charcoal abstractions in Columbia, South Carolina."],
  1916: ["Stieglitz shows her drawings at 291. That fall she begins teaching in Canyon, Texas."],
  1917: ["Her first solo exhibition opens at 291. That summer she passes through New Mexico for the first time."],
  1918: ["Moves to New York and spends her first summer at Lake George with Stieglitz."],
  1923: ["Stieglitz presents 100 of her works at the Anderson Galleries in New York."],
  1924: ["Marries Stieglitz in December."],
  1929: ["Spends her first summer in New Mexico, in Taos."],
  1934: ["Spends her first summer at Ghost Ranch."],
  1940: ["Buys a house at Ghost Ranch."],
  1945: ["Buys a house in Abiquiú, with a garden and the water rights to irrigate it."],
  1946: ["The Museum of Modern Art holds a retrospective of her work. Stieglitz dies in July."],
  1949: ["Moves to New Mexico for good."],
  1959: ["Travels around the world for more than three months."],
  1965: ["Paints Sky Above Clouds IV, 24 feet wide."],
  1970: ["The Whitney Museum of American Art holds a retrospective of her work."],
  1972: ["Her eyesight begins to fail. She paints less, and later works with assistants."],
  1977: ["Receives the Presidential Medal of Freedom."],
  1984: ["Moves to Santa Fe."],
  1986: ["Dies March 6 in Santa Fe, at 98."]
};
const WHERE = [
  [1887, 1900, "Growing up on the family farm near Sun Prairie, Wisconsin."],
  [1918, 1928, "Summers at Lake George, New York; the rest of the year in New York City."],
  [1929, 1948, "Most summers in New Mexico; the rest of the year in New York."],
  [1949, 1983, "Living in New Mexico, at her houses in Abiquiú and Ghost Ranch."],
  [1984, 1986, "Living in Santa Fe."]
];
const PLACES = [
  [1887, 1917, "Growing up, studying, teaching", "Early years"],
  [1918, 1928, "Lake George summers", "Lake George"],
  [1929, 1948, "New Mexico summers", "NM summers"],
  [1949, 1986, "Living in New Mexico", "New Mexico"]
];
const LOOKS = [
  { y: 1902, short: "Narrowest", h: "The narrowest ring", p: "The thinnest ring of O'Keeffe's lifetime grew in 1902, the year she turned 15. Its index of 0.16 means the trees put on about one-sixth of an average year's wood." },
  { y: 1920, short: "Widest", h: "The widest ring", p: "In 1920, O'Keeffe's third summer at Lake George, the trees near Ghost Ranch grew more than twice their average. She had not yet painted in New Mexico." },
  { y: 1929, short: "First NM summer", h: "Her first New Mexico summer", p: "Her first summer in New Mexico, in Taos, came in a narrow-ring year, most likely a dry one. Taos is about 50 miles from Echo Amphitheater, so the trees speak for the region, not for her exact view." },
  { y: 1950, short: "15 dry years", h: "Fifteen dry years in a row", p: "From 1950 through 1964, just after she settled in New Mexico for good, every ring is narrower than average: the longest dry run of her lifetime. She had bought the Abiquiú house partly for its garden and the water to irrigate it." },
  { y: 1959, short: "Busy, but dry", h: "Busy years and wet years don't line up", p: "Counting shares of works dated to a span, her busiest year in this set is 1959, the year of her trip around the world, and its ring is very narrow. Her busiest year for works dated to a single year, 1917, has an almost exactly average ring. Across all her working years, the two hardly move together." },
  { y: 1986, short: "After her death", h: "A ring she didn't see", p: "O'Keeffe died on March 6, 1986, before that year's growing season began. The 1986 ring is the second widest of all 100." }
];

// Wood colors stay the same in both themes: they belong to the object, not the page.
const WOOD = { early: [232, 207, 164], earlyWet: [242, 224, 190], late: [166, 108, 64], bark: [74, 52, 38], inner: [110, 76, 52], pith: [142, 95, 60], crack: [58, 38, 26], sel: [184, 67, 42], dot: [23, 22, 21] };

const PALETTES = {
  light: { bg: "#FFFFFF", fg: "#171615", ink2: "#3E3A36", muted: "#6B655E", line: "#DEDAD4", paper: "#F2F0EC", accent: "#B8432A",
           wider: "#1F78B0", narrower: "#C2622A", exact: "#3E3A36", share: "#BDB6AC", sel: [184, 67, 42, 26] },
  dark:  { bg: "#141312", fg: "#EFEDEA", ink2: "#CFCAC4", muted: "#A9A39C", line: "#2F2C29", paper: "#1F1D1B", accent: "#E07A5F",
           wider: "#4F9CC8", narrower: "#D9773C", exact: "#D6D1CA", share: "#5C5751", sel: [224, 122, 95, 40] }
};

// ======================================================================
// p5
// ======================================================================

function preload() {
  ringTable = loadTable("nm593.csv", "csv", "header");
  worksJSON = loadJSON("works.json");
}

function setup() {
  // tree rings
  for (let r = 0; r < ringTable.getRowCount(); r++) {
    ringIndex[ringTable.getNum(r, "age_CE")] = ringTable.getNum(r, "trsgi");
  }
  for (let y = FIRST; y <= LAST; y++) years.push(y);
  years.slice().sort((a, b) => ringIndex[a] - ringIndex[b]).forEach((y, i) => (rankOf[y] = i + 1));

  // works: clamp each date to her lifetime and give it a fixed spot on its ring
  works = Object.values(worksJSON).map((w) => {
    const start = max(w.start, FIRST), end = min(w.end, LAST);
    return { ...w, start, end, exact: start === end, angle: hash(w.id, 1) * TWO_PI, depth: 0.08 + hash(w.id, 2) * 0.84 };
  });

  setPalette();
  const c = createCanvas(holderWidth(), 600);
  c.parent("sketch");
  c.elt.tabIndex = 0;
  c.elt.setAttribute("aria-label", "O'Keeffe in Tree Rings. Use the left and right arrow keys to move between years.");
  noiseSeed(7);
  noLoop();
  layout();

  // Canvas text uses Schibsted Grotesk once it has loaded
  if (document.fonts) {
    document.fonts.load('700 16px "Schibsted Grotesk"').then((found) => { if (found.length) { UI_FONT = "Schibsted Grotesk"; layout(); redraw(); } });
  }
  // follow the viewer's light or dark theme
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { setPalette(); redraw(); });
  new MutationObserver(() => { setPalette(); redraw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  updateDescription();
}

function draw() {
  background(P.bg);
  hits = [];
  tip = null;
  drawFilters();
  drawDisc();
  drawLabel(false);
  drawChart();
  drawLooks();
  drawTip();
}

function windowResized() {
  const w = holderWidth();
  if (w !== width) { resizeCanvas(w, height); layout(); redraw(); }
}

// ======================================================================
// layout
// ======================================================================

function holderWidth() { return max(300, floor(document.getElementById("sketch").clientWidth)); }

function layout() {
  const W = width, wide = W >= 860;
  textFont(UI_FONT);
  L.wide = wide;
  L.filters = { x: 0, y: 0, w: W };
  L.filtersH = measureChips(FILTERS.map((f) => chipLabel(f)), W, 13.5);
  const top = L.filtersH + 24;
  if (wide) {
    L.disc = { x: 0, y: top, s: min(600, floor(W * 0.5)) };
    L.panel = { x: L.disc.s + 44, y: top, w: W - L.disc.s - 44 };
  } else {
    L.disc = { x: floor((W - min(W, 560)) / 2), y: top, s: min(W, 560) };
    L.panel = { x: 0, y: top + L.disc.s + 28, w: W };
  }
  L.cols = L.panel.w >= 520 ? 4 : 3;
  // reserve the tallest year label, so the page doesn't jump as years change
  let tallest = 0;
  for (const y of years) tallest = max(tallest, labelHeight(y));
  L.panelH = tallest;
  const below = wide ? max(L.disc.y + L.disc.s, L.panel.y + L.panelH) : L.panel.y + L.panelH;
  L.chart = { x: 0, y: below + 56, w: W };
  L.chartH = chartHeight(W);
  L.looks = { x: 0, y: L.chart.y + L.chartH + 40, w: W };
  L.looksH = 30 + measureChips(LOOKS.map((l) => l.y + "  " + l.short), W, 13.5);
  const H = L.looks.y + L.looksH + 8;
  buildWood();
  if (H !== height) resizeCanvas(width, H);
}

// ======================================================================
// the cross-section
// ======================================================================

const STEPS = 240;
let R, cx, cy;

function discGeometry() {
  const d = L.disc;
  R = (d.s / 2) * 0.985; cx = d.x + d.s / 2; cy = d.y + d.s / 2;
  const pith = R * 0.035;
  const total = years.reduce((s, y) => s + ringIndex[y], 0);
  const k = (R * 0.875 - pith) / total;   // pixels per unit of growth
  bounds = [pith];
  let r = pith;
  for (const y of years) { r += ringIndex[y] * k; bounds.push(r); }
  dotPos = {};
  for (const w of works) {
    const i = w.start - FIRST, j = w.end - FIRST;
    const rr = w.exact ? (bounds[i] + bounds[i + 1]) / 2 : bounds[i] + (bounds[j + 1] - bounds[i]) * w.depth;
    dotPos[w.id] = ringPoint(w.angle, rr);
  }
}

// The pith sits a little off-center, and the rings wobble, like real wood.
// Only the width of each ring carries data.
function ringCenter(r) { const f = 1 - r / R; return [cx - R * 0.055 * f, cy + R * 0.04 * f]; }
function wobble(a, r) {
  const rr = r / R, c = cos(a), s = sin(a);
  return 1 + 0.06 * (noise(3 + c * 0.9, 3 + s * 0.9, rr * 1.3) - 0.5) + 0.014 * (noise(9 + c * 3.2, 9 + s * 3.2, rr * 3) - 0.5);
}
function ringPoint(a, r) { const c = ringCenter(r), rw = r * wobble(a, r); return [c[0] + cos(a) * rw, c[1] + sin(a) * rw]; }

function ringShape(g, r, rgb) {
  g.fill(rgb[0], rgb[1], rgb[2]); g.noStroke(); g.beginShape();
  for (let i = 0; i < STEPS; i++) { const q = ringPoint((i / STEPS) * TWO_PI, r); g.vertex(q[0] - L.disc.x, q[1] - L.disc.y); }
  g.endShape(CLOSE);
}

function buildWood() {
  discGeometry();
  const s = L.disc.s;
  if (wood) wood.remove();
  wood = createGraphics(s, s);
  wood.clear();
  // bark
  const barkIn = R * 0.875;
  wood.fill(...WOOD.bark); wood.noStroke(); wood.beginShape();
  for (let i = 0; i < STEPS * 2; i++) {
    const a = (i / (STEPS * 2)) * TWO_PI;
    const q = ringPoint(a, barkIn + R * (0.05 + 0.055 * noise(20 + cos(a) * 7, 20 + sin(a) * 7)));
    wood.vertex(q[0] - L.disc.x, q[1] - L.disc.y);
  }
  wood.endShape(CLOSE);
  ringShape(wood, barkIn + R * 0.012, WOOD.inner);
  // rings, from the outside in: dark latewood at each ring's edge, pale earlywood inside it
  for (let n = years.length - 1; n >= 0; n--) {
    const outer = bounds[n + 1], w = outer - bounds[n], v = ringIndex[years[n]];
    ringShape(wood, outer, WOOD.late);
    const t = constrain((v - 0.2) / 1.7, 0, 1);
    ringShape(wood, outer - constrain(w * 0.3, 0.8, 3.4), WOOD.early.map((c, i) => lerp(c, WOOD.earlyWet[i], t)));
  }
  ringShape(wood, bounds[0], WOOD.pith);
  // a drying check running in from the bark
  wood.fill(...WOOD.crack, 230); wood.beginShape();
  for (const [a, r] of [[2.609, 0.94], [2.631, 0.94], [2.624, 0.7], [2.62, 0.5]]) {
    const q = ringPoint(a, R * r); wood.vertex(q[0] - L.disc.x, q[1] - L.disc.y);
  }
  wood.endShape(CLOSE);
}

function ringAt(x, y) {
  for (let n = 0; n < years.length; n++) {
    const r = bounds[n + 1], c = ringCenter(r);
    if (dist(x, y, c[0], c[1]) <= r * wobble(atan2(y - c[1], x - c[0]), r)) return years[n];
  }
  return null;
}

function traceRing(r) {
  beginShape();
  for (let i = 0; i < STEPS; i++) { const q = ringPoint((i / STEPS) * TWO_PI, r); vertex(q[0], q[1]); }
  endShape(CLOSE);
}

function drawDisc() {
  image(wood, L.disc.x, L.disc.y);
  const n = year - FIRST;

  // the chosen ring
  fill(...WOOD.sel, 160); stroke(...WOOD.sel); strokeWeight(2);
  beginShape();
  for (let i = 0; i <= STEPS; i++) { const q = ringPoint((i / STEPS) * TWO_PI, bounds[n + 1]); vertex(q[0], q[1]); }
  beginContour();
  for (let i = STEPS; i >= 0; i--) { const q = ringPoint((i / STEPS) * TWO_PI, bounds[n]); vertex(q[0], q[1]); }
  endContour();
  endShape(CLOSE);

  // the ring under the pointer
  if (hoverYear !== null && hoverYear !== year) {
    const h = hoverYear - FIRST;
    noFill(); stroke(...WOOD.dot, 210); strokeWeight(1.2);
    traceRing(bounds[h + 1]); traceRing(bounds[h]);
  }

  // works: open circles for works dated to a span, filled dots for works dated to one year
  const d = max(3, L.disc.s / 165);
  const shown = works.filter(passes);
  noFill(); stroke(...WOOD.dot, 150); strokeWeight(1);
  for (const w of shown) if (!w.exact && !(w.start <= year && year <= w.end)) circle(...dotPos[w.id], d);
  noStroke(); fill(...WOOD.dot, 205);
  for (const w of shown) if (w.exact && w.start !== year) circle(...dotPos[w.id], d);
  noFill(); stroke(...WOOD.sel); strokeWeight(1.6);
  for (const w of shown) if (!w.exact && w.start <= year && year <= w.end) circle(...dotPos[w.id], d * 1.15);
  fill(...WOOD.sel); stroke(255); strokeWeight(1.2);
  for (const w of shown) if (w.exact && w.start === year) circle(...dotPos[w.id], d * 1.6);

  // a decade scale along one radius
  const A = -0.98;
  const a0 = ringPoint(A, bounds[0]), a1 = ringPoint(A, bounds[years.length]);
  stroke(...WOOD.dot, 230); strokeWeight(1); line(a0[0], a0[1], a1[0], a1[1]);
  const fs = max(10, round(L.disc.s / 52));
  let last = -1e9;
  for (let dec = 1900; dec <= 1980; dec += 10) {
    const r = bounds[dec - FIRST], q = ringPoint(A, r);
    noStroke(); fill(...WOOD.dot); circle(q[0], q[1], 4);
    if ((r - last) * abs(sin(A)) < fs + 8) continue;
    last = r;
    woodLabel(String(dec), q[0] + 6, q[1], fs, LEFT);
  }
  const p0 = ringPoint(PI * 0.82, bounds[0]); woodLabel("1887", p0[0] - 4, p0[1] + 2, fs, RIGHT);
  const p1 = ringPoint(A, R * 0.985); woodLabel("1986", p1[0] + 6, p1[1] - 4, fs, LEFT);

  // pointer
  if (inDisc(mouseX, mouseY) && hoverYear !== null) {
    const c = countFor(hoverYear);
    tip = { x: mouseX, y: mouseY, lines: [hoverYear + "  ·  index " + nf(ringIndex[hoverYear], 1, 2) + "  ·  " + c.exact + (c.exact === 1 ? " work" : " works")] };
  }
}

function woodLabel(s, x, y, fs, align) {
  textFont(UI_FONT); textStyle(BOLD); textSize(fs);
  const w = textWidth(s), x0 = align === RIGHT ? x - w - 8 : x;
  noStroke(); fill(255, 235); rect(x0, y - (fs + 6) / 2, w + 8, fs + 6);
  fill(...WOOD.dot); textAlign(LEFT, CENTER); text(s, x0 + 4, y + 0.5);
}

function inDisc(x, y) { return x >= L.disc.x && x <= L.disc.x + L.disc.s && y >= L.disc.y && y <= L.disc.y + L.disc.s; }

// ======================================================================
// the year label (drawn like a museum wall label)
// ======================================================================

function labelHeight(y) { return drawLabel(true, y); }

function drawLabel(dry, y = year) {
  const { x, w } = L.panel;
  let yy = L.panel.y;
  const put = (fn) => { if (!dry) fn(); };
  const v = ringIndex[y];

  put(() => { stroke(P.fg); strokeWeight(1); line(x, yy, x + w, yy); });
  yy += 16;
  // the year
  setType(L.wide ? 84 : 64, BOLD);
  put(() => { fill(P.fg); noStroke(); textAlign(LEFT, TOP); text(y, x - 3, yy); });
  setType(14);
  const age = y === FIRST ? "The year she was born" : y === LAST ? "The year she died, at 98" : "She turns " + (y - FIRST) + " this year";
  put(() => { fill(P.muted); textAlign(RIGHT, TOP); text(age, x + w, yy + 8); textAlign(LEFT, TOP); });
  yy += L.wide ? 92 : 72;

  // the ring
  setType(17, BOLD);
  put(() => { fill(P.fg); text("Ring-width index " + nf(v, 1, 2), x, yy); });
  yy += 30;
  put(() => drawMeter(x, yy, w, v));
  yy += 40;
  setType(14.5);
  yy += para(ringSentence(v) + " " + rankSentence(y), x, yy, w, 21, P.fg, dry) + 10;

  const where = WHERE.find((r) => y >= r[0] && y <= r[1]);
  if (where) {
    setType(14.5, BOLD);
    put(() => { fill(P.fg); text("Where she was", x, yy); });
    yy += 21;
    setType(14.5);
    yy += para(where[2], x, yy, w, 21, P.fg, dry) + 10;
  }
  for (const e of EVENTS[y] || []) {
    put(() => { stroke(P.line); line(x, yy, x + w, yy); noStroke(); });
    yy += 9;
    setType(14.5);
    yy += para(e, x, yy, w, 21, P.fg, dry) + 9;
  }
  const look = LOOKS.find((l) => l.y === y);
  if (look) {
    yy += 6;
    const top = yy;
    setType(14.5, BOLD);
    put(() => { fill(P.fg); text(look.h, x + 14, yy); });
    yy += 22;
    setType(14);
    yy += para(look.p, x + 14, yy, w - 14, 20, P.fg, dry);
    put(() => { noStroke(); fill(P.fg); rect(x, top, 3, yy - top); });
    yy += 10;
  }

  // the works
  yy += 14;
  const c = countFor(y);
  const list = showSpan ? c.spanList : c.exactList;
  setType(16, BOLD);
  const head = showSpan ? "Works dated to a span that includes " + y : "Works dated " + y;
  put(() => {
    fill(P.fg); text(head, x, yy);
    setType(16); fill(P.muted);
    textAlign(RIGHT, TOP); text(list.length + (filterKey === "all" ? "" : "  ·  " + filterLabel()), x + w, yy); textAlign(LEFT, TOP);
  });
  yy += 30;
  const gap = 10, cell = (w - gap * (L.cols - 1)) / L.cols, perPage = L.cols * 2;
  const pages = max(1, ceil(list.length / perPage));
  const pg = min(page, pages - 1);
  if (!dry) {
    if (!list.length) {
      setType(14); fill(P.muted);
      text(filterKey === "all" ? "No works in this set are dated to " + y + "." : "No works with this subject are dated to " + y + ".", x, yy);
    }
    list.slice(pg * perPage, pg * perPage + perPage).forEach((wk, i) => drawThumb(wk, x + (i % L.cols) * (cell + gap), yy + floor(i / L.cols) * (cell + 46), cell));
  }
  yy += (cell + 46) * 2 + 4;

  // paging and the span toggle
  setType(13.5, BOLD);
  if (!dry) {
    let bx = x;
    if (pages > 1) {
      bx += button("←", bx, yy, () => { page = (pg - 1 + pages) % pages; redraw(); }) + 6;
      setType(13.5); fill(P.muted); noStroke(); textAlign(LEFT, CENTER);
      const t = (pg + 1) + " of " + pages; text(t, bx + 4, yy + 15); bx += textWidth(t) + 14; setType(13.5, BOLD);
      bx += button("→", bx, yy, () => { page = (pg + 1) % pages; redraw(); }) + 14;
    }
    const other = showSpan ? c.exactList.length : c.spanList.length;
    if (showSpan || other) {
      const label = showSpan ? "Back to works dated " + y : "Show " + other + " dated to a span";
      button(label, bx, yy, () => { showSpan = !showSpan; page = 0; redraw(); });
    }
  }
  yy += 40;
  if (imagesBlocked) {
    setType(12.5);
    const h = para("Images can't load here, so each work appears as bands of its color tags.", x + 12, yy, w - 12, 18, P.muted, dry);
    put(() => { noStroke(); fill(P.fg); rect(x, yy, 3, h); });
    yy += h + 8;
  }
  return yy - L.panel.y;
}

function drawMeter(x, y, w, v) {
  const sx = (val) => x + (min(val, 2.2) / 2.2) * w;
  noStroke(); fill(P.paper); rect(x, y, w, 12);
  fill(v >= 1 ? P.wider : P.narrower);
  rect(min(sx(1), sx(v)), y, max(1.5, abs(sx(v) - sx(1))), 12);
  stroke(P.fg); strokeWeight(1.5); line(sx(1), y - 5, sx(1), y + 17);
  noStroke(); setType(11); fill(P.muted);
  textAlign(LEFT, TOP); text("0", x, y + 20);
  textAlign(CENTER, TOP); text("1.0, average", sx(1), y + 20); text("2.0", sx(2), y + 20);
  textAlign(LEFT, TOP);
}

function drawThumb(w, x, y, s) {
  noStroke(); fill(P.paper); rect(x, y, s, s);
  const img = loadThumb(w);
  if (img && img !== "loading" && img !== "failed") {
    const k = min(s / img.width, s / img.height), iw = img.width * k, ih = img.height * k;
    image(img, x + (s - iw) / 2, y + (s - ih) / 2, iw, ih);
  } else {
    // stand-in: bands of the work's color tags
    const inset = s * 0.16, bw = (s - inset * 2) / max(1, w.colors.length);
    if (!w.colors.length) { fill(P.line); rect(x + inset, y + inset, s - inset * 2, s - inset * 2); }
    w.colors.forEach((c, i) => { fill(c); rect(x + inset + i * bw, y + inset, bw + 0.5, s - inset * 2); });
  }
  setType(11.5, BOLD); fill(P.fg); textAlign(LEFT, TOP);
  text(fit(w.title, s), x, y + s + 6);
  setType(11.5); fill(P.muted); text(fit(w.date, s), x, y + s + 22);
  const over = mouseX > x && mouseX < x + s && mouseY > y && mouseY < y + s + 38;
  if (over) { noFill(); stroke(P.fg); strokeWeight(2); rect(x - 1, y - 1, s + 2, s + 2); tip = { x: mouseX, y: mouseY, lines: [w.title + ", " + w.date, w.medium, "Click to open in Access O'Keeffe"] }; }
  hits.push({ x, y, w: s, h: s + 38, go: () => window.open("https://access-ok.okeeffemuseum.org/object/" + w.id + "/", "_blank", "noopener") });
}

function loadThumb(w) {
  if (!w.image) return "failed";
  if (thumbs.has(w.id)) return thumbs.get(w.id);
  thumbs.set(w.id, "loading");
  loadImage("https://iiif.okeeffemuseum.org/image/iiif/2/" + w.image + "/full/!300,300/0/default.jpg",
    (img) => { thumbs.set(w.id, img); redraw(); },
    () => { thumbs.set(w.id, "failed"); if (!imagesBlocked) { imagesBlocked = true; layout(); } redraw(); });
  return "loading";
}

// ======================================================================
// the chart: the same 100 years in a line
// ======================================================================

const LEGEND = () => [[P.exact, "Works dated to that year"], [P.share, "Share of works dated to a span"], [P.wider, "Ring wider than average"], [P.narrower, "Ring narrower than average"]];

// Lay the legend out in rows that fit the width
function legendRows(W) {
  setType(13);
  const rows = [[]]; let x = 0;
  for (const item of LEGEND()) {
    const w = textWidth(item[1]) + 18;
    if (x && x + w > W) { rows.push([]); x = 0; }
    rows[rows.length - 1].push({ item, x });
    x += w + 18;
  }
  return rows;
}

function chartHeight(W) { const small = W < 560; return legendRows(W).length * 22 + 22 + 54 + (small ? 110 : 140) + 36 + (small ? 110 : 140) + 34; }

function drawChart() {
  const { y: top, w: W } = L.chart, small = W < 560;
  const mL = 38, mR = 6, bw = (W - mL - mR) / years.length, gap = bw > 6 ? 2 : bw > 3.5 ? 1 : 0.5;
  const X = (y) => mL + (y - FIRST) * bw;
  const rows = legendRows(W), legH = rows.length * 22;
  const Y = { legend: top, placeT: top + legH + 12, place: top + legH + 22 };
  Y.worksT = Y.place + 22 + 32; Y.works = Y.worksT + 12; Y.worksH = small ? 110 : 140;
  Y.ringT = Y.works + Y.worksH + 26; Y.ring = Y.ringT + 12; Y.ringH = small ? 110 : 140; Y.axis = Y.ring + Y.ringH + 8;
  L.chartGeom = { mL, bw, top: Y.place - 4, bottom: Y.ring + Y.ringH + 4 };

  // legend
  setType(13);
  rows.forEach((row, r) => row.forEach(({ item, x }) => {
    const ly = Y.legend + r * 22;
    noStroke(); fill(item[0]); rect(x, ly + 2, 12, 12); fill(P.fg); textAlign(LEFT, TOP); text(item[1], x + 18, ly);
  }));

  // the chosen year
  noStroke(); fill(...P.sel); rect(X(year), Y.place - 4, bw, Y.ring + Y.ringH - Y.place + 8);

  // where she was
  setType(12.5, BOLD); fill(P.fg); text("Where she was", mL, Y.placeT - 12);
  PLACES.forEach((pl, i) => {
    const x0 = X(pl[0]) + (i ? 1 : 0), x1 = X(pl[1] + 1) - 1;
    noStroke(); fill(i % 2 ? P.line : P.paper); rect(x0, Y.place, x1 - x0, 22);
    setType(11.5); fill(P.ink2); textAlign(LEFT, CENTER);
    const lab = textWidth(pl[2]) + 12 < x1 - x0 ? pl[2] : textWidth(pl[3]) + 12 < x1 - x0 ? pl[3] : "";
    if (lab) text(lab, x0 + 6, Y.place + 11.5);
  });

  // works from each year
  const counts = years.map(countFor);
  const most = max(5, ...counts.map((c) => c.exact + c.share));
  const scaleTop = [10, 20, 25, 50, 100, 150, 200].find((s) => most <= s) || ceil(most / 50) * 50;
  const wy = (v) => Y.works + Y.worksH - (v / scaleTop) * Y.worksH;
  setType(12.5, BOLD); fill(P.fg); textAlign(LEFT, TOP);
  text("Works from each year" + (filterKey === "all" ? "" : ": " + filterLabel()), mL, Y.worksT - 12);
  for (const t of [0, scaleTop / 2, scaleTop]) {
    stroke(P.line); strokeWeight(1); line(mL, wy(t), W - mR, wy(t));
    noStroke(); setType(11); fill(P.muted); textAlign(RIGHT, CENTER); text(t, mL - 6, wy(t));
  }
  counts.forEach((c, i) => {
    const bx = X(years[i]) + gap / 2, w = max(0.5, bw - gap);
    noStroke();
    if (c.exact) { fill(P.exact); rect(bx, wy(c.exact), w, wy(0) - wy(c.exact)); }
    if (c.share > 0.01) { const h = max(0.5, wy(0) - wy(c.share)); fill(P.share); rect(bx, wy(c.exact) - (c.exact ? 1 : 0) - h, w, h); }
  });

  // ring-width index, above and below an average year
  const ry = (v) => Y.ring + ((2.2 - v) / 2.2) * Y.ringH;
  setType(12.5, BOLD); fill(P.fg); textAlign(LEFT, TOP); noStroke();
  text("Ring-width index (1.0 is an average year)", mL, Y.ringT - 12);
  for (const t of [0.5, 1, 1.5, 2]) {
    stroke(t === 1 ? P.muted : P.line); strokeWeight(1); line(mL, ry(t), W - mR, ry(t));
    noStroke(); setType(11); fill(P.muted); textAlign(RIGHT, CENTER); text(nf(t, 1, 1), mL - 6, ry(t));
  }
  years.forEach((y) => {
    const v = ringIndex[y], a = ry(max(v, 1)), b = ry(min(v, 1));
    noStroke(); fill(v >= 1 ? P.wider : P.narrower);
    rect(X(y) + gap / 2, a, max(0.5, bw - gap), max(1, b - a));
  });

  // axis
  stroke(P.line); line(mL, Y.ring + Y.ringH, W - mR, Y.ring + Y.ringH);
  noStroke(); fill(P.accent); rect(X(year), Y.ring + Y.ringH + 2, bw, 3);
  setType(11); fill(P.muted); textAlign(CENTER, TOP);
  for (let d = 1890; d <= 1980; d += small ? 20 : 10) text(d, X(d) + bw / 2, Y.axis);

  // pointer: hover shows the year; click or drag picks it
  const g = L.chartGeom;
  if (mouseX >= mL && mouseX < mL + bw * years.length && mouseY >= g.top && mouseY <= g.bottom) {
    const y = FIRST + floor((mouseX - mL) / bw), c = countFor(y);
    noFill(); stroke(P.fg); strokeWeight(1); rect(X(y), g.top, bw, g.bottom - g.top);
    tip = { x: X(y) + bw / 2, y: Y.works, lines: [y + "  ·  ring-width index " + nf(ringIndex[y], 1, 2) + " (" + ringWord(ringIndex[y]) + ")",
      c.exact + (c.exact === 1 ? " work" : " works") + " dated " + y + (c.share > 0.05 ? ", plus " + nf(c.share, 1, 1) + " from spans" : "")] };
  }
}

function chartYearAt(x, y) {
  const g = L.chartGeom;
  if (!g || y < g.top || y > g.bottom) return null;
  const i = floor((x - g.mL) / g.bw);
  return i >= 0 && i < years.length ? years[i] : null;
}

// ======================================================================
// filters and "rings to look at"
// ======================================================================

function drawFilters() {
  setType(13, BOLD); fill(P.fg); noStroke(); textAlign(LEFT, TOP);
  const labels = FILTERS.map((f) => chipLabel(f));
  layoutChips(labels, L.filters.x, L.filters.y, L.filters.w, (i, x, y, w) => chip(labels[i], x, y, w, FILTERS[i].key === filterKey, () => {
    filterKey = FILTERS[i].key; page = 0; showSpan = false; updateDescription(); redraw();
  }));
}

function drawLooks() {
  const { x, y, w } = L.looks;
  setType(16, BOLD); fill(P.fg); noStroke(); textAlign(LEFT, TOP);
  text("Rings to look at", x, y);
  const labels = LOOKS.map((l) => l.y + "  " + l.short);
  layoutChips(labels, x, y + 30, w, (i, cx, cy, cw) => chip(labels[i], cx, cy, cw, LOOKS[i].y === year, () => goToYear(LOOKS[i].y)));
}

function chipLabel(f) {
  const n = f.key === "all" ? works.length : works.filter((w) => w.subjects.includes(f.key)).length;
  return f.label + "  " + n.toLocaleString("en-US");
}

function measureChips(labels, W, size) {
  setType(size, BOLD);
  let x = 0, y = 0;
  for (const s of labels) { const w = textWidth(s) + 22; if (x && x + w > W) { x = 0; y += 38; } x += w + 8; }
  return y + 32;
}

function layoutChips(labels, x0, y0, W, each) {
  setType(13.5, BOLD);
  let x = 0, y = 0;
  labels.forEach((s, i) => { const w = textWidth(s) + 22; if (x && x + w > W) { x = 0; y += 38; } each(i, x0 + x, y0 + y, w); x += w + 8; });
}

function chip(label, x, y, w, on, go) {
  const over = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + 32;
  stroke(P.fg); strokeWeight(1); fill(on ? P.fg : over ? P.paper : P.bg); rect(x + 0.5, y + 0.5, w, 31);
  noStroke(); fill(on ? P.bg : P.fg); setType(13.5, BOLD); textAlign(LEFT, CENTER); text(label, x + 11, y + 16.5);
  hits.push({ x, y, w, h: 32, go });
}

function button(label, x, y, go) {
  setType(13.5, BOLD);
  const w = textWidth(label) + 24;
  const over = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + 30;
  stroke(P.fg); strokeWeight(1); fill(over ? P.fg : P.bg); rect(x + 0.5, y + 0.5, w, 30);
  noStroke(); fill(over ? P.bg : P.fg); textAlign(LEFT, CENTER); text(label, x + 12, y + 15.5);
  hits.push({ x, y, w, h: 30, go });
  return w;
}

function drawTip() {
  if (!tip) return;
  setType(12.5);
  const pad = 8, lh = 18, w = max(...tip.lines.map((s) => textWidth(s))) + pad * 2, h = tip.lines.length * lh + pad * 2 - 4;
  const x = constrain(tip.x - w / 2, 0, width - w), y = max(0, tip.y - h - 14);
  noStroke(); fill(P.fg); rect(x, y, w, h);
  fill(P.bg); textAlign(LEFT, TOP);
  tip.lines.forEach((s, i) => text(s, x + pad, y + pad + i * lh));
}

// ======================================================================
// input
// ======================================================================

function mouseMoved() {
  const y = inDisc(mouseX, mouseY) ? ringAt(mouseX, mouseY) : null;
  hoverYear = y;
  const over = y !== null || chartYearAt(mouseX, mouseY) !== null || hits.some((h) => inside(h));
  cursor(over ? HAND : ARROW);
  redraw();
}

function mousePressed() {
  if (mouseX < 0 || mouseY < 0 || mouseX > width || mouseY > height) return;
  const h = hits.find(inside);
  if (h) { h.go(); return; }
  const r = inDisc(mouseX, mouseY) ? ringAt(mouseX, mouseY) : null;
  if (r !== null) { goToYear(r, false); return; }
  const c = chartYearAt(mouseX, mouseY);
  if (c !== null) { dragging = true; goToYear(c, false); }
}

function mouseDragged() {
  if (!dragging) return;
  const c = chartYearAt(mouseX, constrain(mouseY, L.chartGeom.top, L.chartGeom.bottom));
  if (c !== null && c !== year) goToYear(c, false);
}

function mouseReleased() { dragging = false; }

function keyPressed() {
  const el = document.activeElement;
  if (el && el !== document.body && el.tagName !== "CANVAS") return;
  if (keyCode === LEFT_ARROW || keyCode === DOWN_ARROW) { goToYear(year - 1, false); return false; }
  if (keyCode === RIGHT_ARROW || keyCode === UP_ARROW) { goToYear(year + 1, false); return false; }
}

function inside(h) { return mouseX >= h.x && mouseX <= h.x + h.w && mouseY >= h.y && mouseY <= h.y + h.h; }

function goToYear(y, scroll = true) {
  year = constrain(y, FIRST, LAST);
  page = 0; showSpan = false;
  updateDescription();
  redraw();
  if (scroll) {
    const r = document.querySelector("#sketch canvas").getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top + L.disc.y - 12, behavior: "smooth" });
  }
}

// ======================================================================
// helpers
// ======================================================================

function passes(w) { return filterKey === "all" || w.subjects.includes(filterKey); }
function filterLabel() { return FILTERS.find((f) => f.key === filterKey).label; }

// Works dated to one year count fully. A work dated to a span counts as a share
// of each year in it: 1959–1960 adds half a work to each year.
function countFor(y) {
  const c = { exact: 0, share: 0, exactList: [], spanList: [] };
  for (const w of works) {
    if (!passes(w) || y < w.start || y > w.end) continue;
    if (w.exact) { c.exact++; c.exactList.push(w); }
    else { c.share += 1 / (w.end - w.start + 1); c.spanList.push(w); }
  }
  return c;
}

function ringWord(v) { return v < 0.5 ? "very narrow" : v < 0.9 ? "narrow" : v <= 1.1 ? "average" : v <= 1.5 ? "wide" : "very wide"; }
function ringSentence(v) {
  if (v < 0.5) return "A very narrow ring. Most likely a severe drought year.";
  if (v < 0.9) return "A narrow ring. Most likely a dry year.";
  if (v <= 1.1) return "Close to an average ring.";
  if (v <= 1.5) return "A wide ring. Most likely a wet year.";
  return "A very wide ring. Most likely a very wet year.";
}
function ordinal(n) { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
function rankSentence(y) {
  const r = rankOf[y];
  if (r === 1) return "The narrowest of the 100 rings.";
  if (r === 100) return "The widest of the 100 rings.";
  return r <= 50 ? "The " + ordinal(r) + " narrowest of the 100 rings." : "The " + ordinal(101 - r) + " widest of the 100 rings.";
}

function setType(size, style = NORMAL) { textFont(UI_FONT); textStyle(style); textSize(size); }

function wrap(s, maxW) {
  const out = []; let line = "";
  for (const word of s.split(" ")) {
    const test = line ? line + " " + word : word;
    if (line && textWidth(test) > maxW) { out.push(line); line = word; } else line = test;
  }
  if (line) out.push(line);
  return out;
}

function para(s, x, y, maxW, lh, col, dry) {
  const lines = wrap(s, maxW);
  if (!dry) { noStroke(); fill(col); textAlign(LEFT, TOP); lines.forEach((l, i) => text(l, x, y + i * lh)); }
  return lines.length * lh;
}

function fit(s, maxW) {
  if (textWidth(s) <= maxW) return s;
  while (s.length > 1 && textWidth(s + "…") > maxW) s = s.slice(0, -1);
  return s + "…";
}

function hash(n, salt) {
  let x = (Math.imul(n, 2654435761) ^ Math.imul(salt, 40503)) >>> 0;
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d) >>> 0; x ^= x >>> 15; x = Math.imul(x, 0x846ca68b) >>> 0; x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

function setPalette() {
  const t = document.documentElement.getAttribute("data-theme");
  const dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  P = dark ? PALETTES.dark : PALETTES.light;
}

// A plain-text description of the canvas for screen readers (p5's describe())
function updateDescription() {
  const y = year, v = ringIndex[y], c = countFor(y);
  const parts = [
    "Tree-ring cross-section from 1887 at the center to 1986 at the bark, with O'Keeffe's works placed on the ring for their year. Selected year: " + y + ".",
    "Ring-width index " + nf(v, 1, 2) + ". " + ringSentence(v) + " " + rankSentence(y),
    ...(EVENTS[y] || []),
    c.exact + " works dated " + y + (filterKey === "all" ? "" : " with the subject " + filterLabel()) + ": " + c.exactList.slice(0, 12).map((w) => w.title).join("; ") + (c.exact > 12 ? "; and more." : "."),
    "Use the left and right arrow keys to change the year."
  ];
  describe(parts.join(" "));
}
