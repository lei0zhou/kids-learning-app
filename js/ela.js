/* English Language Arts: reading, vocabulary, spelling, sentence building. */
function ElaHub(app){
  const pr = prog('ela');
  screen(app, 'Reading & Words', '📖', tiles([
    {icon: '📚', title: 'Story Time', sub: `${Object.keys(pr.passages || {}).length} / ${ELA.passages.length} passages read`, color: '#e8835a', onclick: () => go(ReadingList), id: 'ela-reading'},
    {icon: '🧩', title: 'Word Match', sub: 'Match words to meanings', color: '#70c1b3', onclick: () => go(VocabMatch), id: 'ela-match'},
    {icon: '🔎', title: 'Context Clues', sub: 'Which word fits?', color: '#5fa8d3', onclick: () => go(VocabContext), id: 'ela-context'},
    {icon: '🔁', title: 'Same & Opposite', sub: 'Synonyms and antonyms', color: '#a78bfa', onclick: () => go(SynAnt), id: 'ela-synant'},
    {icon: '🐝', title: 'Spelling Bee', sub: 'Hear it, spell it', color: '#e0a526', onclick: () => go(SpellList), id: 'ela-spell'},
    {icon: '🧱', title: 'Sentence Builder', sub: 'Put the words in order', color: '#7fb069', onclick: () => go(SentenceBuilder), id: 'ela-build'},
    {icon: '✏️', title: 'Fix It!', sub: 'Capitals and end marks', color: '#f25f5c', onclick: () => go(FixIt), id: 'ela-fix'},
  ]));
}
function ReadingList(app){
  const pr = prog('ela').passages || {};
  const lv = level(); const list = ELA.passages.slice().sort((a, b) => lv === 'A' ? a.grade - b.grade : b.grade - a.grade);
  screen(app, 'Story Time', '📚', h('p', {class: 'muted'}, lv === 'A' ? 'Grade 2 stories are first. Try a grade 3 story when you are ready!' : 'Grade 4 stories are first. Challenge yourself!'),
    tiles(list.map(p => ({icon: p.emoji, title: p.title, sub: `Grade ${p.grade} · ${p.kind}${pr[p.id] != null ? ' · ✅ ' + pr[p.id] + '/' + p.qs.length : ''}`,
      color: p.kind === 'Fiction' ? '#e8835a' : '#5fa8d3', onclick: () => go(Reader, p.id), id: 'passage-' + p.id}))));
}
function markText(text, clue){
  let html = esc(text);
  if (clue) { const c = esc(clue); const i = html.indexOf(c); if (i >= 0) html = html.slice(0, i) + '<mark>' + c + '</mark>' + html.slice(i + c.length); }
  return html.split(/(?<=[.!?]"?)\s+(?=[A-Z"])/).join(' ');
}
function Reader(app, id){
  const p = ELA.passages.find(x => x.id === id);
  const para = h('div', {class: 'passage', 'data-testid': 'passage', html: markText(p.text)});
  const readBtn = h('button', {class: 'btn say', 'data-testid': 'read-aloud', onclick: () => {
    const hasVoice = window.speechSynthesis && speechSynthesis.getVoices().some(v => /^en/i.test(v.lang));
    if (hasVoice) speak(p.title + '. ' + p.text, 'en-US', 0.9); else play(ELA.passageAudio[p.id], p.text, 'en-US');
  }}, '🔊 Read to me');
  const stopBtn = h('button', {class: 'btn', onclick: stopAudio}, '⏹ Stop');
  const left = h('div', {class: 'card sticky'}, h('div', null, h('span', {class: 'tag'}, 'Grade ' + p.grade), h('span', {class: 'tag'}, p.kind), h('span', {class: 'tag'}, p.words + ' words')),
    h('h2', null, p.emoji + ' ' + p.title), h('div', {class: 'row'}, readBtn, stopBtn), para);
  const right = h('div');
  screen(app, 'Story Time', '📚', h('div', {class: 'two-col'}, left, right));
  let qi = 0, score = 0;
  function showQ(){
    right.innerHTML = '';
    if (qi >= p.qs.length) return finish();
    const q = p.qs[qi], fb = h('div', {class: 'feedback'}); let missed = false, done = false;
    para.innerHTML = markText(p.text);
    right.append(h('div', {class: 'card'}, h('div', {class: 'qhead'}, h('span', {class: 'qnum'}, `Question ${qi + 1} of ${p.qs.length}`), h('span', {class: 'tag'}, q.type)),
      h('h3', null, q.q),
      h('div', {class: 'choices', style: {gridTemplateColumns: '1fr'}}, q.choices.map((c, k) => h('button', {class: 'btn choice', 'data-correct': k === q.answer ? '1' : null, onclick: (e) => {
        if (done) return;
        para.innerHTML = markText(p.text, q.clue);
        if (k === q.answer) { done = true; if (!missed) score++; e.currentTarget.classList.add('right'); sfx('ok');
          fb.innerHTML = ''; fb.append(h('b', null, '✅ Yes! '), q.why, h('div', {class: 'small muted'}, 'The highlighted words in the story show it.'));
          right.firstChild.append(h('button', {class: 'btn primary next', 'data-testid': 'next', onclick: () => { qi++; showQ(); }}, qi + 1 < p.qs.length ? 'Next question ➜' : 'Finish 🎉'));
        } else { missed = true; e.currentTarget.classList.add('wrong'); e.currentTarget.disabled = true; sfx('no');
          fb.innerHTML = ''; fb.append(h('b', null, 'Not quite. '), 'Look at the highlighted part of the story, then try again.'); }
      }}, c))), fb));
  }
  function finish(){
    const pr = prog('ela'); pr.passages[p.id] = Math.max(pr.passages[p.id] || 0, score);
    const stars = award('ela', 'Reading: ' + p.title, score, p.qs.length);
    right.append(h('div', {class: 'done-card'}, h('div', {class: 'big-emoji'}, stars >= 3 ? '🏆' : '🎉'), h('h2', null, 'Story complete!'),
      h('p', {class: 'score', 'data-testid': 'score'}, `${score} / ${p.qs.length} on the first try`), h('p', {class: 'stars-earned'}, '⭐'.repeat(stars)),
      h('button', {class: 'btn primary', 'data-testid': 'quiz-done', onclick: back}, 'More stories')));
  }
  showQ();
}
function VocabMatch(app){
  const words = sample(ELA.vocab, level() === 'A' ? 4 : 6);
  const meanings = shuffle(words); let sel = null, matched = 0, misses = 0;
  const L = h('div', {class: 'choices', style: {gridTemplateColumns: '1fr'}}), R = h('div', {class: 'choices', style: {gridTemplateColumns: '1fr'}});
  words.forEach(w => L.append(h('button', {class: 'btn choice', 'data-word': w.word, onclick: (e) => { if (e.currentTarget.disabled) return; [...L.children].forEach(b => b.classList.remove('sel-word')); sel = w; e.currentTarget.classList.add('sel-word'); e.currentTarget.style.outline = '4px solid #3b82f6'; [...L.children].forEach(b => { if (b !== e.currentTarget) b.style.outline = ''; }); sfx('click'); }}, w.word)));
  meanings.forEach(w => R.append(h('button', {class: 'btn choice', 'data-meaning-of': w.word, style: {fontSize: '19px', textAlign: 'left'}, onclick: (e) => {
    if (!sel) { toast('First tap a word on the left'); return; }
    const b = e.currentTarget;
    if (sel.word === w.word) { sfx('ok'); b.classList.add('right'); b.disabled = true; const lb = L.querySelector(`[data-word="${sel.word}"]`); lb.classList.add('right'); lb.disabled = true; lb.style.outline = ''; sel = null; matched++;
      if (matched === words.length) { const stars = award('ela', 'Vocabulary match', words.length - Math.min(misses, words.length), words.length); setTimeout(() => go(VocabMatch), 1600); toast(`All matched! ${'⭐'.repeat(stars)}`); } }
    else { sfx('no'); misses++; b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 600); }
  }}, w.meaning)));
  screen(app, 'Word Match', '🧩', h('p', null, 'Tap a word, then tap what it means.'), h('div', {class: 'two-col'}, h('div', {class: 'card'}, h('h3', null, 'Words'), L), h('div', {class: 'card'}, h('h3', null, 'Meanings'), R)));
}
function VocabContext(app){
  const n = level() === 'A' ? 5 : 8; const nc = level() === 'A' ? 3 : 4;
  const qs = sample(ELA.vocab, n).map(v => { const ch = shuffle([v, ...sample(ELA.vocab, nc - 1, v)]);
    return {prompt: v.sentence.replace('___', '_____'), choices: ch.map(c => c.word), answer: ch.indexOf(v), explain: `“${v.word}” means ${v.meaning}.`, hint: 'Read the whole sentence. Which word makes sense?'}; });
  screen(app, 'Context Clues', '🔎'); quiz(app, {sec: 'ela', activity: 'Vocabulary in context', questions: qs, big: level() === 'A'});
}
function SynAnt(app){
  const n = level() === 'A' ? 6 : 10;
  const qs = shuffle([...ELA.syn.map(x => ({...x, kind: 'same'})), ...ELA.ant.map(x => ({...x, kind: 'opp'}))]).slice(0, n).map(x => {
    const ch = shuffle([x.answer, ...x.others.slice(0, level() === 'A' ? 2 : 2)]);
    return {prompt: h('span', null, x.kind === 'same' ? 'Which word means the SAME as ' : 'Which word means the OPPOSITE of ', h('b', null, `“${x.word}”`), '?'),
      choices: ch, answer: ch.indexOf(x.answer), explain: `${x.word} ${x.kind === 'same' ? '≈' : '↔'} ${x.answer}`, hint: x.kind === 'same' ? 'Synonyms are words that mean almost the same thing.' : 'Antonyms are opposites, like up and down.'};
  });
  screen(app, 'Same & Opposite', '🔁'); quiz(app, {sec: 'ela', activity: 'Synonyms & antonyms', questions: qs, big: level() === 'A'});
}
function SpellList(app){
  const lv = level();
  screen(app, 'Spelling Bee', '🐝', h('p', {class: 'muted'}, 'Listen to the word, then type it. Hints help if you get stuck.'),
    tiles(ELA.spelling.filter(l => lv === 'B' || l.grade <= 3).map(l => ({icon: l.grade === 2 ? '🌱' : l.grade === 3 ? '🌿' : '🌳', title: l.title, sub: `Grade ${l.grade} · ${l.pattern}`, color: '#e0a526', onclick: () => go(Spell, l.id), id: 'spell-' + l.id}))));
}
function Spell(app, id){
  const list = ELA.spelling.find(l => l.id === id); const words = shuffle(list.words).slice(0, level() === 'A' ? 5 : 8);
  let i = 0, score = 0;
  const box = h('div', {class: 'card', style: {textAlign: 'center'}});
  screen(app, 'Spelling: ' + list.title, '🐝', box);
  function show(){
    const w = words[i]; let tries = 0; box.innerHTML = '';
    const inp = h('input', {type: 'text', class: 'big-input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'data-testid': 'spell-input', 'aria-label': 'Type the word'});
    const fb = h('div', {class: 'feedback'}), hint = h('div', {class: 'feedback', style: {fontSize: '28px', letterSpacing: '4px'}});
    const hear = () => play(w.audio, `${w.word}. ${w.sentence} ${w.word}.`, 'en-US');
    const check = () => {
      const v = inp.value.trim().toLowerCase(); if (!v) return;
      if (v === w.word) { sfx('ok'); if (tries === 0) score++; prog('ela').spellRight = (prog('ela').spellRight || 0) + (tries < 2 ? 1 : 0); save();
        fb.innerHTML = ''; fb.append(h('b', null, '🎉 Correct! '), h('span', null, w.word)); inp.disabled = true;
        box.append(h('button', {class: 'btn primary next', 'data-testid': 'next', onclick: () => { i++; i < words.length ? show() : finish(); }}, i + 1 < words.length ? 'Next word ➜' : 'Finish 🎉'));
      } else { tries++; sfx('no');
        const gentle = ['So close! Listen again and try once more.', 'Good try! Here is a hint.', 'Almost! Copy the word to practice it.'];
        fb.textContent = gentle[Math.min(tries - 1, 2)];
        if (tries === 1) hint.textContent = `Pattern: ${list.pattern}. It has ${w.word.length} letters: ` + '_ '.repeat(w.word.length);
        else if (tries === 2) hint.textContent = w.word.split('').map((c, k) => k === 0 || !'aeiou'.includes(c) ? c : '_').join(' ');
        else hint.textContent = w.word.split('').join(' ');
        inp.select(); if (tries <= 2) hear();
      }
    };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    box.append(h('p', {class: 'qnum'}, `Word ${i + 1} of ${words.length}`), h('div', {class: 'row center'}, h('button', {class: 'btn say', 'data-testid': 'hear-word', onclick: hear, style: {fontSize: '28px'}}, '🔊 Hear the word'),
      h('button', {class: 'btn', onclick: () => speak(w.word, 'en-US', 0.6)}, '🐢 Slow')), h('p', null, inp), h('button', {class: 'btn primary', 'data-testid': 'spell-check', onclick: check}, 'Check ✔'), hint, fb);
    setTimeout(() => { hear(); inp.focus(); }, 250);
  }
  function finish(){ const st = award('ela', 'Spelling: ' + list.title, score, words.length); box.innerHTML = '';
    box.append(h('div', {class: 'done-card'}, h('div', {class: 'big-emoji'}, '🐝'), h('h2', null, 'Spelling round done!'), h('p', {class: 'score', 'data-testid': 'score'}, `${score} / ${words.length} on the first try`), h('p', {class: 'stars-earned'}, '⭐'.repeat(st)), h('button', {class: 'btn primary', 'data-testid': 'quiz-done', onclick: back}, 'Done'))); }
  show();
}
/* Draggable / tappable word tiles shared by sentence builder and Chat Corner. */
function tileBoard(words, {onChange} = {}){
  const line = h('div', {class: 'answer-line', 'data-testid': 'answer-line', 'aria-label': 'Your sentence'}), bank = h('div', {class: 'wordbank', 'data-testid': 'word-bank'});
  words.forEach((w, k) => bank.append(mk(w, k)));
  function mk(w, k){
    const t = h('button', {class: 'wtile', 'data-w': w, 'data-k': k}, w);
    let sx, sy, drag = null;
    t.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; t.setPointerCapture(e.pointerId); });
    t.addEventListener('pointermove', e => {
      if (sx == null) return;
      if (!drag && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) { drag = t.cloneNode(true); drag.classList.add('drag-name'); document.body.append(drag); t.classList.add('dragging'); }
      if (drag) { drag.style.left = e.clientX - 30 + 'px'; drag.style.top = e.clientY - 25 + 'px'; }
    });
    t.addEventListener('pointerup', e => {
      if (sx == null) return; sx = null;
      if (drag) { drag.remove(); drag = null; t.classList.remove('dragging');
        const el = document.elementFromPoint(e.clientX, e.clientY); const tgtTile = el && el.closest('.wtile'); const zone = el && (el.closest('.answer-line') || el.closest('.wordbank'));
        if (zone) { if (tgtTile && tgtTile !== t && tgtTile.parentNode === zone) zone.insertBefore(t, tgtTile); else zone.append(t); sfx('click'); onChange && onChange(); }
      } else { (t.parentNode === bank ? line : bank).append(t); sfx('click'); onChange && onChange(); }
    });
    return t;
  }
  return {line, bank, value: () => [...line.children].map(t => t.dataset.w).join(' '), reset: () => [...line.children].forEach(t => bank.append(t))};
}
function SentenceBuilder(app){
  const pool = ELA.sentences.filter(s => level() === 'B' || s.split(' ').length <= 7);
  const set = shuffle(pool).slice(0, level() === 'A' ? 4 : 6); let i = 0, score = 0;
  const box = h('div', {class: 'card'}); screen(app, 'Sentence Builder', '🧱', h('p', null, 'Tap the words in order (or drag them) to build a sentence. Tap a word again to send it back.'), box);
  function show(){
    const s = set[i]; let tries = 0; box.innerHTML = '';
    let words = s.split(' '); let sh; do { sh = shuffle(words); } while (sh.join(' ') === s && words.length > 1);
    const tb = tileBoard(sh); const fb = h('div', {class: 'feedback'});
    box.append(h('p', {class: 'qnum'}, `Sentence ${i + 1} of ${set.length}`), tb.line, h('p'), tb.bank, h('div', {class: 'row center', style: {marginTop: '14px'}},
      h('button', {class: 'btn', onclick: tb.reset}, '↺ Start over'), h('button', {class: 'btn say', onclick: () => speak(tb.value() || 'Build your sentence first', 'en-US')}, '🔊 Read mine'),
      h('button', {class: 'btn primary', 'data-testid': 'sentence-check', onclick: () => {
        const v = tb.value();
        if (v === s) { sfx('ok'); if (!tries) score++; prog('ela').built = (prog('ela').built || 0) + 1; save(); fb.innerHTML = '<b>🎉 Perfect sentence!</b>';
          box.append(h('button', {class: 'btn primary next', 'data-testid': 'next', onclick: () => { i++; i < set.length ? show() : finish(); }}, i + 1 < set.length ? 'Next ➜' : 'Finish 🎉'));
        } else { tries++; sfx('no'); const first = s.split(' ')[0];
          fb.textContent = !v.startsWith(first) ? `Hint: a sentence starts with a capital letter. Try starting with “${first}”.` : v.split(' ').length < words.length ? 'Use all the words, and the one with the end mark goes last.' : 'Read it out loud. Does it sound right? Try moving a word.'; }
      }}, 'Check ✔')), fb);
  }
  function finish(){ const st = award('ela', 'Sentence builder', score, set.length); box.innerHTML = '';
    box.append(h('div', {class: 'done-card'}, h('div', {class: 'big-emoji'}, '🧱'), h('h2', null, 'Master builder!'), h('p', {class: 'score', 'data-testid': 'score'}, `${score} / ${set.length} on the first try`), h('p', {class: 'stars-earned'}, '⭐'.repeat(st)), h('button', {class: 'btn primary', 'data-testid': 'quiz-done', onclick: back}, 'Done'))); }
  show();
}
function FixIt(app){
  const set = shuffle(ELA.fixes).slice(0, level() === 'A' ? 4 : 7); let i = 0, score = 0;
  const box = h('div', {class: 'card'}); screen(app, 'Fix It!', '✏️', h('p', null, 'Tap each word that needs a capital letter. Then pick the right end mark.'), box);
  const capFirst = w => w.charAt(0).toUpperCase() + w.slice(1);
  function show(){
    const f = set[i]; let tries = 0, mark = null; box.innerHTML = '';
    const words = f.wrong.split(' '); const target = f.right.slice(0, -1).split(' '); const endMark = f.right.slice(-1);
    const row = h('div', {class: 'answer-line'}, words.map((w, k) => h('button', {class: 'wtile', 'data-k': k, onclick: (e) => { const b = e.currentTarget; const on = b.classList.toggle('cap'); b.textContent = on ? capFirst(w) : w; sfx('click'); }}, w)));
    const markBtn = h('span', {class: 'wtile', style: {minWidth: '50px'}}, '?');
    const marks = h('div', {class: 'row center'}, ['.', '?', '!'].map(m => h('button', {class: 'btn', style: {fontSize: '34px', minWidth: '80px'}, 'data-mark': m, onclick: () => { mark = m; markBtn.textContent = m; sfx('click'); }}, m)));
    row.append(markBtn); const fb = h('div', {class: 'feedback'});
    box.append(h('p', {class: 'qnum'}, `Sentence ${i + 1} of ${set.length}`), row, h('p', {class: 'muted small', style: {textAlign: 'center'}}, 'End mark:'), marks,
      h('div', {class: 'row center', style: {marginTop: '12px'}}, h('button', {class: 'btn primary', 'data-testid': 'fix-check', onclick: () => {
        const got = [...row.querySelectorAll('[data-k]')].map(b => b.textContent);
        const capsOk = got.every((w, k) => w === target[k]);
        if (capsOk && mark === endMark) { sfx('ok'); if (!tries) score++; fb.innerHTML = '<b>🎉 Fixed!</b> ' + esc(f.right);
          box.append(h('button', {class: 'btn primary next', 'data-testid': 'next', onclick: () => { i++; i < set.length ? show() : finish(); }}, i + 1 < set.length ? 'Next ➜' : 'Finish 🎉'));
        } else { tries++; sfx('no');
          fb.textContent = !capsOk ? 'Check the capitals: the first word, the word “I”, and names of people, places, days and months.' : 'Capitals look great! Now think: is it telling, asking, or excited?'; }
      }}, 'Check ✔')), fb);
  }
  function finish(){ const st = award('ela', 'Capitalization & punctuation', score, set.length); box.innerHTML = '';
    box.append(h('div', {class: 'done-card'}, h('div', {class: 'big-emoji'}, '✏️'), h('h2', null, 'Editor extraordinaire!'), h('p', {class: 'score'}, `${score} / ${set.length} on the first try`), h('p', {class: 'stars-earned'}, '⭐'.repeat(st)), h('button', {class: 'btn primary', 'data-testid': 'quiz-done', onclick: back}, 'Done'))); }
  show();
}
