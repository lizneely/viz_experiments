// ============================================================
// quiz.js
//
// Eye for O'Keeffe: five rounds. Each round shows two works.
// The visitor decides "Alike" or "Different," then sees how the
// computer reads the pair.
//
// Pairs are chosen so the computer's answer is clear-cut:
// "alike" pairs are among each other's closest matches and agree
// on most aspects; "different" pairs are far apart and agree on
// at most one.
// ============================================================


const ROUNDS = 5;
const MIN_READY = 80;            // works read before the quiz can start

let screen = "intro";            // intro | play | end
let game = null;                 // { rounds: [...], i, phase }

const $ = id => document.getElementById(id);


// ============================================================
// Building a game
// ============================================================

function quizPool() {
  return works.filter(w => analyses[w.key] && !readFailures.has(w.key));
}

function buildGame() {
  const pool = quizPool();
  const used = new Set();

  // Two or three of each, in random order.
  const truths = ["alike", "alike", "different", "different", Math.random() < 0.5 ? "alike" : "different"];
  shuffle(truths);

  const rounds = [];
  for (const truth of truths) {
    const pair = truth === "alike" ? pickAlikePair(pool, used) : pickDifferentPair(pool, used);
    const fallback = pair || (truth === "alike" ? pickDifferentPair(pool, used) : pickAlikePair(pool, used));
    if (!fallback) continue;
    used.add(fallback.a.key);
    used.add(fallback.b.key);
    rounds.push(fallback);
  }

  return { rounds, i: 0, phase: "loading" };
}

function verdictsFor(a, b) {
  const A = analyses[a.key], B = analyses[b.key];
  return Object.fromEntries(ASPECTS.map(asp => [asp.key, verdict(asp.key, A, B)]));
}

function countVerdicts(v) {
  const c = { alike: 0, close: 0, different: 0 };
  for (const k in v) c[v[k]]++;
  return c;
}

function pickAlikePair(pool, used) {
  for (let tries = 0; tries < 200; tries++) {
    const a = pool[Math.floor(Math.random() * pool.length)];
    if (used.has(a.key)) continue;
    const A = analyses[a.key];
    const near = pool
      .filter(w => w.key !== a.key && !used.has(w.key))
      .map(w => ({ w, d: compositionDistance(A, analyses[w.key]) }))
      .sort((x, y) => x.d - y.d)
      .slice(0, 6);
    for (const n of near) {
      // Skip near-identical records (the same image catalogued twice)
      if (n.d < 0.004) continue;
      const v = verdictsFor(a, n.w);
      const c = countVerdicts(v);
      if (c.alike + c.close * 0.5 >= 3 && c.different <= 1) {
        return { a, b: n.w, truth: "alike", verdicts: v };
      }
    }
  }
  return null;
}

