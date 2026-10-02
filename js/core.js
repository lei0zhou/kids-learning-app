/* Acorn Academy core: state, profiles, rewards, sounds, confetti, speech, UI helpers. All data stays in localStorage. */
'use strict';
const KEY = 'acornAcademy.v1';
const SECTIONS = {
  ela:   {name: 'Reading & Words', icon: '📖', color: '#e8835a'},
  zh:    {name: 'Mandarin',        icon: '🏮', color: '#d65a5a'},
  es:    {name: 'Spanish',         icon: '🌮', color: '#e0a526'},
  usa:   {name: 'US Geography',    icon: '🗺️', color: '#4f8fc0'},
  world: {name: 'World Geography', icon: '🌍', color: '#2f9e8f'},
  acting:{name: 'Acting',          icon: '🎭', color: '#9a6bc0'},
  chess: {name: 'Chess',           icon: '♞', color: '#5c7a5a'},
  chat:  {name: 'Games/Chat',      icon: '💬', color: '#3aa39a'},
};
const BADGES = [
  {id:'first-star', name:'First Star', icon:'⭐', desc:'Earn your first star', test:p=>p.stars>=1},
  {id:'streak3', name:'3-Day Streak', icon:'🔥', desc:'Learn 3 days in a row', test:p=>p.streak.count>=3},
  {id:'stars50', name:'Star Collector', icon:'🌟', desc:'Earn 50 stars', test:p=>p.stars>=50},
  {id:'bookworm', name:'Bookworm', icon:'🐛', desc:'Finish 3 reading passages', test:p=>Object.keys(p.prog.ela.passages||{}).length>=3},
  {id:'speller', name:'Super Speller', icon:'🐝', desc:'Spell 20 words right', test:p=>(p.prog.ela.spellRight||0)>=20},
  {id:'builder', name:'Sentence Builder', icon:'🧱', desc:'Build 10 sentences', test:p=>(p.prog.ela.built||0)>=10},
  {id:'tone', name:'Tone Tamer', icon:'🎵', desc:'Get 20 tones right', test:p=>(p.prog.zh.tonesRight||0)>=20},
  {id:'hanzi', name:'Character Keeper', icon:'🀄', desc:'Learn 20 characters', test:p=>Object.keys(p.prog.zh.chars||{}).length>=20},
  {id:'hola', name:'¡Hola Hero!', icon:'🌮', desc:'Finish 5 Spanish rounds', test:p=>(p.prog.es.rounds||0)>=5},
  {id:'spotter', name:'State Spotter', icon:'📍', desc:'Find 10 states on the map', test:p=>(p.prog.usa.spotted||[]).length>=10},
  {id:'capital', name:'Capital Champ', icon:'🏛️', desc:'Get 20 capitals right', test:p=>(p.prog.usa.capitals||0)>=20},
  {id:'fifty', name:'50 State Star', icon:'🇺🇸', desc:'Find all 50 states', test:p=>(p.prog.usa.spotted||[]).length>=50},
  {id:'continent', name:'Continent Captain', icon:'🧭', desc:'Get 10 continent or ocean answers right', test:p=>((p.prog.world||{}).continents||0)>=10},
  {id:'flagmaster', name:'Flag Master', icon:'🏁', desc:'Match or name 20 world flags', test:p=>((p.prog.world||{}).flags||0)>=20},
  {id:'traveler', name:'World Traveler', icon:'✈️', desc:'Find 15 different countries', test:p=>((p.prog.world||{}).found||[]).length>=15},
  {id:'brave', name:'Brave Performer', icon:'🎭', desc:'Do 3 acting activities', test:p=>(p.prog.acting.done||0)>=3},
  {id:'improv', name:'Improv Star', icon:'✨', desc:'Do 3 improv games', test:p=>(p.prog.acting.improv||0)>=3},
  {id:'voice', name:'Voice Wizard', icon:'🎤', desc:'Do 3 voice exercises', test:p=>(p.prog.acting.voice||0)>=3},
  {id:'pawn', name:'Pawn Pro', icon:'♟️', desc:'Finish the pawn lesson', test:p=>(p.prog.chess.lessons||[]).includes('p')},
  {id:'knight', name:'Knight Rider', icon:'♞', desc:'Finish the knight lesson or star hunt', test:p=>(p.prog.chess.lessons||[]).includes('n')||(p.prog.chess.starHunt||0)>0},
  {id:'mate', name:'First Checkmate', icon:'👑', desc:'Checkmate the computer', test:p=>(p.prog.chess.wins||0)>=1},
  {id:'story', name:'Storyteller', icon:'📜', desc:'Finish 2 story chains', test:p=>(p.prog.chat.stories||0)>=2},
  {id:'riddle', name:'Riddle Master', icon:'🦉', desc:'Solve 5 riddles', test:p=>(p.prog.chat.riddles||0)>=5},
  {id:'chatter', name:'Chatterbox', icon:'💬', desc:'Finish 5 chat games', test:p=>(p.prog.chat.rounds||0)>=5},
];
const PRESETS = [['Little Explorer', '🦊', 7], ['Big Explorer', '🐼', 9]]; // Level A (age 7) and Level B (almost 10)
const AVATARS = ['🦊','🐼','🐰','🐸','🦉','🐱','🐶','🦄','🐢','🐙','🦁','🐨'];

