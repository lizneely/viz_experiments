/*
==================================================
CURATE YOUR OWN GALLERY: sharing
==================================================

- Save image: a poster-style PNG with the wall drawn to
  scale, numbered works, the title wall text set large
  enough to read, and the Exhibition Checklist.
- Copy checklist: the title, introduction, and checklist
  as plain text.
- Copy link (hosted version only): the whole exhibition is
  packed into the link itself, so no server is needed.
==================================================
*/

const POSTER_W = 2400;
const POSTER_INK = "#171615", POSTER_MUTED = "#6B655E", POSTER_RULE = "#DEDAD4";
const PROTOTYPE_URL = "https://okeeffe-experiments.netlify.app/";

function exhibitionTitle() { return G.title.trim() || "Untitled exhibition"; }

function workCaption(w) {
  return {
    title: `${w.title}, ${w.date}`,
    meta: w.mediumDim || [w.medium, w.extent].filter(Boolean).join(", "),
    owner: w.owner
  };
}

/* ---------- images for the saved file ---------- */

// Loaded with CORS so the finished canvas can be saved. Anything that won't
// load that way is drawn as its color bands instead.
function loadExportImage(work, px) {
  return new Promise(resolve => {
    // odd sizes keep these requests apart from the cached (non-CORS) images on the live wall
    const n = Math.max(65, Math.min(1601, Math.ceil(px))) | 1;
    const im = new Image();
    im.crossOrigin = "anonymous";
    let done = false;
    const finish = ok => { if (!done) { done = true; resolve(ok ? im : null); } };
    im.onload = () => finish(true);
    im.onerror = () => finish(false);
    setTimeout(() => finish(false), 9000);
    im.src = IIIF_URL(work.dam, n, n);
  });
}

/* ---------- text helpers (pixels) ---------- */

function wrapPx(ctx, text, font, maxW) {
  ctx.font = font;
  const out = [];
  for (const para of String(text).split(/\n+/)) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const t = line ? line + " " + word : word;
      if (ctx.measureText(t).width > maxW && line) { out.push(line); line = word; } else line = t;
    }
    if (line) out.push(line);
  }
  return out;
}

/* ---------- the poster ---------- */

async function renderPoster() {
  const W = POSTER_W, pad = 96, inner = W - pad * 2;
  const span = L.wallW - L.minX, totalH = L.wallH + FLOOR;
  const s = inner / span;
  const wallH = Math.round(totalH * s);

  // images first
  const images = new Map();
  let missing = 0;
  await Promise.all(G.ids.map(async id => {
    const w = WORK_BY_ID.get(id);
    const im = await loadExportImage(w, Math.max(w.w, w.h) * s * 1.25);
    if (im) images.set(id, im); else missing++;
  }));

  // the wall, drawn with the same code as the live canvas
  const wallCanvas = document.createElement("canvas");
  wallCanvas.width = inner; wallCanvas.height = wallH;
  const saved = { ...view };
  view = { s, ox: -L.minX * s, oy: L.wallH * s };
  wrapCache.clear();
  exporting = true;
  try {
    drawScene(wallCanvas.getContext("2d"), inner, wallH, { images, numbers: true, bg: "#FFFFFF", uiPx: Math.round(inner / 105) });
  } finally {
    view = saved;
    exporting = false;
    wrapCache.clear();
  }

  // measure the text
  const m = document.createElement("canvas").getContext("2d");
  const F = {
    title: `800 92px ${UI_FONT}`, cur: `italic 400 32px ${UI_FONT}`, intro: `400 32px ${UI_FONT}`,
    h2: `700 40px ${UI_FONT}`, wt: `italic 600 27px ${UI_FONT}`, wm: `400 24px ${UI_FONT}`, foot: `400 22px ${UI_FONT}`
  };
  const titleLines = wrapPx(m, exhibitionTitle(), F.title, inner);
  const introLines = G.intro.trim() ? wrapPx(m, G.intro.trim(), F.intro, Math.min(inner, 1560)) : [];
  const cols = 2, gutter = 72, colW = (inner - gutter) / cols, numW = 56;
  const entries = G.ids.map((id, i) => {
    const c = workCaption(WORK_BY_ID.get(id));
    const t = wrapPx(m, c.title, F.wt, colW - numW);
    const meta = wrapPx(m, c.meta, F.wm, colW - numW);
    const own = c.owner ? wrapPx(m, c.owner, F.wm, colW - numW) : [];
    return { n: i + 1, t, meta, own, h: t.length * 36 + (meta.length + own.length) * 32 + 30 };
  });
  const per = Math.ceil(entries.length / cols);
  const colsList = [entries.slice(0, per), entries.slice(per)];
  const checklistH = entries.length ? Math.max(...colsList.map(c => c.reduce((a, e) => a + e.h, 0))) : 40;
  const footLines = wrapPx(m, "Made with Curate Your Own Gallery, an O'Keeffe Experiments prototype from the Georgia O'Keeffe Museum. The images and information have not been reviewed for publication in this format.", F.foot, Math.min(inner, 1700));

  const headerH = titleLines.length * 96 + (G.curator.trim() ? 56 : 0) + (introLines.length ? 28 + introLines.length * 47 : 0);
  const H = Math.round(pad + headerH + 56 + wallH + 72 + 64 + checklistH + 40 + footLines.length * 32 + pad);

  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";

  let y = pad;
  ctx.fillStyle = POSTER_INK; ctx.font = F.title; ctx.letterSpacing = "-2.5px";
  for (const l of titleLines) { y += 92; ctx.fillText(l, pad, y); y += 4; }
  ctx.letterSpacing = "0px";
  if (G.curator.trim()) { y += 52; ctx.font = F.cur; ctx.fillStyle = POSTER_MUTED; ctx.fillText("Curated by " + G.curator.trim(), pad, y); }
  if (introLines.length) {
    y += 28; ctx.font = F.intro; ctx.fillStyle = POSTER_INK;
    for (const l of introLines) { y += 47; ctx.fillText(l, pad, y); }
  }
  y += 56;
  ctx.drawImage(wallCanvas, pad, y);
  y += wallH + 72;

  ctx.fillStyle = POSTER_INK; ctx.fillRect(pad, y - 36, inner, 2);
  ctx.font = F.h2; ctx.fillText("Exhibition Checklist", pad, y + 10);
  y += 64;
  colsList.forEach((col, ci) => {
    let yy = y;
    const x = pad + ci * (colW + gutter);
    for (const e of col) {
      ctx.fillStyle = POSTER_INK; ctx.fillRect(x, yy, 38, 38);
      ctx.fillStyle = "#FFFFFF"; ctx.font = `700 22px ${UI_FONT}`; ctx.textAlign = "center";
      ctx.fillText(String(e.n), x + 19, yy + 27); ctx.textAlign = "left";
      let ly = yy + 27;
      ctx.fillStyle = POSTER_INK; ctx.font = F.wt;
      for (const l of e.t) { ctx.fillText(l, x + numW, ly); ly += 36; }
      ctx.fillStyle = POSTER_MUTED; ctx.font = F.wm; ly -= 4;
      for (const l of e.meta.concat(e.own)) { ctx.fillText(l, x + numW, ly); ly += 32; }
      yy += e.h;
    }
  });
  if (!entries.length) { ctx.fillStyle = POSTER_MUTED; ctx.font = F.wm; ctx.fillText("No works on the wall yet.", pad, y + 24); }
  y += checklistH + 40;
  ctx.fillStyle = POSTER_RULE; ctx.fillRect(pad, y - 20, inner, 2);
  ctx.fillStyle = POSTER_MUTED; ctx.font = F.foot;
  for (const l of footLines) { y += 32; ctx.fillText(l, pad, y); }

  return { canvas: cv, missing };
}

