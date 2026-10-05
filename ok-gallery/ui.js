/*
==================================================
CURATE YOUR OWN GALLERY: controls
==================================================
*/

const WALL_COLORS = [
  { name: "Gallery white", hex: "#F6F4EF" },
  { name: "Bone", hex: "#EAE3D4" },
  { name: "Adobe", hex: "#C9A47F" },
  { name: "Red hill", hex: "#A65A3F" },
  { name: "Sage", hex: "#A4A98F" },
  { name: "Sky", hex: "#B9CDD9" },
  { name: "Pedernal blue", hex: "#56677D" },
  { name: "Charcoal", hex: "#2F2D2B" }
];

const RESULTS_PAGE = 48;
const F = { tab: "color", color: null, subject: null, shown: RESULTS_PAGE };
const $ = (sel) => document.querySelector(sel);

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function fmtIn(v) {
  const whole = Math.floor(v + 1e-6), f = v - whole;
  const eighths = Math.round(f * 8);
  if (eighths === 0) return String(whole);
  if (eighths === 8) return String(whole + 1);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const k = gcd(eighths, 8);
  return (whole ? whole + " " : "") + (eighths / k) + "/" + (8 / k);
}

function fmtFtIn(inches) {
  const ft = Math.floor(inches / 12), r = Math.round(inches - ft * 12);
  if (r === 12) return (ft + 1) + " ft";
  return r ? `${ft} ft ${r} in` : `${ft} ft`;
}

function colorBandsHTML(work) {
  if (!work.colors.length) return '<span class="bands none"></span>';
  return '<span class="bands">' + work.colors.map(c => `<i style="background:${c.hex}"></i>`).join("") + "</span>";
}

function thumbHTML(work, size, alt) {
  return `<span class="thumb">${colorBandsHTML(work)}<img alt="${esc(alt || "")}" loading="lazy" decoding="async" src="${IIIF_URL(work.dam, size, size)}" onerror="this.remove()"></span>`;
}

/* ---------- step 1: choose works ---------- */

function buildFilters() {
  const sw = $("#color-swatches");
  sw.innerHTML = COLOR_LIST.map((c, i) =>
    `<button type="button" class="swatch" data-i="${i}" style="--c:${c.hex}" aria-pressed="false" aria-label="${esc(c.label)}, ${c.works.length} works" title="${esc(c.label)} (${c.works.length})"></button>`
  ).join("");
  sw.addEventListener("click", e => {
    const b = e.target.closest(".swatch"); if (!b) return;
    const c = COLOR_LIST[+b.dataset.i];
    F.color = F.color === c ? null : c; F.shown = RESULTS_PAGE;
    renderResults();
  });

  // subject bubbles redraw when their width changes (and when the tab first opens)
  if (window.ResizeObserver) {
    let lastW = 0;
    new ResizeObserver(entries => {
      const w = Math.round(entries[0].contentRect.width);
      if (w && w !== lastW) { lastW = w; renderSubjectBubbles(); }
    }).observe($("#subject-bubbles"));
  }

  document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
    F.tab = t.dataset.tab;
    document.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", x === t ? "true" : "false"));
    $("#panel-color").hidden = F.tab !== "color";
    $("#panel-subject").hidden = F.tab !== "subject";
    if (F.tab === "subject") renderSubjectBubbles();
  }));

  $("#results").addEventListener("click", e => {
    const b = e.target.closest(".result"); if (!b) return;
    const id = +b.dataset.id;
    if (G.ids.includes(id)) wallRemove(id);
    else if (!wallAdd(id)) flash(`Your wall holds up to ${MAX_WORKS} works. Remove one to add another.`);
  });
  $("#more").addEventListener("click", () => { F.shown += RESULTS_PAGE; renderResults(); });
  $("#active-filters").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.clear === "color") F.color = null;
    if (b.dataset.clear === "subject") F.subject = null;
    renderResults();
  });
}

function filteredWorks() {
  let list = WORKS;
  if (F.color) { const set = new Set(F.color.works.map(w => w.id)); list = list.filter(w => set.has(w.id)); }
  if (F.subject) list = list.filter(w => w.subject === F.subject.name);
  return list;
}

