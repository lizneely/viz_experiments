/* Which Way Is Up? — game logic. Plain JavaScript, no libraries.
   Needs disputes.js (loaded first). Reads paintings.json (the Eye for O'Keeffe data)
   from the same folder; without it, the game plays only the disputed works.

   EDIT: games settings */
const ROUNDS = 6;              // works per game
const DISPUTED_PER_GAME = 2;   // works with a recorded dispute in each game
const MAX_DRAWINGS = 2;        // most drawings among the other works in a game
const IMAGE_SIZE = "!1000,1000";

const CR = window.CR_LABEL, NB = window.NB_LABEL;
const ACCESS = n => `https://access-ok.okeeffemuseum.org/object/${n}/`;
const IIIF = (id, size = IMAGE_SIZE) => `https://iiif.okeeffemuseum.org/image/iiif/2/${id}/full/${size}/0/default.jpg`;
const EMBEDDED = window.EMBEDDED_IMAGES || {};   // only in the claude.ai preview build
const $ = id => document.getElementById(id);
const norm = d => ((d % 360) + 360) % 360;
const first = v => Array.isArray(v) ? v[0] : v;
const TURN_WORDS = {0:"upright", 90:"a quarter turn right", 180:"upside down", 270:"a quarter turn left"};

let POOL = [];                 // works without a recorded dispute
const DISPUTED = window.DISPUTED.map(w => ({...w, disputed:true}));
let game = [], round = 0, work = null, rot = 0, revealed = false, results = [];
let disputedQueue = [];
const FAILED = new Set();   // images that didn't load this visit

/* ---------- Data ---------- */
function isColorWork(s){
  const types = (s.item_type || []).join(" ");
  const med = [first(s.classified_as), first(s.caption && s.caption.medium_dimension)].join(" ");
  return /Paintings|Watercolors/.test(types) || /oil|watercolor|pastel|gouache|tempera|acrylic|color|crayon/i.test(med);
}
function fromRecord(r){
  const s = r._source || r;
  const types = s.item_type || [];
  if (types.includes("Stoneware")) return null;
  const asset = s.best_image && s.best_image.asset_id;
  if (!asset) return null;
  const obj = String(s.id || "").split("/")[1];
  return {
    key: String(asset), obj,
    title: first(s.label) || "Untitled",
    date: first(s.timespan && s.timespan.label) || "",
    holder: first(s.caption && s.caption.owner) || "",
    medium: first(s.caption && s.caption.medium_dimension) || "",
    alt: (s.best_image && s.best_image.alt_text) || "",
    credit: (s.best_image && s.best_image.credit) || "",
    color: isColorWork(s),
    disputed: false
  };
}
async function loadPool(){
  try {
    const res = await fetch("paintings.json");
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const disputedObjs = new Set(DISPUTED.map(w => String(w.obj)));
    POOL = data.map(fromRecord).filter(w => w && !disputedObjs.has(w.obj));
  } catch (e) {
    POOL = [];   // preview or missing file: play the disputed works only
  }
}

