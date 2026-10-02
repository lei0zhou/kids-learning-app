/* Chat Corner: scripted, offline conversation games with Nutmeg the acorn. No AI and no network; free text stays on this device. */
const CHAT = {
  storyOpeners: ['Once upon a time, a little fox found a glowing pebble in the creek.', 'On the first snowy morning, the school bus took a wrong turn into a forest.', 'Deep under the library, there was a door no one had opened in a hundred years.',
    'A cloud floated down and asked to borrow my umbrella.', 'Grandpa’s old bicycle started ringing its bell all by itself.'],
  storyChoicesA: [['The fox put the pebble in her pocket.', 'A sleepy owl hooted, “That’s mine!”', 'The pebble began to hum a song.'],
    ['Suddenly, it started to rain jellybeans.', 'A tiny door opened in a tree.', 'Everyone heard a giant sneeze.'],
    ['They decided to follow the strange sound.', 'A friendly turtle offered a ride.', 'The wind whispered a secret.'],
    ['At last, they found a hidden picnic.', 'The moon came out early to help.', 'A rainbow bridge appeared.'],
    ['Everyone laughed and shared snacks.', 'They promised to meet again tomorrow.', 'The pebble glowed one last time.']],
  twists: ['Just then, the ground began to wiggle like jelly!', 'Suddenly, a parade of ducks marched by wearing tiny hats.', 'Out of nowhere, everything turned purple for one minute.', 'Then a talking map popped out of a backpack.',
    'At that exact moment, it started snowing upward.', 'A loud voice called, “Who ordered the giant pancake?”', 'Then the shadows started dancing on their own.', 'Just then, the clock struck thirteen.'],
  riddlesA: [['What has hands but can’t clap?', 'a clock', ['a clock', 'a glove', 'a tree']], ['What has to be broken before you can use it?', 'an egg', ['an egg', 'a pencil', 'a door']],
    ['What gets wetter the more it dries?', 'a towel', ['a towel', 'a fish', 'the sun']], ['What has a face and two hands but no arms or legs?', 'a clock', ['a clock', 'a doll', 'a cat']],
    ['I’m tall when I’m young and short when I’m old. What am I?', 'a candle', ['a candle', 'a tree', 'a giraffe']], ['What has many keys but can’t open a door?', 'a piano', ['a piano', 'a jail', 'a car']],
    ['What goes up but never comes down?', 'your age', ['your age', 'a ball', 'a bird']], ['What has legs but can’t walk?', 'a table', ['a table', 'a snake', 'a puppy']]],
  riddlesB: [['The more of me you take, the more you leave behind. What am I?', 'footsteps', ['footstep', 'steps'], 'Think about walking on a beach.'],
    ['What can travel around the world while staying in a corner?', 'a stamp', ['stamp', 'postage stamp'], 'It goes on an envelope.'],
    ['What has a neck but no head?', 'a bottle', ['bottle'], 'You might drink from it.'],
    ['What can you catch but not throw?', 'a cold', ['cold', 'the flu'], 'Achoo!'],
    ['What has one eye but can’t see?', 'a needle', ['needle'], 'It helps you sew.'],
    ['What word is spelled wrong in every dictionary?', 'wrong', ['wrong', 'the word wrong'], 'Read the question very carefully.'],
    ['What building has the most stories?', 'a library', ['library'], 'Stories can be books!'],
    ['What runs but never walks, has a mouth but never talks?', 'a river', ['river', 'stream'], 'It flows to the sea.'],
    ['I have cities but no houses, forests but no trees, and water but no fish. What am I?', 'a map', ['map'], 'You use it in USA Explorer!'],
    ['What comes once in a minute, twice in a moment, but never in a thousand years?', 'the letter m', ['m', 'letter m', 'the letter m'], 'Look at the letters in the words.']],
  jokes: [['Why did the cookie go to the doctor?', 'Because it felt crummy!'], ['What do you call a sleeping dinosaur?', 'A dino-snore!'], ['Why are fish so smart?', 'Because they live in schools!'],
    ['What did one plate say to the other?', 'Dinner is on me!'], ['Why did the bicycle fall over?', 'It was two-tired!'], ['What do you call a bear with no teeth?', 'A gummy bear!']],
  wyr: [['have a pet dragon the size of a hamster', 'have a pet hamster the size of a dragon'], ['be able to talk to animals', 'be able to speak every human language'], ['eat spaghetti with a spoon forever', 'eat soup with a fork forever'],
    ['have a slide from your bedroom to the kitchen', 'have a trampoline floor in your bedroom'], ['be invisible for a day', 'be able to fly for a day'], ['live in a treehouse', 'live in an underwater bubble'],
    ['have hiccups that sound like a duck', 'sneeze glitter'], ['be a famous actor', 'be a famous inventor'], ['explore the deep ocean', 'explore outer space'], ['always have to sing instead of talk', 'always have to dance instead of walk']],
  starters: ['If you could shrink to the size of an ant for a day, where would you go?', 'What would your superhero name be, and what is your silly power?', 'If our family had a theme song, what would it sound like?',
    'Which animal would be the funniest teacher?', 'If you could invent a new holiday, what would we celebrate?', 'What is something that always makes you laugh?', 'If you opened a restaurant, what weird food would be on the menu?',
    'What would you do if you found a door in the back of your closet?', 'If you could swap places with anyone in the family for a day, who and why?', 'What is the best thing that happened today, and what was the trickiest?',
    'If your toys could talk, what would they complain about?', 'What three things would you take to a desert island?', 'If you could make one rule for the whole world, what would it be?', 'What would a day in the life of our pet (or a pet we’d like) be like?'],
};
const SCENES = {
  cafe: {title: 'At the Café', icon: '☕', link: 'Try this scene for real in Acting Studio with a grown-up as the server!', start: 'a', nodes: {
    a: {bot: 'Welcome to the Acorn Café! What would you like today?', opts: [['I would like a hot chocolate, please.', 'b'], ['Can I see the menu, please?', 'm'], ['Do you have any muffins?', 'c']]},
    m: {bot: 'Here you go! We have hot chocolate, apple juice, blueberry muffins, and pancakes.', opts: [['Pancakes, please!', 'c'], ['A hot chocolate, please.', 'b']]},
    b: {bot: 'Great choice! Would you like whipped cream on top?', opts: [['Yes, please!', 'c'], ['No, thank you.', 'c']]},
    c: {bot: 'Coming right up! That will be three acorns, please.', opts: [['Here you go. Thank you!', 'd'], ['Oops, I only have two acorns!', 'e']]},
    e: {bot: 'No problem, today is half-price Friday! Two acorns is perfect.', opts: [['Wow, thank you so much!', 'd']]},
    d: {bot: 'Enjoy your treat! Have a lovely day!', end: true}}},
  friend: {title: 'Meeting a New Friend', icon: '👋', link: 'Practice your friendly face and voice in Acting Studio.', start: 'a', nodes: {
    a: {bot: 'Hi! I’m new here. My name is Pip.', opts: [['Hi Pip! I’m {name}. Welcome!', 'b'], ['Hello! Where did you move from?', 'c']]},
    b: {bot: 'Thanks! I’m a little nervous. What do you like to do at recess?', opts: [['I like playing tag. Want to join?', 'd'], ['I like drawing. Do you like to draw?', 'd']]},
    c: {bot: 'I moved from a town by the ocean. It’s really different here!', opts: [['That sounds cool! Do you miss the beach?', 'b'], ['I can show you around!', 'd']]},
    d: {bot: 'Yes! That sounds really fun. Thanks for being so kind!', opts: [['See you tomorrow, Pip!', 'e']]},
    e: {bot: 'See you tomorrow, friend! 😊', end: true}}},
  pirate: {title: 'The Pirate Captain', icon: '🏴‍☠️', link: 'Use your big pirate voice from the Voice Gym!', start: 'a', nodes: {
    a: {bot: 'Ahoy, matey! I’m Captain Barnacle. Ye want to join my crew?', opts: [['Aye aye, Captain!', 'b'], ['Only if there are snacks on board.', 'c']]},
    c: {bot: 'Har har! We have the finest biscuits on the seven seas. Welcome aboard!', opts: [['Aye aye, Captain!', 'b']]},
    b: {bot: 'Our treasure map has a riddle: “Go where the parrots sing.” Where should we sail?', opts: [['To the jungle island!', 'd'], ['To the parrot pet shop!', 'e']]},
    e: {bot: 'Ha! The pet shop is closed on Tuesdays. Let’s try the jungle island!', opts: [['Full speed ahead!', 'd']]},
    d: {bot: 'Land ho! You found the treasure chest! It’s full of… golden library cards!', opts: [['Hooray! Books for everyone!', 'f']]},
    f: {bot: 'Ye be a fine pirate, matey! Farewell!', end: true}}},
  shop: {title: 'The Toy Shop', icon: '🧸', link: 'Act it out: one person is the shopkeeper, one the customer.', start: 'a', nodes: {
    a: {bot: 'Hello and welcome to Tumble Toys! Can I help you find something?', opts: [['I’m looking for a birthday present.', 'b'], ['Just looking, thank you!', 'c']]},
    c: {bot: 'Take your time! Let me know if you have questions.', opts: [['How much is this teddy bear?', 'd'], ['Do you have puzzles?', 'b']]},
    b: {bot: 'Wonderful! Who is the present for?', opts: [['My little brother. He loves dinosaurs.', 'd'], ['My best friend. She loves art.', 'd']]},
    d: {bot: 'I have the perfect thing! It costs eight dollars. Would you like it gift-wrapped?', opts: [['Yes, please! Thank you.', 'e'], ['No, thanks. I’ll wrap it myself.', 'e']]},
    e: {bot: 'Here you go! Thank you for shopping at Tumble Toys!', end: true}}},
};
function zhP(h){ return ZH.phrases.find(p => p.han === h); } function esP(s){ return ES.phrases.find(p => p.es === s); }
const LANG_SCENES = {
  esFriend: {title: 'Spanish: ¡Hola, amigo!', icon: '🌮', lang: 'es', link: 'Find all these phrases in Spanish → Phrases.', start: 'a', nodes: {
    a: {bot: esP('¡Hola!'), opts: [[esP('¡Hola!'), 'b']]}, b: {bot: esP('¿Cómo te llamas?'), opts: [[esP('Me llamo Ana.'), 'c']]},
    c: {bot: esP('Mucho gusto.'), opts: [[esP('¿Cómo estás?'), 'd']]}, d: {bot: esP('Estoy bien, gracias.'), opts: [[esP('¿Quieres jugar?'), 'e']]}, e: {bot: esP('¡Adiós!'), end: true}}},
  zhFriend: {title: 'Mandarin: 你好!', icon: '🏮', lang: 'zh', link: 'Find all these phrases in Mandarin → Phrases.', start: 'a', nodes: {
    a: {bot: zhP('你好'), opts: [[zhP('你好'), 'b']]}, b: {bot: zhP('你叫什么名字？'), opts: [[zhP('我叫小明。'), 'c']]},
    c: {bot: zhP('很高兴认识你！'), opts: [[zhP('谢谢'), 'd']]}, d: {bot: zhP('不客气'), opts: [[zhP('再见'), 'e']]}, e: {bot: zhP('再见'), end: true}}},
};
function chatRound(name){ const c = prog('chat'); c.rounds = (c.rounds || 0) + 1; save(); }
function ChatHub(app){
  screen(app, 'Chat Corner', '💬', h('div', {class: 'hero card'}, mascot(80), h('div', {class: 'bubble'}, 'Let’s chat! Pick a game. ', level() === 'A' ? 'I’ll read everything out loud for you.' : 'You can type your own answers.')),
    tiles([
      {icon: '📜', title: 'Story Chain', sub: 'Take turns adding sentences', color: '#3aa39a', onclick: () => go(StoryChain), id: 'chat-story'},
      {icon: '🦉', title: 'Riddles & Jokes', sub: 'Guess, laugh, add your own', color: '#e0a526', onclick: () => go(Riddles), id: 'chat-riddles'},
      {icon: '🤔', title: 'Would You Rather', sub: 'Silly choices + why', color: '#a78bfa', onclick: () => go(WouldYouRather), id: 'chat-wyr'},
      {icon: '🎓', title: 'Trivia Chat', sub: 'Nutmeg the quizmaster', color: '#4f8fc0', onclick: () => go(TriviaChat), id: 'chat-trivia'},
      {icon: '🎭', title: 'Role-Play', sub: 'Café, new friend, pirate, shop', color: '#9a6bc0', onclick: () => go(RolePlayList), id: 'chat-roleplay'},
      {icon: '🍽️', title: 'Talk Starters', sub: 'For siblings and family dinner', color: '#e8835a', onclick: () => go(TalkStarters), id: 'chat-starters'},
    ]));
}
/* chat UI */
function chatUI(app, title, icon){
  const log = h('div', {class: 'chat', 'data-testid': 'chat-log'}); const dock = h('div', {class: 'chat', style: {marginTop: '12px'}});
  screen(app, title, icon, log, dock);
  const autoRead = level() === 'A';
  return {
    bot(text, {audio, lang, sub} = {}){ const b = h('div', {class: 'b'}, text, sub ? h('div', {class: 'small muted'}, sub) : null, audio ? sayBtn(audio, typeof text === 'string' ? text : '', lang, '🔊') : h('button', {class: 'btn say', onclick: () => speak(String(text))}, '🔊'));
      log.append(h('div', {class: 'msg'}, h('span', {class: 'who-ico'}, mascot(44)), b)); if (audio) setTimeout(() => play(audio, text, lang), 200); else if (autoRead) speak(String(text)); sfx('flip'); b.scrollIntoView({block: 'nearest', behavior: 'smooth'}); },
    me(text, who){ const p = kid(); log.append(h('div', {class: 'msg me'}, h('span', {class: 'who-ico'}, who || (p ? p.avatar : '🙂')), h('div', {class: 'b'}, text))); },
    choices(opts, onPick){ dock.innerHTML = ''; const r = h('div', {class: 'replies'}, opts.map((o, k) => h('button', {class: 'btn choice', 'data-testid': 'reply-' + k, onclick: () => { dock.innerHTML = ''; onPick(o, k); }}, o.label || o))); dock.append(r, sayAloud()); },
    input(placeholder, onSend, {min = 2} = {}){ dock.innerHTML = ''; const inp = h('input', {type: 'text', placeholder, 'aria-label': placeholder, 'data-testid': 'chat-input', maxlength: 200});
      const send = () => { const v = inp.value.trim(); if (v.length < min) { toast('Type a little more!'); return; } if (!isClean(v)) { toast('Let’s use kind words! Try again.'); return; } dock.innerHTML = ''; onSend(cleanText(v)); };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') send(); }); dock.append(h('div', {class: 'typing'}, inp, h('button', {class: 'btn primary', 'data-testid': 'chat-send', onclick: send}, 'Send ➤')), sayAloud()); setTimeout(() => inp.focus(), 50); },
    dock, log, clear(){ dock.innerHTML = ''; }
  };
}
function sayAloud(){ const d = h('details', {class: 'small'}, h('summary', {class: 'muted'}, '🎤 Say it out loud (optional)')); d.addEventListener('toggle', () => { if (d.open && !d.querySelector('.recorder')) d.append(h('p', null, 'Read your answer out loud like an actor. Record it to hear yourself!'), recorder('Record')); }); return d; }
function StoryChain(app){
  const A = level() === 'A'; const c = chatUI(app, 'Story Chain', '📜'); const story = []; const turns = A ? 5 : 8; let players = [];
  const opener = pick(CHAT.storyOpeners); const twists = shuffle(CHAT.twists);
  const add = (s, who) => { story.push(s); c.me(s, who); };
  function setup(){
    if (A) { players = [{name: kid() ? kid().name : 'You', avatar: kid() ? kid().avatar : '🙂'}, {name: 'Nutmeg', bot: true}]; begin(); return; }
    c.bot('Who is playing? You can play with a brother or sister, or with me!');
    const others = S.profiles.filter(p => p.id !== S.current);
    c.choices(['Just me and Nutmeg', ...others.map(o => 'Me + ' + o.name), others.length ? null : 'Me + another player'].filter(Boolean), (o, k) => {
      const me = {name: kid().name, avatar: kid().avatar};
      players = k === 0 ? [me, {name: 'Nutmeg', bot: true}] : others[k - 1] ? [me, {name: others[k - 1].name, avatar: others[k - 1].avatar}] : [me, {name: 'Player 2', avatar: '🙂'}];
      c.me(o); begin(); });
  }
  function begin(){ c.bot('Here is how our story starts:'); c.bot(opener); story.push(opener); turn(0); }
  function turn(n){
    if (n >= turns) return finish();
    const p = players[n % players.length];
    if (n > 0 && n % (A ? 2 : 3) === 0 && !c._tw) { c._tw = true; const tw = twists.pop(); c.bot('✨ Plot twist! ' + tw); story.push(tw); }
    c._tw = false;
    if (p.bot) { const s = pick(['Then, everyone held their breath and listened.', 'So they tiptoed closer to see what would happen.', 'Luckily, a clever idea popped into their heads.', 'But nobody expected what came next.']); c.bot(s); story.push(s); return turn(n + 1); }
    if (A) { const opts = CHAT.storyChoicesA[Math.min(Math.floor(n / 2), CHAT.storyChoicesA.length - 1)]; c.bot('Your turn! Pick the next sentence:'); c.choices(opts, o => { add(o, p.avatar); turn(n + 1); }); }
    else { c.bot(`${p.name}, add one sentence to the story:`); c.input(`${p.name}'s sentence…`, s => { if (!/[.!?]$/.test(s)) s += '.'; s = s.charAt(0).toUpperCase() + s.slice(1); add(s, p.avatar); turn(n + 1); }, {min: 8}); }
  }
  function finish(){
    c.clear(); const text = story.join(' ');
    c.bot('The end! What a story! Here it is:');
    c.dock.append(h('div', {class: 'card', 'data-testid': 'final-story'}, h('h3', null, '📜 Our Story'), h('p', {style: {fontSize: '22px'}}, text),
      h('div', {class: 'row'}, h('button', {class: 'btn say', onclick: () => speak(text, 'en-US')}, '🔊 Read it aloud'),
        h('button', {class: 'btn primary', 'data-testid': 'save-story', onclick: (e) => { const ch = prog('chat'); ch.stories = (ch.stories || 0) + 1; chatRound(); award('chat', 'Story chain', 1, 1, {stars: 2, note: text.slice(0, 600), celebrate: true}); e.currentTarget.disabled = true; e.currentTarget.textContent = '✅ Saved to my history'; }}, '💾 Save my story'),
        h('button', {class: 'btn', onclick: () => go(StoryChain)}, '🔁 New story'))));
  }
  setup();
}
const lev = (a, b) => { const d = Array.from({length: a.length + 1}, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)); return d[a.length][b.length]; };
function fuzzy(guess, answers){ const n = s => s.toLowerCase().replace(/[^a-z ]/g, '').replace(/^(a|an|the|your) /, '').trim(); const g = n(guess);
  return answers.some(a => { const t = n(a); return g === t || (t.length > 2 && g.includes(t)) || lev(g, t) <= Math.max(1, Math.floor(t.length / 4)); }); }