function renderResults() {
  document.querySelectorAll(".swatch").forEach(b => b.setAttribute("aria-pressed", COLOR_LIST[+b.dataset.i] === F.color ? "true" : "false"));
  renderSubjectBubbles();

  const list = filteredWorks();
  const chips = [];
  if (F.color) chips.push(`<button type="button" data-clear="color" aria-label="Clear color ${esc(F.color.label)}"><i style="background:${F.color.hex}"></i>${esc(F.color.label)} <span aria-hidden="true">×</span></button>`);
  if (F.subject) chips.push(`<button type="button" data-clear="subject" aria-label="Clear subject ${esc(F.subject.name)}">${esc(F.subject.name)} <span aria-hidden="true">×</span></button>`);
  $("#active-filters").innerHTML =
    `<span class="count">${list.length} ${list.length === 1 ? "work" : "works"}${chips.length ? "" : ", all colors and subjects"}</span>` + chips.join("");

  const shown = list.slice(0, F.shown);
  $("#results").innerHTML = shown.map(w => {
    const on = G.ids.includes(w.id);
    return `<button type="button" class="result${on ? " on" : ""}" data-id="${w.id}" aria-pressed="${on}" title="${esc(w.title)}, ${esc(w.date)}">
      ${thumbHTML(w, 200)}
      <span class="rt"><em>${esc(w.title)}</em><span>${esc(w.date)} · ${fmtIn(w.h)} × ${fmtIn(w.w)} in</span></span>
      <span class="tick" aria-hidden="true">${on ? "On wall" : "Add"}</span>
    </button>`;
  }).join("") || '<p class="empty">No works match both choices. Clear one to see more.</p>';
  $("#more").hidden = list.length <= F.shown;
  $("#more").textContent = `Show more (${list.length - F.shown} left)`;
}

/* ---------- step 2: the wall ---------- */

function buildWallControls() {
  const box = $("#wall-colors");
  box.innerHTML = WALL_COLORS.map((c, i) =>
    `<button type="button" class="wallswatch" data-i="${i}" style="--c:${c.hex}" aria-pressed="false" aria-label="${c.name}" title="${c.name}"></button>`
  ).join("") +
    `<label class="custom" title="Mix your own"><input type="color" id="wall-custom" aria-label="Mix your own wall color"><span>Mix your own</span></label>`;
  box.addEventListener("click", e => {
    const b = e.target.closest(".wallswatch"); if (!b) return;
    G.wall = WALL_COLORS[+b.dataset.i].hex; wallChanged({ wall: true }); syncWallControls();
  });
  $("#wall-custom").addEventListener("input", e => { G.wall = e.target.value.toUpperCase(); wallChanged({ wall: true }); syncWallControls(); });

  document.querySelectorAll('input[name="hang"]').forEach(r => r.addEventListener("change", () => { if (r.checked) setHang(r.value); }));
  $("#opt-labels").addEventListener("change", e => { G.showLabels = e.target.checked; wallChanged({}); });
  $("#opt-figure").addEventListener("change", e => { G.showFigure = e.target.checked; wallChanged({}); });
  $("#opt-guide").addEventListener("change", e => { G.showGuide = e.target.checked; wallChanged({}); });
  $("#opt-snap").addEventListener("change", e => setSnap(e.target.checked));

  for (const [sel, key] of [["#t-title", "title"], ["#t-intro", "intro"], ["#t-curator", "curator"]]) {
    $(sel).addEventListener("input", e => { G[key] = e.target.value; wallChanged({ text: true }); });
  }

  $("#zoom-in").addEventListener("click", () => wallZoom(1.4));
  $("#zoom-out").addEventListener("click", () => wallZoom(1 / 1.4));
  $("#zoom-fit").addEventListener("click", () => fitView(false));
  $("#rehang").addEventListener("click", () => wallRehang());
  // Two-step clear, built into the page (no browser dialogs)
  let clearArmed = null;
  $("#clear-wall").addEventListener("click", e => {
    const btn = e.currentTarget;
    if (!G.ids.length) return;
    if (clearArmed) {
      clearTimeout(clearArmed); clearArmed = null; btn.textContent = "Clear the wall";
      wallClear(); flash("The wall is clear.");
      return;
    }
    btn.textContent = "Click again to take every work down";
    clearArmed = setTimeout(() => { clearArmed = null; btn.textContent = "Clear the wall"; }, 4000);
  });

  // Start over, also two-step
  let resetArmed = null;
  const resetBtn = $("#start-over");
  const disarm = () => { clearTimeout(resetArmed); resetArmed = null; resetBtn.textContent = "Start over"; resetBtn.classList.remove("armed"); };
  resetBtn.addEventListener("click", () => {
    if (resetArmed) {
      disarm();
      F.color = null; F.subject = null; F.shown = RESULTS_PAGE;
      $("#results").scrollTop = 0;
      $("#share-text").hidden = true;
      wallStartOver();
      flash("Starting fresh: a blank wall and an empty checklist.");
      return;
    }
    resetBtn.textContent = "Click again to start over";
    resetBtn.classList.add("armed");
    resetArmed = setTimeout(disarm, 4000);
  });

  $("#on-wall").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const id = +b.closest("li").dataset.id;
    if (b.dataset.act === "up") wallMove(id, -1);
    else if (b.dataset.act === "down") wallMove(id, 1);
    else if (b.dataset.act === "remove") wallRemove(id);
    else if (b.dataset.act === "select") wallSelect(id);
  });
  $("#card").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || G.selected === null) return;
    const id = G.selected;
    if (b.dataset.act === "up") wallMove(id, -1);
    if (b.dataset.act === "down") wallMove(id, 1);
    if (b.dataset.act === "remove") wallRemove(id);
  });
}

