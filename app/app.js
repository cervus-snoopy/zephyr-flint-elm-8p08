// Leonida Trophy Guide — tracker, roadmap, missables and sources, all offline.
// Progress lives in localStorage; export/import move it as a file. Nothing here
// fetches anything but the guide's own data file, and nothing leaves the browser.
const KEY = 'gta6-trophy-guide-r2';
const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byName = new Map(trophies.map((t) => [t.name, t]));
const byId = new Map(trophies.map((t) => [t.id, t]));

const KIND_LABELS = {
  story: 'Story', side: 'Side quest', stranger: 'Strangers & Freaks', collectible: 'Collectible',
  activity: 'Activity', combat: 'Combat', exploration: 'Exploration', robbery: 'Robbery',
  money: 'Money', completion: 'Completion', misc: 'Misc feat',
};

let state = loadState();
if (params.get('demo') === '1' && !localStorage.getItem(KEY)) seedDemo();
let view = params.get('view') || 'tracker';
let openId = params.get('open') ? Number(params.get('open')) : null;

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (raw && Array.isArray(raw.earned)) {
      return { earned: new Set(raw.earned), counters: raw.counters ?? {}, spoiler: !!raw.spoiler };
    }
  } catch { /* fall through to a fresh state */ }
  return { earned: new Set(), counters: {}, spoiler: params.get('spoiler') === '1' };
}

function save() {
  localStorage.setItem(KEY, JSON.stringify({
    earned: [...state.earned], counters: state.counters, spoiler: state.spoiler,
  }));
}

function seedDemo() {
  // A mid-run save for screenshots and demos: story done through Chapter 2,
  // a few early feats earned, and the count trackers part way.
  state.earned = new Set(['Just Like Paradise', 'Paradise Lost', 'T**s Ass Drug Money', 'Trust',
    'Baited My Tackle', 'Stick Fiddler', 'Whip It Good', 'The Goodtime State',
    'In The Beginning…', 'Let’s Go Bowling', 'Ten Pin', 'Treat Yo Self', 'On the Spot']);
  state.counters = { 15: 87, 17: 12, 18: 5, 19: 9, 25: 3, 28: 6, 31: 41, 32: 23, 35: 64, 40: 2, 52: 120000, 53: 42000, 54: 3, 55: 6 };
  save();
}

// ---- citation counts, computed live from the guide data --------------------
function citationStats() {
  let claims = 0, backed = 0;
  const sources = new Map();
  for (const t of trophies) {
    for (const step of t.steps ?? []) {
      claims++;
      const names = [...new Set(step.sources ?? [])];
      if (names.length >= 2) backed++;
      for (const n of names) sources.set(n, (sources.get(n) ?? 0) + 1);
    }
  }
  return { claims, backed, sources };
}

function renderBanner() {
  const s = citationStats();
  document.getElementById('citeClaims').textContent = s.claims;
  document.getElementById('citeBacked').textContent = s.backed;
  document.getElementById('citeSources').textContent = s.sources.size;
  document.getElementById('citeDisagree').textContent = doc.disagreements.length;
}

function renderProgress() {
  const earned = state.earned.size;
  document.getElementById('earnedCount').textContent = earned;
  document.getElementById('barFill').style.width = `${Math.round((earned / trophies.length) * 100)}%`;
  const byGrade = {};
  for (const t of trophies) if (state.earned.has(t.name)) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  document.getElementById('gradeCounts').textContent =
    `Platinum ${byGrade.platinum ?? 0}/1 · Gold ${byGrade.gold ?? 0}/2 · Silver ${byGrade.silver ?? 0}/6 · Bronze ${byGrade.bronze ?? 0}/46`;
  document.getElementById('platinumLine').textContent = state.earned.has('Vice Got a Price!')
    ? 'Platinum earned — you are a Leonida Legend.'
    : `Platinum: Vice Got a Price! — ${54 - (earned - (state.earned.has('Vice Got a Price!') ? 1 : 0))} trophies to go.`;
}

// ---- tracker ---------------------------------------------------------------
const els = {
  search: document.getElementById('search'),
  grade: document.getElementById('grade'),
  kind: document.getElementById('kind'),
  earnedFilter: document.getElementById('earnedFilter'),
  spoiler: document.getElementById('spoiler'),
  list: document.getElementById('trophyList'),
  filterLine: document.getElementById('filterLine'),
};
els.spoiler.checked = state.spoiler;