function Riddles(app){
  const A = level() === 'A'; const c = chatUI(app, 'Riddles & Jokes', '🦉'); const set = shuffle(A ? CHAT.riddlesA : CHAT.riddlesB).slice(0, A ? 4 : 5); let i = 0, solved = 0;
  c.bot(A ? 'I have some riddles for you! Tap your answer.' : 'Riddle time! Type your guess. Ask for a hint if you need one.');
  function next(){
    if (i >= set.length) return done();
    const r = set[i]; c.bot(`Riddle ${i + 1}: ${r[0]}`); let tries = 0;
    if (A) { const askA = () => c.choices(shuffle(r[2]), o => { c.me(o); if (o === r[1]) { if (!tries) solved++; sfx('ok'); c.bot(pick(['Yes! You got it! 🎉', 'Correct! You’re so clever!', 'Woohoo! That’s right!'])); i++; next(); } else { tries++; sfx('no'); c.bot('Hmm, not quite! Try another one.'); askA(); } }); askA(); }
    else { const ask = () => c.input('Your guess… (or type hint / give up)', g => { c.me(g);
      if (/^hint/i.test(g)) { c.bot('💡 Hint: ' + r[3]); return ask(); }
      if (/give up|reveal|tell me/i.test(g)) { c.bot(`The answer is: ${r[1]}! 😄`); i++; return next(); }
      if (fuzzy(g, [r[1], ...r[2]])) { solved++; sfx('ok'); c.bot(`🎉 Yes! It’s ${r[1]}!`); i++; return next(); }
      tries++; sfx('no'); c.bot(tries === 1 ? 'Good guess, but no! Try again, or type “hint”.' : 'Still not it! Type “hint” or “give up”.'); ask(); }); ask(); }
  }
  function done(){ const ch = prog('chat'); ch.riddles = (ch.riddles || 0) + solved; chatRound(); award('chat', 'Riddles', solved, set.length);
    c.bot(`You solved ${solved} riddles! Want to hear a joke, or add your own to your joke book?`); jokeMenu(); }
  function jokeMenu(){ c.choices(['😂 Tell me a joke', '📒 Add my joke', '📖 Read my joke book', '✅ All done'], (o, k) => { c.me(o);
    if (k === 0) { const j = pick(CHAT.jokes); c.bot(j[0]); setTimeout(() => { c.bot(j[1]); jokeMenu(); }, 1800); }
    else if (k === 1) { c.bot('What’s the question part of your joke?'); c.input('Joke question…', q => { c.me(q); c.bot('And the funny answer?'); c.input('Punchline…', a => { c.me(a); const p = kid(); p.jokes = p.jokes || []; p.jokes.push([q, a]); save(); c.bot('Ha! Saved to your joke book (only on this device). 📒'); jokeMenu(); }); }); }
    else if (k === 2) { const js = (kid().jokes || []); c.bot(js.length ? js.map(j => `• ${j[0]} … ${j[1]}`).join('\n') : 'Your joke book is empty. Add one!'); jokeMenu(); }
    else c.bot('Thanks for laughing with me! 🦉'); }); }
  next();
}
function WouldYouRather(app){
  const A = level() === 'A'; const c = chatUI(app, 'Would You Rather', '🤔'); const set = shuffle(CHAT.wyr).slice(0, A ? 3 : 4); let i = 0, whys = 0;
  const tally = prog('chat').wyr || (prog('chat').wyr = {});
  function next(){
    if (i >= set.length) { chatRound(); award('chat', 'Would you rather', whys, set.length); c.bot('That was fun! You think in such interesting ways. 🌟'); return; }
    const [a, b] = set[i]; c.bot(`Would you rather ${a}, OR ${b}?`);
    c.choices([a, b].map(x => x.charAt(0).toUpperCase() + x.slice(1)), (o, k) => { c.me(o); const key = set[i].join('|'); tally[key] = tally[key] || [0, 0]; tally[key][k]++; save();
      c.bot(`Ooh! Your family picks: ${tally[key][0]} vs ${tally[key][1]}. Why would you choose that?`); const choice = [a, b][k];
      if (A) { const words = `I would rather ${choice} because it is fun.`.split(' '); const tb = tileBoard(shuffle(words.slice(0, 6)).concat(words.slice(6)), {});
        c.dock.append(h('p', {class: 'small muted'}, 'Build your “why” sentence: put the first words in order.'), tb.line, tb.bank, h('button', {class: 'btn primary', 'data-testid': 'wyr-check', onclick: () => {
          if (tb.value().startsWith('I would rather')) { whys++; sfx('ok'); c.dock.innerHTML = ''; c.me(words.join(' ')); c.bot('Great sentence! 👏'); i++; next(); } else { sfx('no'); toast('Start with “I would rather…”'); } }}, 'Check ✔'));
      } else c.input('I would rather … because …', s => { c.me(s); if (/because/i.test(s) && /^[A-Z]/.test(s) && /[.!?]$/.test(s)) { whys++; c.bot('Super sentence! Capital letter, a reason with “because”, and an end mark. ✅'); }
        else c.bot('Nice thinking! Tip: start with a capital letter, use “because”, and end with a period.'); i++; next(); }, {min: 10});
    });
  }
  next();
}
function triviaBank(){
  const A = level() === 'A'; const qs = [];
  sample(ELA.vocab, 3).forEach(v => { const ch = shuffle([v.meaning, ...sample(ELA.vocab, 2, v).map(x => x.meaning)]); qs.push({cat: '📖 Words', q: `What does “${v.word}” mean?`, ch, a: v.meaning}); });
  sample(ZH.chars, 2).forEach(z => { const ch = shuffle([z.en, ...sample(ZH.chars, 2, z).map(x => x.en)]); qs.push({cat: '🏮 Mandarin', q: `What does ${z.han} (${z.py}) mean?`, ch, a: z.en}); });
  sample(ES.words.filter(w => A ? w.a : true), 2).forEach(w => { const ch = shuffle([w.en, ...sample(ES.words, 2, w).map(x => x.en)]); qs.push({cat: '🌮 Spanish', q: `What does “${w.es}” mean?`, ch, a: w.en}); });
  sample(A ? US.levelA.map(n => ST[n]) : US.states, 2).forEach(s => { const ch = shuffle([s.capital, ...sample(US.states, 2, s).map(x => x.capital)]); qs.push({cat: '🗺️ USA', q: `What is the capital of ${s.name}?`, ch, a: s.capital}); });
  sample(ES.countries, 1).forEach(cn => { const ch = shuffle([cn.capital, ...sample(ES.countries, 2, cn).map(x => x.capital)]); qs.push({cat: '🌎 World', q: `What is the capital of ${cn.name}?`, ch, a: cn.capital}); });
  return shuffle(qs).slice(0, A ? 6 : 10);
}
function TriviaChat(app){
  const c = chatUI(app, 'Trivia Chat', '🎓'); const qs = triviaBank(); let i = 0, score = 0, streak = 0;
  c.bot(`Welcome to Trivia Chat! I’m your quizmaster. ${qs.length} questions from all over Acorn Academy. Ready?`);
  function next(){ if (i >= qs.length) { chatRound(); award('chat', 'Trivia chat', score, qs.length); c.bot(`That’s a wrap! You scored ${score} out of ${qs.length}. 🎓`); return; }
    const q = qs[i]; c.bot(`${q.cat}: ${q.q}`); c.choices(q.ch, o => { c.me(o);
      if (o === q.a) { score++; streak++; sfx('ok'); c.bot(streak >= 3 ? `🔥 ${streak} in a row! You’re on fire!` : pick(['Correct! ✅', 'Yes! Nice one!', 'Right answer! 🌟'])); }
      else { streak = 0; sfx('no'); c.bot(`Not this time. The answer is ${q.a}.`); } i++; setTimeout(next, 500); }); }
  next();
}
function RolePlayList(app){
  const items = Object.entries(SCENES).map(([k, s]) => ({icon: s.icon, title: s.title, sub: 'Role-play', color: '#9a6bc0', onclick: () => go(RolePlay, k), id: 'rp-' + k}));
  if (level() === 'B') Object.entries(LANG_SCENES).forEach(([k, s]) => items.push({icon: s.icon, title: s.title, sub: 'Language role-play', color: s.lang === 'es' ? '#e0a526' : '#d65a5a', onclick: () => go(RolePlay, k), id: 'rp-' + k}));
  screen(app, 'Role-Play', '🎭', h('p', {class: 'muted'}, level() === 'A' ? 'Tap what you want to say. Then say it out loud like an actor!' : 'Pick a line or type your own. Level B also has Spanish and Mandarin role-plays.'), tiles(items));
}
function RolePlay(app, key){
  const sc = SCENES[key] || LANG_SCENES[key]; const c = chatUI(app, sc.title, sc.icon); const A = level() === 'A'; let lines = 0;
  const txt = x => typeof x === 'string' ? x.replace('{name}', kid() ? kid().name : 'friend') : x;
  function botLine(x){ if (sc.lang === 'es') c.bot(x.es, {audio: x.audio, lang: 'es-MX', sub: x.en}); else if (sc.lang === 'zh') c.bot(h('span', null, h('span', {class: 'han'}, x.han), ' ', h('span', {class: 'py', style: {fontSize: '20px'}}, x.py)), {audio: x.audio, lang: 'zh-CN', sub: x.en}); else c.bot(txt(x)); }
  function step(id){
    const n = sc.nodes[id]; botLine(n.bot);
    if (n.end) { chatRound(); award('chat', 'Role-play: ' + sc.title, lines, lines, {stars: 2}); c.dock.append(h('div', {class: 'card'}, h('p', null, '🎬 Scene complete! ' + sc.link), h('div', {class: 'row'}, h('button', {class: 'btn primary', onclick: () => go(ActHub)}, '🎭 Go to Acting Studio'), h('button', {class: 'btn', onclick: () => go(RolePlay, key)}, '🔁 Play again')))); return; }
    const labels = n.opts.map(([o]) => sc.lang === 'es' ? o.es + '  (' + o.en + ')' : sc.lang === 'zh' ? o.han + ' ' + o.py + '  (' + o.en + ')' : txt(o));
    c.choices(labels, (o, k) => { lines++; const opt = n.opts[k][0]; c.me(o); if (sc.lang) play(opt.audio, sc.lang === 'es' ? opt.es : opt.han, sc.lang === 'es' ? 'es-MX' : 'zh-CN'); setTimeout(() => step(n.opts[k][1]), sc.lang ? 1400 : 500); });
    if (!A && !sc.lang) c.dock.append(h('button', {class: 'btn', onclick: () => c.input('Type your own line…', s => { lines++; c.me(s); setTimeout(() => step(n.opts[0][1]), 500); }, {min: 3})}, '⌨️ Type my own line'));
  }
  step(sc.start);
}
function TalkStarters(app){
  const card = h('div', {class: 'bigcard', style: {fontSize: '30px'}, 'data-testid': 'starter'}); let n = 0;
  const next = () => { card.textContent = pick(CHAT.starters); n++; sfx('flip'); if (level() === 'A') speak(card.textContent); }; next();
  screen(app, 'Talk Starters', '🍽️', h('div', {class: 'card'}, card, h('div', {class: 'row center'}, h('button', {class: 'btn primary', onclick: next}, '🔀 New question'), h('button', {class: 'btn say', onclick: () => speak(card.textContent)}, '🔊 Read it'))),
    h('div', {class: 'card'}, h('p', null, 'Take turns answering. Listen to each other and ask one follow-up question: “Why?” or “What would happen next?”'), h('button', {class: 'btn green', 'data-testid': 'talk-done', onclick: () => { chatRound(); award('chat', 'Talk starters', 1, 1, {stars: 1}); toast('Great conversation! ⭐'); }}, '✅ We talked!'), sayAloud()));
}