/* ---------- state ---------- */
let S;
function blankProg(){ return {ela:{passages:{}}, zh:{chars:{}}, es:{}, usa:{spotted:[]}, world:{found:[]}, acting:{}, chess:{lessons:[]}, chat:{}}; }
function load(){
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.profiles) { s.profiles.forEach(p => { p.prog = Object.assign(blankProg(), p.prog || {}); }); return s; } } catch(e) {}
  // First launch: two preset explorers (rename them on the profile screen or the Grown-ups page).
  const s = {profiles: [], current: null, jokes: []};
  PRESETS.forEach(([name, avatar, age]) => s.profiles.push(makeProfile(name, avatar, age)));
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e) {}
  return s;
}
S = load();
function save(){ localStorage.setItem(KEY, JSON.stringify(S)); }
function kid(){ return S.profiles.find(p => p.id === S.current) || null; }
function makeProfile(name, avatar, age){
  return {id: 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2,6), name, avatar, age,
          level: age >= 9 ? 'B' : 'A', stars: 0, streak: {count: 0, last: null}, badges: [], history: [], secStars: {}, prog: blankProg(), jokes: []};
}
function newProfile(name, avatar, age){ const p = makeProfile(name, avatar, age); S.profiles.push(p); save(); return p; }
function renameProfile(p){ const n = prompt('New name for ' + p.name + ':', p.name); if (n == null) return false; const t = cleanText(n.trim()).slice(0, 14); if (!t) return false; p.name = t; save(); renderTop(); return true; }
function resetProfile(p){ Object.assign(p, {stars:0, streak:{count:0,last:null}, badges:[], history:[], secStars:{}, prog: blankProg(), jokes: []}); save(); }
function level(){ const p = kid(); return p ? p.level : 'A'; }
function today(){ const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function touchStreak(p){
  const t = today(); if (p.streak.last === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const ys = y.getFullYear() + '-' + String(y.getMonth()+1).padStart(2,'0') + '-' + String(y.getDate()).padStart(2,'0');
  p.streak.count = p.streak.last === ys ? p.streak.count + 1 : 1; p.streak.last = t;
}
function prog(sec){ const p = kid(); return p ? p.prog[sec] : {}; }
/** Record a finished activity. stars: explicit or computed from score/total. Returns stars earned. */
function award(sec, activity, score, total, opts = {}){
  const p = kid(); if (!p) return 0;
  let stars = opts.stars != null ? opts.stars : (total ? (score/total >= 0.9 ? 3 : score/total >= 0.6 ? 2 : score > 0 ? 1 : 0) : 1);
  p.stars += stars; p.secStars[sec] = (p.secStars[sec] || 0) + stars;
  touchStreak(p);
  p.history.unshift({t: Date.now(), sec, activity, score, total, stars, note: opts.note || ''});
  if (p.history.length > 400) p.history.length = 400;
  const fresh = BADGES.filter(b => !p.badges.includes(b.id) && b.test(p));
  fresh.forEach(b => p.badges.push(b.id));
  save(); renderTop();
  if (stars >= 2 || opts.celebrate) { confetti(); sfx('win'); }
  fresh.forEach((b, i) => setTimeout(() => { toast(`${b.icon} New badge: ${b.name}!`); sfx('badge'); confetti(); }, 700 + i * 1200));
  return stars;
}
function checkBadges(){ const p = kid(); if (!p) return; const fresh = BADGES.filter(b => !p.badges.includes(b.id) && b.test(p)); fresh.forEach(b => { p.badges.push(b.id); toast(`${b.icon} New badge: ${b.name}!`); confetti(); }); save(); }

/* ---------- DOM helpers ---------- */
function h(tag, attrs, ...kids){
  const e = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(9)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}
const $ = (s, r = document) => r.querySelector(s);
function shuffle(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
function sample(a, n, not){ return shuffle(a.filter(x => x !== not)).slice(0, n); }
function esc(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function toast(msg, ms = 2600){ const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms); }

/* ---------- navigation ---------- */
const NAV = [];
let cleanup = null;
function go(fn, ...args){
  if (cleanup) { try { cleanup(); } catch(e) {} cleanup = null; }
  stopAudio();
  NAV.push([fn, args]); if (NAV.length > 40) NAV.shift();
  const app = $('#app'); app.innerHTML = ''; app.scrollTop = 0; window.scrollTo(0, 0);
  fn(app, ...args); renderTop();
}
function back(){ NAV.pop(); const prev = NAV.pop(); if (prev) go(prev[0], ...prev[1]); else go(Home); }
function onLeave(fn){ cleanup = fn; }
function screen(app, title, icon, ...body){
  app.append(h('div', {class: 'screen-head'},
    h('button', {class: 'btn back', onclick: back, 'aria-label': 'Back', 'data-testid': 'back'}, '⬅ Back'),
    h('h1', null, icon ? h('span', {class: 'h-ico'}, icon) : null, title)), ...body.flat(9).filter(x => x != null && x !== false));
}
function tiles(items){ // [{icon,title,sub,onclick,color,id}]
  return h('div', {class: 'tiles'}, items.map(it => h('button', {class: 'tile', style: {'--c': it.color || '#e8835a'}, onclick: it.onclick, 'data-testid': it.id || null},
    h('span', {class: 'tile-ico'}, it.icon), h('span', {class: 'tile-title'}, it.title), it.sub ? h('span', {class: 'tile-sub'}, it.sub) : null)));
}

/* ---------- top bar ---------- */
function renderTop(){
  const p = kid(), t = $('#topbar'); t.innerHTML = '';
  t.append(h('button', {class: 'brand', onclick: () => { NAV.length = 0; go(Home); }, 'aria-label': 'Home'}, mascot(40), h('span', null, 'Acorn Academy')));
  if (p) t.append(h('div', {class: 'who'},
    h('span', {class: 'pill', title: 'Stars', 'data-testid': 'star-count'}, '⭐ ', String(p.stars)),
    h('span', {class: 'pill', title: 'Day streak'}, '🔥 ', String(p.streak.count)),
    h('button', {class: 'pill lvl', title: 'Switch level', 'data-testid': 'level-toggle', onclick: () => { p.level = p.level === 'A' ? 'B' : 'A'; save(); toast(p.level === 'A' ? 'Level A: big buttons, gentle pace' : 'Level B: harder questions and timers'); const cur = NAV[NAV.length-1]; if (cur) { NAV.pop(); go(cur[0], ...cur[1]); } }},
      'Level ', p.level),
    h('button', {class: 'pill kid', onclick: () => { S.current = null; save(); NAV.length = 0; go(Home); }, title: 'Switch kid'}, p.avatar, ' ', p.name)));
}
function mascot(size = 80){ // original acorn mascot "Nutmeg"
  const s = `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true"><ellipse cx="50" cy="62" rx="30" ry="32" fill="#c98a4b"/><ellipse cx="50" cy="66" rx="25" ry="26" fill="#e0a868"/>
  <path d="M16 44 Q50 8 84 44 Q50 36 16 44Z" fill="#7a5130"/><path d="M20 44 Q50 30 80 44 L80 48 Q50 40 20 48Z" fill="#5d3c22"/><rect x="47" y="8" width="6" height="14" rx="3" fill="#5d3c22"/>
  <path d="M53 12 q14 -10 22 0 q-10 6 -22 0" fill="#7fb069"/><circle cx="40" cy="62" r="4.5" fill="#2b2b2b"/><circle cx="60" cy="62" r="4.5" fill="#2b2b2b"/><circle cx="41.5" cy="60.5" r="1.5" fill="#fff"/><circle cx="61.5" cy="60.5" r="1.5" fill="#fff"/>
  <ellipse cx="33" cy="72" rx="5" ry="3" fill="#f2a0a0" opacity=".7"/><ellipse cx="67" cy="72" rx="5" ry="3" fill="#f2a0a0" opacity=".7"/><path d="M44 74 q6 6 12 0" stroke="#2b2b2b" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`;
  return h('span', {class: 'mascot', html: s});
}

/* ---------- sound effects (WebAudio, no files) ---------- */
let AC = null;
function ac(){ if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {} } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(freq, t0, dur, type = 'sine', vol = 0.18){
  const c = ac(); if (!c) return; const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0, c.currentTime + t0);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t0 + dur);
  o.connect(g).connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
}
function sfx(kind){
  if (S.muted) return;
  if (kind === 'ok') { tone(660, 0, .15, 'triangle'); tone(880, .1, .25, 'triangle'); }
  else if (kind === 'no') { tone(300, 0, .18, 'sine', .12); tone(250, .12, .25, 'sine', .1); }
  else if (kind === 'click') tone(520, 0, .06, 'square', .05);
  else if (kind === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .1, .3, 'triangle'));
  else if (kind === 'badge') [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * .08, .35, 'sine', .15));
  else if (kind === 'tick') tone(1000, 0, .04, 'square', .04);
  else if (kind === 'flip') tone(400, 0, .08, 'triangle', .08);
}
/* ---------- confetti (CSS) ---------- */
function confetti(n = 70){
  const box = $('#confetti'); const cols = ['#f4a259','#f25f5c','#70c1b3','#ffe066','#a78bfa','#7fb069','#5fa8d3'];
  for (let i = 0; i < n; i++) {
    const d = h('i', {style: {left: Math.random() * 100 + 'vw', background: pick(cols), animationDelay: Math.random() * .5 + 's',
      animationDuration: 1.6 + Math.random() * 1.4 + 's', transform: `rotate(${Math.random()*360}deg)`, width: 6 + Math.random()*8 + 'px', height: 8 + Math.random()*10 + 'px'}});
    box.append(d); setTimeout(() => d.remove(), 3600);
  }
}
/* ---------- audio + speech ---------- */
let curAudio = null;
function stopAudio(){ if (curAudio) { curAudio.pause(); curAudio = null; } if (window.speechSynthesis) speechSynthesis.cancel(); }
function speak(text, lang = 'en-US', rate = 0.9){
  if (!('speechSynthesis' in window)) { toast('Read-aloud is not available in this browser.'); return false; }
  speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = rate;
  const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.replace('_','-').toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)));
  if (v) u.voice = v; speechSynthesis.speak(u); return true;
}
/** Play a bundled MP3; fall back to Web Speech if the file can't play. */
function play(path, text, lang){
  stopAudio(); const a = new Audio('audio/' + path); curAudio = a; window.__lastAudio = path;
  a.play().catch(() => { if (text) speak(text, lang); });
  a.onerror = () => { if (text) speak(text, lang); };
  return a;
}
function sayBtn(path, text, lang, label = '🔊', extra = {}){
  return h('button', Object.assign({class: 'btn say', 'aria-label': 'Play sound', onclick: (e) => { e.stopPropagation(); play(path, text, lang); }}, extra), label);
}
/* ---------- local-only voice recorder (MediaRecorder; nothing is uploaded or saved) ---------- */
function recorder(label = 'Record my voice'){
  const wrap = h('div', {class: 'recorder'});
  if (!navigator.mediaDevices || !window.MediaRecorder) { wrap.append(h('p', {class: 'muted small'}, '🎤 Recording is not available on this device.')); return wrap; }
  let rec = null, chunks = [], url = null;
  const btn = h('button', {class: 'btn rec'}, '🎤 ' + label), playB = h('button', {class: 'btn', disabled: true}, '▶ Hear it');
  btn.onclick = async () => {
    if (rec && rec.state === 'recording') { rec.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      rec = new MediaRecorder(stream); chunks = [];
      rec.ondataavailable = e => chunks.push(e.data);
      rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(new Blob(chunks, {type: rec.mimeType})); playB.disabled = false; btn.textContent = '🎤 Record again'; btn.classList.remove('on'); };
      rec.start(); btn.textContent = '⏹ Stop'; btn.classList.add('on');
      setTimeout(() => { if (rec && rec.state === 'recording') rec.stop(); }, 30000);
    } catch(e) { toast('Microphone not allowed. That is OK, just say it out loud!'); }
  };
  playB.onclick = () => { if (url) new Audio(url).play(); };
  wrap.append(btn, playB, h('span', {class: 'muted small'}, 'Stays on this device only.'));
  return wrap;
}
/* ---------- generic quiz runner ---------- */
/** questions: [{prompt (node|string), choices:[string|node], answer:index, explain?, audio?:fn, choiceClass?}] */
function quiz(container, {title, sec, activity, questions, onDone, timer, big}){
  let i = 0, score = 0, t0 = Date.now(), tick = null, left = timer;
  const box = h('div', {class: 'quiz' + (big ? ' big' : '')}); container.append(box);
  const bar = h('div', {class: 'progress'}, h('i')); const timerEl = timer ? h('div', {class: 'timer'}) : null;
  if (timer) { tick = setInterval(() => { left--; timerEl.textContent = '⏱ ' + left + 's'; if (left <= 5) sfx('tick'); if (left <= 0) { clearInterval(tick); finish(true); } }, 1000); timerEl.textContent = '⏱ ' + left + 's'; onLeave(() => clearInterval(tick)); }
  function show(){
    const q = questions[i]; box.innerHTML = '';
    bar.firstChild.style.width = (i / questions.length * 100) + '%';
    box.append(h('div', {class: 'qhead'}, h('span', {class: 'qnum'}, `${i+1} / ${questions.length}`), bar, timerEl));
    box.append(h('div', {class: 'prompt'}, q.prompt));
    if (q.audio) setTimeout(q.audio, 150);
    const fb = h('div', {class: 'feedback', role: 'status'});
    const ch = h('div', {class: 'choices ' + (q.choiceClass || '')}, q.choices.map((c, k) => h('button', {class: 'btn choice', 'data-correct': k === q.answer ? '1' : null, onclick: (e) => answer(k, e.currentTarget, ch, fb)}, c)));
    box.append(ch, fb);
  }
  function answer(k, btn, ch, fb){
    const q = questions[i]; if (ch.dataset.done) return;
    if (k === q.answer) {
      score += ch.dataset.missed ? 0.5 : 1; ch.dataset.done = 1; btn.classList.add('right'); sfx('ok');
      fb.innerHTML = ''; fb.append(h('b', null, pick(['Great job!', 'Yes!', 'You got it!', 'Awesome!', 'Correct!'])), q.explain ? h('div', null, q.explain) : null);
      if (q.onRight) q.onRight();
      box.append(h('button', {class: 'btn primary next', 'data-testid': 'next', onclick: () => { i++; i < questions.length ? show() : finish(); }}, i + 1 < questions.length ? 'Next ➜' : 'Finish 🎉'));
    } else {
      btn.classList.add('wrong'); btn.disabled = true; sfx('no'); ch.dataset.missed = 1;
      fb.innerHTML = ''; fb.append(h('b', null, 'Not quite. Try again!'), q.hint ? h('div', null, q.hint) : null);
      if (q.onWrong) q.onWrong(fb);
    }
  }
  function finish(timeUp){
    clearInterval(tick); const total = questions.length; score = Math.floor(score);
    const stars = award(sec, activity, score, total);
    box.innerHTML = '';
    box.append(h('div', {class: 'done-card'}, h('div', {class: 'big-emoji'}, timeUp ? '⏰' : stars >= 3 ? '🏆' : stars >= 2 ? '🎉' : '👍'),
      h('h2', null, timeUp ? "Time's up!" : 'Round complete!'), h('p', {class: 'score', 'data-testid': 'score'}, `${score} / ${total} correct`),
      h('p', {class: 'stars-earned'}, '⭐'.repeat(stars) || 'Keep practicing!'),
      h('div', {class: 'row'}, h('button', {class: 'btn primary', 'data-testid': 'quiz-done', onclick: () => back()}, 'Done'))));
    if (onDone) onDone(score, total);
  }
  show();
  return box;
}
/* ---------- simple kid-safe word filter for free text (kept local only) ---------- */
const BAD_WORDS = ['stupid','idiot','dumb','shut up','hate you','kill','damn','hell','crap','sucks','loser','ugly','fat','poop head','butt','fart'];
function cleanText(s){ let t = String(s || '').slice(0, 300); BAD_WORDS.forEach(w => { t = t.replace(new RegExp('\\b' + w.replace(' ', '\\s+') + '\\b', 'gi'), m => '★'.repeat(m.length)); }); return t; }
function isClean(s){ return cleanText(s) === String(s || '').slice(0, 300); }
