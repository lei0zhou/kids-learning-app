/* Spanish: pronunciation, vocabulary, phrases, listening, grammar (Level B), typing with accents. */
const esPlay = it => play(it.audio, it.es, 'es-MX');
const esWords = () => level() === 'A' ? ES.words.filter(w => w.a) : ES.words;
const bare = s => s.replace(/^(el|la|los|las) /, '');
function esRound(){ prog('es').rounds = (prog('es').rounds || 0) + 1; save(); }
function EsHub(app){
  const lv = level();
  const t = [
    {icon: '👄', title: 'Sounds', sub: 'Vowels, ñ, rr, ll, accents', color: '#e0a526', onclick: () => go(EsSounds), id: 'es-sounds'},
    {icon: '👂', title: 'Hear & Pick', sub: 'perro or pero?', color: '#e8835a', onclick: () => go(EsPairs), id: 'es-pairs'},
    {icon: '🃏', title: 'Word Cards', sub: `${esWords().length} words in ${[...new Set(esWords().map(w => w.cat))].length} groups`, color: '#7fb069', onclick: () => go(EsCards), id: 'es-cards'},
    {icon: '❓', title: 'Word Quiz', sub: 'Spanish ↔ English', color: '#5fa8d3', onclick: () => go(EsWordQuiz), id: 'es-quiz'},
    {icon: '💬', title: 'Phrases', sub: 'Hola, gracias, me llamo…', color: '#a78bfa', onclick: () => go(EsPhrases), id: 'es-phrases'},
    {icon: '🎧', title: 'Listening', sub: lv === 'A' ? 'Hear a word, pick the meaning' : 'Hear a sentence, pick the meaning', color: '#70c1b3', onclick: () => go(EsListen), id: 'es-listen'},
  ];
  if (lv === 'B') t.push(
    {icon: '⚖️', title: 'el or la?', sub: 'Noun gender & articles', color: '#f25f5c', onclick: () => go(EsGender), id: 'es-gender'},
    {icon: '🔧', title: 'Verbs', sub: 'ser, estar, tener, gustar', color: '#d65a5a', onclick: () => go(EsVerbs), id: 'es-verbs'},
    {icon: '⌨️', title: 'Type It', sub: 'Spell with á é í ó ú ñ', color: '#8a7b63', onclick: () => go(EsType), id: 'es-type'},
    {icon: '🌎', title: 'Countries', sub: 'Where people speak Spanish', color: '#4f8fc0', onclick: () => go(EsCountries), id: 'es-countries'});
  screen(app, 'Spanish', '🌮', lv === 'A' ? h('p', {class: 'muted'}, 'Level A: 44 starter words and simple phrases. Switch to Level B for grammar, typing and 135 words.') : null, tiles(t));
}
function EsSounds(app){
  screen(app, 'Spanish Sounds', '👄', ES.pron.map(p => h('div', {class: 'card'}, h('h3', null, p.title), h('p', null, p.tip),
    h('div', {class: 'row'}, p.items.map(it => h('div', {class: 'card', style: {margin: 0, textAlign: 'center', minWidth: '150px'}}, h('div', {style: {fontSize: '36px', fontWeight: 800}}, it.sound), h('div', {class: 'small muted'}, it.says),
      h('div', {style: {fontSize: '26px'}}, it.word), sayBtn(it.audio, it.word, 'es-MX', '🔊', {'data-testid': 'es-say'})))))));
}
function EsPairs(app){
  const qs = shuffle(ES.pairs).slice(0, level() === 'A' ? 4 : 6).map(pair => { const it = pick(pair);
    return {prompt: h('div', null, 'Which word do you hear?', h('div', null, sayBtn(it.audio, it.es, 'es-MX', '🔊 Again'))), audio: () => esPlay(it),
      choices: pair.map(x => h('span', null, h('b', {style: {fontSize: '30px'}}, x.es), h('br'), h('span', {class: 'small'}, x.en))), answer: pair.indexOf(it),
      explain: 'Listen again to both: ', onRight: () => {}, hint: 'Listen for a rolled rr, an ñ (ny), or which part is loudest.'}; });
  screen(app, 'Hear & Pick', '👂'); quiz(app, {sec: 'es', activity: 'Sound pairs', questions: qs, big: true, onDone: esRound});
}
function EsCards(app){
  const words = esWords(); const cats = [...new Set(words.map(w => w.cat))];
  screen(app, 'Word Cards', '🃏', cats.map(c => h('div', {class: 'card'}, h('h3', null, c), h('div', {class: 'char-grid', style: {gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))'}},
    words.filter(w => w.cat === c).map(w => h('button', {class: 'char-cell', onclick: () => esPlay(w)}, h('div', {style: {fontSize: '24px', fontWeight: 800}}, w.es),
      h('div', {class: 'small muted'}, w.en + (w.g === 'f*' ? ' (feminine, but uses el)' : ''))))))));
}
function EsWordQuiz(app){
  const words = esWords(); const nc = level() === 'A' ? 3 : 4; const n = level() === 'A' ? 6 : 10;
  const qs = sample(words, n).map((w, k) => { const ch = shuffle([w, ...sample(words.filter(x => x.cat === w.cat || Math.random() < .3), nc - 1, w)]);
    const toEn = level() === 'A' || k % 2 === 0;
    return toEn ? {prompt: h('div', null, h('div', {style: {fontSize: '44px', fontWeight: 800}}, w.es), sayBtn(w.audio, w.es, 'es-MX'), h('div', null, 'What does it mean?')), audio: () => esPlay(w), choices: ch.map(x => x.en), answer: ch.indexOf(w), explain: `${w.es} = ${w.en}`}
      : {prompt: h('div', null, 'How do you say ', h('b', null, `“${w.en}”`), ' in Spanish?'), choices: ch.map(x => x.es), answer: ch.indexOf(w), onRight: () => esPlay(w), explain: `${w.en} = ${w.es}`};
  });
  screen(app, 'Word Quiz', '❓'); quiz(app, {sec: 'es', activity: 'Word quiz', questions: qs, big: level() === 'A', onDone: esRound});
}
function EsPhrases(app){
  const list = ES.phrases.filter(p => level() === 'B' || p.a); const cats = [...new Set(list.map(p => p.cat))];
  screen(app, 'Phrases', '💬', cats.map(c => h('div', {class: 'card'}, h('h3', null, c), list.filter(p => p.cat === c).map(p => h('div', {class: 'row', style: {borderBottom: '2px solid #f0e7d6', padding: '8px 0'}},
    sayBtn(p.audio, p.es, 'es-MX', '🔊', {'data-testid': 'es-phrase-say'}), h('b', {style: {fontSize: '26px'}}, p.es), h('span', null, '= ' + p.en))))),
    h('div', {class: 'row center'}, h('button', {class: 'btn primary', onclick: () => go(EsPhraseQuiz)}, 'Quiz me on phrases ➜')));
}
function EsPhraseQuiz(app){
  const list = ES.phrases.filter(p => level() === 'B' || p.a); const nc = level() === 'A' ? 3 : 4;
  const qs = sample(list, level() === 'A' ? 5 : 8).map(p => { const ch = shuffle([p, ...sample(list, nc - 1, p)]);
    return {prompt: h('div', null, h('div', {style: {fontSize: '34px', fontWeight: 800}}, p.es), sayBtn(p.audio, p.es, 'es-MX'), h('div', null, 'What does it mean?')), audio: () => esPlay(p), choices: ch.map(x => x.en), answer: ch.indexOf(p), explain: `${p.es} = ${p.en}`}; });
  screen(app, 'Phrase Quiz', '💬'); quiz(app, {sec: 'es', activity: 'Phrase quiz', questions: qs, big: level() === 'A', onDone: esRound});
}
function EsListen(app){
  let qs;
  if (level() === 'A') qs = sample(esWords(), 6).map(w => { const ch = shuffle([w, ...sample(esWords(), 2, w)]);
    return {prompt: h('div', null, '🎧 Listen! What did you hear?', h('div', null, sayBtn(w.audio, w.es, 'es-MX', '🔊 Again', {'data-testid': 'es-listen-play'}))), audio: () => esPlay(w), choices: ch.map(x => x.en), answer: ch.indexOf(w), explain: `${w.es} = ${w.en}`}; });
  else qs = shuffle(ES.sentences).slice(0, 6).map(s => { const ch = shuffle([s, ...sample(ES.sentences, 3, s)]);
    return {prompt: h('div', null, '🎧 Listen to the sentence. What does it mean?', h('div', null, sayBtn(s.audio, s.es, 'es-MX', '🔊 Again'))), audio: () => esPlay(s), choices: ch.map(x => x.en), answer: ch.indexOf(s), explain: `${s.es} = ${s.en}`}; });
  screen(app, 'Listening', '🎧'); quiz(app, {sec: 'es', activity: 'Listening', questions: qs, big: level() === 'A', onDone: esRound});
}
function EsGender(app){
  const nouns = ES.words.filter(w => w.g === 'm' || w.g === 'f');
  const qs = sample(nouns, 10).map((w, k) => { const plural = /^(los|las) /.test(w.es); const word = bare(w.es); const m = w.g === 'm';
    const indefinite = !plural && k % 2; const opts = plural ? ['los', 'las'] : indefinite ? ['un', 'una'] : ['el', 'la']; const ans = m ? 0 : 1;
    return {prompt: h('div', null, h('div', {style: {fontSize: '40px', fontWeight: 800}}, '___ ' + word), `(${w.en})`), choices: opts, answer: ans,
      explain: `${opts[ans]} ${word}: ${m ? 'masculine' : 'feminine'}.` + (word.endsWith('a') && m ? ' Watch out: this one ends in -a but is masculine!' : word.endsWith('o') && !m ? ' Tricky: it ends in -o but is feminine!' : ''),
      hint: 'Most words ending in -o are masculine (el/un), and most ending in -a are feminine (la/una).', onRight: () => esPlay(w)}; });
  screen(app, 'el or la?', '⚖️'); quiz(app, {sec: 'es', activity: 'Gender & articles', questions: qs, onDone: esRound});
}
function EsVerbs(app){
  screen(app, 'Verbs', '🔧', h('div', {class: 'tiles', style: {gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))'}}, ES.verbs.map(v => h('div', {class: 'card'}, h('h3', null, v.verb, h('span', {class: 'small muted'}, ' · ' + v.en)),
    h('table', {class: 'dash'}, v.forms.map(f => h('tr', null, h('td', {style: {textAlign: 'left'}}, f.who), h('td', null, h('b', null, f.form))))),
    v.ex.map(e => h('p', {class: 'small'}, sayBtn(e.audio, e.es, 'es-MX'), ' ', h('b', null, e.es), ' ', e.en))))),
    h('div', {class: 'row center'}, h('button', {class: 'btn primary', 'data-testid': 'verb-quiz', onclick: () => go(EsVerbQuiz)}, 'Verb quiz ➜')));
}
function EsVerbQuiz(app){
  const qs = shuffle(ES.serEstar).slice(0, 4).map(q => { const opts = shuffle(['es', 'está', 'soy', 'estoy', 'somos', 'eres', 'están'].filter(x => x !== q.answer)).slice(0, 3); const ch = shuffle([q.answer, ...opts]);
    return {prompt: q.q.replace('___', '_____'), choices: ch, answer: ch.indexOf(q.answer), explain: q.why}; });
  ES.verbs.forEach(v => { const f = pick(v.forms); const ch = shuffle([f, ...sample(v.forms, 2, f)]);
    qs.push({prompt: h('div', null, h('b', null, v.verb), ` (${v.en}): `, h('b', null, f.who), ' → ?'), choices: ch.map(x => x.form), answer: ch.indexOf(f), explain: `${f.who} ${f.form}`}); });
  screen(app, 'Verb Quiz', '🔧'); quiz(app, {sec: 'es', activity: 'Verb forms', questions: shuffle(qs), onDone: esRound});
}
function accentBar(inp){ return h('div', {class: 'keys'}, ['á','é','í','ó','ú','ñ','ü','¿','¡'].map(k => h('button', {class: 'btn', 'data-key': k, onclick: () => { const s = inp.selectionStart ?? inp.value.length; inp.value = inp.value.slice(0, s) + k + inp.value.slice(inp.selectionEnd ?? s); inp.focus(); inp.setSelectionRange(s + 1, s + 1); }}, k))); }
function EsType(app){
  const pool = ES.words.filter(w => /[áéíóúñ]/.test(w.es)).concat(sample(ES.words.filter(w => !/[áéíóúñ]/.test(w.es)), 6));
  const set = sample(pool, 8); let i = 0, score = 0; const box = h('div', {class: 'card', style: {textAlign: 'center'}});
  screen(app, 'Type It', '⌨️', box);
  const strip = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function show(){
    const w = set[i]; let tries = 0; box.innerHTML = '';
    const inp = h('input', {type: 'text', class: 'big-input', autocomplete: 'off', spellcheck: 'false', 'data-testid': 'es-type-input', 'aria-label': 'Type in Spanish'}); const fb = h('div', {class: 'feedback'});
    const check = () => { const v = inp.value.trim().toLowerCase(); const target = w.es.toLowerCase();
      if (v === target || v === bare(target)) { sfx('ok'); if (!tries) score++; fb.innerHTML = `<b>🎉 ¡Muy bien!</b> ${esc(w.es)}`; esPlay(w); inp.disabled = true;
        box.append(h('button', {class: 'btn primary next', 'data-testid': 'next', onclick: () => { i++; i < set.length ? show() : finish(); }}, i + 1 < set.length ? 'Next ➜' : 'Finish 🎉')); }
      else if (strip(v) === strip(target) || strip(v) === strip(bare(target))) { tries++; sfx('no'); fb.textContent = 'So close! Just add the accent mark (use the buttons).'; }
      else { tries++; sfx('no'); fb.textContent = tries >= 2 ? `It is: ${w.es}. Type it to practice!` : 'Not quite. Listen again!'; esPlay(w); } };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    box.append(h('p', {class: 'qnum'}, `Word ${i + 1} of ${set.length}`), h('h2', null, `“${w.en}”`), sayBtn(w.audio, w.es, 'es-MX', '🔊 Hear it'), h('p', null, inp), accentBar(inp), h('button', {class: 'btn primary', onclick: check}, 'Check ✔'), h('p', {class: 'small muted'}, 'You can leave out el/la.'), fb);
    inp.focus();
  }
  function finish(){ const st = award('es', 'Typing with accents', score, set.length); esRound(); box.innerHTML = ''; box.append(h('div', {class: 'done-card'}, h('div', {class: 'big-emoji'}, '⌨️'), h('h2', null, '¡Excelente!'), h('p', {class: 'score'}, `${score} / ${set.length}`), h('p', {class: 'stars-earned'}, '⭐'.repeat(st)), h('button', {class: 'btn primary', 'data-testid': 'quiz-done', onclick: back}, 'Done'))); }
  show();
}
function EsCountries(app){
  const qs = shuffle(ES.countries).slice(0, 6).map((c, k) => { const ch = shuffle([c, ...sample(ES.countries, 3, c)]);
    return k % 2 ? {prompt: h('div', null, h('div', {style: {fontSize: '70px'}}, c.flag), 'Which Spanish-speaking country has this flag?'), choices: ch.map(x => x.name), answer: ch.indexOf(c), explain: `${c.flag} ${c.name}, capital ${c.capital}`}
      : {prompt: h('div', null, 'What is the capital of ', h('b', null, c.name), ' ', c.flag, '?'), choices: ch.map(x => x.capital), answer: ch.indexOf(c), explain: `The capital of ${c.name} is ${c.capital}.`}; });
  screen(app, 'Countries', '🌎', h('p', {class: 'muted'}, 'Spanish is spoken in more than 20 countries! Country names are written in Spanish.')); quiz(app, {sec: 'es', activity: 'Spanish-speaking countries', questions: qs, onDone: esRound});
}
