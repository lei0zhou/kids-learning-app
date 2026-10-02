/* Home: profile picker and section hub. */
function Home(app){
  const p = kid();
  if (!p) return ProfilePicker(app);
  app.append(h('div', {class: 'hero card'}, mascot(96), h('div', {class: 'bubble'},
    h('b', null, `Hi ${p.name}! `), p.streak.count > 1 ? `You're on a ${p.streak.count}-day streak! 🔥 ` : '', 'What shall we explore today?')));
  app.append(tiles([
    {icon: '📖', title: 'Reading & Words', sub: 'Stories, vocabulary, spelling, sentences', color: SECTIONS.ela.color, onclick: () => go(ElaHub), id: 'go-ela'},
    {icon: '🏮', title: 'Mandarin', sub: 'Tones, pinyin, characters, phrases', color: SECTIONS.zh.color, onclick: () => go(ZhHub), id: 'go-zh'},
    {icon: '🌮', title: 'Spanish', sub: 'Sounds, words, phrases, listening', color: SECTIONS.es.color, onclick: () => go(EsHub), id: 'go-es'},
    {icon: '🗺️', title: 'USA Explorer', sub: 'Map quiz, capitals, flags, hunts', color: SECTIONS.usa.color, onclick: () => go(UsaHub), id: 'go-usa'},
    {icon: '🌍', title: 'World Explorer', sub: 'Countries, flags, continents, oceans', color: SECTIONS.world.color, onclick: () => go(WorldHub), id: 'go-world'},
    {icon: '🎭', title: 'Acting Studio', sub: 'Charades, improv, voice games', color: SECTIONS.acting.color, onclick: () => go(ActHub), id: 'go-act'},
    {icon: '♞', title: 'Chess', sub: 'Learn the pieces, play the computer', color: SECTIONS.chess.color, onclick: () => go(ChessHub), id: 'go-chess'},
    {icon: '💬', title: 'Chat Corner', sub: 'Stories, riddles, role-play', color: SECTIONS.chat.color, onclick: () => go(ChatHub), id: 'go-chat'},
    {icon: '👪', title: 'Grown-ups', sub: 'Progress and settings', color: '#8a7b63', onclick: () => go(ParentGate), id: 'go-parent'},
  ]));
  const earned = BADGES.filter(b => p.badges.includes(b.id));
  app.append(h('div', {class: 'card'}, h('h3', null, 'My badges'), earned.length ? h('div', {class: 'badge-row'}, earned.map(b => h('span', {class: 'badge', title: b.desc}, b.icon, ' ', b.name)))
    : h('p', {class: 'muted'}, 'Finish activities to earn badges!')));
}
function ProfilePicker(app){
  app.append(h('div', {class: 'hero card'}, mascot(110), h('div', {class: 'bubble'}, h('b', null, 'Welcome to Acorn Academy! '), "I'm Nutmeg. Who's learning today?")));
  const list = h('div', {class: 'profiles'});
  S.profiles.forEach(p => list.append(h('div', {class: 'profile-wrap'}, h('button', {class: 'profile', 'data-testid': 'profile-' + p.name, onclick: () => { S.current = p.id; save(); sfx('ok'); NAV.length = 0; go(Home); }},
    h('span', {class: 'av'}, p.avatar), h('b', null, p.name), h('span', {class: 'muted small'}, `⭐ ${p.stars} · Level ${p.level} · age ${p.age}`)),
    h('button', {class: 'btn small rename', 'data-testid': 'rename-' + p.name, 'aria-label': 'Rename ' + p.name, onclick: () => { if (renameProfile(p)) go(Home); }}, '✏️ Rename'))));
  if (S.profiles.length < 3) list.append(h('button', {class: 'profile', 'data-testid': 'add-profile', onclick: () => go(NewProfile)}, h('span', {class: 'av'}, '➕'), h('b', null, 'Add a kid')));
  app.append(h('div', {class: 'card'}, h('h2', null, 'Pick your profile'), h('p', {class: 'muted small'}, 'Two explorers are ready: Level A (about age 7) and Level B (about age 10). Tap ✏️ Rename to put in your names.'), list));
}
function NewProfile(app){
  let av = AVATARS[S.profiles.length % AVATARS.length];
  const name = h('input', {type: 'text', maxlength: 14, placeholder: 'Name', 'data-testid': 'name-input', 'aria-label': 'Name'});
  const age = h('select', {'aria-label': 'Age', 'data-testid': 'age-select'}, [6,7,8,9,10,11].map(a => h('option', {value: a, selected: a === 7 ? true : null}, a + ' years')));
  const pickBox = h('div', {class: 'av-pick'}, AVATARS.map(a => h('button', {class: a === av ? 'sel' : '', 'aria-label': 'Avatar ' + a, onclick: (e) => { av = a; [...pickBox.children].forEach(b => b.classList.remove('sel')); e.currentTarget.classList.add('sel'); }}, a)));
  screen(app, 'New explorer', '🌱', h('div', {class: 'card'},
    h('h3', null, 'Your name'), name, h('h3', null, 'Your age'), age, h('p', {class: 'muted small'}, 'Age 6–8 starts at Level A, age 9+ starts at Level B. You can switch any time with the Level button.'),
    h('h3', null, 'Pick an avatar'), pickBox, h('p'),
    h('button', {class: 'btn primary', 'data-testid': 'save-profile', onclick: () => {
      const n = name.value.trim().slice(0, 14); if (!n) { toast('Type a name first'); return; }
      const p = newProfile(n, av, +age.value); S.current = p.id; save(); sfx('win'); confetti(); NAV.length = 0; go(Home);
    }}, "Let's go! 🚀")));
}
window.addEventListener('DOMContentLoaded', () => { renderTop(); go(Home); if (window.speechSynthesis) speechSynthesis.getVoices(); });
