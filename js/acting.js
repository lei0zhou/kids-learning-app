/* Acting Studio: self-reported activities. A kid or grown-up taps "We did it!" and rates it to earn stars. */
function didIt(name, kind, {rec = true} = {}){
  let rating = 0; const stars = h('div', {class: 'rating', role: 'group', 'aria-label': 'How did it go?'});
  [1, 2, 3].forEach(n => stars.append(h('button', {'aria-label': n + ' stars', 'data-rate': n, onclick: () => { rating = n; [...stars.children].forEach((b, k) => b.classList.toggle('on', k < n)); sfx('click'); }}, '⭐')));
  const box = h('div', {class: 'card', style: {textAlign: 'center', borderColor: '#c7b1e0'}}, h('h3', null, 'How did it go?'), stars,
    h('p', null, h('button', {class: 'btn primary', 'data-testid': 'did-it', onclick: () => {
      if (!rating) { toast('Tap the stars to rate it first'); return; }
      const a = prog('acting'); a.done = (a.done || 0) + 1; if (kind) a[kind] = (a[kind] || 0) + 1; save();
      award('acting', name, rating, 3, {stars: rating, celebrate: true}); box.innerHTML = ''; box.append(h('h2', null, '🎭 Bravo! Take a bow!'), h('p', {class: 'stars-earned'}, '⭐'.repeat(rating)));
    }}, '🎉 We did it!')), rec ? recorder('Record (optional)') : null);
  return box;
}
function ActHub(app){
  const A = level() === 'A';
  const t = A ? [
    {icon: '😲', title: 'Emotion Charades', sub: 'Act it out, no words!', color: '#9a6bc0', onclick: () => go(Charades), id: 'act-charades'},
    {icon: '🪞', title: 'Mirror Game', sub: 'Leader and follower', color: '#5fa8d3', onclick: () => go(Mirror), id: 'act-mirror'},
    {icon: '🗿', title: 'Freeze Dance', sub: 'Dance, then statue!', color: '#e8835a', onclick: () => go(Freeze), id: 'act-freeze'},
    {icon: '🎡', title: 'Scene Spinner', sub: 'Who? Where? Uh-oh!', color: '#7fb069', onclick: () => go(SceneSpinner, 'A'), id: 'act-spinner'},
  ] : [
    {icon: '📜', title: 'Story Starters', sub: 'Make up the rest', color: '#9a6bc0', onclick: () => go(Starters), id: 'act-starters'},
    {icon: '🪪', title: 'Character Cards', sub: 'Name, want, quirk, voice', color: '#e0a526', onclick: () => go(CharCard), id: 'act-char'},
    {icon: '🤝', title: 'Yes, and…', sub: 'Improv building game', color: '#70c1b3', onclick: () => go(YesAnd), id: 'act-yesand'},
    {icon: '🎬', title: 'Scene Generator', sub: 'Character + setting + conflict + twist', color: '#7fb069', onclick: () => go(SceneSpinner, 'B'), id: 'act-scene'},
    {icon: '🎤', title: 'Voice Gym', sub: 'Tongue twisters & drills', color: '#e8835a', onclick: () => go(VoiceGym), id: 'act-voice'},
    {icon: '🧍', title: 'Body & Status', sub: 'Say it without words', color: '#5fa8d3', onclick: () => go(Status), id: 'act-status'},
    {icon: '😲', title: 'Emotion Charades', sub: 'Quick warm-up', color: '#9a6bc0', onclick: () => go(Charades), id: 'act-charades'},
    {icon: '📝', title: 'Reflection', sub: 'How did my scene go?', color: '#8a7b63', onclick: () => go(Reflect), id: 'act-reflect'},
  ];
  screen(app, 'Acting Studio', '🎭', h('p', {class: 'muted'}, 'Act with a sibling, a grown-up, or a mirror. When you finish, tap “We did it!” and rate it.'), tiles(t));
}
function countdown(el, secs, onEnd){
  let left = secs; el.textContent = fmt(left); const id = setInterval(() => { left--; el.textContent = fmt(left); if (left <= 3 && left > 0) sfx('tick'); if (left <= 0) { clearInterval(id); sfx('badge'); onEnd && onEnd(); } }, 1000);
  function fmt(s){ return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); } return () => clearInterval(id);
}
function Charades(app){
  let card = null, guessed = 0, stop = null;
  const em = h('div', {class: 'em'}, '🎭'), word = h('div', null, 'Tap “New card”. Only the actor looks!'), clock = h('div', {class: 'clock'}, '1:00'), tally = h('p', {class: 'muted'}, 'Guessed: 0');
  const next = () => { card = pick(ACT.EMOTIONS.filter(e => e !== card)); em.textContent = card[1]; word.textContent = card[0].toUpperCase(); sfx('flip'); };
  screen(app, 'Emotion Charades', '😲', h('div', {class: 'card bigcard'}, em, word, clock, tally, h('div', {class: 'row center'},
    h('button', {class: 'btn primary', 'data-testid': 'new-card', onclick: () => { next(); if (stop) stop(); stop = countdown(clock, 60, () => toast("Time's up! Switch actors.")); }}, '🃏 New card'),
    h('button', {class: 'btn green', onclick: () => { if (!card) return; guessed++; tally.textContent = 'Guessed: ' + guessed; sfx('ok'); next(); }}, '✅ They guessed it!'),
    h('button', {class: 'btn', onclick: next}, '⏭ Skip'))), h('p', {class: 'muted'}, 'Rules: act out the feeling with your face and body. No talking! Others guess the emotion.'), didIt('Emotion charades', null, {rec: false}));
  onLeave(() => stop && stop());
}
function Mirror(app){
  const clock = h('div', {class: 'clock'}, '1:00'); const role = h('h2', {style: {textAlign: 'center'}}, 'Leader: Player 1'); let stop = null, round = 0;
  const run = () => { round++; role.textContent = `Leader: Player ${round % 2 ? 1 : 2}`; if (stop) stop(); stop = countdown(clock, 60, () => { toast('🔁 Switch leader!'); setTimeout(run, 1500); }); };
  screen(app, 'Mirror Game', '🪞', h('div', {class: 'card'}, h('ol', null, ACT.MIRROR.map(x => h('li', {style: {margin: '6px 0'}}, x)))), h('div', {class: 'card'}, role, clock,
    h('div', {class: 'row center'}, h('button', {class: 'btn primary', onclick: run}, '▶ Start / switch'), h('button', {class: 'btn', onclick: () => { stop && stop(); clock.textContent = '1:00'; }}, '⏹ Stop'))), didIt('Mirror game', null, {rec: false}));
  onLeave(() => stop && stop());
}
function Freeze(app){
  let playing = false, timer = null, nodes = [], step = 0, beat = null;
  const status = h('div', {class: 'bigcard'}, h('div', {class: 'em'}, '💃'), h('div', null, 'Press play and dance!'));
  const notes = [392, 494, 587, 494, 440, 523, 659, 523, 392, 494, 587, 784, 659, 587, 523, 494];
  function music(){ beat = setInterval(() => { const f = notes[step++ % notes.length]; tone(f, 0, .22, 'triangle', .12); if (step % 2) tone(f / 2, 0, .3, 'sine', .1); }, 260); }
  function start(){ if (playing) return; playing = true; ac(); music(); status.innerHTML = ''; status.append(h('div', {class: 'em'}, '💃🕺'), h('div', null, 'DANCE!'));
    timer = setTimeout(freeze, 5000 + Math.random() * 7000); }
  function freeze(){ clearInterval(beat); playing = false; const st = pick(ACT.STATUES); sfx('badge'); status.innerHTML = ''; status.append(h('div', {class: 'em'}, '🗿'), h('div', null, 'FREEZE!'), h('div', {style: {fontSize: '26px'}}, 'Be a statue of ' + st + '!')); }
  screen(app, 'Freeze Dance', '🗿', h('div', {class: 'card'}, h('ul', null, ACT.FREEZE.map(x => h('li', null, x)))), h('div', {class: 'card'}, status, h('div', {class: 'row center'},
    h('button', {class: 'btn primary', 'data-testid': 'freeze-play', onclick: start}, '▶ Play music'), h('button', {class: 'btn', onclick: () => { clearTimeout(timer); freeze(); }}, '🗿 Freeze now'))), didIt('Freeze dance', null, {rec: false}));
  onLeave(() => { clearInterval(beat); clearTimeout(timer); });
}
function SceneSpinner(app, lv){
  const parts = lv === 'A' ? [['Who', ACT.WHO_A], ['Where', ACT.WHERE_A], ['Uh-oh! Problem', ACT.PROBLEM_A]] : [['Character', ACT.CHARACTERS], ['Setting', ACT.SETTINGS], ['Conflict', ACT.CONFLICTS], ['Twist (add halfway!)', ACT.TWISTS]];
  const slots = parts.map(([lab]) => h('div', {class: 'slot'}, h('div', {class: 'lab'}, lab), h('div', {class: 'val'}, '?')));
  const spin = () => { slots.forEach(s => s.classList.add('spin')); let n = 0; const id = setInterval(() => { slots.forEach((s, k) => s.lastChild.textContent = pick(parts[k][1])); sfx('tick'); if (++n > 12) { clearInterval(id); slots.forEach(s => s.classList.remove('spin')); sfx('ok'); } }, 80); };
  screen(app, lv === 'A' ? 'Scene Spinner' : 'Scene Generator', '🎡', h('div', {class: 'card'}, h('div', {class: 'spinner'}, slots), h('div', {class: 'row center', style: {marginTop: '14px'}}, h('button', {class: 'btn primary', 'data-testid': 'spin', onclick: spin}, '🎡 Spin!'))),
    h('div', {class: 'card'}, h('p', null, lv === 'A' ? 'Act out a short scene (about 1 minute) with these. How does your character fix the problem?' : 'Plan for 30 seconds, then perform a 2–3 minute scene. Bring in the twist halfway through. End with the conflict solved (or hilariously worse!).')),
    didIt(lv === 'A' ? 'Scene spinner' : 'Scene generator', 'improv'));
  spin();
}
function Starters(app){
  const card = h('div', {class: 'bigcard', style: {fontSize: '28px'}}); const next = () => { card.textContent = '“' + pick(ACT.STARTERS) + ' …”'; sfx('flip'); }; next();
  screen(app, 'Story Starters', '📜', h('div', {class: 'card'}, card, h('div', {class: 'row center'}, h('button', {class: 'btn primary', onclick: next}, '🔀 New starter'))),
    h('div', {class: 'card'}, h('p', null, 'Read the starter out loud, then keep the story going for 1 minute with no stopping. Use a character voice! Pass it to a partner for the next minute.')), didIt('Impromptu story', 'improv'));
}
function CharCard(app){
  const box = h('div', {class: 'card', style: {fontSize: '24px'}});
  const deal = () => { box.innerHTML = ''; sfx('flip'); const age = 5 + Math.floor(Math.random() * 90);
    box.append(h('h2', null, '🪪 ' + pick(ACT.NAMES)), h('p', null, h('b', null, 'Age: '), age), h('p', null, h('b', null, 'Wants: '), pick(ACT.WANTS)), h('p', null, h('b', null, 'Quirk: '), pick(ACT.QUIRKS)), h('p', null, h('b', null, 'Voice: '), pick(ACT.VOICES))); };
  deal();
  screen(app, 'Character Cards', '🪪', box, h('div', {class: 'row center'}, h('button', {class: 'btn primary', 'data-testid': 'deal', onclick: deal}, '🃏 New character')),
    h('div', {class: 'card'}, h('p', null, 'Become this character! Walk in, introduce yourself, and tell us about your day while trying to get what you want. Stay in the voice the whole time.')), didIt('Character card', 'improv'));
}
function YesAnd(app){
  const line = h('div', {class: 'bigcard', style: {fontSize: '28px'}}); const clock = h('div', {class: 'clock'}, '2:00'); let stop = null;
  const next = () => { line.textContent = pick(ACT.YESAND); sfx('flip'); }; next();
  screen(app, 'Yes, and…', '🤝', h('div', {class: 'card'}, h('ol', null, ACT.YESAND_RULES.map(r => h('li', null, r)))), h('div', {class: 'card'}, h('p', {class: 'muted'}, 'Starting line:'), line, clock,
    h('div', {class: 'row center'}, h('button', {class: 'btn', onclick: next}, '🔀 New line'), h('button', {class: 'btn primary', onclick: () => { stop && stop(); stop = countdown(clock, 120, () => toast('Wrap it up with an ending!')); }}, '▶ Start 2 minutes'))), didIt('Yes, and… improv', 'improv'));
  onLeave(() => stop && stop());
}
function VoiceGym(app){
  const tw = h('div', {class: 'bigcard', style: {fontSize: '30px'}}); const nextTw = () => { tw.textContent = pick(ACT.TWISTERS); };
  const ln = h('div', {class: 'bigcard', style: {fontSize: '28px'}}); const emos = h('div', {class: 'row center'});
  const nextLine = () => { ln.textContent = pick(ACT.LINES); emos.innerHTML = ''; sample(ACT.LINE_EMOTIONS, 5).forEach((e, k) => emos.append(h('span', {class: 'pill'}, (k + 1) + '. ' + e))); };
  nextTw(); nextLine();
  screen(app, 'Voice Gym', '🎤', h('div', {class: 'card'}, h('h3', null, '👅 Tongue twister'), tw, h('p', {class: 'muted', style: {textAlign: 'center'}}, 'Say it 3 times: slow, medium, fast. Keep every sound clear!'),
      h('div', {class: 'row center'}, h('button', {class: 'btn', onclick: nextTw}, '🔀 New twister'), h('button', {class: 'btn say', onclick: () => speak(tw.textContent, 'en-US', 0.8)}, '🔊 Hear it'))),
    h('div', {class: 'card'}, h('h3', null, '🎚️ Drills'), ACT.DRILLS.map(([t, d]) => h('p', null, h('b', null, t + ': '), d))),
    h('div', {class: 'card'}, h('h3', null, '🎭 One line, five feelings'), ln, emos, h('div', {class: 'row center'}, h('button', {class: 'btn', onclick: nextLine}, '🔀 New line'))), didIt('Voice gym', 'voice'));
}
function Status(app){
  screen(app, 'Body & Status', '🧍', ACT.STATUS.map(([t, d]) => h('div', {class: 'card'}, h('h3', null, t), h('p', null, d))), didIt('Body language & status', null, {rec: false}));
}
function Reflect(app){
  const boxes = ACT.REFLECT.map(r => h('label', null, h('input', {type: 'checkbox'}), r));
  const next = h('textarea', {rows: 2, style: {width: '100%'}, placeholder: 'Next time I want to try… (stays on this device)', 'aria-label': 'Next time I want to try'});
  screen(app, 'Reflection', '📝', h('div', {class: 'card checklist'}, h('h3', null, 'After my scene…'), boxes, h('h3', null, 'Next time I want to try:'), next),
    h('div', {class: 'row center'}, h('button', {class: 'btn primary', 'data-testid': 'reflect-save', onclick: () => { const n = boxes.filter(b => b.firstChild.checked).length;
      const a = prog('acting'); a.done = (a.done || 0) + 1; save(); award('acting', 'Reflection checklist', n, ACT.REFLECT.length, {stars: n >= 4 ? 2 : 1, note: cleanText(next.value).slice(0, 120)}); toast('Saved! Great reflecting.'); }}, '💾 Save reflection')));
}
