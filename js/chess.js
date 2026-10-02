/* Chess: piece lessons, mini-games, and a full game vs. a small built-in alpha-beta AI. Rules by chess.js (bundled). */
const FILES = 'abcdefgh';
const PIECE_NAME = {p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King'};
const pieceImg = (color, type) => h('img', {src: `vendor/pieces/${color}${type.toUpperCase()}.svg`, alt: (color === 'w' ? 'White ' : 'Black ') + PIECE_NAME[type], draggable: 'false'});
const sqXY = sq => [FILES.indexOf(sq[0]), +sq[1] - 1];
const xySq = (x, y) => FILES[x] + (y + 1);
/** Generic board. get(sq) -> {color,type}|null; legal(from) -> [{to, capture}]; onMove(from,to). Tap-tap or drag. */
function Board({get, legal, onMove, big, showMoves = true, canPick = () => true, extra}){
  let sm = showMoves;
  const el = h('div', {class: 'board' + (big ? ' big' : ''), role: 'grid', 'aria-label': 'Chess board', 'data-testid': 'board'});
  let sel = null, marks = {}, lastMove = null, checkSq = null, hintSq = [];
  function render(){
    el.innerHTML = '';
    for (let y = 7; y >= 0; y--) for (let x = 0; x < 8; x++) {
      const sq = xySq(x, y), p = get(sq);
      const d = h('div', {class: 'sq ' + ((x + y) % 2 ? 'l' : 'd'), 'data-sq': sq, role: 'gridcell', 'aria-label': sq + (p ? ' ' + PIECE_NAME[p.type] : '')});
      if (sq === sel) d.classList.add('sel'); if (lastMove && lastMove.includes(sq)) d.classList.add('last'); if (sq === checkSq) d.classList.add('check'); if (hintSq.includes(sq)) d.classList.add('hint');
      if (marks[sq] && sm) { d.classList.add('mv'); if (marks[sq].capture) d.classList.add('cap'); }
      if (x === 0) d.append(h('span', {class: 'coord', style: {top: '1px', bottom: 'auto'}}, y + 1)); if (y === 0) d.append(h('span', {class: 'coord', style: {left: 'auto', right: '3px'}}, FILES[x]));
      if (extra) { const e = extra(sq); if (e) d.append(e); }
      if (p) d.append(pieceImg(p.color, p.type));
      el.append(d);
    }
  }
  function select(sq){ sel = sq; marks = {}; legal(sq).forEach(m => marks[m.to] = m); render(); }
  function clear(){ sel = null; marks = {}; render(); }
  function tapSq(sq){
    if (sel && marks[sq]) { const f = sel; clear(); onMove(f, sq); return; }
    const p = get(sq);
    if (p && canPick(sq, p) && legal(sq).length) { sfx('click'); select(sq); } else if (sel) { clear(); }
  }
  // pointer handling: tap or drag
  let down = null, ghost = null;
  el.addEventListener('pointerdown', e => { const s = e.target.closest('.sq'); if (!s) return; down = {sq: s.dataset.sq, x: e.clientX, y: e.clientY}; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', e => { if (!down) return; const p = get(down.sq);
    if (!ghost && p && canPick(down.sq, p) && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 12) { if (sel !== down.sq) select(down.sq); ghost = pieceImg(p.color, p.type); ghost.className = 'drag-piece'; document.body.append(ghost); }
    if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; } });
  el.addEventListener('pointerup', e => { if (!down) return; const start = down.sq; down = null;
    if (ghost) { ghost.remove(); ghost = null; const t = document.elementFromPoint(e.clientX, e.clientY); const s = t && t.closest('.sq'); if (s && marks[s.dataset.sq]) { clear(); onMove(start, s.dataset.sq); } else render(); return; }
    tapSq(start); });
  render();
  return {el, render, clear, select, set last(v){ lastMove = v; }, set check(v){ checkSq = v; }, set hint(v){ hintSq = v || []; render(); }, set showMoves(v){ sm = v; render(); }};
}
/* ---------- single-piece geometry for lessons (empty board) ---------- */
function pieceMoves(type, from, color, occ){ // occ: sq -> {color,type}
  const [x, y] = sqXY(from), out = [], add = (nx, ny) => { if (nx < 0 || nx > 7 || ny < 0 || ny > 7) return false; const s = xySq(nx, ny), o = occ[s]; if (o && o.color === color) return false; out.push({to: s, capture: !!o}); return !o; };
  const ray = (dx, dy) => { let nx = x + dx, ny = y + dy; while (add(nx, ny)) { nx += dx; ny += dy; } };
  if (type === 'r' || type === 'q') [[1,0],[-1,0],[0,1],[0,-1]].forEach(d => ray(...d));
  if (type === 'b' || type === 'q') [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(d => ray(...d));
  if (type === 'n') [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([a, b]) => add(x + a, y + b));
  if (type === 'k') [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([a, b]) => add(x + a, y + b));
  if (type === 'p') { const dir = color === 'w' ? 1 : -1, s1 = xySq(x, y + dir);
    if (y + dir >= 0 && y + dir <= 7 && !occ[s1]) { out.push({to: s1}); const home = color === 'w' ? 1 : 6, s2 = xySq(x, y + 2 * dir); if (y === home && !occ[s2]) out.push({to: s2}); }
    [-1, 1].forEach(dx => { const nx = x + dx, ny = y + dir; if (nx < 0 || nx > 7 || ny < 0 || ny > 7) return; const s = xySq(nx, ny); if (occ[s] && occ[s].color !== color) out.push({to: s, capture: true}); }); }
  return out;
}
const LESSONS = [
  {t: 'p', title: 'The Pawn', icon: '♟️', start: 'd2', stars: ['d4', 'e5'], enemies: {e5: 'p'}, text: 'Pawns march straight forward one square (or two on their very first move). They capture diagonally! Move to the ⭐ on d4, then capture the black pawn.'},
  {t: 'r', title: 'The Rook', icon: '♜', start: 'a1', stars: ['a6', 'f6'], text: 'Rooks slide any distance in straight lines: up, down, left, right. Visit both stars!'},
  {t: 'b', title: 'The Bishop', icon: '♝', start: 'c1', stars: ['h6', 'e3'], text: 'Bishops slide diagonally and always stay on the same color. Collect the stars.'},
  {t: 'n', title: 'The Knight', icon: '♞', start: 'b1', stars: ['c3', 'e4', 'f6'], text: 'Knights jump in an L: two squares one way, then one square to the side. They can jump over pieces! Hop to each star.'},
  {t: 'q', title: 'The Queen', icon: '♛', start: 'd1', stars: ['d7', 'h3', 'a3'], text: 'The queen is the strongest piece. She moves like a rook AND a bishop. Grab the stars!'},
  {t: 'k', title: 'The King', icon: '♚', start: 'e1', stars: ['e2', 'f3', 'g3'], text: 'The king moves one square in any direction. Protect him! Walk him to the stars.'},
];
function ChessHub(app){
  const c = prog('chess'); const done = c.lessons || [];
  screen(app, 'Chess', '♞', h('h3', null, 'How pieces move'), tiles(LESSONS.map(l => ({icon: l.icon, title: l.title, sub: done.includes(l.t) ? '✅ Done' : 'Lesson + challenge', color: '#5c7a5a', onclick: () => go(ChessLesson, l.t), id: 'lesson-' + l.t}))),
    h('h3', null, 'Play'), tiles([
      {icon: '⭐', title: "Knight's Star Hunt", sub: 'Collect stars with L-jumps', color: '#e0a526', onclick: () => go(StarHunt), id: 'chess-stars'},
      {icon: '♟️', title: 'Pawn Wars', sub: 'First pawn to the end wins', color: '#e8835a', onclick: () => go(PawnWars), id: 'chess-pawns'},
      {icon: '👑', title: 'Play the Computer', sub: level() === 'A' ? 'Practice mode with hints' : 'Full game · 5 levels', color: '#4f8fc0', onclick: () => go(ChessGame), id: 'chess-game'},
    ]), h('p', {class: 'muted small'}, `Games finished: ${c.games || 0} · Wins: ${c.wins || 0}`));
}
function ChessLesson(app, t){
  const L = LESSONS.find(l => l.t === t); let pos = L.start, stars = L.stars.slice(), moves = 0;
  const enemies = Object.fromEntries(Object.entries(L.enemies || {}).map(([s, ty]) => [s, {color: 'b', type: ty}]));
  const msg = h('div', {class: 'status', 'data-testid': 'lesson-status'}, `Tap the ${PIECE_NAME[t].toLowerCase()} to see where it can go.`);
  const occ = () => ({...enemies, [pos]: {color: 'w', type: t}});
  const b = Board({big: level() === 'A', get: sq => occ()[sq] || null, legal: sq => sq === pos ? pieceMoves(t, pos, 'w', occ()) : [], canPick: sq => sq === pos,
    extra: sq => stars.includes(sq) && sq !== pos ? h('span', {class: 'star'}, enemies[sq] ? '' : '⭐') : null,
    onMove: (f, to) => { moves++; delete enemies[to]; pos = to; sfx('click');
      if (stars[0] === to || stars.includes(to)) { stars = stars.filter(s => s !== to); sfx('ok'); }
      if (!stars.length) { msg.textContent = `🎉 You mastered the ${PIECE_NAME[t]}! (${moves} moves)`; const c = prog('chess'); c.lessons = c.lessons || []; if (!c.lessons.includes(t)) c.lessons.push(t); save(); award('chess', 'Lesson: ' + L.title, 1, 1, {stars: 2, celebrate: true}); }
      else msg.textContent = `Nice! ${stars.length} to go.`;
      b.render(); setTimeout(() => { if (stars.length) b.select(pos); }, 50); }});
  screen(app, L.title, L.icon, h('div', {class: 'chess-layout'}, b.el, h('div', null, h('div', {class: 'card'}, h('p', {style: {fontSize: '22px'}}, L.text), msg),
    h('div', {class: 'row'}, h('button', {class: 'btn', onclick: () => go(ChessLesson, t)}, '↺ Restart'), h('button', {class: 'btn primary', onclick: back}, 'Back to lessons')))));
  setTimeout(() => b.select(pos), 100);
}
function StarHunt(app){
  let pos = 'b1', moves = 0; const n = level() === 'A' ? 3 : 5; const stars = [];
  while (stars.length < n) { const s = xySq(Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)); if (s !== pos && !stars.includes(s)) stars.push(s); }
  const msg = h('div', {class: 'status'}, `Collect all ${n} stars with the knight!`);
  const b = Board({big: level() === 'A', get: sq => sq === pos ? {color: 'w', type: 'n'} : null, legal: sq => sq === pos ? pieceMoves('n', pos, 'w', {}) : [], canPick: sq => sq === pos,
    extra: sq => stars.includes(sq) ? h('span', {class: 'star'}, '⭐') : null,
    onMove: (f, to) => { moves++; pos = to; const i = stars.indexOf(to); if (i >= 0) { stars.splice(i, 1); sfx('ok'); }
      if (!stars.length) { msg.textContent = `🎉 All stars in ${moves} jumps!`; const c = prog('chess'); c.starHunt = (c.starHunt || 0) + 1; save(); award('chess', "Knight's star hunt", 1, 1, {stars: moves <= n * 3 ? 3 : 2, celebrate: true}); }
      else msg.textContent = `${stars.length} star${stars.length > 1 ? 's' : ''} left · ${moves} jumps`; b.render(); setTimeout(() => stars.length && b.select(pos), 30); }});
  screen(app, "Knight's Star Hunt", '⭐', h('div', {class: 'chess-layout'}, b.el, h('div', null, h('div', {class: 'card'}, msg, h('p', null, 'Knights move in an L shape. Plan your jumps!')), h('button', {class: 'btn', onclick: () => go(StarHunt)}, '🔀 New stars'))));
  setTimeout(() => b.select(pos), 100);
}
function PawnWars(app){
  const occ = {}; for (let x = 0; x < 8; x++) { occ[xySq(x, 1)] = {color: 'w', type: 'p'}; occ[xySq(x, 6)] = {color: 'b', type: 'p'}; }
  let turn = 'w', over = false, last = null;
  const msg = h('div', {class: 'status', 'data-testid': 'pawn-status'}, 'Your turn (white). Get a pawn to the other side!');
  const movesFor = c => Object.keys(occ).filter(s => occ[s].color === c).flatMap(s => pieceMoves('p', s, c, occ).map(m => ({from: s, ...m})));
  function apply(f, to){ occ[to] = occ[f]; delete occ[f]; last = [f, to]; b.last = last; }
  function check(){ const wWin = Object.keys(occ).some(s => occ[s].color === 'w' && s[1] === '8') || !movesFor('b').length && turn === 'b' || !Object.values(occ).some(p => p.color === 'b');
    const bWin = Object.keys(occ).some(s => occ[s].color === 'b' && s[1] === '1') || !movesFor('w').length && turn === 'w' || !Object.values(occ).some(p => p.color === 'w');
    if (wWin || bWin) { over = true; msg.textContent = wWin ? '🎉 You win Pawn Wars!' : '🤖 The computer wins this time. Try again!'; award('chess', 'Pawn wars', wWin ? 1 : 0, 1, {stars: wWin ? 3 : 1, celebrate: wWin}); return true; } return false; }
  const b = Board({big: level() === 'A', get: sq => occ[sq] || null, legal: sq => turn === 'w' && !over && occ[sq] && occ[sq].color === 'w' ? pieceMoves('p', sq, 'w', occ) : [], canPick: (sq, p) => p.color === 'w' && turn === 'w' && !over,
    onMove: (f, to) => { apply(f, to); sfx('click'); turn = 'b'; b.render(); if (check()) return; msg.textContent = '🤖 Thinking…';
      setTimeout(() => { const ms = movesFor('b'); const win = ms.find(m => m.to[1] === '1'); const caps = ms.filter(m => m.capture);
        const safe = ms.filter(m => { const [x, y] = sqXY(m.to); return ![-1, 1].some(dx => { const s = x + dx >= 0 && x + dx < 8 && y - 1 >= 0 ? xySq(x + dx, y - 1) : null; return s && occ[s] && occ[s].color === 'w'; }); });
        const m = win || (caps.length && Math.random() < .8 ? pick(caps) : pick(safe.length ? safe : ms)); if (m) apply(m.from, m.to); turn = 'w'; b.render(); if (!check()) msg.textContent = 'Your turn!'; }, 500); }});
  screen(app, 'Pawn Wars', '♟️', h('div', {class: 'chess-layout'}, b.el, h('div', null, h('div', {class: 'card'}, msg, h('p', null, 'Only pawns! Move forward, capture diagonally. First pawn to reach the far side wins.')), h('button', {class: 'btn', onclick: () => go(PawnWars)}, '↺ New game'))));
}
/* ---------- AI ---------- */
const PV = {p: 100, n: 320, b: 330, r: 500, q: 900, k: 0};
const PST = { // from white's view, index 0 = a8
  p: [0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
  r: [0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0],
  q: [-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20],
};
function evaluate(g){ // positive = good for side to move
  let s = 0; const bd = g.board();
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) { const p = bd[r][f]; if (!p) continue; const idx = p.color === 'w' ? r * 8 + f : (7 - r) * 8 + f; const v = PV[p.type] + PST[p.type][idx]; s += p.color === 'w' ? v : -v; }
  return g.turn() === 'w' ? s : -s;
}
function orderMoves(ms){ return ms.sort((a, b) => ((b.captured ? PV[b.captured] * 10 - PV[b.piece] : 0) + (b.promotion ? 800 : 0)) - ((a.captured ? PV[a.captured] * 10 - PV[a.piece] : 0) + (a.promotion ? 800 : 0))); }
function aiMove(g, lvl, timeMs = 1100){
  const ms = g.moves({verbose: true}); if (!ms.length) return null;
  if (lvl <= 1) { const caps = ms.filter(m => m.captured); return caps.length && Math.random() < 0.5 ? pick(caps) : pick(ms); }  // very easy
  const t0 = performance.now(); let nodes = 0, aborted = false;
  function search(depth, alpha, beta){
    if ((++nodes & 255) === 0 && performance.now() - t0 > timeMs) aborted = true; if (aborted) return 0;
    if (g.isCheckmate()) return -100000 - depth; if (g.isDraw() || g.isStalemate()) return 0;
    if (depth === 0) return quiesce(alpha, beta, 2);
    for (const m of orderMoves(g.moves({verbose: true}))) { g.move(m); const v = -search(depth - 1, -beta, -alpha); g.undo(); if (aborted) return 0; if (v >= beta) return beta; if (v > alpha) alpha = v; }
    return alpha;
  }
  function quiesce(alpha, beta, d){ const stand = evaluate(g); if (d === 0) return stand; if (stand >= beta) return beta; if (stand > alpha) alpha = stand;
    for (const m of orderMoves(g.moves({verbose: true}).filter(m => m.captured))) { g.move(m); const v = -quiesce(-beta, -alpha, d - 1); g.undo(); if (v >= beta) return beta; if (v > alpha) alpha = v; } return alpha; }
  const maxDepth = {2: 1, 3: 2, 4: 3, 5: 4}[lvl] || 2; let best = orderMoves(ms)[0];
  for (let d = 1; d <= maxDepth; d++) {
    let bestD = null, alpha = -Infinity;
    const list = orderMoves(ms.slice()); if (best) list.sort((a, b) => (b.san === best.san) - (a.san === best.san));
    for (const m of list) { g.move(m); const v = -search(d - 1, -Infinity, -alpha); g.undo(); if (aborted) break; if (v > alpha || !bestD) { alpha = v; bestD = m; } }
    if (aborted) break; best = bestD;
  }
  if (lvl === 2 && Math.random() < 0.3) return pick(ms); // a little sloppy at level 2
  return best;
}
function ChessGame(app){
  const A = level() === 'A';
  const st = prog('chess'); let diff = st.diff || (A ? 1 : 3), undoOn = A ? true : st.undo !== false, practice = A;
  const g = new Chess(); let over = false, thinking = false, lastAiMs = 0;
  window.__chess = g;
  const status = h('div', {class: 'status', 'data-testid': 'chess-status'}, 'You are white. Your move!');
  const list = h('div', {class: 'movelist', 'data-testid': 'move-list'});
  const kingSq = c => { const bd = g.board(); for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) { const p = bd[r][f]; if (p && p.type === 'k' && p.color === c) return FILES[f] + (8 - r); } };
  const b = Board({big: A, showMoves: practice, get: sq => g.get(sq) || null, canPick: (sq, p) => !over && !thinking && p.color === 'w' && g.turn() === 'w',
    legal: sq => g.moves({square: sq, verbose: true}).map(m => ({to: m.to, capture: !!m.captured})).filter((m, i, a) => a.findIndex(x => x.to === m.to) === i), onMove: userMove});
  async function userMove(f, to){
    let promo; const cand = g.moves({square: f, verbose: true}).filter(m => m.to === to);
    if (cand.some(m => m.promotion)) promo = A ? 'q' : await choosePromo();
    g.move({from: f, to, promotion: promo}); sfx(cand[0] && cand[0].captured ? 'ok' : 'click'); b.hint = []; afterMove();
    if (!over) { thinking = true; status.textContent = '🤖 Thinking…'; setTimeout(() => { const t0 = performance.now(); const m = aiMove(g, diff); lastAiMs = Math.round(performance.now() - t0); window.__lastAiMs = lastAiMs; if (m) g.move(m); thinking = false; afterMove(); }, 60); }
  }
  function choosePromo(){ return new Promise(res => { const dlg = h('div', {class: 'card', style: {position: 'fixed', left: '50%', top: '40%', transform: 'translate(-50%,-50%)', zIndex: 80, textAlign: 'center'}}, h('h3', null, 'Promote your pawn to…'),
    h('div', {class: 'row center'}, ['q', 'r', 'b', 'n'].map(p => h('button', {class: 'btn', 'data-promo': p, style: {width: '90px', height: '90px'}, onclick: () => { dlg.remove(); res(p); }}, pieceImg('w', p))))); document.body.append(dlg); }); }
  function afterMove(){
    const hist = g.history({verbose: true}); const lm = hist[hist.length - 1]; b.last = lm ? [lm.from, lm.to] : null; b.check = g.inCheck() ? kingSq(g.turn()) : null; b.render();
    list.innerHTML = ''; const sans = g.history(); for (let i = 0; i < sans.length; i += 2) list.append(h('div', null, `${i / 2 + 1}. ${sans[i]} ${sans[i + 1] || ''}`)); list.scrollTop = 1e6;
    if (g.isGameOver()) { over = true; let res, win = false;
      if (g.isCheckmate()) { win = g.turn() === 'b'; res = win ? '👑 Checkmate! You win!' : '🤖 Checkmate. The computer wins. Good game!'; } else if (g.isStalemate()) res = '🤝 Stalemate! No legal moves, so it is a draw.'; else res = '🤝 Draw!';
      status.textContent = res; const c = prog('chess'); c.games = (c.games || 0) + 1; if (win) c.wins = (c.wins || 0) + 1; save();
      award('chess', `Game vs computer (level ${diff}): ${win ? 'win' : g.isCheckmate() ? 'loss' : 'draw'}`, win ? 1 : 0, 1, {stars: win ? 3 : 1, celebrate: win}); return; }
    status.textContent = g.inCheck() ? (g.turn() === 'w' ? '⚠️ Check! Protect your king.' : '⚡ Check!') : g.turn() === 'w' ? 'Your move!' + (lastAiMs ? ` (computer took ${(lastAiMs / 1000).toFixed(1)}s)` : '') : '';
  }
  const diffSel = h('select', {'aria-label': 'Difficulty', 'data-testid': 'difficulty', onchange: e => { diff = +e.target.value; st.diff = diff; save(); }}, [1, 2, 3, 4, 5].map(n => h('option', {value: n, selected: n === diff ? true : null}, ['1 · Sprout (random)', '2 · Seedling', '3 · Sapling', '4 · Oak', '5 · Ancient Tree'][n - 1])));
  const controls = h('div', {class: 'row'},
    h('button', {class: 'btn', 'data-testid': 'undo', onclick: () => { if (!undoOn || thinking) return; g.undo(); if (g.turn() === 'b') g.undo(); over = false; afterMove(); }}, '↶ Undo'),
    A ? h('button', {class: 'btn green', 'data-testid': 'hint', onclick: () => { if (over || thinking) return; const m = aiMove(g, 3, 600); if (m) { b.hint = [m.from, m.to]; status.textContent = `💡 Try this: move the ${PIECE_NAME[m.piece].toLowerCase()} from ${m.from} to ${m.to}!`; } }}, '💡 Hint') : null,
    h('button', {class: 'btn', onclick: () => { if (over) return; over = true; status.textContent = '🏳️ You resigned. Shake hands and try again!'; const c = prog('chess'); c.games = (c.games || 0) + 1; save(); award('chess', 'Game vs computer: resigned', 0, 1, {stars: 0}); }}, '🏳️ Resign'),
    h('button', {class: 'btn primary', 'data-testid': 'new-game', onclick: () => go(ChessGame)}, '✨ New game'));
  const opts = h('div', {class: 'card'}, h('h3', null, 'Settings'), A ? h('p', null, 'Level A: practice mode shows legal moves, the computer is very easy, and hints are on.') : h('div', null,
      h('label', null, 'Computer: ', diffSel), h('p', null, h('label', null, h('input', {type: 'checkbox', checked: undoOn ? true : null, onchange: e => { undoOn = e.target.checked; st.undo = undoOn; save(); }}), ' Allow undo')),
      h('p', null, h('label', null, h('input', {type: 'checkbox', 'data-testid': 'show-moves', onchange: e => { b.showMoves = e.target.checked; }}), ' Show legal moves'))));
  screen(app, 'Play the Computer', '👑', h('div', {class: 'chess-layout'}, b.el, h('div', null, h('div', {class: 'card'}, status, controls), opts, h('div', {class: 'card'}, h('h3', null, 'Moves'), list))));
  if (A) diff = 1;
}
