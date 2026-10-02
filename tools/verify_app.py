"""Headless end-to-end check of Acorn Academy (Playwright + Chromium). Run: python tools/verify_app.py [base_url]"""
import asyncio, sys, json, os, re, time
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/index.html'
SHOTS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'screenshots')
results = []
def ok(name, cond, info=''):
    results.append((name, bool(cond), info)); print(('PASS ' if cond else 'FAIL ') + name + (' :: ' + str(info) if info else ''), flush=True)

async def home(pg):
    await pg.click('.brand'); await pg.wait_for_timeout(200)
async def tid(pg, t): await pg.click(f'[data-testid="{t}"]'); await pg.wait_for_timeout(150)
async def answer_quiz(pg, maxq=20):
    for _ in range(maxq):
        if await pg.locator('[data-testid="quiz-done"]').count(): return True
        await pg.locator('.choice[data-correct="1"]').first.click(); await pg.wait_for_timeout(120)
        await pg.locator('[data-testid="next"]').first.click(); await pg.wait_for_timeout(200)
    return await pg.locator('[data-testid="quiz-done"]').count() > 0
async def shot(pg, path, **kw):
    await pg.evaluate("() => { document.getElementById('confetti').innerHTML = ''; document.getElementById('toast').classList.remove('show'); }"); await pg.wait_for_timeout(350)
    await pg.screenshot(path=path, **kw)
async def stars(pg): return int((await pg.inner_text('[data-testid="star-count"]')).replace('⭐', '').strip())