function posterFileName() {
  const slug = exhibitionTitle().toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  return (slug || "my-exhibition") + ".png";
}

/* ---------- checklist text ---------- */

function checklistText() {
  const out = [exhibitionTitle()];
  if (G.curator.trim()) out.push("Curated by " + G.curator.trim());
  if (G.intro.trim()) out.push("", G.intro.trim());
  out.push("", "Exhibition Checklist");
  G.ids.forEach((id, i) => {
    const c = workCaption(WORK_BY_ID.get(id));
    out.push(`${i + 1}. ${c.title}. ${c.meta}.${c.owner ? " " + c.owner + "." : ""}`);
  });
  if (!G.ids.length) out.push("No works on the wall yet.");
  out.push("", "Made with Curate Your Own Gallery, an O'Keeffe Experiments prototype from the Georgia O'Keeffe Museum: " + (canShareLink() ? location.origin + location.pathname : PROTOTYPE_URL));
  return out.join("\n");
}

/* ---------- link ---------- */

// The claude.ai preview drops anything after "?" or "#key=", so links only work on the hosted page.
function canShareLink() { return !window.EMBEDDED_PAINTINGS && /^https?:$/.test(location.protocol); }

function b64urlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = ""; bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s + "===".slice((s.length + 3) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

function shareLink() {
  const r2 = v => Math.round(v * 2) / 2;
  const packed = {
    v: 1, i: G.ids, h: G.hang === "salon" ? 1 : 0, c: G.wall.replace("#", ""),
    t: G.title, n: G.intro, b: G.curator,
    o: (G.showLabels ? 1 : 0) | (G.showFigure ? 2 : 0) | (G.showGuide ? 4 : 0) | (G.snap ? 8 : 0)
  };
  if (G.hang === "salon") packed.s = G.ids.map(id => { const p = G.salon[id] || { x: 0, y: CENTER }; return [r2(p.x), r2(p.y), G.z[id] || 0]; });
  return location.origin + location.pathname + "?wall=" + b64urlEncode(JSON.stringify(packed));
}

// Returns true if the page was opened from a shared link.
function loadStateFromLink() {
  try {
    const q = new URLSearchParams(location.search).get("wall");
    if (!q) return false;
    const p = JSON.parse(b64urlDecode(q));
    const ids = (p.i || []).filter(id => WORK_BY_ID.has(id)).slice(0, MAX_WORKS);
    Object.assign(G, {
      ids, hang: p.h ? "salon" : "line", wall: "#" + String(p.c || "EAE3D4").toUpperCase(),
      title: p.t || "", intro: p.n || "", curator: p.b || "",
      showLabels: !!(p.o & 1), showFigure: !!(p.o & 2), showGuide: !!(p.o & 4), snap: !!(p.o & 8),
      salon: {}, z: {}, selected: null
    });
    if (p.s) (p.i || []).forEach((id, k) => {
      if (WORK_BY_ID.has(id) && p.s[k]) { G.salon[id] = { x: p.s[k][0], y: p.s[k][1] }; if (p.s[k][2]) G.z[id] = p.s[k][2]; }
    });
    if (G.hang === "salon") packSalon(G.ids.filter(id => !G.salon[id]));
    history.replaceState(null, "", location.pathname);
    return true;
  } catch (e) {
    console.warn("Couldn't read the shared exhibition", e);
    return false;
  }
}