function pickDifferentPair(pool, used) {
  for (let tries = 0; tries < 200; tries++) {
    const a = pool[Math.floor(Math.random() * pool.length)];
    if (used.has(a.key)) continue;
    const A = analyses[a.key];
    const far = pool
      .filter(w => w.key !== a.key && !used.has(w.key))
      .map(w => ({ w, d: compositionDistance(A, analyses[w.key]) }))
      .sort((x, y) => y.d - x.d);
    const top = far.slice(0, Math.max(5, Math.floor(far.length * 0.35)));
    shuffle(top);
    for (const f of top) {
      const v = verdictsFor(a, f.w);
      const c = countVerdicts(v);
      if (c.alike <= 1 && c.different >= 3) {
        return { a, b: f.w, truth: "different", verdicts: v };
      }
    }
  }
  return null;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


// ============================================================
// Words
// ============================================================

const AGREE_HEADS = [
  "You and the computer agree.",
  "Same read as the computer.",
  "You saw it the computer's way.",
  "Right in step with the computer."
];

const DIFFER_HEADS = [
  "You and the computer split on this one.",
  "The computer saw this one another way.",
  "Not how the computer called it."
];

const DIFFER_NOTES = [
  "That's part of the fun: you may be responding to subject or color, which the computer doesn't consider.",
  "The computer only measures light, color, and edges. You may be seeing something it can't.",
  "Take a look at the rings and arrows to see what it noticed."
];

const RESULTS = [
  // index = score
  { title: "Room to roam", text: "The best way to sharpen your eye is to spend an afternoon with O'Keeffe's works in the galleries. Come see us, then play again." },
  { title: "Room to roam", text: "The best way to sharpen your eye is to spend an afternoon with O'Keeffe's works in the galleries. Come see us, then play again." },
  { title: "Fresh eyes", text: "You're reading these works your own way, and that's a great place to start. Play again and watch where the rings land." },
  { title: "Good eye", text: "You and the computer see a lot the same way, and you bring things to the works that it can't see." },
  { title: "Sharp eye", text: "You have a strong feel for where a picture's focus and weight sit." },
  { title: "Eagle eye", text: "Five for five. You read composition just the way the computer does, and O'Keeffe's careful arrangements don't get past you." }
];

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

function listWords(items) {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return items[0] + " and " + items[1];
  return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
}

function explain(round) {
  const groups = { alike: [], close: [], different: [] };
  for (const asp of ASPECTS) groups[round.verdicts[asp.key]].push(asp.label.toLowerCase());

  if (round.truth === "alike") {
    const main = groups.alike.length ? groups.alike : groups.close;
    let s = "The computer finds these composed alike. They match in " + listWords(main) + ".";
    if (groups.alike.length && groups.close.length) s += " They're also close in " + listWords(groups.close) + ".";
    return s;
  }

  let s = "The computer finds these composed differently. They differ in " + listWords(groups.different) + ".";
  if (groups.alike.length) s += " They're alike only in " + listWords(groups.alike) + ".";
  return s;
}


function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function esc(s) {
  return String(s === null || s === undefined ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}


// ============================================================
// Screens
// ============================================================

function setupUI() {
  $("start").addEventListener("click", startGame);
  $("btn-alike").addEventListener("click", () => answer("alike"));
  $("btn-different").addEventListener("click", () => answer("different"));
  $("next").addEventListener("click", nextRound);
  $("again").addEventListener("click", startGame);

  // Keyboard shortcuts still work, but aren't shown on screen
  // (Liz, October 2026: the hints were visual noise).
  // A = Alike, D = Different, Enter = start / next pair / play again.
  document.addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    const k = e.key.toLowerCase();

    if (k === "enter") {
      if (tag === "button" || tag === "a" || tag === "summary") return;   // focused controls handle Enter
      if (screen === "intro" && !$("start").disabled) { e.preventDefault(); startGame(); }
      else if (screen === "play" && game && game.phase === "reveal") { e.preventDefault(); nextRound(); }
      else if (screen === "end") { e.preventDefault(); startGame(); }
      return;
    }
    if (screen === "play" && game && game.phase === "question") {
      if (k === "a") { e.preventDefault(); answer("alike"); }
      if (k === "d") { e.preventDefault(); answer("different"); }
    }
  });

  renderDots();
  updateReady();
}

function showScreen(name) {
  screen = name;
  $("screen-intro").hidden = name !== "intro";
  $("screen-play").hidden = name !== "play";
  $("screen-end").hidden = name !== "end";
  if (name === "play") stageResized();
}

function updateReady() {
  const total = works.length;
  const pool = quizPool().length;
  let done = 0;
  for (const w of works) if (analyses[w.key] || readFailures.has(w.key)) done++;
  const finished = done >= total;
  const target = Math.min(MIN_READY, total);
  const ok = pool >= target || (finished && pool >= 12);

  $("start").disabled = !ok;
  $("ready-fill").style.width = Math.min(100, (pool / target) * 100).toFixed(1) + "%";
  $("ready-text").textContent = ok
    ? (finished ? `Ready, with ${pool} works to draw from` : "Ready")
    : `Getting the works ready… ${pool} of ${target}`;
  $("ready").classList.toggle("done", ok);
}

function startGame() {
  if (quizPool().length < 12) return;
  game = buildGame();
  showScreen("play");
  loadRound(0);
  window.scrollTo({ top: document.querySelector(".game").offsetTop - 12, behavior: reduceMotion ? "auto" : "smooth" });
}