function spoilerHidden(t) {
  return state.spoiler && t.kind === 'story' && !state.earned.has(t.name);
}

function visibleTrophies() {
  const q = els.search.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (els.grade.value !== 'all' && t.grade !== els.grade.value) return false;
    if (els.kind.value === 'missable' && !t.missable) return false;
    if (els.kind.value !== 'all' && els.kind.value !== 'missable' && t.kind !== els.kind.value) return false;
    if (els.earnedFilter.value === 'earned' && !state.earned.has(t.name)) return false;
    if (els.earnedFilter.value === 'remaining' && state.earned.has(t.name)) return false;
    if (q) {
      const hay = spoilerHidden(t) ? '' : `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function renderTracker() {
  const list = visibleTrophies();
  els.list.replaceChildren();
  els.filterLine.textContent = `Showing ${list.length} of 55 trophies · ${state.earned.size} earned`;
  if (!list.length) {
    els.list.append(el('p', 'empty', 'No trophies match these filters.'));
    return;
  }
  for (const t of list) {
    const card = el('article', 'trophy' + (state.earned.has(t.name) ? ' earned' : ''));
    const head = el('div', 'trophy-head');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) state.earned.add(t.name); else state.earned.delete(t.name);
      save(); renderAll();
    });
    head.append(box);
    const title = el('div', 'trophy-title');
    const h = el('h3');
    h.append(el('span', 'num', `#${t.id}`));
    if (spoilerHidden(t)) {
      h.append(document.createTextNode('Hidden story trophy'));
      title.append(h, el('p', 'official spoiler-hidden', 'Name and description hidden until earned — spoiler-free mode is on.'));
    } else {
      h.append(document.createTextNode(t.name));
      title.append(h, el('p', 'official', t.description));
    }
    const tags = el('div', 'tags');
    tags.append(el('span', `grade-chip ${t.grade}`, t.grade));
    tags.append(el('span', 'kind-tag', KIND_LABELS[t.kind] ?? t.kind));
    if (t.chapter) tags.append(el('span', 'kind-tag', `Chapter ${t.chapter}`));
    if (t.hidden) tags.append(el('span', 'flag-tag hidden', 'Hidden on PSN'));
    if (t.missable) tags.append(el('span', 'flag-tag missable', 'Possibly missable'));
    if (t.guide.startsWith('UNCONFIRMED')) tags.append(el('span', 'flag-tag unconfirmed', 'Method unconfirmed'));
    tags.append(el('span', 'rarity-tag', `Exophase earn rate ${t.rarity}`));
    title.append(tags);
    if (!spoilerHidden(t)) {
      title.append(el('p', 'guide', t.guide));
      const toggle = el('button', 'guide-toggle', openId === t.id ? 'Hide cited steps' : `Show cited steps (${t.steps.length})`);
      toggle.type = 'button';
      toggle.addEventListener('click', () => { openId = openId === t.id ? null : t.id; renderTracker(); });
      title.append(toggle);
      if (openId === t.id) {
        const body = el('div', 'guide-body');
        const ol = el('ol', 'steps');
        for (const s of t.steps) {
          const li = el('li', '', s.text);
          li.append(el('span', 'src', `Sources: ${(s.sources ?? []).join(', ')}`));
          ol.append(li);
        }
        body.append(ol);
        if (t.disagreement) {
          const note = el('p', 'disagree-note');
          note.append(el('strong', '', 'Disagreement: '), document.createTextNode(t.disagreement));
          body.append(note);
        }
        title.append(body);
      }
      if (t.target) {
        const cur = state.counters[t.id] ?? 0;
        const counter = el('div', 'counter');
        counter.append(el('span', 'target-label', `Progress: `));
        const minus = el('button', '', '−');
        minus.type = 'button';
        minus.addEventListener('click', () => setCounter(t, cur - (t.targetStep ?? 1)));
        const input = document.createElement('input');
        input.type = 'number'; input.min = '0'; input.max = String(t.target); input.value = String(cur);
        input.setAttribute('aria-label', `${t.name} progress`);
        input.addEventListener('change', () => setCounter(t, Number(input.value)));
        const plus = el('button', '', '+');
        plus.type = 'button';
        plus.addEventListener('click', () => setCounter(t, cur + (t.targetStep ?? 1)));
        counter.append(minus, input, plus, el('span', 'target-label', `/ ${t.target.toLocaleString('en-US')} ${t.targetUnit}`));
        title.append(counter);
      }
    }
    head.append(title);
    card.append(head);
    els.list.append(card);
  }
}

