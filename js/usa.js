/* USA Explorer: map quiz, name drop, scavenger hunt, capitals, flag memory. Map: us-atlas (Census) Albers USA projection with AK/HI insets. */
const ST = Object.fromEntries(US.states.map(s => [s.name, s]));
const NE_BOX = (() => { const b = US.zoom.concat(['New York', 'Pennsylvania', 'Maine']).map(n => ST[n].b); return [Math.min(...b.map(x => x[0])) - 10, Math.min(...b.map(x => x[1])) - 10, Math.max(...b.map(x => x[2])) + 10, Math.max(...b.map(x => x[3])) + 10]; })();
function spot(name){ const u = prog('usa'); u.spotted = u.spotted || []; if (!u.spotted.includes(name)) { u.spotted.push(name); save(); checkBadges(); } }
function usMap({onTap, active, regionColors, labels, allowZoom} = {}){
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', US.viewBox); svg.setAttribute('class', 'usmap'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Map of the United States');
  const paths = {};
  US.states.forEach(s => {
    const p = document.createElementNS(NS, 'path'); p.setAttribute('d', s.d); p.dataset.name = s.name;
    const on = !active || active.includes(s.name);
    if (!on) p.classList.add('dim'); if (regionColors) p.classList.add('reg-' + s.region);
    const t = document.createElementNS(NS, 'title'); t.textContent = labels ? s.name : ''; p.append(t);
    p.addEventListener('click', () => { if (!on) return; window.__lastTap = s.name; onTap && onTap(s.name, p); });
    svg.append(p); paths[s.name] = p;
  });
  if (labels) US.states.forEach(s => { const t = document.createElementNS(NS, 'text'); t.setAttribute('x', s.c[0]); t.setAttribute('y', s.c[1]); t.setAttribute('text-anchor', 'middle'); t.textContent = s.abbr; svg.append(t); });
  const wrap = h('div', {class: 'map-wrap'}, svg);
  let zoomed = false;
  const zoomBtn = allowZoom ? h('button', {class: 'btn', style: {position: 'absolute', right: '10px', top: '10px'}, 'data-testid': 'zoom-ne', onclick: () => {
    zoomed = !zoomed; svg.setAttribute('viewBox', zoomed ? `${NE_BOX[0]} ${NE_BOX[1]} ${NE_BOX[2] - NE_BOX[0]} ${NE_BOX[3] - NE_BOX[1]}` : US.viewBox); zoomBtn.textContent = zoomed ? '🔍 Whole map' : '🔍 Zoom Northeast'; }}, '🔍 Zoom Northeast') : null;
  if (zoomBtn) wrap.append(zoomBtn);
  return {el: wrap, svg, paths, flash(name, cls, ms = 1200){ const p = paths[name]; p.classList.add(cls); setTimeout(() => p.classList.remove(cls), ms); }};
}
function UsaHub(app){
  const u = prog('usa'); const lv = level();
  screen(app, 'USA Explorer', '🗺️', h('p', {class: 'muted'}, lv === 'A' ? 'Level A: 10 famous states, the 5 regions, big targets and no timers.' : 'Level B: all 50 states and capitals, timed rounds, and a Northeast zoom for the small states.'),
    tiles([
      {icon: '📍', title: 'Map Quiz', sub: `Tap the state · ${(u.spotted || []).length}/50 found`, color: '#4f8fc0', onclick: () => go(MapQuiz), id: 'usa-map'},
      {icon: '🧭', title: 'Regions', sub: 'Northeast, Southeast, Midwest…', color: '#7fb069', onclick: () => go(RegionQuiz), id: 'usa-regions'},
      {icon: '🏷️', title: 'Name Drop', sub: 'Drag names onto the map', color: '#e0a526', onclick: () => go(NameDrop), id: 'usa-drop'},
      {icon: '🔍', title: 'Find the State', sub: 'Scavenger hunt with clues', color: '#a78bfa', onclick: () => go(HuntList), id: 'usa-hunt'},
      {icon: '🏛️', title: 'Capitals', sub: 'Capital trivia', color: '#e8835a', onclick: () => go(CapitalQuiz), id: 'usa-capitals'},
      {icon: '🎯', title: 'Capital Hunt', sub: 'Tap the state for a capital', color: '#f25f5c', onclick: () => go(CapitalTap), id: 'usa-captap'},
      {icon: '🚩', title: 'Flag Memory', sub: lv === 'A' ? '8 cards' : '16 cards', color: '#70c1b3', onclick: () => go(FlagMemory), id: 'usa-flags'},
      {icon: '🗺️', title: 'Explore', sub: 'Tap any state to learn', color: '#8a7b63', onclick: () => go(UsaExplore), id: 'usa-explore'},
    ]));
}
function mapRound(app, {title, icon, sec = 'usa', activity, items, ask, check, active, timer, allowZoom, explainRight, regionColors}){
  let i = 0, score = 0, missed = false, left = timer, tick = null, busy = false;
  const askEl = h('div', {class: 'map-ask', 'data-testid': 'map-ask'}); const fb = h('div', {class: 'feedback'}); const info = h('div', {class: 'row', style: {justifyContent: 'space-between'}});
  const m = usMap({active, allowZoom, regionColors, onTap: (name, p) => {
    if (busy || i >= items.length) return;
    const it = items[i];
    if (check(it, name)) { busy = true; sfx('ok'); p.classList.add('right'); if (!missed) score++; spot(name); fb.innerHTML = ''; fb.append(h('b', null, '✅ ' + name + '! '), explainRight ? explainRight(it, name) : '');
      setTimeout(() => { p.classList.remove('right'); i++; missed = false; busy = false; i < items.length ? show() : finish(); }, 1100); }
    else { missed = true; sfx('no'); m.flash(name, 'wrong', 700); fb.textContent = `That's ${name}. Try again!`; if (level() === 'A' && it.answer) setTimeout(() => m.flash(it.answer, 'target', 900), 500); }
  }});
  function show(){ askEl.innerHTML = ''; askEl.append(ask(items[i])); info.innerHTML = ''; info.append(h('span', {class: 'qnum'}, `${i + 1} / ${items.length}`), timer ? h('span', {class: 'timer', 'data-testid': 'timer'}, '⏱ ' + left + 's') : '', h('span', null, '⭐ ' + score)); }
  function finish(timeUp){ clearInterval(tick); const st = award(sec, activity, score, items.length); if (activity.startsWith('Capital')) { prog('usa').capitals = (prog('usa').capitals || 0) + score; save(); checkBadges(); }
    askEl.innerHTML = ''; askEl.append(h('div', {class: 'done-card'}, h('h2', null, timeUp ? "⏰ Time's up!" : '🎉 Round complete!'), h('p', {class: 'score', 'data-testid': 'score'}, `${score} / ${items.length}`), h('p', {class: 'stars-earned'}, '⭐'.repeat(st)),
      h('div', {class: 'row center'}, h('button', {class: 'btn primary', 'data-testid': 'quiz-done', onclick: back}, 'Done')))); }
  if (timer) { tick = setInterval(() => { left--; const t = info.querySelector('.timer'); if (t) t.textContent = '⏱ ' + left + 's'; if (left <= 5 && left > 0) sfx('tick'); if (left <= 0) { busy = true; finish(true); } }, 1000); onLeave(() => clearInterval(tick)); }
  screen(app, title, icon, h('div', {class: 'card map-card'}, info, askEl, fb), m.el);
  show(); return m;
}
function MapQuiz(app){
  const lv = level(); const pool = lv === 'A' ? US.levelA : US.states.map(s => s.name);
  const items = sample(pool, lv === 'A' ? 6 : 10).map(n => ({answer: n}));
  mapRound(app, {title: 'Map Quiz', icon: '📍', activity: 'US map quiz', items, active: lv === 'A' ? US.levelA : null, timer: lv === 'B' ? 90 : 0, allowZoom: lv === 'B',
    ask: it => h('span', null, 'Tap ', h('b', null, it.answer), lv === 'A' ? ' 👇' : ''), check: (it, n) => n === it.answer, explainRight: it => ST[it.answer].fact});
}
function RegionQuiz(app){
  const regs = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'];
  const legend = h('div', {class: 'row'}, regs.map(r => h('span', {class: 'pill', style: {background: {Northeast: '#f7c6c1', Southeast: '#c9e6b8', Midwest: '#fbe2a2', Southwest: '#f6c79a', West: '#bcd9ef'}[r]}}, r)));
  if (level() === 'A') {
    const qs = sample(US.levelA, 6).map(n => { const ch = shuffle([ST[n].region, ...sample(regs, 2, ST[n].region)]);
      return {prompt: h('div', null, 'Which region is ', h('b', null, n), ' in?'), choices: ch, answer: ch.indexOf(ST[n].region), explain: `${n} is in the ${ST[n].region}.`}; });
    const m = usMap({regionColors: true}); screen(app, 'Regions', '🧭', legend, h('div', {style: {maxWidth: '700px', margin: '10px auto'}}, m.el));
    quiz(app, {sec: 'usa', activity: 'Regions', questions: qs, big: true});
  } else {
    const items = shuffle(regs).concat(shuffle(regs)).slice(0, 6).map(r => ({region: r}));
    mapRound(app, {title: 'Regions', icon: '🧭', activity: 'Regions', items, timer: 60, allowZoom: true, ask: it => h('span', null, 'Tap a state in the ', h('b', null, it.region)), check: (it, n) => ST[n].region === it.region, explainRight: (it, n) => `${n} is in the ${it.region}.`});
  }
}
function HuntList(app){
  const lv = level(); const hunts = US.hunts.filter(x => lv === 'B' || x.level === 'A');
  screen(app, 'Find the State', '🔍', h('p', {class: 'muted'}, 'Follow the clues! Each clue leads to the next state.'), tiles(hunts.map((x, k) => ({icon: ['🚂', '🏝️', '🛶', '🔔', '🤠'][US.hunts.indexOf(x)], title: x.title, sub: `${x.clues.length} clues · Level ${x.level}`, color: '#a78bfa', onclick: () => go(Hunt, US.hunts.indexOf(x)), id: 'hunt-' + k}))));
}
function Hunt(app, k){
  const hunt = US.hunts[k];
  mapRound(app, {title: hunt.title, icon: '🔍', activity: 'Scavenger hunt: ' + hunt.title, items: hunt.clues, allowZoom: true, ask: it => h('span', {style: {fontSize: '24px'}}, '🧩 ', it.clue), check: (it, n) => n === it.answer, explainRight: it => ST[it.answer].fact});
}
function CapitalQuiz(app){
  const lv = level(); const pool = lv === 'A' ? US.levelA : US.states.map(s => s.name); const nc = lv === 'A' ? 3 : 4;
  const qs = sample(pool, lv === 'A' ? 6 : 10).map((n, k) => { const s = ST[n];
    if (lv === 'B' && k % 3 === 2) { const ch = shuffle([n, ...sample(US.states.map(x => x.name), nc - 1, n)]); return {prompt: h('div', null, h('b', null, s.capital), ' is the capital of which state?'), choices: ch, answer: ch.indexOf(n), explain: `${s.capital} is the capital of ${n}.`, onRight: () => { prog('usa').capitals = (prog('usa').capitals || 0) + 1; }}; }
    const others = sample(US.states.filter(x => x.name !== n).map(x => x.capital), nc - 1); const ch = shuffle([s.capital, ...others]);
    return {prompt: h('div', null, h('img', {class: 'flag', src: s.flag, alt: 'Flag of ' + n}), h('div', null, 'What is the capital of ', h('b', null, n), '?')), choices: ch, answer: ch.indexOf(s.capital),
      explain: `The capital of ${n} is ${s.capital}.` + (lv === 'A' ? ' ' + s.fact : ''), onRight: () => { prog('usa').capitals = (prog('usa').capitals || 0) + 1; }};
  });
  screen(app, 'Capitals', '🏛️'); quiz(app, {sec: 'usa', activity: 'Capital trivia', questions: qs, timer: lv === 'B' ? 90 : 0, big: lv === 'A', onDone: () => { save(); checkBadges(); }});
}
function CapitalTap(app){
  const lv = level(); const pool = lv === 'A' ? US.levelA : US.states.map(s => s.name);
  const items = sample(pool, lv === 'A' ? 5 : 8).map(n => ({answer: n}));
  mapRound(app, {title: 'Capital Hunt', icon: '🎯', activity: 'Capital hunt (map)', items, active: lv === 'A' ? US.levelA : null, timer: lv === 'B' ? 90 : 0, allowZoom: lv === 'B',
    ask: it => h('span', null, 'Which state has the capital ', h('b', null, ST[it.answer].capital), '?'), check: (it, n) => n === it.answer, explainRight: it => `${ST[it.answer].capital} is its capital.`});
}
function FlagMemory(app){
  const lv = level(); const pairs = lv === 'A' ? 4 : 8; const pool = lv === 'A' ? US.levelA : US.states.map(s => s.name);
  const chosen = sample(pool, pairs); const cards = shuffle(chosen.flatMap(n => [{n, kind: 'flag'}, {n, kind: 'name'}]));
  let open = [], matched = 0, moves = 0, lock = false;
  const grid = h('div', {class: 'mem-grid', style: {gridTemplateColumns: `repeat(${lv === 'A' ? 4 : 4}, 1fr)`, maxWidth: lv === 'A' ? '720px' : '820px', margin: '0 auto'}});
  const status = h('p', {class: 'muted', style: {textAlign: 'center'}}, 'Find each flag and its state name!');
  cards.forEach((c, k) => { const b = h('button', {class: 'mem', 'data-n': c.n, 'data-kind': c.kind, 'aria-label': 'Card ' + (k + 1), onclick: () => {
    if (lock || b.classList.contains('open') || b.classList.contains('matched')) return; sfx('flip');
    b.classList.add('open'); b.innerHTML = ''; b.append(c.kind === 'flag' ? h('img', {src: ST[c.n].flag, alt: 'flag'}) : h('span', null, c.n)); open.push(b);
    if (open.length === 2) { moves++; lock = true; const [a, d] = open;
      if (a.dataset.n === d.dataset.n && a.dataset.kind !== d.dataset.kind) { setTimeout(() => { a.classList.add('matched'); d.classList.add('matched'); sfx('ok'); open = []; lock = false; matched++;
        status.textContent = `Matched ${matched} of ${pairs}! ${ST[a.dataset.n].fact}`;
        if (matched === pairs) { const perfect = pairs + 2; award('usa', 'Flag memory', Math.max(0, pairs - Math.max(0, moves - perfect)), pairs, {stars: moves <= pairs + 2 ? 3 : moves <= pairs * 2 ? 2 : 1, celebrate: true}); status.textContent = `🎉 All matched in ${moves} moves!`; grid.after(h('div', {class: 'row center'}, h('button', {class: 'btn primary', onclick: () => go(FlagMemory)}, 'Play again'), h('button', {class: 'btn', 'data-testid': 'quiz-done', onclick: back}, 'Done'))); } }, 400); }
      else setTimeout(() => { [a, d].forEach(x => { x.classList.remove('open'); x.innerHTML = ''; }); open = []; lock = false; }, 900);
    } }}); grid.append(b); });
  screen(app, 'Flag Memory', '🚩', status, grid);
}
function NameDrop(app){
  const lv = level(); const pool = lv === 'A' ? US.levelA : US.states.filter(s => s.area > 1500).map(s => s.name);
  const names = sample(pool, lv === 'A' ? 3 : 5); let placed = 0, misses = 0;
  const fb = h('div', {class: 'feedback'}, 'Drag each name onto its state. (Or tap a name, then tap the state.)');
  let selected = null;
  const m = usMap({active: lv === 'A' ? US.levelA : null, allowZoom: false, onTap: (name, p) => { if (selected) tryDrop(selected, name); }});
  const bank = h('div', {class: 'wordbank', style: {justifyContent: 'center'}});
  function tryDrop(tile, name){
    if (tile.dataset.n === name) { sfx('ok'); m.paths[name].classList.add('right'); spot(name); tile.remove(); placed++; selected = null;
      const NS = 'http://www.w3.org/2000/svg'; const t = document.createElementNS(NS, 'text'); t.setAttribute('x', ST[name].c[0]); t.setAttribute('y', ST[name].c[1]); t.setAttribute('text-anchor', 'middle'); t.textContent = ST[name].abbr; m.svg.append(t);
      fb.textContent = `✅ ${name}! ${ST[name].fact}`;
      if (placed === names.length) { award('usa', 'Name drop', names.length - Math.min(misses, names.length), names.length); bank.append(h('button', {class: 'btn primary', 'data-testid': 'quiz-done', onclick: back}, 'Done 🎉')); }
    } else { sfx('no'); misses++; m.flash(name, 'wrong', 600); fb.textContent = `That's ${name}. Try another spot!`; }
  }
  names.forEach(n => { const t = h('button', {class: 'wtile', 'data-n': n}, n); let sx = null, drag = null;
    t.addEventListener('pointerdown', e => { sx = [e.clientX, e.clientY]; t.setPointerCapture(e.pointerId); });
    t.addEventListener('pointermove', e => { if (!sx) return; if (!drag && Math.hypot(e.clientX - sx[0], e.clientY - sx[1]) > 10) { drag = t.cloneNode(true); drag.classList.add('drag-name'); document.body.append(drag); } if (drag) { drag.style.left = e.clientX - 40 + 'px'; drag.style.top = e.clientY - 30 + 'px'; } });
    t.addEventListener('pointerup', e => { const wasDrag = !!drag; if (drag) { drag.remove(); drag = null; } sx = null;
      if (wasDrag) { const el = document.elementFromPoint(e.clientX, e.clientY); if (el && el.dataset && el.dataset.name && !el.classList.contains('dim')) tryDrop(t, el.dataset.name); }
      else { [...bank.children].forEach(b => b.style.outline = ''); selected = t; t.style.outline = '4px solid #3b82f6'; fb.textContent = `Now tap where ${n} is.`; } });
    bank.append(t); });
  screen(app, 'Name Drop', '🏷️', h('div', {class: 'card map-card'}, bank, fb), m.el);
}
function UsaExplore(app){
  const info = h('div', {class: 'card', 'data-testid': 'state-info'}, h('p', {class: 'muted'}, 'Tap any state to see its capital, region, and flag.'));
  const m = usMap({labels: true, allowZoom: true, onTap: n => { const s = ST[n]; info.innerHTML = ''; info.append(h('div', {class: 'row'}, h('img', {class: 'flag', src: s.flag, alt: 'Flag of ' + n}),
    h('div', null, h('h2', null, `${n} (${s.abbr})`), h('div', null, '🏛️ Capital: ', h('b', null, s.capital)), h('div', null, '🧭 Region: ' + s.region), h('div', null, '💡 ' + s.fact)))); sfx('click'); }});
  screen(app, 'Explore the USA', '🗺️', info, m.el);
}
