// ============================================================
// compare.js
//
// Finds the works composed most like the chosen one, and says
// where each pair is alike and where it differs.
//
// The overall distance (compositionDistance and its weights)
// is Jonathan's, from the original sketch.js.
// ============================================================


let works = [];                 // records that have an image
let worksByKey = new Map();
let analyses = {};              // key -> composition fingerprint

const FILTERS = [
  { value: "flat", label: "Paintings and works on paper", test: w => w.category !== "object" },
  { value: "painting", label: "Paintings", test: w => w.category === "painting" },
  { value: "paper", label: "Works on paper", test: w => w.category === "paper" }
];

// What a pair of works can be compared on.
const ASPECTS = [
  { key: "eye", label: "Where the eye lands", short: "Focus" },
  { key: "balance", label: "Balance", short: "Balance" },
  { key: "lines", label: "Lines", short: "Lines" },
  { key: "symmetry", label: "Symmetry", short: "Symmetry" },
  { key: "detail", label: "Amount of detail", short: "Detail" }
];

// "Match on" choices. "all" uses Jonathan's overall distance.
const MATCH_MODES = [
  { value: "all", label: "Everything" },
  { value: "eye", label: "Where the eye lands" },
  { value: "balance", label: "Balance" },
  { value: "lines", label: "Lines" }
];


// ============================================================
// Prepare records
// ============================================================