function loadRound(i) {
  game.i = i;
  game.phase = "loading";
  const round = game.rounds[i];

  $("round-label").textContent = `Round ${NUMBER_WORDS[i + 1]} of ${NUMBER_WORDS[game.rounds.length]}`;
  $("ask").hidden = false;
  $("reveal").hidden = true;
  $("cap-a").innerHTML = "";
  $("cap-b").innerHTML = "";
  setAnswersEnabled(false);
  renderDots();

  showPair(round, () => {
    if (game.rounds[game.i] !== round) return;
    game.phase = "question";
    setAnswersEnabled(true);
    preloadRound(i + 1);
  });
}

function setAnswersEnabled(on) {
  $("btn-alike").disabled = !on;
  $("btn-different").disabled = !on;
}

function answer(choice) {
  if (!game || game.phase !== "question") return;
  const round = game.rounds[game.i];
  round.answer = choice;
  round.agree = choice === round.truth;
  game.phase = "reveal";
  setAnswersEnabled(false);
  startReveal();
  renderReveal(round);
  renderDots();
}

function nextRound() {
  if (!game || game.phase !== "reveal") return;
  if (game.i + 1 < game.rounds.length) loadRound(game.i + 1);
  else endGame();
}

function endGame() {
  const score = game.rounds.filter(r => r.agree).length;
  const total = game.rounds.length;
  const result = RESULTS[Math.round(score * 5 / Math.max(1, total))];

  $("round-label").textContent = "Your result";
  $("score-num").innerHTML = `${score}<small>of ${total}</small>`;
  $("score-title").textContent = result.title;
  const lead = score === total ? "" : `You agreed with the computer on ${NUMBER_WORDS[score]} of ${NUMBER_WORDS[total]} pairs. `;
  $("score-text").textContent = lead + result.text;

  $("review").innerHTML = game.rounds.map((r, i) => `
    <li>
      <span class="n">${i + 1}</span>
      <span class="pair">
        <img src="${iiifURL(r.a, "square/!112,112")}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <img src="${iiifURL(r.b, "square/!112,112")}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
      </span>
      <span class="what"><i>${esc(r.a.shortTitle)}</i> and <i>${esc(r.b.shortTitle)}</i><br>
        You said ${r.answer}. The computer said ${r.truth}.</span>
      <span class="mark ${r.agree ? "agree" : "differ"}">${r.agree ? "Agreed" : "Differed"}</span>
    </li>`).join("");

  showScreen("end");
  renderDots();
}


// ---------------- Pieces ----------------

function renderDots() {
  const n = game ? game.rounds.length : ROUNDS;
  let html = "";
  for (let i = 0; i < n; i++) {
    const r = game && game.rounds[i];
    let cls = "dot";
    let label = `Round ${i + 1}`;
    if (r && r.answer) { cls += r.agree ? " agree" : " differ"; label += r.agree ? ": agreed" : ": differed"; }
    else if (game && screen === "play" && i === game.i) { cls += " current"; label += ": now"; }
    html += `<li class="${cls}" title="${label}"><span class="sr-only">${label}</span></li>`;
  }
  $("dots").innerHTML = html;
}

function renderReveal(round) {
  const A = analyses[round.a.key], B = analyses[round.b.key];

  const verdictBox = document.querySelector(".verdict");
  verdictBox.classList.toggle("differ", !round.agree);
  $("verdict-head").textContent = round.agree ? pick(AGREE_HEADS) : pick(DIFFER_HEADS);
  $("verdict-body").textContent = explain(round) + (round.agree ? "" : " " + pick(DIFFER_NOTES));

  const ringA = `<svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="6.5" class="g-stroke" fill="none" stroke-width="2.5"/></svg>`;
  const ringB = `<svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="6.5" class="ink-stroke" fill="none" stroke-width="2" stroke-dasharray="3.5 2.5"/></svg>`;
  $("cap-a").innerHTML = caption(round.a, ringA);
  $("cap-b").innerHTML = caption(round.b, ringB);

  $("overlay").innerHTML = overlaySVG(A, B);

  $("reveal-table").innerHTML = `
    <thead><tr>
      <th scope="col"><span class="sr-only">Aspect</span></th>
      <th scope="col"><span class="sw a" aria-hidden="true"></span>Left</th>
      <th scope="col"><span class="sw b" aria-hidden="true"></span>Right</th>
      <th scope="col" class="v"><span class="sr-only">Verdict</span></th>
    </tr></thead>
    <tbody>${ASPECTS.map(asp => `
      <tr>
        <th scope="row">${esc(asp.label)}</th>
        <td class="a">${esc(describeAspect(asp.key, A))}</td>
        <td class="b">${esc(describeAspect(asp.key, B))}</td>
        <td class="v"><span class="pill ${round.verdicts[asp.key]}">${capital(round.verdicts[asp.key])}</span></td>
      </tr>`).join("")}
    </tbody>`;

  $("next").innerHTML = game.i + 1 < game.rounds.length
    ? `Next pair`
    : `See your result`;

  $("ask").hidden = true;
  $("reveal").hidden = false;
  $("next").focus({ preventScroll: true });
}