function syncWallControls() {
  document.querySelectorAll(".wallswatch").forEach(b => b.setAttribute("aria-pressed", WALL_COLORS[+b.dataset.i].hex === G.wall ? "true" : "false"));
  const custom = !WALL_COLORS.some(c => c.hex === G.wall);
  $("#wall-custom").value = G.wall.toLowerCase();
  $(".custom").classList.toggle("on", custom);
  document.querySelectorAll('input[name="hang"]').forEach(r => { r.checked = r.value === G.hang; });
  $("#opt-labels").checked = G.showLabels;
  $("#opt-labels").disabled = G.hang === "salon";
  $("#opt-labels").closest("label").classList.toggle("off", G.hang === "salon");
  $("#opt-figure").checked = G.showFigure;
  $("#opt-guide").checked = G.showGuide;
  $("#snap-wrap").hidden = G.hang !== "salon";
  $("#opt-snap").checked = G.snap;
  $("#t-title").value = G.title; $("#t-intro").value = G.intro; $("#t-curator").value = G.curator;
}

function wallColorName() {
  const c = WALL_COLORS.find(c => c.hex === G.wall);
  return c ? c.name.toLowerCase() : "a custom color";
}

/* ---------- on the wall + details ---------- */

function renderOnWall() {
  const n = G.ids.length;
  $("#on-wall-count").textContent = n ? `(${n} of ${MAX_WORKS})` : "";
  $("#on-wall").innerHTML = G.ids.map((id, i) => {
    const w = WORK_BY_ID.get(id);
    const line = G.hang === "line";
    return `<li data-id="${id}" class="${G.selected === id ? "sel" : ""}">
      <button type="button" class="ow-main" data-act="select">${thumbHTML(w, 200)}<span><em>${esc(w.title)}</em><span>${esc(w.date)}</span></span></button>
      ${line ? `<button type="button" class="ic" data-act="up" aria-label="Move ${esc(w.title)} earlier" ${i === 0 ? "disabled" : ""}>←</button>
      <button type="button" class="ic" data-act="down" aria-label="Move ${esc(w.title)} later" ${i === n - 1 ? "disabled" : ""}>→</button>` : ""}
      <button type="button" class="ic" data-act="remove" aria-label="Remove ${esc(w.title)}">×</button>
    </li>`;
  }).join("");
  $("#on-wall-empty").hidden = n > 0;
  $("#clear-wall").hidden = n === 0;

  const len = L ? L.wallW - L.minX : 0;
  $("#wall-stats").textContent = n
    ? `${n} ${n === 1 ? "work" : "works"} · wall ${fmtFtIn(len)} long, ${fmtFtIn(L.wallH)} high`
    : `Wall ${fmtFtIn(len)} long, ${fmtFtIn(L ? L.wallH : 144)} high`;
  $("#rehang").hidden = G.hang !== "salon" || n < 2;
  $("#drag-hint").textContent = G.hang === "line"
    ? "Drag a work along the wall to change the order. Click a work for its details."
    : G.snap
      ? "Drag a work anywhere on the wall; it slides to the nearest open spot. Re-hang packs them again."
      : "Drag a work anywhere on the wall; it stays exactly where you drop it. Re-hang packs them again.";

  const names = G.ids.map(id => WORK_BY_ID.get(id).title);
  const hangText = G.hang === "line" ? "hung at eye level, 60 inches on center" : "in a salon hang";
  cnv && cnv.elt.setAttribute("aria-label",
    `A wall painted ${wallColorName()}` + (G.title.trim() ? `, titled ${G.title.trim()}` : "") +
    (n ? `, with ${n} ${n === 1 ? "work" : "works"} ${hangText}: ${names.join("; ")}.` : ", with no works yet."));
}