function setCounter(t, value) {
  const v = Math.max(0, Math.min(t.target, Math.round(value) || 0));
  state.counters[t.id] = v;
  if (v >= t.target) state.earned.add(t.name);
  else if (state.earned.has(t.name) && (state.counters[t.id] ?? 0) < t.target) state.earned.delete(t.name);
  save(); renderAll();
}

// ---- roadmap ----------------------------------------------------------------
function renderRoadmap() {
  const host = document.getElementById('roadmapList');
  host.replaceChildren();
  for (const stage of doc.roadmap) {
    const card = el('section', 'stage');
    const head = el('div', 'stage-head');
    head.append(el('span', 'stage-num', String(stage.stage)));
    head.append(el('h3', '', stage.title));
    head.append(el('span', 'stage-hours', stage.hours));
    card.append(head, el('p', '', stage.note));
    const done = stage.trophies.filter((n) => state.earned.has(n)).length;
    card.append(el('p', 'stage-progress', `${done} of ${stage.trophies.length} trophies in this stage earned`));
    const chips = el('div', 'stage-trophies');
    for (const n of stage.trophies) {
      const t = byName.get(n);
      chips.append(el('span', state.earned.has(n) ? 'done' : '', `${t.grade === 'platinum' ? '◆ ' : ''}${n}`));
    }
    card.append(chips);
    host.append(card);
  }
}

// ---- missables ---------------------------------------------------------------
function renderMissables() {
  const watch = document.getElementById('missableWatch');
  watch.replaceChildren();
  const t = byName.get('Positive Mental Attitude');
  const box = el('div', 'watch');
  box.append(el('h3', '', '⚠ The one to watch: Positive Mental Attitude'));
  const earned = state.earned.has(t.name);
  box.append(el('p', '', earned
    ? 'Earned — the Chapter 1 balcony meditation is behind you.'
    : 'In Chapter 1, after the mission Down to Earth, talk to Lucia in the kitchen in the morning, follow her to the balcony and accept. The spot is gone after Chapter 1 — and whether the trophy needs it is still unconfirmed, so do it.'));
  box.append(el('p', '', 'Sources: PowerPyx, EGamers, Mobalytics. Disagreement: PowerPyx notes the balcony meditation raises the counter by 1 but is not marked as a Meditation Spot like the rest.'));
  watch.append(box);

  const grid = document.getElementById('missableGrid');
  grid.replaceChildren();
  const table = el('table', 'grid-table');
  const thead = document.createElement('thead');
  const hr = document.createElement('tr');
  for (const h of ['Chapter', 'Trophies that must be done here', 'Risk']) hr.append(el('th', '', h));
  thead.append(hr);
  table.append(thead);
  const body = document.createElement('tbody');
  const rows = [
    [1, ['Just Like Paradise', 'Paradise Lost', 'Baited My Tackle', 'Stick Fiddler', 'Positive Mental Attitude'], 'Positive Mental Attitude — the balcony meditation is the only possible missable in the game.'],
    [2, ['T**s Ass Drug Money', 'Trust', 'The Lone Rider', 'Hot Together', 'Personal Best', 'Little Boxes', 'On the Spot'], 'None — duo play opens after Coffee Break; everything stays open.'],
    [3, ['Vice City, Baby!', 'Break the Bank', 'Road to Rehabilitation', 'Supply & Demand', 'Spin On This!', 'Retail Therapy', 'Sneakthief', 'Dime on the Dollar'], 'None.'],
    [4, ['Top Of The World, Ma', 'Family Matters', 'DWNFALL', 'Hi-Jacked', 'Maximum Withdrawal', 'A Classic Blitz Play'], 'None.'],
    [5, ['You Gotta Know When to Get Off', 'Snow Storm'], 'None.'],
  ];
  for (const [ch, names, risk] of rows) {
    const tr = document.createElement('tr');
    tr.append(el('td', '', `Chapter ${ch}`));
    const td = el('td', '');
    td.textContent = names.map((n) => `${n}${state.earned.has(n) ? ' ✓' : ''}`).join(' · ');
    tr.append(td);
    tr.append(el('td', ch === 1 ? 'risk' : 'safe', risk));
    body.append(tr);
  }
  table.append(body);
  grid.append(table);
}

