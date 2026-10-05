/*
==================================================
CURATE YOUR OWN GALLERY: subject bubbles
==================================================

A small packed-bubble chart for choosing by subject,
after O'Keeffe's Subjects. Each bubble's area shows how
many works have that subject; its ring shows the subject's
most common color tags. When a color is chosen, the
bubbles resize to the works with that color.

The bubbles are ordinary buttons (largest first), so they
work with the keyboard and screen readers.
==================================================
*/

// Short labels for inside the bubbles; the full name is used everywhere else.
const SUBJECT_SHORT = {
  "Plants, Flowers, and Leaves": "Plants and flowers",
  "Buildings and Built Environments": "Buildings",
  "Portraits and Human Figures": "Portraits",
  "Fruits and Vegetables": "Fruit",
  "Native American Objects": "Native American objects",
  "Christian Objects": "Christian objects",
  "Clothing and Domestic Objects": "Clothing",
};

const BUB = { gap: 3, minR: 13, fill: 0.56 };
let bubbleHover = null;

function subjectCounts() {
  const pool = F.color ? F.color.works : WORKS;
  const by = new Map();
  for (const w of pool) {
    if (!w.subject) continue;
    if (!by.has(w.subject)) by.set(w.subject, []);
    by.get(w.subject).push(w);
  }
  return SUBJECT_LIST
    .map(s => ({ s, works: by.get(s.name) || [] }))
    .filter(x => x.works.length)
    .sort((a, b) => b.works.length - a.works.length);
}

function topColors(works, n) {
  const c = new Map();
  for (const w of works) for (const col of w.colors) c.set(col.hex, (c.get(col.hex) || 0) + 1);
  return Array.from(c.entries()).sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0]);
}

// Greedy circle packing: largest first, each new circle placed touching two
// already placed (or one), as close to the centre as it fits. Squashed
// horizontally so the cluster matches the box's proportions.
function packCircles(rs, aspect) {
  const P = [];
  const g = BUB.gap;
  const fits = (x, y, r) => P.every(p => Math.hypot(p.x - x, p.y - y) >= p.r + r + g - 0.01);
  const score = (x, y) => (x / aspect) * (x / aspect) + y * y;
  for (const r of rs) {
    if (!P.length) { P.push({ x: 0, y: 0, r }); continue; }
    let best = null, bs = Infinity;
    const tryAt = (x, y) => { if (fits(x, y, r)) { const s = score(x, y); if (s < bs) { bs = s; best = { x, y }; } } };
    for (let i = 0; i < P.length; i++) {
      const a = P[i];
      for (let k = 0; k < 12; k++) {
        const t = (k / 12) * Math.PI * 2, d = a.r + r + g;
        tryAt(a.x + Math.cos(t) * d, a.y + Math.sin(t) * d);
      }
      for (let j = i + 1; j < P.length; j++) {
        const b = P[j];
        const ra = a.r + r + g, rb = b.r + r + g;
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
        if (d > ra + rb || d < Math.abs(ra - rb) || d === 0) continue;
        const l = (ra * ra - rb * rb + d * d) / (2 * d), h = Math.sqrt(Math.max(0, ra * ra - l * l));
        const mx = a.x + (dx * l) / d, my = a.y + (dy * l) / d;
        tryAt(mx + (h * dy) / d, my - (h * dx) / d);
        tryAt(mx - (h * dy) / d, my + (h * dx) / d);
      }
    }
    P.push({ x: best ? best.x : 0, y: best ? best.y : 0, r });
  }
  return P;
}

