/*
==================================================
WORKS: load and normalize paintings.json
==================================================

Adapted from Jonathan's ColorGrid (museum.js).
Reads the same search-index records, so any
paintings.json in that shape can be dropped in.
Uses colors.js (Jonathan's) for hex, HSB, and sorting.
==================================================
*/

const IIIF_URL = (dam, w, h) =>
  `https://iiif.okeeffemuseum.org/image/iiif/2/${dam}/full/!${w},${h}/0/default.jpg`;

const ACCESS_URL = (n) => `https://access-ok.okeeffemuseum.org/object/${n}/`;

// Not hung: 3D works and sketchbooks.
const SKIP_TYPES = new Set(["Sculpture", "Casts", "Stoneware", "Sketchbooks"]);

// Height and width fields that disagree with the Measurement
// Description (from the O'Keeffe to Scale review list).
const DIMENSION_CONFLICTS = new Set([
  8486, 8491, 8496, 8631, 9335, 8698, 8782, 8962, 10294, 730, 745, 747, 805, 10174
]);

let WORKS = [];          // usable works
let WORK_BY_ID = new Map();
let COLOR_LIST = [];     // [{hex, label, hsb, works: [...]}] sorted for display
let SUBJECT_LIST = [];   // [{name, works: [...]}] sorted by count

function first(a) {
  return Array.isArray(a) ? a[0] : a;
}

function normalizeWork(hit) {
  const s = hit._source || {};
  const idNum = parseInt(String(hit._id || "").split("/").pop(), 10);
  if (!idNum) return null;

  const types = s.item_type || [];
  if (types.some(t => SKIP_TYPES.has(t))) return null;
  if (DIMENSION_CONFLICTS.has(idNum)) return null;

  const dim = s.dimensions || {};
  const h = Number(dim.height_in), w = Number(dim.width_in);
  if (!(h > 0 && w > 0)) return null;

  const views = (s.representation && s.representation.views) || [];
  const v = views[0];
  if (!v || !v.image_num) return null;

  const colors = [];
  const seen = new Set();
  for (const f of s.color_facets || []) {
    const hex = normalizeHex(f.hex);
    if (!hex || seen.has(hex)) continue;
    seen.add(hex);
    const rgb = hexToRgb(hex);
    colors.push({ hex, label: f.label || "", rgb, hsb: rgbToHsb(rgb) });
  }
  colors.sort(sortColorsForDisplay);

  const captionTitle = first((s.caption || {}).title_date) || "";
  const title = first(s.label) || captionTitle.replace(/,\s*[^,]*$/, "") || "Untitled";
  const date = first((s.timespan || {}).label) || "";
  const inst = first(s.controlling_institution);
  const owner = (inst && inst.name) || first((s.caption || {}).owner) || "";

  return {
    id: idNum,
    title,
    date,
    medium: first(s.classified_as) || "",
    mediumDim: first((s.caption || {}).medium_dimension) || "",
    extent: first(s.extent) || "",
    owner,
    subject: first(s.theme) || "",
    h, w,
    dam: String(v.image_num),
    iw: Number(v.width) || w,
    ih: Number(v.height) || h,
    colors,
    year: parseInt(String(date).match(/\d{4}/) || "0", 10) || 9999,
    // from the Museum's best-images list (Eye for O'Keeffe data), when present
    alt: ((s.best_image || {}).alt_text || "").trim(),
    credit: ((s.best_image || {}).credit || "").trim()
  };
}

function buildIndexes() {
  WORK_BY_ID = new Map(WORKS.map(w => [w.id, w]));

  const byHex = new Map();
  for (const work of WORKS) {
    for (const c of work.colors) {
      if (!byHex.has(c.hex)) byHex.set(c.hex, { hex: c.hex, label: c.label, rgb: c.rgb, hsb: c.hsb, works: [] });
      byHex.get(c.hex).works.push(work);
    }
  }
  COLOR_LIST = Array.from(byHex.values()).sort(sortColorsForDisplay);

  const bySubject = new Map();
  for (const work of WORKS) {
    if (!work.subject) continue;
    if (!bySubject.has(work.subject)) bySubject.set(work.subject, { name: work.subject, works: [] });
    bySubject.get(work.subject).works.push(work);
  }
  SUBJECT_LIST = Array.from(bySubject.values()).sort((a, b) => b.works.length - a.works.length || a.name.localeCompare(b.name));
}

async function loadWorks() {
  let hits = window.EMBEDDED_PAINTINGS;
  if (!hits) {
    const res = await fetch("paintings.json");
    if (!res.ok) throw new Error("Could not load paintings.json (HTTP " + res.status + ")");
    hits = await res.json();
  }
  if (!Array.isArray(hits)) throw new Error("paintings.json is not a list of records");

  const seen = new Set();
  WORKS = [];
  for (const hit of hits) {
    const w = normalizeWork(hit);
    if (w && !seen.has(w.id)) { seen.add(w.id); WORKS.push(w); }
  }
  WORKS.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
  buildIndexes();
  return WORKS;
}