function prepareWorks(parsed) {
  works = parsed
    .filter(paintingHasImage)
    .map((p, i) => {
      const s = p.source || {};
      const rep = p.representation || {};
      const view = p.firstView || {};
      const w = Number(view.width) || Number(rep.width) || 1;
      const h = Number(view.height) || Number(rep.height) || 1;

      p.key = p.elasticId || p.id || "record-" + p.index;
      p.catalogueOrder = i;
      p.category = workCategory(s);
      p.aspect = w / h;
      p.shortTitle = firstLabel(s.label) || p.title;
      p.dateLabel = firstLabel(s.timespan && s.timespan.label);
      p.mediumDims = firstLabel(s.caption && s.caption.medium_dimension) || firstLabel(s.classified_as);
      p.owner = firstLabel(s.caption && s.caption.owner) ||
        (Array.isArray(s.controlling_institution) && s.controlling_institution[0]
          ? s.controlling_institution[0].name : "");
      p.imageNum = view.image_num || null;

      const objectNumber = String(p.id || p.key).replace(/^object\//, "");
      p.accessURL = /^\d+$/.test(objectNumber)
        ? "https://access-ok.okeeffemuseum.org/object/" + objectNumber + "/"
        : null;
      return p;
    })
    .filter(w => w.category !== "object" && w.imageNum);   // photos of objects don't read as compositions

  worksByKey = new Map(works.map(w => [w.key, w]));
}

function firstLabel(value) {
  if (Array.isArray(value)) value = value[0];
  return getLabelValue(value);
}

function workCategory(s) {
  const types = (s.item_type || []).join(" ").toLowerCase();
  const medium = ((s.classified_as || [])[0] || "").toLowerCase();
  if (/sculpture|cast|stoneware/.test(types) || /bronze|stoneware|ceramic/.test(medium)) return "object";
  if (/works on paper|drawings|watercolors/.test(types)) return "paper";
  if (/paintings/.test(types)) return "painting";
  if (/^oil/.test(medium) && !/paper/.test(medium)) return "painting";
  if (/paper|watercolor|pastel|graphite|grapite|charcoal|chacoal|ink/.test(medium)) return "paper";
  return "other";
}

function iiifURL(work, spec) {
  return "https://iiif.okeeffemuseum.org/image/iiif/2/" + work.imageNum + "/" + spec + "/0/default.jpg";
}

// Small image used only for the pixel analysis (composition.js
// shrinks everything to 150 pixels wide anyway).
function analysisImageURL(work) { return iiifURL(work, "full/200,"); }
function displayImageURL(work, size) { return iiifURL(work, "full/!" + size + "," + size); }


// ============================================================
// Fingerprint
// ============================================================

function getFingerprintKeys() {
  return [
    "focalX", "focalY",
    "visualCenterX", "visualCenterY",
    "balanceX", "balanceY",
    "symmetry",
    "edgeDensity",
    "horizontalEnergy", "verticalEnergy",
    "diagonalAEnergy", "diagonalBEnergy",
    "thirdsScore", "goldenScore"
  ];
}

function copyFingerprint(analysis) {
  const result = {};
  for (const key of getFingerprintKeys()) {
    result[key] = Math.round((Number(analysis[key]) || 0) * 10000) / 10000;
  }
  result.dominantDirection = analysis.dominantDirection;
  return result;
}


// ============================================================
// Distances, one per aspect
// ============================================================

function aspectDistance(aspect, a, b) {
  switch (aspect) {
    case "eye":
      return Math.hypot(a.focalX - b.focalX, a.focalY - b.focalY);
    case "balance":
      return Math.hypot(a.visualCenterX - b.visualCenterX, a.visualCenterY - b.visualCenterY);
    case "lines":
      return (
        Math.abs(a.horizontalEnergy - b.horizontalEnergy) +
        Math.abs(a.verticalEnergy - b.verticalEnergy) +
        Math.abs(a.diagonalAEnergy - b.diagonalAEnergy) +
        Math.abs(a.diagonalBEnergy - b.diagonalBEnergy)
      ) / 2;
    case "symmetry":
      return Math.abs(a.symmetry - b.symmetry);
    case "detail":
      return Math.abs(a.edgeDensity - b.edgeDensity);
  }
  return 0;
}


// Jonathan's overall distance.
function compositionDistance(a, b) {
  const weights = {
    focalX: 2.0, focalY: 2.0,
    visualCenterX: 1.6, visualCenterY: 1.6,
    balanceX: 1.7, balanceY: 1.7,
    symmetry: 1.0,
    edgeDensity: 0.8,
    horizontalEnergy: 1.1, verticalEnergy: 1.1,
    diagonalAEnergy: 1.1, diagonalBEnergy: 1.1,
    thirdsScore: 0.5, goldenScore: 0.5
  };
  let weightedDistance = 0;
  let totalWeight = 0;
  for (const key in weights) {
    let av = Number(a[key]) || 0;
    let bv = Number(b[key]) || 0;
    if (key === "balanceX" || key === "balanceY") {
      av = (av + 1) / 2;
      bv = (bv + 1) / 2;
    }
    weightedDistance += (av - bv) * (av - bv) * weights[key];
    totalWeight += weights[key];
  }
  return Math.sqrt(weightedDistance / totalWeight);
}

function distanceToSimilarity(distance) {
  return Math.max(0, Math.min(1, 1 - distance * 2.1));
}


// ============================================================
// Collection statistics
//
// "Alike" and "different" are judged against the collection:
// a pair is "alike" on an aspect when it is closer than 80
// percent of random pairs, "close" when closer than 55 percent.
// Recomputed as more works are read.
// ============================================================

let stats = null;

const FALLBACK_CUTS = {
  eye: [0.10, 0.22], balance: [0.04, 0.09], lines: [0.08, 0.18],
  symmetry: [0.02, 0.05], detail: [0.03, 0.08]
};

function computeStats() {
  const keys = Object.keys(analyses).filter(k => worksByKey.has(k));
  if (keys.length < 30) {
    stats = null;
    return;
  }

  const cuts = {};
  let seed = 12345;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const samples = Math.min(4000, keys.length * 20);

  for (const asp of ASPECTS) {
    const d = [];
    for (let i = 0; i < samples; i++) {
      const a = analyses[keys[Math.floor(rand() * keys.length)]];
      const b = analyses[keys[Math.floor(rand() * keys.length)]];
      if (a === b) continue;
      d.push(aspectDistance(asp.key, a, b));
    }
    d.sort((x, y) => x - y);
    cuts[asp.key] = [quantile(d, 0.20), quantile(d, 0.45)];
  }

  // Tertiles for describing a single work's symmetry and detail.
  const sym = keys.map(k => analyses[k].symmetry).sort((x, y) => x - y);
  const det = keys.map(k => analyses[k].edgeDensity).sort((x, y) => x - y);

  stats = {
    count: keys.length,
    cuts,
    symmetry: [quantile(sym, 1 / 3), quantile(sym, 2 / 3)],
    detail: [quantile(det, 1 / 3), quantile(det, 2 / 3)]
  };
}

function quantile(sorted, q) {
  if (sorted.length === 0) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round(q * (sorted.length - 1))));
  return sorted[i];
}