function renderSubjectBubbles() {
  const box = $("#subject-bubbles");
  if (!box) return;
  const W = box.clientWidth;
  if (!W) return;                          // panel hidden; drawn when the tab opens
  const H = Math.round(Math.max(230, Math.min(320, W * 0.8)));
  box.style.height = H + "px";

  const data = subjectCounts();
  const total = data.reduce((a, d) => a + d.works.length, 0) || 1;
  const k = Math.sqrt((BUB.fill * W * H) / (Math.PI * total));
  let rs = data.map(d => Math.max(BUB.minR, k * Math.sqrt(d.works.length)));
  let P = packCircles(rs, W / H);

  // fit the cluster into the box
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of P) { x0 = Math.min(x0, p.x - p.r); x1 = Math.max(x1, p.x + p.r); y0 = Math.min(y0, p.y - p.r); y1 = Math.max(y1, p.y + p.r); }
  const sc = Math.min(1, (W - 4) / (x1 - x0), (H - 4) / (y1 - y0));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;

  // reuse buttons by subject so they glide when sizes change
  const existing = new Map(Array.from(box.querySelectorAll(".bubble")).map(b => [b.dataset.name, b]));
  const keep = new Set();
  data.forEach((d, i) => {
    const p = P[i], r = p.r * sc;
    const name = d.s.name;
    keep.add(name);
    let b = existing.get(name);
    if (!b) {
      b = document.createElement("button");
      b.type = "button"; b.className = "bubble"; b.dataset.name = name;
      b.innerHTML = '<span class="bl"></span><span class="bn"></span>';
      b.addEventListener("click", () => {
        const s = SUBJECT_LIST.find(x => x.name === name);
        F.subject = F.subject === s ? null : s; F.shown = RESULTS_PAGE;
        renderResults();
      });
      b.addEventListener("mouseenter", () => { bubbleHover = name; bubbleCaption(); });
      b.addEventListener("mouseleave", () => { bubbleHover = null; bubbleCaption(); });
      b.addEventListener("focus", () => { bubbleHover = name; bubbleCaption(); });
      b.addEventListener("blur", () => { bubbleHover = null; bubbleCaption(); });
      // start at the centre so a new bubble grows into place
      b.style.left = W / 2 + "px"; b.style.top = H / 2 + "px"; b.style.width = b.style.height = "0px";
      box.appendChild(b);
    }
    box.appendChild(b);                    // DOM order = largest first, for keyboard order
    const n = d.works.length;
    b.dataset.n = n;
    const left = W / 2 + (p.x - cx) * sc - r, top = H / 2 + (p.y - cy) * sc - r;
    requestAnimationFrame(() => {
      b.style.left = left.toFixed(1) + "px"; b.style.top = top.toFixed(1) + "px";
      b.style.width = b.style.height = (r * 2).toFixed(1) + "px";
    });
    const cols = topColors(d.works, 5);
    b.style.setProperty("--ring", cols.length
      ? `conic-gradient(${cols.map((c, j) => `${c} ${(j / cols.length * 100).toFixed(1)}% ${((j + 1) / cols.length * 100).toFixed(1)}%`).join(",")})`
      : "var(--line)");
    const label = SUBJECT_SHORT[name] || name;
    // shrink the type until the longest word fits (not below 10.5 px); allow two lines in bigger bubbles
    const longest = Math.max(...label.split(" ").map(w => w.length));
    const lineW = r * 1.75;
    const fs = Math.max(10.5, Math.min(14, r / 3.6, lineW / (longest * 0.58)));
    const charW = fs * 0.56;
    const roomy = r >= 22 && longest * charW < lineW && label.length * charW < (r >= 34 ? lineW * 1.8 : lineW);
    b.querySelector(".bl").textContent = roomy ? label : "";
    b.querySelector(".bn").textContent = roomy && r >= 30 ? n : "";
    b.style.fontSize = fs.toFixed(1) + "px";
    b.setAttribute("aria-label", `${name}, ${n} ${n === 1 ? "work" : "works"}${F.color ? " tagged " + F.color.label : ""}`);
    b.setAttribute("aria-pressed", F.subject && F.subject.name === name ? "true" : "false");
  });
  for (const [name, b] of existing) if (!keep.has(name)) b.remove();
  bubbleCaption();
}

function bubbleCaption() {
  const cap = $("#bubble-caption");
  if (!cap) return;
  const name = bubbleHover || (F.subject && F.subject.name);
  const b = name && $(`.bubble[data-name="${CSS.escape(name)}"]`);
  if (b) {
    const n = +b.dataset.n;
    cap.innerHTML = `<b>${esc(name)}</b> · ${n} ${n === 1 ? "work" : "works"}${F.color ? " tagged " + esc(F.color.label) : ""}`;
  } else if (F.subject) {
    cap.innerHTML = `<b>${esc(F.subject.name)}</b> has no works tagged ${esc(F.color.label)}.`;
  } else {
    cap.textContent = F.color
      ? `Subjects of the works tagged ${F.color.label}. Pick one to narrow the list.`
      : "Bubble size shows how many works have each subject; the ring shows its most common colors.";
  }
}