function renderCard() {
  const id = G.selected, card = $("#card");
  if (id === null || !WORK_BY_ID.has(id)) { card.hidden = true; return; }
  const w = WORK_BY_ID.get(id), i = G.ids.indexOf(id), line = G.hang === "line";
  card.hidden = false;
  card.innerHTML = `
    ${thumbHTML(w, 400, w.alt)}
    <div class="card-body">
      <h3><em>${esc(w.title)}</em>, ${esc(w.date)}</h3>
      <p>${esc(w.mediumDim || (w.medium + ", " + w.extent))}</p>
      ${w.owner ? `<p class="muted">${esc(w.owner)}</p>` : ""}
      <p class="muted">${w.subject ? "Subject: " + esc(w.subject) : ""}${w.colors.length ? `${w.subject ? " · " : ""}Colors: ${w.colors.map(c => esc(c.label)).join(", ")}` : ""}</p>
      ${w.alt ? `<details class="desc"><summary>Image description</summary><p>${esc(w.alt)}</p></details>` : ""}
      ${w.credit ? `<p class="muted small">${/^(photo|courtesy|image)/i.test(w.credit) ? "" : "Photo: "}${esc(w.credit)}</p>` : ""}
      <p><a href="${ACCESS_URL(w.id)}" target="_blank" rel="noopener">View on <em>Access O'Keeffe</em> ↗</a></p>
      <div class="card-actions">
        ${line ? `<button type="button" class="btn-line" data-act="up" ${i <= 0 ? "disabled" : ""}>← Move earlier</button>
        <button type="button" class="btn-line" data-act="down" ${i >= G.ids.length - 1 ? "disabled" : ""}>Move later →</button>` : ""}
        <button type="button" class="btn-line" data-act="remove">Remove from wall</button>
      </div>
    </div>`;
}

let flashTimer = null;
function flash(msg) {
  const el = $("#flash");
  el.textContent = msg; el.hidden = false;
  clearTimeout(flashTimer); flashTimer = setTimeout(() => { el.hidden = true; }, 4000);
}

function checkImages() {
  // The claude.ai preview blocks outside images; say so once it's clear none are loading.
  if (imgStats.fail >= 3 && imgStats.ok === 0) $("#img-note").hidden = false;
  else if (imgStats.ok > 0) $("#img-note").hidden = true;
}

/* ---------- sharing ---------- */