function caption(w, ring) {
  return `${ring}<span><i>${esc(w.shortTitle)}</i>${w.dateLabel ? ", " + esc(w.dateLabel) : ""}
    ${w.accessURL ? `<br><a href="${w.accessURL}" target="_blank" rel="noopener">View on Access O'Keeffe ↗</a>` : ""}</span>`;
}

function overlaySVG(a, b) {
  const S = 260, P = 12, I = S - P * 2;
  const px = v => (P + v * I).toFixed(1);
  const arrow = (x1, y1, x2, y2, cls, dash) => {
    x1 = +x1; y1 = +y1; x2 = +x2; y2 = +y2;
    if (Math.hypot(x2 - x1, y2 - y1) < 6) {
      return `<g class="${cls}" stroke-width="2"><line x1="${x2 - 7}" y1="${y2}" x2="${x2 + 7}" y2="${y2}"/><line x1="${x2}" y1="${y2 - 7}" x2="${x2}" y2="${y2 + 7}"/></g>`;
    }
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hx = o => (x2 - Math.cos(ang + o) * 10).toFixed(1);
    const hy = o => (y2 - Math.sin(ang + o) * 10).toFixed(1);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" stroke-width="2" ${dash ? 'stroke-dasharray="5 4"' : ""}/>
      <path d="M${x2} ${y2} L${hx(0.45)} ${hy(0.45)} L${hx(-0.45)} ${hy(-0.45)} Z" class="${cls.replace("stroke", "fill")}"/>`;
  };
  return `<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="Where the eye lands and which way each work leans, on one frame">
    <rect x="${P}" y="${P}" width="${I}" height="${I}" class="paper-fill rule-stroke" stroke-width="1.5"/>
    <g class="rule-stroke" stroke-width="1" stroke-dasharray="3 4">
      <line x1="${px(1 / 3)}" y1="${P}" x2="${px(1 / 3)}" y2="${P + I}"/>
      <line x1="${px(2 / 3)}" y1="${P}" x2="${px(2 / 3)}" y2="${P + I}"/>
      <line x1="${P}" y1="${px(1 / 3)}" x2="${P + I}" y2="${px(1 / 3)}"/>
      <line x1="${P}" y1="${px(2 / 3)}" x2="${P + I}" y2="${px(2 / 3)}"/>
    </g>
    <rect x="${+px(0.5) - 5}" y="${+px(0.5) - 5}" width="10" height="10" fill="none" class="ink-stroke" stroke-width="1.5"/>
    <line x1="${px(a.focalX)}" y1="${px(a.focalY)}" x2="${px(b.focalX)}" y2="${px(b.focalY)}" class="ink-stroke" stroke-width="1" stroke-dasharray="1 4" opacity=".6"/>
    ${arrow(px(0.5), px(0.5), px(b.visualCenterX), px(b.visualCenterY), "ink-stroke", true)}
    ${arrow(px(0.5), px(0.5), px(a.visualCenterX), px(a.visualCenterY), "g-stroke", false)}
    <circle cx="${px(b.focalX)}" cy="${px(b.focalY)}" r="15" fill="none" class="ink-stroke" stroke-width="2" stroke-dasharray="5 4"/>
    <circle cx="${px(a.focalX)}" cy="${px(a.focalY)}" r="15" fill="none" class="g-stroke" stroke-width="3"/>
  </svg>`;
}
