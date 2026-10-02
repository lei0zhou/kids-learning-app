# Acorn Academy: a kids learning studio (offline prototype)

A bright, cozy learning web app for kids aged about 7 to 10, guided by **Nutmeg the acorn**, an original mascot. It runs **fully offline** as plain HTML, CSS and JavaScript. There is no build step, no network access and no accounts. Progress is saved in the browser's `localStorage`.

## Run it

```bash
cd kids-learning-app
python3 -m http.server 8000
# then open http://localhost:8000
```

You can also double-click `index.html`, because everything also works from `file://`. Use a recent Chrome, Edge, Safari or Firefox. Tablets work too: every control is tap-friendly, and drag uses pointer events.

## What's inside

**Profiles and rewards.** There are up to 3 kids, each with a name, an avatar emoji and an age. Age sets the starting level (**Level A** for about 7, **Level B** for about 10), and the Level pill in the top bar switches it. Kids earn stars, keep day streaks and collect 21 badges. Each result is logged to the kid's quiz history. Success brings confetti and WebAudio sound effects, with no audio files needed for those.

| Section | Highlights |
|---|---|
| 📖 **Reading & Words** | 9 original passages (grades 2–4, fiction and nonfiction, 80–200 words) with 4–5 questions each: main idea, detail, vocabulary in context, inference and sequence. Feedback **highlights the evidence in the passage**. Read-aloud uses Web Speech `en-US`, with a bundled MP3 as the fallback. Also: Word Match, Context Clues, Synonyms & Antonyms, a Spelling Bee (6 pattern lists; hear the word and its sentence, type it, and get gentle step-by-step hints), a Sentence Builder (drag or tap word tiles) and Fix It! (capitals and end marks). |
| 🏮 **Mandarin** | Tone Trainer (hear a syllable and pick tone 1–4 from 8 four-tone sets), Pinyin Reader (tone marks plus the mark-placement rule), Initials & Finals, **52 characters** (numbers, family, body, nature, verbs, people and size) with **hanzi-writer stroke-order animation and a write-it-yourself quiz** using bundled stroke data, Character Quiz, 39 Phrases with audio, and Listening (hear a word and pick the emoji). The first 12 characters and their hints come from the *Chinese Writing Fun* workbook. |
| 🌮 **Spanish** | Sounds (vowels, ñ, rr, ll, h/j, accent marks), Hear & Pick minimal pairs (pero/perro, papa/papá…), Word Cards and Word Quiz (**135 words**, of which 44 are marked Level A), Phrases (25), and Listening (words at Level A, sentences at Level B). **Level B adds** el/la/un/una gender, ser/estar/tener/gustar, typing with an **á é í ó ú ñ ü ¿ ¡** bar, and Spanish-speaking countries. |
| 🗺️ **USA Explorer** | A real US map (Census-based **us-atlas** TopoJSON, Albers USA projection with Alaska and Hawaii insets, pre-projected to SVG paths). Includes: Map Quiz (tap the state), Regions, Name Drop (drag names onto the map), Find the State (5 chained-clue hunts), Capital trivia, Capital Hunt (tap the state for a capital), Flag Memory, and Explore. Level A gets 10 famous states, 5 regions, 3 choices, no timer and 8 cards. Level B gets all 50 states, timed rounds, 16 cards and a **Northeast zoom** for the small states. |
| 🎭 **Acting Studio** | Level A: Emotion Charades (card + timer), Mirror Game (leader/follower timer), Freeze Dance (generated music that stops at random, then a statue prompt), and Scene Spinner (who / where / problem). Level B: Story Starters, Character Cards, "Yes, and…", Scene Generator (+ twist), Voice Gym (original tongue twisters, drills, one line in 5 emotions), Body & Status, and a Reflection checklist. Activities are self-reported: tap **"We did it!"** and rate it. There's an optional **local-only recorder** (MediaRecorder): nothing is uploaded or saved. |
| ♞ **Chess** | "How pieces move" lessons for all 6 pieces, showing legal squares plus a star challenge for each. Knight's Star Hunt and Pawn Wars. A full game against the computer, with rules from **chess.js** (castling, en passant, promotion, check, mate and stalemate). The built-in **alpha-beta AI** has 5 levels and a time cap of about 1.1 s. Level A has practice mode (legal-move dots, 💡 hints, undo, a very easy opponent). Level B has difficulty 1–5, an undo toggle, a move list, resign and new game. Moves work by tap-tap or drag, by mouse or touch. |
| 💬 **Chat Corner** | Scripted, offline chat with Nutmeg (no AI): Story Chain (with plot twists, read-aloud and save to history; Level A taps, Level B types and can play with a sibling), Riddles & Jokes (fuzzy-matched guesses, hints, a personal joke book), Would You Rather (family tally plus a "why" sentence), Trivia Chat (mixes Reading, Mandarin, Spanish, US and World questions), Role-Play (café, new friend, pirate captain, toy shop; Level B adds Spanish and Mandarin role-plays with real audio), and Talk Starters. Each turn has an optional **🎤 Say it out loud** recorder. Free text goes through a simple word filter and stays on the device. |
| 👪 **Grown-ups** | A multiplication gate leads to a per-kid table with stars and activity counts for **Reading, Mandarin, Spanish, US Geography, Acting, Chess, Games/Chat**, plus detailed counters, badges, recent quiz history, a level switch, reset or delete per kid, mute, and erase everything. |