async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        ctx = await br.new_context(viewport={'width': 1280, 'height': 800})
        pg = await ctx.new_page(); errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        await pg.goto(BASE); await pg.wait_for_timeout(500)
        # ---- profiles
        pre = await pg.evaluate("S.profiles.map(p => [p.name, p.age, p.level])")
        ok('first launch ships two preset profiles (Level A age 7, Level B age 9)', len(pre) == 2 and pre[0][1:] == [7, 'A'] and pre[1][1:] == [9, 'B'], pre)
        answers = []
        pg.on('dialog', lambda d: asyncio.ensure_future(d.accept(answers.pop(0)) if d.type == 'prompt' and answers else d.accept()))
        for old, new in [(pre[0][0], 'Mia'), (pre[1][0], 'Leo')]:
            answers.append(new); await tid(pg, 'rename-' + old); await pg.wait_for_timeout(300)
        await pg.reload(); await pg.wait_for_timeout(400)
        ok('preset profiles renamed and saved', await pg.evaluate("S.profiles.map(p => p.name).join(',')") == 'Mia,Leo')
        await tid(pg, 'profile-Mia'); await pg.wait_for_timeout(300)
        ok('profile picked (Mia, Level A)', 'Hi Mia' in await pg.inner_text('main') and 'Level A' in await pg.inner_text('#topbar'))
        await shot(pg, f'{SHOTS}/01-home.png')
        # ---- reading passage
        await tid(pg, 'go-ela'); await tid(pg, 'ela-reading'); await tid(pg, 'passage-snail')
        await pg.locator('.choice:not([data-correct])').first.click(); await pg.wait_for_timeout(150)
        ok('reading: wrong answer highlights evidence', await pg.locator('.passage mark').count() == 1)
        await pg.locator('.choice[data-correct="1"]').first.click(); await pg.wait_for_timeout(300)
        await shot(pg, f'{SHOTS}/02-reading.png')
        await tid(pg, 'next')
        for _ in range(10):
            if await pg.locator('[data-testid="quiz-done"]').count(): break
            await pg.locator('.choice[data-correct="1"]').first.click(); await pg.wait_for_timeout(100); await tid(pg, 'next')
        sc = await pg.inner_text('[data-testid="score"]'); ok('reading passage finished', '4 / 5' in sc, sc)
        await tid(pg, 'read-aloud') if await pg.locator('[data-testid="read-aloud"]').count() else None
        # ---- spelling
        await home(pg); await tid(pg, 'go-ela'); await tid(pg, 'ela-spell'); await tid(pg, 'spell-short'); await pg.wait_for_timeout(500)
        for k in range(5):
            w = await pg.evaluate("ELA.spelling.flatMap(l=>l.words).find(w=>w.audio===window.__lastAudio).word")
            if k == 0:
                await pg.fill('[data-testid="spell-input"]', w + 'x'); await tid(pg, 'spell-check'); await pg.wait_for_timeout(200)
                ok('spelling: gentle hint after a miss', 'letters' in await pg.inner_text('main'))
            await pg.fill('[data-testid="spell-input"]', w); await tid(pg, 'spell-check'); await tid(pg, 'next'); await pg.wait_for_timeout(400)
        sc = await pg.inner_text('[data-testid="score"]'); ok('spelling round finished', '4 / 5' in sc, sc)
        # ---- sentence builder
        await home(pg); await tid(pg, 'go-ela'); await tid(pg, 'ela-build')
        for k in range(4):
            words = await pg.eval_on_selector_all('[data-testid="word-bank"] .wtile', 'els=>els.map(e=>e.dataset.w)')
            target = await pg.evaluate("ws => ELA.sentences.find(s => s.split(' ').slice().sort().join('|') === ws.slice().sort().join('|'))", words)
            for j, w in enumerate(target.split(' ')):
                if k == 0 and j == 0:  # use drag for the first tile to exercise pointer drag
                    src = pg.locator(f'[data-testid="word-bank"] .wtile[data-w="{w}"]').first; bb = await src.bounding_box(); line = await pg.locator('[data-testid="answer-line"]').bounding_box()
                    await pg.mouse.move(bb['x'] + 10, bb['y'] + 10); await pg.mouse.down(); await pg.mouse.move(bb['x'] + 40, bb['y'] - 20, steps=4); await pg.mouse.move(line['x'] + 30, line['y'] + 30, steps=6); await pg.mouse.up()
                    ok('sentence builder: drag a tile onto the line', await pg.locator('[data-testid="answer-line"] .wtile').count() == 1)
                else: await pg.locator(f'[data-testid="word-bank"] .wtile[data-w="{w}"]').first.click()
            if k == 1: await shot(pg, f'{SHOTS}/03-sentence-builder.png')
            await tid(pg, 'sentence-check'); await tid(pg, 'next')
        ok('sentence builder finished', '4 / 4' in await pg.inner_text('[data-testid="score"]'))
        # ---- Mandarin tones
        await home(pg); await tid(pg, 'go-zh'); await tid(pg, 'zh-tones'); await pg.wait_for_timeout(700)
        await shot(pg, f'{SHOTS}/04-pinyin-tones.png')
        ok('tone quiz finished', await answer_quiz(pg))
        # ---- characters + quiz
        await home(pg); await tid(pg, 'go-zh'); await tid(pg, 'zh-chars'); await tid(pg, 'char-山'); await pg.wait_for_timeout(2500)
        ok('stroke-order animation rendered', await pg.locator('[data-testid="hanzi-box"] svg path').count() > 3)
        await shot(pg, f'{SHOTS}/05-characters.png')
        await home(pg); await tid(pg, 'go-zh'); await tid(pg, 'zh-charquiz'); ok('character quiz finished', await answer_quiz(pg))
        # ---- phrase audio
        await home(pg); await tid(pg, 'go-zh'); await tid(pg, 'zh-phrases'); await pg.locator('[data-testid="phrase-say"]').first.click(); await pg.wait_for_timeout(1500)
        st = await pg.evaluate("({src: curAudio && curAudio.src, t: curAudio && curAudio.currentTime, err: curAudio && curAudio.error, dur: curAudio && curAudio.duration})")
        ok('Mandarin phrase MP3 plays', st['src'] and st['err'] is None and (st['t'] or 0) > 0.2, st)
        # ---- Spanish
        await home(pg); await tid(pg, 'go-es'); await shot(pg, f'{SHOTS}/07-spanish.png')
        await tid(pg, 'es-listen'); await pg.wait_for_timeout(300); ok('Spanish listening finished', await answer_quiz(pg))
        await home(pg); await tid(pg, 'go-es'); await tid(pg, 'es-phrases'); await pg.locator('[data-testid="es-phrase-say"]').first.click(); await pg.wait_for_timeout(1200)
        st = await pg.evaluate("({src: curAudio && curAudio.src, t: curAudio && curAudio.currentTime, err: curAudio && curAudio.error})"); ok('Spanish phrase MP3 plays', st['err'] is None and (st['t'] or 0) > 0.2, st)
        # ---- USA map quiz (Level A)
        await home(pg); await tid(pg, 'go-usa'); await tid(pg, 'usa-map')
        js_point = """name => { const p = document.querySelector(`path[data-name="${name}"]`); p.scrollIntoView({block: 'center'}); const svg = p.ownerSVGElement; const bb = p.getBBox(); const pt = svg.createSVGPoint();
            const N = 24, inside = []; for (let i = 0; i <= N; i++) { inside.push([]); for (let j = 0; j <= N; j++) { pt.x = bb.x + bb.width * i / N; pt.y = bb.y + bb.height * j / N; inside[i].push(p.isPointInFill(pt)); } }
            let best = null, bs = -1; for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) { if (!inside[i][j]) continue; let sc = 0; for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) if (inside[i+a] && inside[i+a][j+b]) sc++; if (sc > bs) { bs = sc; best = [i, j]; } }
            pt.x = bb.x + bb.width * best[0] / N; pt.y = bb.y + bb.height * best[1] / N; const s = pt.matrixTransform(p.getScreenCTM()); return [s.x, s.y]; }"""
        for k in range(6):
            ask = await pg.inner_text('[data-testid="map-ask"]'); name = re.sub(r'^Tap\s+|\s*👇$', '', ask.strip())
            if k == 2: await pg.evaluate('window.scrollTo(0,0)'); await shot(pg, f'{SHOTS}/06-usa-map-quiz.png')
            x, y = await pg.evaluate(js_point, name); await pg.mouse.click(x, y); await pg.wait_for_timeout(1300)
        ok('US map quiz finished', '6 / 6' in await pg.inner_text('[data-testid="score"]'))
        # every state: tap maps to the right state (Explore, whole map + NE zoom for small states)
        await home(pg); await tid(pg, 'go-usa'); await tid(pg, 'usa-explore')
        names = await pg.evaluate("US.states.map(s=>s.name)"); bad = []
        for n in names:
            await pg.evaluate("()=>window.__lastTap=null"); x, y = await pg.evaluate(js_point, n); await pg.mouse.click(x, y); got = await pg.evaluate("window.__lastTap")
            if got != n: bad.append((n, got))
        ok('all 50 state taps map to the right state (full map)', not bad, bad)
        await tid(pg, 'zoom-ne'); bad2 = []
        for n in await pg.evaluate("US.zoom"):
            x, y = await pg.evaluate(js_point, n); await pg.mouse.click(x, y); got = await pg.evaluate("window.__lastTap")
            if got != n: bad2.append((n, got))
        ok('Northeast zoom taps map correctly', not bad2, bad2)
        # capitals quiz + flag memory
        await home(pg); await tid(pg, 'go-usa'); await tid(pg, 'usa-capitals'); ok('capital trivia finished', await answer_quiz(pg))
        await home(pg); await tid(pg, 'go-usa'); await tid(pg, 'usa-flags')
        cards = await pg.eval_on_selector_all('.mem', 'els=>els.map(e=>e.dataset.n)')
        ok('Level A flag memory has 8 cards', len(cards) == 8)
        done = set()
        for i, n in enumerate(cards):
            if n in done: continue
            j = [k for k, m in enumerate(cards) if m == n and k != i][0]
            await pg.locator('.mem').nth(i).click(); await pg.locator('.mem').nth(j).click(); await pg.wait_for_timeout(600); done.add(n)
        ok('flag memory completed', await pg.locator('.mem.matched').count() == 8)
        # ---- World Explorer (Mia, Level A)
        async def world_tap(pg, shot_at=None, shot_path=None, n=20):
            for k in range(n):
                if await pg.locator('[data-testid="quiz-done"]').count(): return True
                if shot_at is not None and k == shot_at: await pg.evaluate('window.scrollTo(0,0)'); await shot(pg, shot_path)
                a = await pg.evaluate("(() => { const e = document.querySelector('[data-testid=map-ask]'); return {kind: e.dataset.kind, answer: e.dataset.answer, target: e.dataset.target}; })()")
                if a['kind'] == 'choice':
                    await pg.locator('.choice[data-correct="1"]').first.click(); await pg.wait_for_timeout(120); await tid(pg, 'next'); continue
                if a['answer']:
                    x, y = await pg.evaluate(js_point, a['answer'])
                elif a['target'] in OCEANS:
                    x, y = await pg.evaluate("n => { const c = document.querySelector(`g[data-ocean='${n}'] circle`); c.scrollIntoView({block: 'center'}); const r = c.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }", a['target'])
                else:
                    big = await pg.evaluate("c => WORLD.shapes.filter(s => s.continent === c).sort((a, b) => b.a - a.a)[0].name", a['target'])
                    big = await pg.evaluate("n => (WORLD.countries.find(c => c.id === WORLD.shapes.find(s => s.name === n).id) || {name: n}).name", big)
                    x, y = await pg.evaluate(js_point, big)
                await pg.mouse.click(x, y); await pg.wait_for_timeout(1450)
            return await pg.locator('[data-testid="quiz-done"]').count() > 0
        OCEANS = await pg.evaluate("WORLD.oceans.map(o => o.name)")
        await pg.click('.pill.kid'); await tid(pg, 'profile-Mia')
        await home(pg); await tid(pg, 'go-world'); await tid(pg, 'world-map')
        ok('world map: Level A shows only the 15 big countries as active', await pg.locator('.wmap path[data-name]:not(.dim)').count() == 15)
        ok('world map quiz (Level A) finished 6/6', await world_tap(pg, 2, f'{SHOTS}/14-world-map-quiz.png') and '6 / 6' in await pg.inner_text('[data-testid="score"]'))
        await home(pg); await tid(pg, 'go-world'); await tid(pg, 'world-cont')
        ok('continents & oceans (Level A) finished 8/8', await world_tap(pg) and '8 / 8' in await pg.inner_text('[data-testid="score"]'))
        await home(pg); await tid(pg, 'go-world'); await tid(pg, 'world-cont'); await world_tap(pg)
        await home(pg); await tid(pg, 'go-world'); await tid(pg, 'world-trivia'); imgs_ok = True; zh_played = False
        for k in range(8):
            if await pg.locator('[data-testid="quiz-done"]').count(): break
            imgs = await pg.eval_on_selector_all('.map-card img', 'els => els.map(e => e.complete && e.naturalWidth > 0)'); imgs_ok = imgs_ok and all(imgs)
            if await pg.locator('[data-testid="zh-say"]').count():
                await pg.locator('[data-testid="zh-say"]').first.click(); await pg.wait_for_timeout(900)
                zh_played = zh_played or await pg.evaluate("!!(curAudio && curAudio.src.includes('/zh/') && !curAudio.error && curAudio.currentTime > 0.1)")
            await world_tap(pg, n=1)
        ok('world mixed trivia (flags, passages, Mandarin + Spanish names) finished', await pg.locator('[data-testid="quiz-done"]').count() == 1 and imgs_ok, imgs_ok)
        ok('Mandarin country-name MP3 plays', zh_played)
        await home(pg); await tid(pg, 'go-world'); await tid(pg, 'world-drop')
        tiles_ = await pg.eval_on_selector_all('.wtile', 'els => els.map(e => e.dataset.n)')
        src = pg.locator('.wtile').first; bb = await src.bounding_box(); await pg.mouse.move(bb['x'] + 10, bb['y'] + 10); await pg.mouse.down(); await pg.mouse.move(bb['x'] + 40, bb['y'] + 40, steps=4)
        x, y = await pg.evaluate(js_point, tiles_[0]); await pg.mouse.move(x, y, steps=8); await pg.mouse.up(); await pg.wait_for_timeout(200)
        for n in tiles_[1:]:
            await pg.locator(f'.wtile[data-n="{n}"]').click(); x, y = await pg.evaluate(js_point, n); await pg.mouse.click(x, y); await pg.wait_for_timeout(200)
        ok('name & flag drop finished (drag + tap)', await pg.locator('[data-testid="quiz-done"]').count() == 1)
        await home(pg); await tid(pg, 'go-world'); await tid(pg, 'world-hunt'); await tid(pg, 'whunt-0')
        ok('Find the Country chained hunt finished', await world_tap(pg) and '5 / 5' in await pg.inner_text('[data-testid="score"]'))
        async def play_memory(pg):
            cards = await pg.eval_on_selector_all('.mem', 'els=>els.map(e=>e.dataset.n)'); done = set()
            for i, n in enumerate(cards):
                if n in done: continue
                j = [k for k, m in enumerate(cards) if m == n and k != i][0]
                await pg.locator('.mem').nth(i).click(); await pg.locator('.mem').nth(j).click(); await pg.wait_for_timeout(550); done.add(n)
            return len(cards), await pg.locator('.mem.matched').count()
        await home(pg); await tid(pg, 'go-world'); await tid(pg, 'world-memory'); await tid(pg, 'wmem-6'); n, m = await play_memory(pg)
        ok('world memory Level A: 6 cards matched', n == 6 and m == 6, (n, m))
        # ---- Acting
        await home(pg); await tid(pg, 'go-act'); await shot(pg, f'{SHOTS}/08-acting-studio.png')
        await tid(pg, 'act-charades'); await tid(pg, 'new-card'); await pg.click('[data-rate="3"]'); await tid(pg, 'did-it')
        ok('acting: "We did it!" awards stars', 'Bravo' in await pg.inner_text('main'))
        await home(pg); await tid(pg, 'go-act'); await tid(pg, 'act-spinner'); await pg.wait_for_timeout(1500); await shot(pg, f'{SHOTS}/09-acting-scene-spinner.png')
        # ---- Chat Corner (Level A story chain)
        await home(pg); await tid(pg, 'go-chat'); await tid(pg, 'chat-story')
        for _ in range(12):
            if await pg.locator('[data-testid="save-story"]').count(): break
            await pg.locator('[data-testid="reply-0"]').click(); await pg.wait_for_timeout(250)
        await tid(pg, 'save-story'); await pg.locator('[data-testid="final-story"]').scroll_into_view_if_needed(); await shot(pg, f'{SHOTS}/10-chat-corner.png')
        ok('story chain finished and saved', 'Saved' in await pg.inner_text('[data-testid="final-story"]'))
        await home(pg); await tid(pg, 'go-chat'); await tid(pg, 'chat-riddles')
        for _ in range(12):
            corr = await pg.evaluate("""() => { const q = [...document.querySelectorAll('.msg:not(.me) .b')].map(b => b.firstChild.textContent).reverse().find(t => t.startsWith('Riddle'));
                const r = CHAT.riddlesA.find(r => q && q.includes(r[0])); return r && r[1]; }""")
            btns = pg.locator('.replies .choice')
            if not corr or not await btns.count(): break
            if 'joke' in (await btns.first.inner_text()).lower(): break
            await pg.locator('.replies .choice', has_text=corr).first.click(); await pg.wait_for_timeout(250)
        ok('riddles round finished', 'You solved 4 riddles' in await pg.inner_text('[data-testid="chat-log"]'))
        # ---- Chess (Level B kid): lesson via touch context, full game to checkmate, AI timing
        await pg.click('.pill.kid'); await tid(pg, 'profile-Leo')
        await tid(pg, 'go-chess'); await shot(pg, f'{SHOTS}/11-chess-hub.png')
        await tid(pg, 'lesson-n'); await pg.wait_for_timeout(200)
        for sq in ['c3', 'e4', 'f6']: await pg.click(f'.sq[data-sq="{sq}"]'); await pg.wait_for_timeout(150)
        ok('knight lesson completed', 'mastered' in await pg.inner_text('[data-testid="lesson-status"]'))
        await home(pg); await tid(pg, 'go-chess'); await tid(pg, 'chess-game'); await pg.select_option('[data-testid="difficulty"]', '1')
        async def ui_move(page, uci):
            await page.click(f'.sq[data-sq="{uci[0]}"]'); await page.click(f'.sq[data-sq="{uci[1]}"]')
            if await page.locator('[data-promo]').count(): await page.click('[data-promo="q"]')
        mate = False
        for ply in range(120):
            await pg.wait_for_function("!document.querySelector('[data-testid=chess-status]').textContent.includes('Thinking')", timeout=5000)
            stt = await pg.inner_text('[data-testid="chess-status"]')
            if 'Checkmate' in stt or 'Stalemate' in stt or 'Draw' in stt: mate = 'You win' in stt; break
            m = await pg.evaluate("(() => { const m = aiMove(window.__chess, 4, 400); return [m.from, m.to]; })()")
            await ui_move(pg, m); await pg.wait_for_timeout(120)
            if ply == 6: await shot(pg, f'{SHOTS}/12-chess-game.png')
        stt = await pg.inner_text('[data-testid="chess-status"]')
        ok('full game played to checkmate (win)', mate, stt + ' | moves: ' + (await pg.inner_text('[data-testid="move-list"]')).replace('\n', ' ')[:300])
        await tid(pg, 'new-game'); await pg.select_option('[data-testid="difficulty"]', '5'); times = []
        for mv in [('e2', 'e4'), ('g1', 'f3'), ('f1', 'c4'), ('d2', 'd3'), ('b1', 'c3')]:
            if not await pg.locator(f'.sq[data-sq="{mv[0]}"] img').count(): continue
            t0 = time.time(); await ui_move(pg, mv)
            await pg.wait_for_function("!document.querySelector('[data-testid=chess-status]').textContent.includes('Thinking')", timeout=8000); times.append(round(time.time() - t0, 2))
            legal = await pg.evaluate("window.__chess.turn()")
        ok('AI (hardest level) answers within 2 s', times and max(times) < 2.0, times)
        await home(pg); await tid(pg, 'go-es'); await tid(pg, 'es-countries'); flags_ok = True
        for _ in range(6):
            imgs = await pg.eval_on_selector_all('.quiz img', 'els => els.map(e => [e.getAttribute("src"), e.complete && e.naturalWidth > 0])')
            flags_ok = flags_ok and len(imgs) > 0 and all(s.startswith('flags/world/') and v for s, v in imgs)
            await pg.locator('.choice[data-correct="1"]').first.click(); await pg.wait_for_timeout(150); await tid(pg, 'next')
        ok('Spanish countries quiz uses bundled SVG flags (no emoji) and finishes', flags_ok and await pg.locator('[data-testid="quiz-done"]').count() == 1)
        # ---- World Explorer (Leo, Level B): every country tap + capital, zoom, timed rounds, 16-card memory
        await home(pg); await tid(pg, 'go-world'); await tid(pg, 'world-explore')
        names = await pg.evaluate("WORLD.countries.map(c => c.name)"); bad = []; badcap = []; zoomed = []
        for n in names:
            await pg.evaluate("()=>window.__lastTap=null"); x, y = await pg.evaluate(js_point, n); await pg.mouse.click(x, y); got = await pg.evaluate("window.__lastTap")
            if got != n:
                z = await pg.evaluate("""n => { const s = WORLD.shapes.find(s => s.id === WORLD.countries.find(c => c.name === n).id); const [x, y] = s.c;
                    return Object.entries(WORLD.zooms).filter(([k, b]) => x > b[0] && x < b[0] + b[2] && y > b[1] && y < b[1] + b[3]).map(([k]) => k)[0] || null; }""", n)
                if z:
                    await tid(pg, 'wzoom-' + re.sub(r'\W+', '-', z)); x, y = await pg.evaluate(js_point, n); await pg.mouse.click(x, y); got = await pg.evaluate("window.__lastTap"); await tid(pg, 'wzoom-world')
                    if got == n: zoomed.append(n)
                if got != n: bad.append((n, got)); continue
            info = await pg.inner_text('[data-testid="country-info"]'); cap = await pg.evaluate("n => WORLD.countries.find(c => c.name === n).capital", n)
            if cap not in info or n not in info: badcap.append((n, cap))
        ok(f'all {len(names)} world country taps map to the right country (small ones via zoom)', not bad, bad)
        ok('explore card shows the right capital for every country', not badcap, badcap)
        print('   small countries tapped via zoom:', zoomed)
        await home(pg); await tid(pg, 'go-world'); await tid(pg, 'world-map')
        ok('world map quiz (Level B) is timed with zoom buttons', await pg.locator('[data-testid="timer"]').count() == 1 and await pg.locator('[data-testid^="wzoom-"]').count() >= 5)
        await home(pg); await tid(pg, 'go-world'); await tid(pg, 'world-trivia'); capq = 0
        for k in range(12):
            if await pg.locator('[data-testid="quiz-done"]').count(): break
            t = await pg.inner_text('[data-testid="map-ask"]')
            if 'capital' in t: capq += 1
            if 'What is the capital of' in t:
                n = re.search(r'capital of (.+)\?', t).group(1).strip(); right = await pg.locator('.choice[data-correct="1"]').first.inner_text()
                if right != await pg.evaluate("n => WORLD.countries.find(c => c.name === n).capital", n): capq = -99
            await world_tap(pg, n=1)
        ok('world trivia (Level B) with capitals finished', await pg.locator('[data-testid="quiz-done"]').count() == 1 and capq >= 2, capq)
        await home(pg); await tid(pg, 'go-world'); await tid(pg, 'world-memory'); await tid(pg, 'wmem-16')
        kinds = await pg.eval_on_selector_all('.mem', 'els=>[...new Set(els.map(e=>e.dataset.kind))].sort()')
        n, m = await play_memory(pg)
        ok('world memory Level B: 16 cards with flag/shape/Mandarin cards', n == 16 and m == 16 and kinds == ['flag', 'name', 'shape', 'zh'], (n, m, kinds))
        btest = await pg.evaluate("""(() => { const f = id => BADGES.find(b => b.id === id); const mk = w => ({prog: {world: w}});
            return [f('continent').test(mk({continents: 10})), f('flagmaster').test(mk({flags: 20})), f('traveler').test(mk({found: Array.from({length: 15}, (_, i) => 'c' + i)})), f('traveler').test(mk({found: []})),
                    f('continent').name, f('flagmaster').name, f('traveler').name]; })()""")
        ok('World badges: Continent Captain, Flag Master, World Traveler', btest == [True, True, True, False, 'Continent Captain', 'Flag Master', 'World Traveler'], btest)
        mia_b = await pg.evaluate("S.profiles.find(p => p.name === 'Mia').badges")
        ok('Mia earned Continent Captain by playing', 'continent' in mia_b, mia_b)
        tctx = await br.new_context(viewport={'width': 820, 'height': 1180}, has_touch=True, is_mobile=True)
        tp = await tctx.new_page(); await tp.goto(BASE); await tp.evaluate("s => localStorage.setItem('acornAcademy.v1', s)", await pg.evaluate("localStorage.getItem('acornAcademy.v1')")); await tp.reload()
        await tp.tap('.brand'); await tp.tap('[data-testid="go-chess"]'); await tp.tap('[data-testid="lesson-r"]'); await tp.wait_for_timeout(200)
        await tp.tap('.sq[data-sq="a1"]'); await tp.tap('.sq[data-sq="a6"]'); await tp.wait_for_timeout(150); await tp.tap('.sq[data-sq="f6"]'); await tp.wait_for_timeout(200)
        ok('touch: rook lesson completed by tapping', 'mastered' in await tp.inner_text('[data-testid="lesson-status"]'))
        await tp.tap('.brand'); await tp.tap('[data-testid="go-chess"]'); await tp.tap('[data-testid="chess-game"]')
        await tp.tap('.sq[data-sq="e2"]'); await tp.tap('.sq[data-sq="e4"]'); await tp.wait_for_timeout(2500)
        ok('touch: move played in a game', await tp.evaluate("window.__chess.history().length") >= 2)
        await tctx.close()
        # ---- Parent dashboard
        await home(pg); await tid(pg, 'go-parent'); q = await pg.inner_text('[data-testid="gate-q"]'); a, b = [int(x) for x in q.split('×')]
        await pg.fill('[data-testid="gate-input"]', str(a * b)); await tid(pg, 'gate-go'); await pg.wait_for_timeout(300)
        tbl = await pg.inner_text('[data-testid="parent-table"]')
        mia = await pg.evaluate("(() => { const p = S.profiles.find(p => p.name === 'Mia'); return {stars: p.stars, secs: p.secStars, hist: p.history.length, badges: p.badges}; })()")
        ok('parent page shows per-kid section columns', all(s in tbl for s in ['US Geography', 'World Geography', 'Acting', 'Spanish', 'Chess', 'Games/Chat', 'Mandarin']), tbl.split('\n')[:3])
        ok('parent page updated with progress', mia['stars'] > 20 and all(mia['secs'].get(s, 0) > 0 for s in ['ela', 'zh', 'es', 'usa', 'world', 'acting', 'chat']), mia)
        ok('parent page has rename buttons', await pg.locator('[data-testid="prename-Mia"]').count() == 1)
        await shot(pg, f'{SHOTS}/13-parent-dashboard.png', full_page=False)
        ok('no console errors', not errs, errs[:5])
        await br.close()
    fails = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(fails)}/{len(results)} checks passed'); sys.exit(1 if fails else 0)
asyncio.run(main())