function buildShare() {
  $("#copy-link").hidden = !canShareLink();
  if (canShareLink()) $("#share-note").textContent = "The image shows your wall to scale, with the title wall and a numbered checklist. The link opens your exhibition for anyone, no account needed.";
  $("#save-image").addEventListener("click", openSharePanel);
  $("#copy-checklist").addEventListener("click", () => copyText(checklistText(), "Checklist"));
  $("#copy-link").addEventListener("click", () => copyText(shareLink(), "Link"));
  $("#sp-close").addEventListener("click", closeSharePanel);
  // In the claude.ai preview, files are offered through the viewer's downloads capability;
  // on the hosted page the plain download link does the job.
  $("#sp-download").addEventListener("click", async e => {
    if (!window.claude || !window.claude.use || !posterBlob) return;
    e.preventDefault();
    const name = posterFileName();
    try {
      const dl = await window.claude.use("downloads");
      if (!dl) { flash("Right-click or long-press the image to save it."); return; }
      await dl.save({ filename: name, data: posterBlob });
      flash("Image saved.");
    } catch (err) {
      if (err && err.code === "declined") return;
      flash("The image couldn't be saved here. Right-click or long-press it instead.");
    }
  });
  $("#share-panel").addEventListener("click", e => { if (e.target.id === "share-panel") closeSharePanel(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#share-panel").hidden) closeSharePanel(); });
}

function copyText(text, what) {
  const ta = $("#share-text");
  const fallback = () => {
    ta.value = text; ta.hidden = false; ta.focus(); ta.select();
    flash(`Select the text below and copy it.`);
  };
  try {
    navigator.clipboard.writeText(text).then(() => { ta.hidden = true; flash(`${what} copied.`); }, fallback);
  } catch (e) { fallback(); }
}

let posterUrl = null, posterBlob = null, lastFocus = null;
async function openSharePanel() {
  lastFocus = document.activeElement;
  const panel = $("#share-panel"), img = $("#sp-img"), dl = $("#sp-download"), status = $("#sp-status");
  panel.hidden = false;
  status.textContent = "Making your image…";
  img.removeAttribute("src"); dl.hidden = true;
  $("#sp-close").focus();
  try {
    const { canvas, missing } = await renderPoster();
    const blob = await new Promise((res, rej) => canvas.toBlob(b => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
    if (posterUrl) URL.revokeObjectURL(posterUrl);
    posterBlob = blob;
    posterUrl = URL.createObjectURL(blob);
    img.src = posterUrl;
    img.alt = `${exhibitionTitle()}: a wall of ${G.ids.length} ${G.ids.length === 1 ? "work" : "works"} by Georgia O'Keeffe with a numbered checklist.`;
    dl.href = posterUrl; dl.download = posterFileName(); dl.hidden = false;
    status.textContent = missing
      ? `${missing === G.ids.length ? "The images" : missing + " of the images"} couldn't be included here, so ${missing === 1 ? "that work appears" : "those works appear"} as bands of ${missing === 1 ? "its" : "their"} color tags.`
      : "Here's your exhibition, ready to save and share.";
  } catch (err) {
    console.error(err);
    status.textContent = "The image couldn't be made. Try Copy checklist instead.";
  }
}

function closeSharePanel() {
  $("#share-panel").hidden = true;
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

/* ---------- start ---------- */

function onSketchReady() {
  loadWorks().then(() => {
    const fromLink = loadStateFromLink();
    if (!fromLink) loadState();
    buildFilters();
    buildShare();
    buildWallControls();
    syncWallControls();
    renderResults();
    onWallChange((o) => {
      if (o.added !== undefined || o.removed !== undefined || o.refit) renderResults();
      if (o.wall || o.text) { renderOnWall(); return; }
      renderOnWall(); renderCard(); syncWallControls();
      if (o.added !== undefined) flash(`Hung ${WORK_BY_ID.get(o.added).title}.`);
    });
    wallChanged({ refit: true });
    $("#loading").hidden = true;
    if (fromLink) flash("You're looking at a shared exhibition. Any changes you make stay on this device.");
    setInterval(checkImages, 1500);
  }).catch(err => {
    console.error(err);
    $("#loading").textContent = "The collection data couldn't be loaded.";
  });
}