Accessibility: base type is 20 px or larger with high contrast, big buttons (at least 56 px), visible focus rings and `prefers-reduced-motion` support.

## Folder layout

```
index.html            app shell (loads everything with classic <script> tags, so file:// works)
css/app.css           all styles (CSS/SVG art: sky, clouds, hills, mascot)
js/                   core.js (state, rewards, sounds, confetti, speech, recorder, quiz engine)
                      ela.js zh.js es.js usa.js acting.js chess.js chat.js parent.js home.js
data/*.js             generated content (ela, zh, hanzi stroke data, es, us map, act)
audio/zh|es|en/       392 pre-generated speech clips (32 kbps mono MP3)
flags/                50 state flag thumbnails (PNG, 160 px)
vendor/               hanzi-writer, chess.js (IIFE bundle), cburnett chess pieces, licenses
fonts/                Chewy (headings), Noto Sans SC subset (only the characters used)
tools/                content sources + build and verify scripts
screenshots/          headless-Chrome screenshots at 1280×800
```

## Rebuilding content (optional; the app ships prebuilt)

```bash
pip install edge-tts pypinyin           # plus ffmpeg on PATH
python3 tools/build_data.py             # validates content, writes data/*.js and the audio manifest
python3 tools/make_audio.py             # edge-tts voices: zh-CN-XiaoxiaoNeural, es-MX-DaliaNeural, en-US-JennyNeural
python3 tools/verify_capitals.py        # 50 capitals vs a saved Wikipedia snapshot
pip install playwright && playwright install chromium
python3 -m http.server 8765 & python3 tools/verify_app.py   # 30 end-to-end checks + screenshots
```

`build_data.py` checks that every reading clue appears in its passage, that word counts are 80–200 and that tone order is right. It cross-checks all pinyin against `pypinyin`; the only differences are standard neutral-tone spellings such as *xièxie*, *bàba* and *zǎoshang*. It also checks region counts (11/12/12/4/11), hunt answers, flags and more.

## Credits and licenses

- **All passages, questions, word lists, riddles, scenes, prompts and tongue twisters are original** to this app. The art is original CSS/SVG. No Studio Ghibli characters or assets are used; the look is only "cozy, hand-drawn-inspired".
- US map: [us-atlas](https://github.com/topojson/us-atlas) v3 by Mike Bostock (ISC license, `vendor/us-atlas.LICENSE`), derived from public-domain U.S. Census Bureau cartographic boundary files.
- State flags: Wikimedia Commons renderings of the official state flags. US state flags are generally public domain or not copyrightable; see each file's Commons page (`Flag_of_<State>.svg`).
- Stroke-order animation: [hanzi-writer](https://hanziwriter.org) (MIT, `vendor/hanzi-writer.LICENSE`). Stroke data from hanzi-writer-data / Make Me a Hanzi (Arphic Public License, `vendor/hanzi-writer-data.ARPHICPL.TXT`). Only the 52 characters used are bundled.
- Chess rules: [chess.js](https://github.com/jhlywa/chess.js) (BSD-2-Clause, `vendor/chess.js.LICENSE`). Pieces: "cburnett" set by Colin M.L. Burnett (CC BY-SA 3.0 / GPL), as used by Lichess.
- Fonts: Chewy (Apache 2.0) and Noto Sans SC (SIL OFL 1.1), subset.
- Speech audio: generated with Microsoft Edge neural TTS voices through `edge-tts`. Check the voice terms before any public or commercial release.

## Known limitations (prototype)

- Read-aloud for long text and the riddle and chat voices use the browser's Web Speech API. Offline voice availability depends on the device, so passages fall back to bundled MP3s, but chat lines are silent without system voices.
- Speech recognition is **not** used, because the browser speech recognizers send audio to the cloud. "Say it out loud" uses a local recorder instead.
- Progress lives in one browser's localStorage. Clearing site data erases it, and there is no sync across devices.
- The chess AI is a small alpha-beta search, roughly beginner to casual-club strength at level 5. It is not Stockfish.
- Flag emoji in the Spanish countries quiz may show as letters on some Linux or Windows setups.
