/* Grown-ups: simple gate, per-kid dashboard, history, reset. */
function ParentGate(app){
  const a = 3 + Math.floor(Math.random() * 6), b = 4 + Math.floor(Math.random() * 6);
  const inp = h('input', {type: 'number', 'aria-label': 'Answer', 'data-testid': 'gate-input', style: {width: '160px'}});
  const ok = () => { if (+inp.value === a * b) go(ParentDash); else { sfx('no'); toast('Ask a grown-up to help!'); } };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); });
  screen(app, 'Grown-ups', '👪', h('div', {class: 'card', style: {textAlign: 'center'}}, h('p', null, 'Grown-ups only! What is ', h('b', {'data-testid': 'gate-q'}, `${a} × ${b}`), '?'), inp, ' ', h('button', {class: 'btn primary', 'data-testid': 'gate-go', onclick: ok}, 'Enter')));
}
function secStats(p, sec){ const hs = p.history.filter(x => x.sec === sec); const sc = hs.filter(x => x.total).reduce((a, x) => [a[0] + x.score, a[1] + x.total], [0, 0]);
  return {n: hs.length, stars: p.secStars[sec] || 0, acc: sc[1] ? Math.round(sc[0] / sc[1] * 100) : null, last: hs[0] ? new Date(hs[0].t).toLocaleDateString() : '–'}; }
function ParentDash(app){
  const secs = Object.keys(SECTIONS);
  const table = h('table', {class: 'dash', 'data-testid': 'parent-table'}, h('tr', null, h('th', null, 'Kid'), h('th', null, '⭐ Total'), h('th', null, '🔥 Streak'), secs.map(s => h('th', null, SECTIONS[s].icon + ' ' + SECTIONS[s].name))),
    S.profiles.map(p => h('tr', {'data-kid': p.name}, h('td', null, h('b', null, p.avatar + ' ' + p.name), h('div', {class: 'small muted'}, 'Level ' + p.level)), h('td', null, p.stars), h('td', null, p.streak.count),
      secs.map(s => { const st = secStats(p, s); return h('td', {'data-sec': s}, h('div', null, '⭐ ' + st.stars), h('div', {class: 'small muted'}, `${st.n} done` + (st.acc != null ? ` · ${st.acc}%` : ''))); }))));
  const detail = S.profiles.map(p => {
    const pr = p.prog; const facts = [
      ['Reading passages', `${Object.keys(pr.ela.passages || {}).length} / ${ELA.passages.length}`], ['Spelling words right', pr.ela.spellRight || 0], ['Sentences built', pr.ela.built || 0],
      ['Chinese characters learned', `${Object.keys(pr.zh.chars || {}).length} / ${ZH.chars.length}`], ['Tones right', pr.zh.tonesRight || 0], ['Spanish rounds', pr.es.rounds || 0],
      ['States found', `${(pr.usa.spotted || []).length} / 50`], ['Capitals right', pr.usa.capitals || 0], ['Acting activities', pr.acting.done || 0],
      ['Chess lessons', `${(pr.chess.lessons || []).length} / 6`], ['Chess games / wins', `${pr.chess.games || 0} / ${pr.chess.wins || 0}`], ['Chat games', pr.chat.rounds || 0]];
    return h('div', {class: 'card'}, h('div', {class: 'row', style: {justifyContent: 'space-between'}}, h('h2', null, p.avatar + ' ' + p.name),
        h('div', {class: 'row'}, h('label', null, 'Level ', h('select', {onchange: e => { p.level = e.target.value; save(); renderTop(); }}, ['A', 'B'].map(l => h('option', {value: l, selected: p.level === l ? true : null}, l === 'A' ? 'A (age ~7)' : 'B (age ~10)')))),
          h('button', {class: 'btn', 'data-testid': 'reset-' + p.name, onclick: () => { if (confirm(`Reset all progress for ${p.name}? This cannot be undone.`)) { resetProfile(p); go(ParentDash); toast('Progress reset'); } }}, '↺ Reset progress'),
          h('button', {class: 'btn', onclick: () => { if (confirm(`Delete the profile ${p.name}?`)) { S.profiles = S.profiles.filter(x => x !== p); if (S.current === p.id) S.current = null; save(); go(ParentDash); } }}, '🗑 Delete'))),
      h('div', {class: 'tiles', style: {gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '8px'}}, facts.map(([k, v]) => h('div', {class: 'card', style: {margin: 0, padding: '10px 14px'}}, h('div', {class: 'small muted'}, k), h('b', {style: {fontSize: '24px'}}, String(v))))),
      h('h3', null, 'Badges'), h('div', {class: 'badge-row'}, BADGES.map(b => h('span', {class: 'badge' + (p.badges.includes(b.id) ? '' : ' off'), title: b.desc}, b.icon + ' ' + b.name))),
      h('h3', null, 'Recent activity (quiz history)'), p.history.length ? h('table', {class: 'dash', 'data-testid': 'history-' + p.name}, h('tr', null, h('th', null, 'When'), h('th', null, 'Section'), h('th', null, 'Activity'), h('th', null, 'Score'), h('th', null, 'Stars')),
        p.history.slice(0, 15).map(x => h('tr', null, h('td', {class: 'small'}, new Date(x.t).toLocaleString([], {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})), h('td', null, SECTIONS[x.sec] ? SECTIONS[x.sec].icon + ' ' + SECTIONS[x.sec].name : x.sec),
          h('td', {style: {textAlign: 'left'}}, x.activity, x.note ? h('div', {class: 'small muted'}, '“' + x.note.slice(0, 140) + (x.note.length > 140 ? '…' : '') + '”') : null), h('td', null, x.total ? `${x.score}/${x.total}` : '✓'), h('td', null, '⭐'.repeat(x.stars))))) : h('p', {class: 'muted'}, 'No activity yet.'));
  });
  screen(app, 'Progress Dashboard', '👪', h('p', {class: 'muted'}, 'Everything is stored only in this browser (localStorage). Nothing is uploaded. Recordings are never saved.'),
    h('div', {class: 'card', style: {overflowX: 'auto'}}, table), detail,
    h('div', {class: 'card'}, h('h3', null, 'Settings'), h('div', {class: 'row'}, h('label', null, h('input', {type: 'checkbox', checked: S.muted ? true : null, onchange: e => { S.muted = e.target.checked; save(); }}), ' Mute sound effects'),
      h('button', {class: 'btn', 'data-testid': 'reset-all', onclick: () => { if (confirm('Erase ALL profiles and progress?')) { localStorage.removeItem(KEY); S = load(); NAV.length = 0; go(Home); } }}, '⚠️ Erase everything'))));
}
