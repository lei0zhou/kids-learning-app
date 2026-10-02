/* Mandarin: tones, pinyin, characters (hanzi-writer, bundled data), phrases, listening. */
const TONE_INFO = {1: {name: 'Tone 1', sym: 'ˉ', desc: 'high and flat', curve: 'M10 20 L90 20'}, 2: {name: 'Tone 2', sym: 'ˊ', desc: 'rising, like asking “huh?”', curve: 'M10 70 L90 15'},
  3: {name: 'Tone 3', sym: 'ˇ', desc: 'dips down, then up', curve: 'M10 40 Q45 95 90 25'}, 4: {name: 'Tone 4', sym: 'ˋ', desc: 'falls sharply, like “No!”', curve: 'M10 15 L90 80'}};
function toneSvg(t, w = 70){ return h('span', {html: `<svg viewBox="0 0 100 100" width="${w}" height="${w*0.8}" preserveAspectRatio="none" aria-hidden="true"><path d="${TONE_INFO[t].curve}" stroke="#b0413e" stroke-width="10" fill="none" stroke-linecap="round"/></svg>`}); }
function zhPlay(item){ return play(item.audio, item.han, 'zh-CN'); }
function ZhHub(app){
  const pr = prog('zh');
  screen(app, 'Mandarin', '🏮', tiles([
    {icon: '🎵', title: 'Tone Trainer', sub: 'Hear it, pick tone 1–4', color: '#d65a5a', onclick: () => go(ToneTrainer), id: 'zh-tones'},
    {icon: '🔤', title: 'Pinyin Reader', sub: 'Read tone marks', color: '#e8835a', onclick: () => go(PinyinReader), id: 'zh-pinyin'},
    {icon: '🧩', title: 'Initials & Finals', sub: 'b p m f… a o e…', color: '#e0a526', onclick: () => go(InitialsGame), id: 'zh-initials'},
    {icon: '🀄', title: 'Characters', sub: `${Object.keys(pr.chars || {}).length} / ${ZH.chars.length} learned · stroke order`, color: '#7fb069', onclick: () => go(CharGrid), id: 'zh-chars'},
    {icon: '❓', title: 'Character Quiz', sub: 'Meaning and pinyin', color: '#5fa8d3', onclick: () => go(CharQuiz), id: 'zh-charquiz'},
    {icon: '💬', title: 'Phrases', sub: 'Hello, thank you, family, food', color: '#a78bfa', onclick: () => go(ZhPhrases), id: 'zh-phrases'},
    {icon: '👂', title: 'Listening', sub: 'Hear it, pick the picture', color: '#70c1b3', onclick: () => go(ZhListen), id: 'zh-listen'},
  ]), h('div', {class: 'card'}, h('h3', null, 'The four tones'), h('div', {class: 'row'}, [1,2,3,4].map(t => h('div', {class: 'card', style: {margin: 0, textAlign: 'center', flex: '1'}}, toneSvg(t), h('div', null, h('b', null, TONE_INFO[t].name)), h('div', {class: 'small muted'}, TONE_INFO[t].desc), h('div', {class: 'py'}, ZH.tones[0].items[t-1].py), sayBtn(ZH.tones[0].items[t-1].audio, ZH.tones[0].items[t-1].han, 'zh-CN'))))));
}
function ToneTrainer(app){
  const n = level() === 'A' ? 6 : 10; const sets = level() === 'A' ? ZH.tones.slice(0, 4) : ZH.tones;
  const qs = Array.from({length: n}, () => { const s = pick(sets); const it = pick(s.items);
    return {prompt: h('div', null, h('div', null, 'Listen! Which tone do you hear?'), h('div', {class: 'py', style: {fontSize: '40px'}}, s.base), sayBtn(it.audio, it.han, 'zh-CN', '🔊 Play again', {'data-testid': 'tone-play'})),
      audio: () => zhPlay(it), choices: [1,2,3,4].map(t => h('span', null, toneSvg(t, 50), h('br'), TONE_INFO[t].name)), answer: it.tone - 1,
      explain: h('span', null, h('span', {class: 'han', style: {fontSize: '34px'}}, it.han), ' ', h('b', {class: 'py'}, it.py), ` = “${it.en}” (${TONE_INFO[it.tone].desc})`),
      hint: 'Listen to the shape of the voice: flat, rising, dipping, or falling?', onRight: () => { prog('zh').tonesRight = (prog('zh').tonesRight || 0) + 1; save(); }};
  });
  screen(app, 'Tone Trainer', '🎵'); quiz(app, {sec: 'zh', activity: 'Tone trainer', questions: qs, big: true});
}
const MARKS = {a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ'};
function markSyl(base, t){ // tone-mark placement rule: a/e first, then o in "ou", else the last vowel
  base = base.replace('v', 'ü'); let idx = base.search(/[ae]/); if (idx < 0) idx = base.indexOf('ou'); if (idx < 0) { const m = [...base].map((c, k) => 'iouü'.includes(c) ? k : -1).filter(k => k >= 0); idx = m[m.length - 1]; }
  return base.slice(0, idx) + MARKS[base[idx]][t - 1] + base.slice(idx + 1);
}
function PinyinReader(app){
  const all = ZH.tones.flatMap(s => s.items.map(it => ({...it, base: s.base}))).concat(ZH.chars.map(c => ({han: c.han, py: c.py, audio: c.audio, en: c.en})));
  const toneOf = py => { for (const t of [1,2,3,4]) if ([...py].some(ch => Object.values(MARKS).some(m => m[t-1] === ch))) return t; return 5; };
  const plain = py => py.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/u\u0308/g, 'ü');
  const items = all.filter(it => !it.py.includes(' ') && !it.py.includes('/') && toneOf(it.py) < 5);
  const n = level() === 'A' ? 6 : 10;
  const qs = sample(items, n).map((it, k) => {
    const t = toneOf(it.py);
    if (level() === 'B' && k % 2) { const base = plain(it.py); const opts = [1,2,3,4].map(x => markSyl(base, x));
      return {prompt: h('div', null, `Which pinyin shows `, h('b', null, `tone ${t}`), ' on ', h('b', {class: 'py'}, base), '?'), choices: opts, answer: t - 1, choiceClass: 'py',
        explain: h('span', null, h('span', {class: 'han'}, it.han), ' ', it.py, it.en ? ` = ${it.en}` : '', '. Tone marks go on a or e first, then the o in ou, otherwise the last vowel.'), onRight: () => zhPlay(it)}; }
    return {prompt: h('div', null, h('div', null, 'What tone is this?'), h('div', {class: 'py', style: {fontSize: '64px'}}, it.py)), choices: [1,2,3,4].map(x => h('span', null, toneSvg(x, 44), h('br'), 'Tone ' + x)), answer: t - 1,
      explain: h('span', null, h('span', {class: 'han', style: {fontSize: '30px'}}, it.han), ` ${it.py} = ${it.en || ''}`), onRight: () => zhPlay(it), hint: 'ˉ flat = 1, ˊ up = 2, ˇ dip = 3, ˋ down = 4'};
  });
  screen(app, 'Pinyin Reader', '🔤'); quiz(app, {sec: 'zh', activity: 'Pinyin reading', questions: qs, big: level() === 'A'});
}
function splitPinyin(py){
  const base = py.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/u\u0308/g, 'ü').toLowerCase();
  const ini = ['zh','ch','sh','b','p','m','f','d','t','n','l','g','k','h','j','q','x','r','z','c','s','y','w'].find(i => base.startsWith(i)) || '';
  return {ini, fin: base.slice(ini.length), base};
}
function InitialsGame(app){
  const pool = ZH.tones.flatMap(s => s.items).concat(ZH.chars).filter(it => !it.py.includes(' ') && !it.py.includes('/') && splitPinyin(it.py).ini);
  const n = level() === 'A' ? 6 : 10; const INI = ZH.initials;
  const qs = sample(pool, n).map((it, k) => {
    const {ini, fin} = splitPinyin(it.py); const askFinal = level() === 'B' && k % 2 && !['y','w'].includes(ini);
    if (askFinal) { const fins = ['a','o','e','i','u','ü','ai','ei','ao','ou','an','en','ang','eng','ong','ia','ie','iu','in','ing','uo','ui','un','uan','iao','ian','iang','ua','er'];
      const ch = shuffle([fin, ...sample(fins.filter(f => f !== fin), 3)]);
      return {prompt: h('div', null, 'Listen. What is the FINAL (the ending sound)?', h('div', {class: 'py', style: {fontSize: '44px'}}, ini + ' + ?'), sayBtn(it.audio, it.han, 'zh-CN', '🔊 Again')), audio: () => zhPlay(it), choices: ch, answer: ch.indexOf(fin), choiceClass: 'py', explain: `${it.han} ${it.py}: ${ini} + ${fin}`}; }
    const ch = shuffle([ini, ...sample(INI.filter(x => x !== ini), level() === 'A' ? 2 : 3)]);
    return {prompt: h('div', null, 'Listen. What is the INITIAL (the starting sound)?', h('div', {class: 'py', style: {fontSize: '44px'}}, '? + ' + fin), sayBtn(it.audio, it.han, 'zh-CN', '🔊 Again')), audio: () => zhPlay(it), choices: ch, answer: ch.indexOf(ini), choiceClass: 'py',
      explain: h('span', null, h('span', {class: 'han', style: {fontSize: '30px'}}, it.han), ` ${it.py}: ${ini} + ${fin}`)};
  });
  screen(app, 'Initials & Finals', '🧩', h('p', {class: 'muted'}, 'A pinyin syllable = initial (start) + final (end) + tone. Example: m + ā = mā.')); quiz(app, {sec: 'zh', activity: 'Initials & finals', questions: qs, big: level() === 'A'});
}
function CharGrid(app){
  const pr = prog('zh').chars; const groups = [...new Set(ZH.chars.map(c => c.group))];
  screen(app, 'Characters', '🀄', h('p', {class: 'muted'}, 'Tap a character to watch its stroke order and practice writing it.'),
    groups.map(g => h('div', {class: 'card'}, h('h3', null, g), h('div', {class: 'char-grid'}, ZH.chars.filter(c => c.group === g).map(c =>
      h('button', {class: 'char-cell' + (pr[c.han] ? ' learned' : ''), 'data-testid': 'char-' + c.han, onclick: () => go(CharDetail, c.han)}, h('span', {class: 'han'}, c.han), h('span', {class: 'py', style: {fontSize: '20px'}}, c.py), h('div', {class: 'small muted'}, c.en)))))));
}
function gridSvg(){ return h('span', {html: '<svg class="grid" viewBox="0 0 300 300" width="300" height="300"><line x1="0" y1="0" x2="300" y2="300" stroke="#f1c5c5" stroke-dasharray="6"/><line x1="300" y1="0" x2="0" y2="300" stroke="#f1c5c5" stroke-dasharray="6"/><line x1="150" y1="0" x2="150" y2="300" stroke="#f1c5c5" stroke-dasharray="6"/><line x1="0" y1="150" x2="300" y2="150" stroke="#f1c5c5" stroke-dasharray="6"/></svg>'}).firstChild; }
function CharDetail(app, han){
  const c = ZH.chars.find(x => x.han === han); const idx = ZH.chars.indexOf(c);
  const box = h('div', {class: 'hw-box', 'data-testid': 'hanzi-box'}, gridSvg()); const target = h('div'); box.append(target);
  const msg = h('div', {class: 'feedback'});
  let writer = null;
  try {
    writer = HanziWriter.create(target, han, {width: 300, height: 300, padding: 18, showOutline: true, strokeColor: '#b0413e', outlineColor: '#e8d5d5', radicalColor: '#d65a5a',
      strokeAnimationSpeed: 0.9, delayBetweenStrokes: 250, drawingWidth: 26, charDataLoader: (ch, done) => done(HANZI[ch])});
  } catch(e) { msg.textContent = 'Stroke animation unavailable. Trace the outline with your finger!'; }
  const learn = () => { if (!prog('zh').chars[han]) { prog('zh').chars[han] = Date.now(); save(); checkBadges(); } };
  screen(app, 'Character', '🀄', h('div', {class: 'two-col'},
    h('div', {class: 'card', style: {textAlign: 'center'}}, box, h('div', {class: 'row center', style: {marginTop: '12px'}},
      h('button', {class: 'btn primary', 'data-testid': 'animate', onclick: () => writer && writer.animateCharacter()}, '▶ Watch strokes'),
      h('button', {class: 'btn green', 'data-testid': 'trace', onclick: () => { if (!writer) return; msg.textContent = 'Draw each stroke in order on the box.'; writer.quiz({showHintAfterMisses: 2,
        onComplete: (d) => { msg.textContent = `🎉 You wrote ${han}! (${d.totalMistakes} oops)`; sfx('win'); learn(); award('zh', 'Wrote ' + han, d.totalMistakes <= 2 ? 1 : 0, 1, {stars: d.totalMistakes <= 2 ? 2 : 1}); }}); }}, '✍️ My turn')), msg),
    h('div', {class: 'card'}, h('div', {class: 'han hanzi-big'}, han), h('div', {class: 'py'}, c.py, ' ', sayBtn(c.audio, han, 'zh-CN', '🔊', {'data-testid': 'char-say'})),
      h('h2', null, c.emoji + ' ' + c.en), h('p', null, h('b', null, `${c.strokes} strokes. `), c.hint), h('p', {class: 'muted small'}, 'Group: ' + c.group),
      h('div', {class: 'row'}, h('button', {class: 'btn', onclick: () => go(CharDetail, ZH.chars[(idx + ZH.chars.length - 1) % ZH.chars.length].han)}, '◀ Prev'),
        h('button', {class: 'btn green', onclick: () => { learn(); toast('Marked as learned ✅'); sfx('ok'); }}, '✅ I know it'),
        h('button', {class: 'btn', onclick: () => go(CharDetail, ZH.chars[(idx + 1) % ZH.chars.length].han)}, 'Next ▶')))));
  setTimeout(() => { zhPlay(c); writer && writer.animateCharacter(); }, 300);
}
function CharQuiz(app){
  const lv = level(); const n = lv === 'A' ? 6 : 10; const nc = lv === 'A' ? 3 : 4;
  const pool = lv === 'A' ? ZH.chars.filter(c => ['Numbers', 'Nature', 'People & size'].includes(c.group)) : ZH.chars;
  const qs = sample(pool, n).map((c, k) => {
    const others = sample(pool, nc - 1, c); const ch = shuffle([c, ...others]); const mode = lv === 'A' ? (k % 2 ? 'py' : 'en') : ['en', 'py', 'han'][k % 3];
    if (mode === 'han') return {prompt: h('div', null, 'Which character means ', h('b', null, `“${c.en}”`), '?'), choices: ch.map(x => h('span', {class: 'han'}, x.han)), choiceClass: 'han', answer: ch.indexOf(c), onRight: () => { zhPlay(c); prog('zh').chars[c.han] = prog('zh').chars[c.han] || Date.now(); }, explain: `${c.han} ${c.py} = ${c.en}`};
    return {prompt: h('div', null, h('div', {class: 'han hanzi-big', style: {fontSize: '110px'}}, c.han), mode === 'en' ? 'What does it mean?' : 'How do you say it?'),
      choices: ch.map(x => mode === 'en' ? x.emoji + ' ' + x.en : x.py), choiceClass: mode === 'py' ? 'py' : '', answer: ch.indexOf(c),
      onRight: () => { zhPlay(c); prog('zh').chars[c.han] = prog('zh').chars[c.han] || Date.now(); }, explain: `${c.han} ${c.py} = ${c.en}`, hint: c.hint};
  });
  screen(app, 'Character Quiz', '❓'); quiz(app, {sec: 'zh', activity: 'Character quiz', questions: qs, big: lv === 'A'});
}
function ZhPhrases(app){
  const cats = [...new Set(ZH.phrases.map(p => p.cat))];
  screen(app, 'Phrases', '💬', h('p', {class: 'muted'}, 'Tap 🔊 to hear each phrase. Say it back out loud!'),
    cats.map(cat => h('div', {class: 'card'}, h('h3', null, cat), ZH.phrases.filter(p => p.cat === cat).map(p => h('div', {class: 'row', style: {borderBottom: '2px solid #f0e7d6', padding: '8px 0'}},
      sayBtn(p.audio, p.han, 'zh-CN', '🔊', {'data-testid': 'phrase-say'}), h('span', {class: 'han', style: {fontSize: '34px'}}, p.han), h('span', {class: 'py', style: {fontSize: '24px'}}, p.py), h('span', null, '= ' + p.en))))),
    h('div', {class: 'row center'}, h('button', {class: 'btn primary', 'data-testid': 'phrase-quiz', onclick: () => go(ZhPhraseQuiz)}, 'Quiz me on phrases ➜')));
}
function ZhPhraseQuiz(app){
  const nc = level() === 'A' ? 3 : 4;
  const qs = sample(ZH.phrases, level() === 'A' ? 5 : 8).map(p => { const ch = shuffle([p, ...sample(ZH.phrases, nc - 1, p)]);
    return {prompt: h('div', null, 'Listen. What does it mean?', h('div', null, sayBtn(p.audio, p.han, 'zh-CN', '🔊 Again')), level() === 'A' ? h('div', {class: 'han', style: {fontSize: '40px'}}, p.han, ' ', h('span', {class: 'py'}, p.py)) : null),
      audio: () => play(p.audio, p.han, 'zh-CN'), choices: ch.map(x => x.en), answer: ch.indexOf(p), explain: `${p.han} (${p.py}) = ${p.en}`}; });
  screen(app, 'Phrase Quiz', '💬'); quiz(app, {sec: 'zh', activity: 'Phrase listening', questions: qs, big: level() === 'A'});
}
function ZhListen(app){
  const nc = level() === 'A' ? 3 : 4;
  const qs = sample(ZH.listen, level() === 'A' ? 6 : 10).map(w => { const ch = shuffle([w, ...sample(ZH.listen, nc - 1, w)]);
    return {prompt: h('div', null, '👂 Listen and tap the picture', h('div', null, sayBtn(w.audio, w.han, 'zh-CN', '🔊 Play again', {'data-testid': 'listen-play'}))), audio: () => play(w.audio, w.han, 'zh-CN'),
      choices: ch.map(x => x.emoji), choiceClass: 'emoji', answer: ch.indexOf(w), explain: h('span', null, h('span', {class: 'han', style: {fontSize: '30px'}}, w.han), ` ${w.py} = ${w.en}`)}; });
  screen(app, 'Listening', '👂'); quiz(app, {sec: 'zh', activity: 'Listening', questions: qs, big: true});
}