// ---- sources -----------------------------------------------------------------
function renderSources() {
  const s = citationStats();
  const host = document.getElementById('sourceMatrix');
  host.replaceChildren();
  const table = el('table', 'matrix');
  const thead = document.createElement('thead');
  const hr = document.createElement('tr');
  for (const h of ['Source', 'What it covers', 'Claims backed']) hr.append(el('th', '', h));
  thead.append(hr);
  table.append(thead);
  const body = document.createElement('tbody');
  for (const src of doc.sources) {
    const tr = document.createElement('tr');
    tr.append(el('td', '', src.name));
    tr.append(el('td', '', src.covers));
    const n = s.sources.get(src.name) ?? 0;
    const td = el('td', 'num', String(n));
    tr.append(td);
    body.append(tr);
  }
  const total = document.createElement('tr');
  total.append(el('td', '', 'Total'));
  total.append(el('td', '', `${s.claims} cited claims across all 55 trophies; ${s.backed} backed by 2+ sources.`));
  total.append(el('td', 'num', String(s.claims)));
  body.append(total);
  table.append(body);
  host.append(table);

  const dl = document.getElementById('disagreeList');
  dl.replaceChildren();
  for (const d of doc.disagreements) {
    const card = el('div', 'disagree');
    card.append(el('h4', '', d.topic));
    card.append(el('p', 'side-a', `One side: ${d.a}`));
    card.append(el('p', 'side-b', `Other side: ${d.b}`));
    dl.append(card);
  }
}

// ---- views, export/import ----------------------------------------------------
function showView(v) {
  view = v;
  for (const b of document.querySelectorAll('#tabs button')) b.classList.toggle('active', b.dataset.view === v);
  for (const name of ['tracker', 'roadmap', 'missables', 'sources']) {
    document.getElementById(`view-${name}`).hidden = name !== v;
  }
  document.getElementById('toolbar').style.display = v === 'tracker' ? '' : 'none';
  document.getElementById('filterLine').style.display = v === 'tracker' ? '' : 'none';
  if (v === 'roadmap') renderRoadmap();
  if (v === 'missables') renderMissables();
  if (v === 'sources') renderSources();
}
for (const b of document.querySelectorAll('#tabs button')) {
  b.addEventListener('click', () => showView(b.dataset.view));
}
for (const [id, fn] of [['search', renderTracker], ['grade', renderTracker], ['kind', renderTracker], ['earnedFilter', renderTracker]]) {
  document.getElementById(id).addEventListener('input', fn);
  document.getElementById(id).addEventListener('change', fn);
}
els.spoiler.addEventListener('change', () => { state.spoiler = els.spoiler.checked; save(); renderTracker(); });

document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({
    guide: 'Leonida Trophy Guide — GTA VI', earned: [...state.earned], counters: state.counters, spoiler: state.spoiler,
  }, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const raw = JSON.parse(await file.text());
    if (!Array.isArray(raw.earned)) throw new Error('no earned list');
    state.earned = new Set(raw.earned.filter((n) => byName.has(n)));
    state.counters = raw.counters ?? {};
    state.spoiler = !!raw.spoiler;
    els.spoiler.checked = state.spoiler;
    save(); renderAll();
  } catch {
    els.filterLine.textContent = 'That file is not a Leonida Trophy Guide progress export — nothing was changed.';
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!window.confirm('Clear all earned ticks, counters and the spoiler setting?')) return;
  state = { earned: new Set(), counters: {}, spoiler: false };
  els.spoiler.checked = false;
  save(); renderAll();
});

function renderAll() {
  renderBanner();
  renderProgress();
  renderTracker();
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missables') renderMissables();
  if (view === 'sources') renderSources();
}

renderAll();
showView(['tracker', 'roadmap', 'missables', 'sources'].includes(view) ? view : 'tracker');
if (openId && byId.has(openId)) renderTracker();