/* ---------- Dealing ---------- */
function shuffle(a){ for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(arr, n, ok = () => true){
  const out = [];
  for (const i of shuffle([...arr.keys()])){ if (out.length >= n) break; if (ok(arr[i], out)) out.push(arr[i]); }
  return out;
}
function deal(){
  if (!POOL.length){
    // Disputed works only, six at a time.
    if (disputedQueue.length < ROUNDS) disputedQueue = shuffle(DISPUTED.slice());
    return disputedQueue.splice(0, ROUNDS);
  }
  if (disputedQueue.length < DISPUTED_PER_GAME) disputedQueue = shuffle(DISPUTED.slice());
  const disputed = disputedQueue.splice(0, DISPUTED_PER_GAME);
  const others = pick(POOL, ROUNDS - disputed.length, (w, out) => !FAILED.has(w.key) && (w.color || out.filter(x => !x.color).length < MAX_DRAWINGS));
  return shuffle([...disputed, ...others]);
}

/* ---------- Layout ---------- */
function fit(box, w, h, deg, pad){
  const S = box.clientWidth, swap = norm(deg) % 180 !== 0;
  const bw = swap ? h : w, bh = swap ? w : h;
  const s = Math.min(S * pad / bw, S * pad / bh);
  return {S, w:w*s, h:h*s, bw:bw*s, bh:bh*s};
}
function place(img, box, w, h, deg, pad){
  const f = fit(box, w, h, deg, pad);
  img.style.width = f.w + "px"; img.style.height = f.h + "px";
  img.style.transform = `translate(-50%,-50%) rotate(${deg}deg)`;
  return f;
}
let wireTimer;
function layout(animateWire){
  if (!work || !work.w) return;
  const f = place($("art"), $("wall"), work.w, work.h, rot, .78);
  const wire = $("wire");
  const draw = () => {
    const cx = f.S/2, top = f.S/2 - f.bh/2, half = f.bw/2;
    const ny = Math.max(14, top - f.bh*0.16 - 10);
    $("nail").setAttribute("cx", cx); $("nail").setAttribute("cy", ny);
    const a = top + Math.min(f.bh*.04, 10);
    for (const [id, x] of [["w1", cx-half*.82], ["w2", cx+half*.82]]){ const l = $(id); l.setAttribute("x1",cx); l.setAttribute("y1",ny); l.setAttribute("x2",x); l.setAttribute("y2",a); }
    wire.classList.remove("off");
  };
  clearTimeout(wireTimer);
  if (animateWire){ wire.classList.add("off"); wireTimer = setTimeout(draw, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 560); }
  else draw();
}
function say(t){ $("live").textContent = t; }
function turn(by){ if (revealed || !work || !work.w) return; rot += by; layout(true); say(`Turned ${TURN_WORDS[norm(rot - work.start)]} from where it started.`); }
function turnTo(target){ const d = ((norm(target) - norm(rot) + 540) % 360) - 180; rot += d; layout(true); }

/* ---------- Images ---------- */
function srcFor(w){ return EMBEDDED[w.key] || IIIF(w.key); }
function loadImage(w){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { w.w = img.naturalWidth; w.h = img.naturalHeight; w.src = img.src; resolve(w); };
    img.onerror = reject;
    img.src = srcFor(w);
  });
}

/* ---------- Rounds ---------- */
async function startGame(){
  round = 0; results = []; game = deal();
  $("results").hidden = true; $("game").hidden = false;
  await showRound();
}
async function showRound(){
  work = game[round]; revealed = false;
  $("prompt").hidden = false; $("reveal").hidden = true; $("turnControls").hidden = false;
  $("count").textContent = `Work ${round + 1} of ${ROUNDS}`;
  $("dots").innerHTML = Array.from({length: ROUNDS}, (_, i) => `<i class="${i < round ? "done" : i === round ? "now" : ""}"></i>`).join("");
  $("walltag").textContent = "";
  const img = $("art");
  img.style.visibility = "hidden"; $("wire").classList.add("off");
  $("loading").hidden = false;
  try { await loadImage(work); }
  catch (e){
    // Image didn't load: swap in another work so the round still plays.
    FAILED.add(work.key);
    const spare = work.disputed ? null : pick(POOL, 1, w => !game.includes(w) && !FAILED.has(w.key))[0];
    if (spare){ game[round] = spare; return showRound(); }
    $("loading").textContent = "This image didn't load. Try the next work.";
    return;
  }
  $("loading").hidden = true;
  work.start = [90, 180, 270][Math.floor(Math.random() * 3)];
  rot = work.start;
  img.src = work.src;
  img.alt = "A work by Georgia O'Keeffe, turned so you can decide which way is up";
  img.style.transition = "none"; layout(false); img.offsetWidth; img.style.transition = "";
  img.style.visibility = "";
  preloadNext();
}
function preloadNext(){ const n = game[round + 1]; if (n && !n.w) loadImage(n).catch(() => {}); }

