/* World Explorer: map quiz, continents & oceans, name/flag drop, Find the Country hunts, mixed trivia (ELA passages,
   Mandarin + Spanish country names), flag/shape/Mandarin memory, explore. Map: world-atlas 110m (Natural Earth, public domain),
   Natural Earth projection. Flags: flag-icons (MIT) SVGs bundled in flags/world/. */
const WC = Object.fromEntries(WORLD.countries.map(c => [c.name, c]));
const WC_BY_ID = Object.fromEntries(WORLD.countries.map(c => [c.id, c]));
const W_LEVEL_A = WORLD.countries.filter(c => c.level === 'A').map(c => c.name);
const W_ALL = WORLD.countries.map(c => c.name);
const W_SHAPE = Object.fromEntries(WORLD.shapes.map(s => [WC_BY_ID[s.id] ? WC_BY_ID[s.id].name : s.name, s]));
const W_SMALL = W_ALL.filter(n => W_SHAPE[n].a < 120);
const NS_SVG = 'http://www.w3.org/2000/svg';
function wprog(){ const p = kid(); if (!p) return {}; p.prog.world = p.prog.world || {found: []}; p.prog.world.found = p.prog.world.found || []; return p.prog.world; }
function wbump(key, n = 1){ const w = wprog(); w[key] = (w[key] || 0) + n; save(); checkBadges(); }
function wfound(name){ const w = wprog(); if (WC[name] && !w.found.includes(name)) { w.found.push(name); save(); checkBadges(); } }
function flagImg(name, cls = 'flag'){ const c = WC[name]; return h('img', {class: cls, src: c.flag, alt: 'Flag of ' + name, draggable: 'false'}); }
function zhSay(c, label){ return sayBtn(c.zhAudio, c.zh, 'zh-CN', label || '🔊', {'data-testid': 'zh-say'}); }
function esSay(c, label){ return sayBtn(c.esAudio, c.es, 'es-MX', label || '🔊', {'data-testid': 'es-say'}); }
function shapeSvg(name, size = 90){
  const s = W_SHAPE[name]; const b = s.mb; const pad = Math.max(b[2] - b[0], b[3] - b[1]) * 0.08 + 1;
  const svg = document.createElementNS(NS_SVG, 'svg'); svg.setAttribute('viewBox', `${b[0] - pad} ${b[1] - pad} ${b[2] - b[0] + 2 * pad} ${b[3] - b[1] + 2 * pad}`);
  svg.setAttribute('class', 'wshape'); svg.setAttribute('width', size); svg.setAttribute('height', size); svg.setAttribute('aria-label', 'Shape of a country');
  const p = document.createElementNS(NS_SVG, 'path'); p.setAttribute('d', s.d); svg.append(p); return svg;
}
const ctClass = c => 'ct-' + String(c || 'none').replace(/\s+/g, '');
/** World map. hit = {name, country (data or null), continent, ocean}. */
function worldMap({onTap, active, continents, colors, oceans, zoom, labels, oceanLabels} = {}){
  const svg = document.createElementNS(NS_SVG, 'svg'); const VB = WORLD.viewBox.join(' ');
  svg.setAttribute('viewBox', VB); svg.setAttribute('class', 'usmap wmap'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Map of the world');
  const sea = document.createElementNS(NS_SVG, 'path'); sea.setAttribute('d', WORLD.sphere); sea.setAttribute('class', 'sea'); svg.append(sea);
  const paths = {};
  WORLD.shapes.forEach(s => {
    const c = WC_BY_ID[s.id]; const name = c ? c.name : s.name;
    const p = document.createElementNS(NS_SVG, 'path'); p.setAttribute('d', s.d); p.dataset.name = name; if (s.continent) p.dataset.continent = s.continent;
    const on = continents ? !!s.continent : (!active || active.includes(name));
    if (!on) p.classList.add('dim'); else if (!c && !continents) p.classList.add('minor');
    if (continents && s.continent && colors !== false) p.classList.add(ctClass(s.continent));
    if (labels && c) { const t = document.createElementNS(NS_SVG, 'title'); t.textContent = name; p.append(t); }
    p.addEventListener('click', () => { if (!on) return; window.__lastTap = name; onTap && onTap({name, country: c || null, continent: s.continent, path: p}); });
    svg.append(p); paths[name] = p;
  });
  if (oceans) WORLD.oceans.forEach(o => o.pts.forEach(pt => {
    const g = document.createElementNS(NS_SVG, 'g'); g.setAttribute('class', 'ocean'); g.dataset.ocean = o.name;
    const ci = document.createElementNS(NS_SVG, 'circle'); ci.setAttribute('cx', pt[0]); ci.setAttribute('cy', pt[1]); ci.setAttribute('r', 26);
    const t = document.createElementNS(NS_SVG, 'text'); t.setAttribute('x', pt[0]); t.setAttribute('y', pt[1] + 6); t.setAttribute('text-anchor', 'middle'); t.textContent = oceanLabels ? o.name.replace(' Ocean', '') : '🌊';
    g.append(ci, t); g.addEventListener('click', () => { window.__lastTap = o.name; onTap && onTap({name: o.name, ocean: true, path: ci}); }); svg.append(g);
  }));
  const wrap = h('div', {class: 'map-wrap'}, svg);
  let zbar = null;
  if (zoom) {
    const set = (k) => { const z = WORLD.zooms[k]; svg.setAttribute('viewBox', z ? z.join(' ') : VB); svg.classList.toggle('zoomed', !!z); [...zbar.children].forEach(b => b.classList.toggle('sel', b.dataset.z === (k || ''))); };
    zbar = h('div', {class: 'row zoombar'}, h('button', {class: 'btn small sel', 'data-z': '', 'data-testid': 'wzoom-world', onclick: () => set(null)}, '🌍 Whole world'),
      Object.keys(WORLD.zooms).map(k => h('button', {class: 'btn small', 'data-z': k, 'data-testid': 'wzoom-' + k.replace(/\W+/g, '-'), onclick: () => set(k)}, '🔍 ' + k)));
  }
  const el = h('div', null, zbar, wrap);
  return {el, svg, paths, flash(name, cls, ms = 1200){ const p = paths[name]; if (!p) return; p.classList.add(cls); setTimeout(() => p.classList.remove(cls), ms); }};
}
function WorldHub(app){
  const w = wprog(); const lv = level();
  screen(app, 'World Explorer', '🌍', h('p', {class: 'muted'}, lv === 'A' ? 'Level A: 7 continents, 5 oceans, 15 big countries, 3 choices and no timers.' : `Level B: ${W_ALL.length} countries and capitals, timed rounds, and zoom buttons for small countries.`),
    tiles([
      {icon: '📍', title: 'Map Quiz', sub: `Tap the country · ${w.found.length}/${lv === 'A' ? 15 : W_ALL.length} found`, color: '#4f8fc0', onclick: () => go(WMapQuiz), id: 'world-map'},
      {icon: '🧭', title: 'Continents & Oceans', sub: 'Tap the continent or ocean', color: '#7fb069', onclick: () => go(WContinents), id: 'world-cont'},
      {icon: '🏷️', title: 'Name & Flag Drop', sub: 'Drag names and flags onto the map', color: '#e0a526', onclick: () => go(WDrop), id: 'world-drop'},
      {icon: '🔍', title: 'Find the Country', sub: 'Follow the chain of clues', color: '#a78bfa', onclick: () => go(WHuntList), id: 'world-hunt'},
      {icon: '🎲', title: 'Mixed Trivia', sub: lv === 'A' ? 'Flags, stories, Mandarin & Spanish names' : 'Capitals, flags, stories, Mandarin & Spanish', color: '#e8835a', onclick: () => go(WTrivia), id: 'world-trivia'},
      {icon: '🃏', title: 'Memory', sub: lv === 'A' ? 'Flags & names · 6 or 8 cards' : 'Flags, shapes & 中文 · 12 or 16 cards', color: '#70c1b3', onclick: () => go(WMemoryPick), id: 'world-memory'},
      {icon: '🗺️', title: 'Explore', sub: 'Tap any country to learn', color: '#8a7b63', onclick: () => go(WExplore), id: 'world-explore'},
    ]));
}
/** Generic round: items are {type:'tap', ask, check(hit), answer?, explain} or {type:'choice', prompt, choices, answer, explain, onRight}. */
function wRound(app, {title, icon, activity, items, mapOpts = {}, timer, onFinish}){
  let i = 0, score = 0, missed = false, left = timer, tick = null, busy = false;
  const askEl = h('div', {class: 'map-ask', 'data-testid': 'map-ask'}); const fb = h('div', {class: 'feedback', role: 'status'}); const choiceBox = h('div');
  const info = h('div', {class: 'row', style: {justifyContent: 'space-between'}});
  const m = worldMap(Object.assign({}, mapOpts, {onTap: hit => {
    const it = items[i]; if (busy || !it || it.type === 'choice') return;
    if (it.check(hit)) { busy = true; sfx('ok'); hit.path.classList.add('right'); if (!missed) { score++; it.onRight && it.onRight(); } if (hit.country) wfound(hit.name);
      fb.innerHTML = ''; fb.append(h('b', null, '✅ ' + (it.rightLabel ? it.rightLabel(hit) : hit.name) + '! '), it.explain ? it.explain(hit) : '');
      setTimeout(() => { hit.path.classList.remove('right'); next(); }, 1300); }
    else { missed = true; sfx('no'); hit.path.classList.add('wrong'); setTimeout(() => hit.path.classList.remove('wrong'), 700);
      fb.textContent = hit.ocean ? `That's the ${hit.name}. Try again!` : `That's ${hit.name}${hit.continent && it.continentHint ? ' (' + hit.continent + ')' : ''}. Try again!`;
      if (level() === 'A' && it.answer && m.paths[it.answer]) setTimeout(() => m.flash(it.answer, 'target', 1000), 500); }
  }}));
  function next(){ i++; missed = false; busy = false; i < items.length ? show() : finish(); }
  function show(){
    const it = items[i]; askEl.innerHTML = ''; choiceBox.innerHTML = ''; fb.textContent = ''; askEl.dataset.answer = it.answer || ''; askEl.dataset.target = it.target || ''; askEl.dataset.kind = it.type;
    askEl.append(it.type === 'choice' ? it.prompt : it.ask);
    if (it.audio) setTimeout(it.audio, 200);
    if (it.type === 'choice') {
      const ch = h('div', {class: 'choices'}, it.choices.map((c, k) => h('button', {class: 'btn choice', 'data-correct': k === it.answer ? '1' : null, onclick: e => {
        if (ch.dataset.done) return; const b = e.currentTarget;
        if (k === it.answer) { ch.dataset.done = 1; b.classList.add('right'); sfx('ok'); if (!missed) { score++; it.onRight && it.onRight(); }
          fb.innerHTML = ''; fb.append(h('b', null, pick(['Yes!', 'Great job!', 'Correct!'])), it.explain ? h('div', null, it.explain) : null);
          if (it.highlight && m.paths[it.highlight]) m.flash(it.highlight, 'right', 1500);
          choiceBox.append(h('button', {class: 'btn primary next', 'data-testid': 'next', onclick: next}, i + 1 < items.length ? 'Next ➜' : 'Finish 🎉')); }
        else { missed = true; b.classList.add('wrong'); b.disabled = true; sfx('no'); fb.textContent = 'Not quite. Try again!'; }
      }}, c)));
      choiceBox.append(ch);
    }
    info.innerHTML = ''; info.append(h('span', {class: 'qnum'}, `${i + 1} / ${items.length}`), timer ? h('span', {class: 'timer', 'data-testid': 'timer'}, '⏱ ' + left + 's') : '', h('span', null, '⭐ ' + score));
  }
  function finish(timeUp){ clearInterval(tick); busy = true; const st = award('world', activity, score, items.length); onFinish && onFinish(score);
    askEl.innerHTML = ''; choiceBox.innerHTML = ''; askEl.append(h('div', {class: 'done-card'}, h('h2', null, timeUp ? "⏰ Time's up!" : '🎉 Round complete!'), h('p', {class: 'score', 'data-testid': 'score'}, `${score} / ${items.length}`), h('p', {class: 'stars-earned'}, '⭐'.repeat(st) || 'Keep exploring!'),
      h('div', {class: 'row center'}, h('button', {class: 'btn primary', 'data-testid': 'quiz-done', onclick: back}, 'Done')))); }
  if (timer) { tick = setInterval(() => { left--; const t = info.querySelector('.timer'); if (t) t.textContent = '⏱ ' + left + 's'; if (left <= 5 && left > 0) sfx('tick'); if (left <= 0) finish(true); }, 1000); onLeave(() => clearInterval(tick)); }
  screen(app, title, icon, h('div', {class: 'card map-card'}, info, askEl, choiceBox, fb), m.el);
  show(); return m;
}
const tapItem = (name, ask, extra = {}) => Object.assign({type: 'tap', answer: name, ask, check: hit => hit.name === name, explain: () => WC[name].fact}, extra);
function wActive(){ return level() === 'A' ? W_LEVEL_A : null; }
function WMapQuiz(app){
  const lv = level(); const pool = lv === 'A' ? W_LEVEL_A : W_ALL;
  const items = sample(pool, lv === 'A' ? 6 : 10).map(n => tapItem(n, h('span', null, 'Tap ', h('b', null, n), lv === 'A' ? ' 👇' : '', W_SMALL.includes(n) ? h('span', {class: 'small muted'}, ' (small! try a 🔍 zoom button)') : '')));
  wRound(app, {title: 'World Map Quiz', icon: '📍', activity: 'World map quiz', items, mapOpts: {active: wActive(), zoom: lv === 'B'}, timer: lv === 'B' ? 120 : 0});
}
function WContinents(app){
  const lv = level(); const conts = WORLD.continents; const oceans = WORLD.oceans.map(o => o.name);
  const contItem = c => ({type: 'tap', target: c, ask: h('span', null, 'Tap ', h('b', null, c)), check: hit => hit.continent === c, rightLabel: () => c, explain: hit => hit.ocean ? '' : `${hit.name} is in ${c}.`, continentHint: true, onRight: () => wbump('continents')});
  const oceanItem = o => ({type: 'tap', target: o, ask: h('span', null, 'Tap the ', h('b', null, o), ' 🌊'), check: hit => hit.name === o, explain: () => '', onRight: () => wbump('continents')});
  let items;
  if (lv === 'A') items = shuffle([...sample(conts, 5).map(contItem), ...sample(oceans, 3).map(oceanItem)]);
  else items = shuffle([...sample(W_ALL, 6).map(n => ({type: 'choice', prompt: h('div', null, 'Which continent is ', h('b', null, n), ' in?'), highlight: n,
      ...(() => { const c = WC[n]; const ch = shuffle([c.continent, ...sample(conts.filter(x => !c.alt.includes(x) && x !== 'Antarctica'), 3)]); return {choices: ch, answer: ch.indexOf(c.continent)}; })(),
      explain: `${n} is in ${WC[n].alt.join(' and ')}.`, onRight: () => wbump('continents')})), ...sample(conts, 2).map(contItem), ...sample(oceans, 2).map(oceanItem)]);
  const legend = h('div', {class: 'row'}, conts.map(c => h('span', {class: 'pill ' + ctClass(c)}, c)));
  const m = wRound(app, {title: 'Continents & Oceans', icon: '🧭', activity: 'Continents & oceans', items, mapOpts: {continents: true, colors: lv === 'A', oceans: true}, timer: lv === 'B' ? 90 : 0});
  if (lv === 'A') m.el.before(legend);
}
function WDrop(app){
  const lv = level(); const pool = lv === 'A' ? W_LEVEL_A : W_ALL.filter(n => W_SHAPE[n].a > 150);
  const names = sample(pool, lv === 'A' ? 3 : 5); let placed = 0, misses = 0, selected = null;
  const fb = h('div', {class: 'feedback'}, 'Drag each name or flag onto its country. (Or tap a card, then tap the country.)');
  const m = worldMap({active: wActive(), onTap: hit => { if (selected) tryDrop(selected, hit.name); }});
  const bank = h('div', {class: 'wordbank', style: {justifyContent: 'center'}});
  function tryDrop(tile, name){
    if (tile.dataset.n === name) { sfx('ok'); m.paths[name].classList.add('right'); wfound(name); if (tile.dataset.kind === 'flag') wbump('flags'); tile.remove(); placed++; selected = null;
      const s = W_SHAPE[name]; const t = document.createElementNS(NS_SVG, 'text'); t.setAttribute('x', s.c[0]); t.setAttribute('y', s.c[1]); t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'wlabel'); t.textContent = name; m.svg.append(t);
      fb.textContent = `✅ ${name}! ${WC[name].fact}`;
      if (placed === names.length) { award('world', 'Name & flag drop', names.length - Math.min(misses, names.length), names.length); bank.append(h('button', {class: 'btn primary', 'data-testid': 'quiz-done', onclick: back}, 'Done 🎉')); }
    } else { sfx('no'); misses++; m.flash(name, 'wrong', 600); fb.textContent = `That's ${name}. Try another spot!`; }
  }
  names.forEach((n, k) => { const kind = k % 2 ? 'flag' : 'name';
    const t = h('button', {class: 'wtile', 'data-n': n, 'data-kind': kind, 'aria-label': kind === 'flag' ? 'Flag card' : n}, kind === 'flag' ? flagImg(n, 'mini-flag') : n); let sx = null, drag = null;
    t.addEventListener('pointerdown', e => { sx = [e.clientX, e.clientY]; t.setPointerCapture(e.pointerId); });
    t.addEventListener('pointermove', e => { if (!sx) return; if (!drag && Math.hypot(e.clientX - sx[0], e.clientY - sx[1]) > 10) { drag = t.cloneNode(true); drag.classList.add('drag-name'); document.body.append(drag); } if (drag) { drag.style.left = e.clientX - 40 + 'px'; drag.style.top = e.clientY - 30 + 'px'; } });
    t.addEventListener('pointerup', e => { const wasDrag = !!drag; if (drag) { drag.remove(); drag = null; } sx = null;
      if (wasDrag) { const el = document.elementFromPoint(e.clientX, e.clientY); if (el && el.dataset && el.dataset.name && !el.classList.contains('dim')) tryDrop(t, el.dataset.name); }
      else { [...bank.children].forEach(b => b.style.outline = ''); selected = t; t.style.outline = '4px solid #3b82f6'; fb.textContent = kind === 'flag' ? 'Now tap the country with this flag.' : `Now tap where ${n} is.`; } });
    bank.append(t); });
  screen(app, 'Name & Flag Drop', '🏷️', h('div', {class: 'card map-card'}, bank, fb), m.el);
}
function WHuntList(app){
  const lv = level(); const hunts = WORLD.hunts.filter(x => lv === 'B' || x.level === 'A');
  screen(app, 'Find the Country', '🔍', h('p', {class: 'muted'}, 'Follow the chain! Each clue starts from the country you just found.'),
    tiles(hunts.map((x, k) => ({icon: ['🐼', '🦅', '🚂', '⛰️', '🏝️'][WORLD.hunts.indexOf(x)], title: x.title, sub: `${x.clues.length} clues · Level ${x.level}`, color: '#a78bfa', onclick: () => go(WHunt, WORLD.hunts.indexOf(x)), id: 'whunt-' + k}))));
}
function WHunt(app, k){
  const hunt = WORLD.hunts[k];
  wRound(app, {title: hunt.title, icon: '🔍', activity: 'Find the Country: ' + hunt.title, items: hunt.clues.map((c, j) => tapItem(c.answer, h('span', {style: {fontSize: '22px'}}, `🧩 Clue ${j + 1}: `, c.clue))),
    mapOpts: {active: level() === 'A' ? W_LEVEL_A : null, zoom: level() === 'B'}, onFinish: () => wbump('hunts')});
}
function WTrivia(app){
  const lv = level(); const pool = lv === 'A' ? W_LEVEL_A : W_ALL; const nc = lv === 'A' ? 3 : 4;
  const flagQ = n => { const ch = shuffle([n, ...sample(pool, nc - 1, n)]); return {type: 'choice', prompt: h('div', null, flagImg(n), h('div', null, 'Which country has this flag?')), choices: ch, answer: ch.indexOf(n), highlight: n, explain: WC[n].fact, onRight: () => wbump('flags')}; };
  const capQ = n => { const c = WC[n]; const ch = shuffle([c.capital, ...sample(W_ALL.filter(x => x !== n).map(x => WC[x].capital), nc - 1)]);
    return {type: 'choice', prompt: h('div', null, flagImg(n, 'mini-flag'), ' What is the capital of ', h('b', null, n), '?'), choices: ch, answer: ch.indexOf(c.capital), highlight: n, explain: `The capital of ${n} is ${c.capital}.`, onRight: () => wbump('capitals')}; };
  const capTap = n => tapItem(n, h('span', null, '🏛️ Which country has the capital ', h('b', null, WC[n].capital), '? Tap it!'), {explain: () => `${WC[n].capital} is the capital of ${n}.`, onRight: () => wbump('capitals')});
  const zhTap = n => { const c = WC[n]; return tapItem(n, h('span', null, '🏮 Listen to the Mandarin name: ', h('b', {class: 'zh', lang: 'zh-CN'}, c.zh), ' ', h('i', null, c.py), ' ', zhSay(c), ' Tap it on the map!'),
    {audio: () => play(c.zhAudio, c.zh, 'zh-CN'), explain: () => `${c.zh} (${c.py}) means ${n}.`}); };
  const esTap = n => { const c = WC[n]; return tapItem(n, h('span', null, '🌮 Escucha: ', h('b', {lang: 'es'}, c.es), ' ', esSay(c), ' Tap it on the map!'),
    {audio: () => play(c.esAudio, c.es, 'es-MX'), explain: () => `In Spanish, ${n} is “${c.es}”.`}); };
  const passTap = p => tapItem(p.answer, h('div', {class: 'passage-mini'}, h('div', null, '📖 Read, then find the place! ', sayBtn(p.audio, p.text, 'en-US', '🔊 Read to me', {'data-testid': 'passage-say'})), h('p', null, p.text)),
    {explain: () => WC[p.answer].fact, onRight: () => wbump('stories')});
  const passages = WORLD.passages.filter(p => lv === 'B' || W_LEVEL_A.includes(p.answer));
  const pk = sample(pool, 12); const ps = sample(passages, 3);
  let items = lv === 'A' ? [flagQ(pk[0]), zhTap(pk[1]), passTap(ps[0]), esTap(pk[2]), flagQ(pk[3]), passTap(ps[1])]
    : [capQ(pk[0]), flagQ(pk[1]), zhTap(pk[2]), passTap(ps[0]), esTap(pk[3]), capTap(pk[4]), flagQ(pk[5]), capQ(pk[6]), zhTap(pk[7]), passTap(ps[1])];
  wRound(app, {title: 'Mixed Trivia', icon: '🎲', activity: 'World mixed trivia', items, mapOpts: {active: wActive(), zoom: lv === 'B'}, timer: lv === 'B' ? 180 : 0});
}
function WMemoryPick(app){
  const lv = level(); const opts = lv === 'A' ? [6, 8] : [12, 16];
  screen(app, 'Memory', '🃏', h('p', {class: 'muted'}, lv === 'A' ? 'Match each flag with its country name.' : 'Match each country name with its flag, its shape, or its Mandarin name.'),
    tiles(opts.map(n => ({icon: '🃏', title: `${n} cards`, sub: `${n / 2} pairs`, color: '#70c1b3', onclick: () => go(WMemory, n), id: 'wmem-' + n}))));
}
function WMemory(app, n){
  const lv = level(); const pairs = n / 2; const pool = lv === 'A' ? W_LEVEL_A : W_ALL.filter(x => W_SHAPE[x].a > 60);
  const kinds = lv === 'A' ? ['flag'] : ['flag', 'shape', 'zh'];
  const chosen = sample(pool, pairs); const cards = shuffle(chosen.flatMap((c, k) => [{n: c, kind: 'name'}, {n: c, kind: kinds[k % kinds.length]}]));
  let open = [], matched = 0, moves = 0, lock = false;
  const cols = n <= 8 ? 4 : n === 12 ? 4 : 4;
  const grid = h('div', {class: 'mem-grid', 'data-testid': 'wmem-grid', style: {gridTemplateColumns: `repeat(${cols}, 1fr)`, maxWidth: n <= 8 ? '720px' : '860px', margin: '0 auto'}});
  const status = h('p', {class: 'muted', style: {textAlign: 'center'}}, lv === 'A' ? 'Find each flag and its country name!' : 'Match names with flags, shapes and 中文 names!');
  const face = c => c.kind === 'flag' ? flagImg(c.n, '') : c.kind === 'shape' ? shapeSvg(c.n, 80) : c.kind === 'zh' ? h('span', {class: 'zh-card'}, h('b', {lang: 'zh-CN'}, WC[c.n].zh), h('small', null, WC[c.n].py)) : h('span', null, c.n);
  cards.forEach((c, k) => { const b = h('button', {class: 'mem', 'data-n': c.n, 'data-kind': c.kind, 'aria-label': 'Card ' + (k + 1), onclick: () => {
    if (lock || b.classList.contains('open') || b.classList.contains('matched')) return; sfx('flip');
    b.classList.add('open'); b.innerHTML = ''; b.append(face(c)); if (c.kind === 'zh') play(WC[c.n].zhAudio, WC[c.n].zh, 'zh-CN'); open.push(b);
    if (open.length === 2) { moves++; lock = true; const [a, d] = open;
      if (a.dataset.n === d.dataset.n && a.dataset.kind !== d.dataset.kind) { setTimeout(() => { a.classList.add('matched'); d.classList.add('matched'); sfx('ok'); open = []; lock = false; matched++; wfound(a.dataset.n);
        if ([a, d].some(x => x.dataset.kind === 'flag')) wbump('flags');
        status.textContent = `Matched ${matched} of ${pairs}! ${WC[a.dataset.n].fact}`;
        if (matched === pairs) { wbump('memory'); award('world', `World memory (${n} cards)`, Math.max(0, pairs - Math.max(0, moves - pairs - 2)), pairs, {stars: moves <= pairs + 2 ? 3 : moves <= pairs * 2 ? 2 : 1, celebrate: true});
          status.textContent = `🎉 All matched in ${moves} moves!`; grid.after(h('div', {class: 'row center'}, h('button', {class: 'btn primary', onclick: () => go(WMemory, n)}, 'Play again'), h('button', {class: 'btn', 'data-testid': 'quiz-done', onclick: back}, 'Done'))); } }, 400); }
      else setTimeout(() => { [a, d].forEach(x => { x.classList.remove('open'); x.innerHTML = ''; }); open = []; lock = false; }, 900);
    } }}); grid.append(b); });
  screen(app, `Memory · ${n} cards`, '🃏', status, grid);
}
function WExplore(app){
  const info = h('div', {class: 'card', 'data-testid': 'country-info'}, h('p', {class: 'muted'}, 'Tap any coloured country to see its flag, capital, continent, and its name in Mandarin and Spanish.'));
  const m = worldMap({labels: true, zoom: true, oceans: true, oceanLabels: true, active: W_ALL, onTap: hit => { info.innerHTML = '';
    if (hit.ocean) { info.append(h('h2', null, '🌊 ' + hit.name)); return; }
    const c = WC[hit.name]; if (!c) return; wfound(c.name); sfx('click');
    info.append(h('div', {class: 'row'}, flagImg(c.name), h('div', null, h('h2', null, c.name), h('div', null, '🏛️ Capital: ', h('b', null, c.capital)), h('div', null, '🧭 Continent: ' + c.alt.join(' / ')),
      h('div', null, '🏮 ', h('b', {lang: 'zh-CN', class: 'zh'}, c.zh), ' ', c.py, ' ', zhSay(c)), h('div', null, '🌮 ', h('b', {lang: 'es'}, c.es), ' ', esSay(c)), h('div', null, '💡 ' + c.fact)))); }});
  screen(app, 'Explore the World', '🗺️', info, m.el);
}