// alike | close | different
function verdict(aspect, a, b) {
  const d = aspectDistance(aspect, a, b);
  const cuts = stats ? stats.cuts[aspect] : FALLBACK_CUTS[aspect];
  if (d <= cuts[0]) return "alike";
  if (d <= cuts[1]) return "close";
  return "different";
}


// ============================================================
// Matches
// ============================================================

function findMatches(key, filterValue, mode, count = 3) {
  const a = analyses[key];
  if (!a) return [];
  const filter = FILTERS.find(f => f.value === filterValue) || FILTERS[0];

  const scored = [];
  for (const w of works) {
    if (w.key === key || !filter.test(w)) continue;
    const b = analyses[w.key];
    if (!b) continue;
    const overall = compositionDistance(a, b);
    const rankDistance = mode === "all"
      ? overall
      : aspectDistance(mode, a, b) + overall * 0.05;    // overall breaks ties
    scored.push({ work: w, overall, rankDistance });
  }
  scored.sort((x, y) => x.rankDistance - y.rankDistance);

  return scored.slice(0, count).map(m => ({
    work: m.work,
    similarity: distanceToSimilarity(m.overall),
    verdicts: Object.fromEntries(ASPECTS.map(asp => [asp.key, verdict(asp.key, a, analyses[m.work.key])]))
  }));
}


// ============================================================
// Describing one work in words
// ============================================================

const DIRECTION_NAMES = {
  "horizontal": "horizontal",
  "vertical": "vertical",
  "diagonal /": "rising diagonal",
  "diagonal \\": "falling diagonal"
};

function describeAspect(aspect, a) {
  switch (aspect) {
    case "eye": return describeSpot(a.focalX, a.focalY);
    case "balance": return describeLean(a.balanceX, a.balanceY);
    case "lines": return describeLines(a);
    case "symmetry": return describeLevel(a.symmetry, stats ? stats.symmetry : [0.86, 0.91],
      ["Asymmetrical", "Somewhat symmetrical", "Very symmetrical"]);
    case "detail": return describeLevel(a.edgeDensity, stats ? stats.detail : [0.12, 0.25],
      ["Spare", "Some detail", "Busy"]);
  }
  return "";
}

function describeSpot(x, y) {
  const h = x < 0.38 ? "left" : (x > 0.62 ? "right" : "center");
  const v = y < 0.38 ? "Top" : (y > 0.62 ? "Bottom" : "Center");
  if (h === "center" && v === "Center") return "Center";
  if (v === "Center") return "Center " + h;
  return v + " " + h;
}

function describeLean(bx, by) {
  const t = 0.10;
  const h = bx < -t ? "left" : (bx > t ? "right" : "");
  const v = by < -t ? "up" : (by > t ? "down" : "");
  if (!h && !v) return "Evenly balanced";
  if (h && v) return `Leans ${v} and to the ${h}`;
  if (h) return `Leans to the ${h}`;
  return `Leans ${v}`;
}

function describeLines(a) {
  const shares = [a.horizontalEnergy, a.verticalEnergy, a.diagonalAEnergy, a.diagonalBEnergy];
  const top = Math.max(...shares);
  const name = DIRECTION_NAMES[a.dominantDirection] || "mixed";
  if (top < 0.32) return "No strong direction";
  return "Mostly " + name;
}

function describeLevel(value, cuts, words) {
  if (value < cuts[0]) return words[0];
  if (value < cuts[1]) return words[1];
  return words[2];
}


// ============================================================
// Cache of analyses (this browser only)
// ============================================================

// Bump when composition.js changes, so stale numbers are dropped.
const ANALYSIS_VERSION = "v6-diagfix";
const CACHE_KEY = "gokm-composition-cache";

function loadCachedAnalyses() {
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (saved && saved.version === ANALYSIS_VERSION && saved.analyses) {
      Object.assign(analyses, saved.analyses);
    }
  } catch (e) { /* storage unavailable */ }
}

function saveCachedAnalyses() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ version: ANALYSIS_VERSION, analyses }));
  } catch (e) { /* storage unavailable or full */ }
}

// Run downloadCompositions() in the browser console once every
// work has been read. Put the downloaded compositions.json next
// to index.html and the page will load instantly for everyone.
function downloadCompositions() {
  const blob = new Blob(
    [JSON.stringify({ version: ANALYSIS_VERSION, made: new Date().toISOString(), analyses })],
    { type: "application/json" }
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "compositions.json";
  a.click();
  return Object.keys(analyses).length + " works saved";
}