function orientsFor(w){
  if (w.disputed) return w.orients;
  return [{deg:[0], src:CR, note:"How Access O'Keeffe shows it. Our search didn't turn up any disagreement about this work's orientation.", record:true}];
}
function hang(){
  if (revealed || !work || !work.w) return;
  revealed = true;
  const chosen = norm(rot);
  const orients = orientsFor(work);
  const hits = orients.filter(o => o.deg && o.deg.includes(chosen));
  const recHit = hits.find(o => o.record);
  const cat = recHit ? "record" : hits.length ? "dispute" : "new";
  results.push({work, deg: chosen, cat});
  $("turnControls").hidden = true; $("prompt").hidden = true; $("reveal").hidden = false;

  const WHO = o => o.who || (o.src === CR ? "the catalogue raisonné" : o.src === NB ? NB : o.src);
  let kicker, head;
  if (work.kind === "both" && recHit){ kicker = "Both ways work"; head = recHit.src.startsWith("Vertical") ? "You hung it as a vertical. The Museum sometimes does too." : "You hung it as a horizontal, the way O'Keeffe preferred."; }
  else if (recHit && work.kind === "disputed"){ kicker = "A disputed work"; head = `You sided with ${WHO(recHit)}.`; }
  else if (recHit){ kicker = work.disputed ? "You agree with the record" : "Right way up"; head = `You hung it like ${WHO(recHit)}.`; }
  else if (hits.length){ kicker = "You joined a dispute"; head = `You hung it like ${WHO(hits[0])}.`; }
  else { kicker = "A new way up"; head = work.disputed ? "Nobody on record has hung it this way." : "The catalogue raisonné hangs it another way."; }

  const v = $("verdict");
  v.className = "verdict" + (recHit ? "" : " split");
  const body = work.disputed
    ? `<p>${work.story}</p>`
    : (work.alt ? `<p class="desc-label">Image description</p><p>${esc(work.alt)}</p>` : "");
  v.innerHTML = `<p class="kicker">${kicker}</p><h2>${head}</h2>${body}`;

  const meta = work.disputed ? `${work.date} · ${work.holder}` : [work.date, work.holder].filter(Boolean).join(" · ");
  $("label").innerHTML = `<p class="t">${esc(work.title)}</p><p class="m">${esc(meta)}</p>`
    + (work.medium ? `<p class="aka">${esc(work.medium)}</p>` : "")
    + (work.aka ? `<p class="aka">${work.aka}</p>` : "")
    + `<p style="margin:6px 0 0"><a href="${ACCESS(work.obj)}" target="_blank" rel="noopener">See it in Access O'Keeffe</a></p>`
    + (work.credit ? `<p class="aka">Photo: ${esc(work.credit)}</p>` : "");
  $("art").alt = work.alt || `${work.title}, ${work.date}, by Georgia O'Keeffe`;

  const rows = [];
  if (!hits.length) rows.push({deg:[chosen], src:"Your hang", note: work.disputed ? "No record we have shows it this way." : "Not how the catalogue raisonné hangs it.", mine:true});
  orients.forEach(o => rows.push(o));
  $("ledgerTitle").textContent = work.disputed ? "Ways it has been hung" : "How it hangs";
  $("ledger").innerHTML = rows.map((o, i) => {
    const d = o.deg ? (o.deg.includes(chosen) ? chosen : o.deg[0]) : null;
    const isMine = o.mine || (o.deg && o.deg.includes(chosen));
    const pill = isMine ? `<span class="pill you">Your hang</span>` : o.record ? `<span class="pill rec">Record</span>` : "";
    const thumb = d === null ? `<span class="q" aria-hidden="true">?</span>` : `<img src="${work.src}" alt="" data-deg="${d}">`;
    return `<li><button class="row" type="button" data-i="${i}" aria-pressed="false"><span class="thumb">${thumb}</span><span><b>${o.src}</b><span class="n">${o.note}</span></span>${pill}</button></li>`;
  }).join("");
  $("ledger").querySelectorAll(".thumb img").forEach(t => place(t, t.parentElement, work.w, work.h, +t.dataset.deg, .86));
  $("ledger").querySelectorAll(".row").forEach(b => b.addEventListener("click", () => {
    $("ledger").querySelectorAll(".row").forEach(x => x.setAttribute("aria-pressed", "false"));
    b.setAttribute("aria-pressed", "true");
    const o = rows[+b.dataset.i];
    if (!o.deg){ $("walltag").textContent = "The record doesn't say which way."; return; }
    turnTo(o.deg.includes(chosen) ? chosen : o.deg[0]);
    $("walltag").textContent = o.src;
    say(`Showing the work as hung by ${o.src}.`);
  }));
  const matchRec = rows.findIndex(o => o.record && o.deg && o.deg.includes(chosen));
  const start = matchRec >= 0 ? matchRec : rows.findIndex(o => o.record);
  const btn = $("ledger").querySelector(`.row[data-i="${start}"]`);
  if (btn) btn.click();
  $("next").textContent = round + 1 < ROUNDS ? "Next work" : "See your hangs";
  $("next").focus({preventScroll: true});
  say(`${kicker}. ${head} ${work.title}, ${work.date}.`);
}
function esc(s){ return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

function next(){
  round++;
  if (round < ROUNDS){ showRound(); window.scrollTo({top: $("game").offsetTop - 8, behavior: "smooth"}); }
  else showResults();
}

/* ---------- Results ---------- */
function showResults(){
  const n = c => results.filter(r => r.cat === c).length;
  const rec = n("record"), dis = n("dispute"), nu = n("new");
  let title, msg;
  if (rec >= 5){ title = "Steady hand"; msg = "You hang O'Keeffe the way the catalogue raisonné does. Registrars everywhere can rest easy."; }
  else if (dis >= 1 && dis + rec >= 4){ title = "In good company"; msg = "Where you parted from the record, you matched orientations used by editors, curators, or O'Keeffe's own notebooks. Which way is up has never been settled for every work."; }
  else if (nu >= 3){ title = "Fresh eyes"; msg = "You found new ways to hang O'Keeffe. She often said a good abstraction could hang more than one way."; }
  else { title = "A fair eye"; msg = "Some matched the record, some didn't. With works this close to their subjects, that's the fun of it."; }
  const VLAB = {record:"Matched the record", dispute:"Joined a dispute", new:"A new way up"};
  const el = $("results");
  el.innerHTML = `
    <div class="big"><h2>${title}</h2><p>${msg}</p></div>
    <div class="tally">
      <div><strong>${rec}</strong><span>matched the record</span></div>
      <div><strong>${dis}</strong><span>joined a dispute</span></div>
      <div><strong>${nu}</strong><span>new ways up</span></div>
    </div>
    <div class="hangs">${results.map((r, i) => `
      <figure class="hang"><div class="box"><img src="${r.work.src}" alt="${esc(r.work.title)} as you hung it" data-i="${i}"></div>
      <p><i>${esc(r.work.title)}</i>${r.work.date ? ", " + esc(r.work.date) : ""}</p><p class="v">${VLAB[r.cat]}${r.work.disputed ? " · disputed work" : ""}</p></figure>`).join("")}</div>
    <div class="controls"><button class="btn primary" id="again" type="button">Play six more</button></div>`;
  $("game").hidden = true; el.hidden = false;
  placeResults();
  $("again").addEventListener("click", () => { startGame(); window.scrollTo({top: $("game").offsetTop - 8, behavior: "smooth"}); });
  window.scrollTo({top: el.offsetTop - 8, behavior: "smooth"});
  $("again").focus({preventScroll: true});
}
function placeResults(){
  document.querySelectorAll(".box img").forEach(t => { const r = results[+t.dataset.i]; place(t, t.parentElement, r.work.w, r.work.h, r.deg, .82); });
}

/* ---------- Wiring ---------- */
$("left").addEventListener("click", () => turn(-90));
$("right").addEventListener("click", () => turn(90));
$("hang").addEventListener("click", hang);
$("next").addEventListener("click", next);
document.addEventListener("keydown", e => {
  if ($("game").hidden || revealed) return;
  if (e.key === "ArrowLeft"){ e.preventDefault(); turn(-90); }
  else if (e.key === "ArrowRight"){ e.preventDefault(); turn(90); }
});
let rz;
addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => {
  layout(false);
  if (work && work.w) document.querySelectorAll(".thumb img").forEach(t => place(t, t.parentElement, work.w, work.h, +t.dataset.deg, .86));
  placeResults();
}, 120); });

loadPool().then(startGame);
