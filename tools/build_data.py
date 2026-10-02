"""Builds data/*.js from tools/content_*.py, verifies pinyin, bundles hanzi stroke data, writes audio manifest."""
import json, os, sys, re, unicodedata
sys.path.insert(0, os.path.dirname(__file__))
from content_ela import *
from content_zh import *
from content_us import *
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HW = "/tmp/hw/node_modules/hanzi-writer-data"
def js(name, obj):
    open(os.path.join(ROOT, "data", name + ".js"), "w").write(f"window.{name.upper()}=" + json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")
def zid(t): return "zh/" + "-".join(f"{ord(c):x}" for c in t if not unicodedata.category(c).startswith("P")) + ".mp3"
def eid(t): return "en/" + re.sub(r"[^a-z0-9]+", "_", t.lower()).strip("_")[:40] + ".mp3"
audio = {}  # path -> (lang, text)
errors = []

# ---------- ELA ----------
for p in PASSAGES:
    w = len(p["text"].split())
    if not 80 <= w <= 200: errors.append(f"passage {p['id']} has {w} words")
    for q in p["qs"]:
        if q[5] not in p["text"]: errors.append(f"clue not in passage {p['id']}: {q[5]}")
        if not 0 <= q[3] < len(q[2]): errors.append("bad answer index")
    p["words"] = w
    audio[eid("passage " + p["id"])] = ("en", p["title"] + ". " + p["text"])
spell = []
for lst in SPELL:
    for wd, sent in lst["words"]:
        if not re.search(r"\b" + wd + r"\b", sent, re.I): errors.append(f"spelling word {wd} not in sentence")
        audio[eid("spell " + wd)] = ("en", f"{wd}. {sent} {wd}.")
for s in SENTENCES: pass
for wrong, right in FIXES:
    a = wrong.split(); b = right.rstrip(".?!").split()
    if len(a) != len(b) or any(x.lower() != y.lower() for x, y in zip(a, b)): errors.append(f"fix mismatch {wrong}")
js("ela", dict(passages=[dict(p, qs=[dict(type=q[0], q=q[1], choices=q[2], answer=q[3], why=q[4], clue=q[5]) for q in p["qs"]]) for p in PASSAGES],
               vocab=[dict(word=w, meaning=m, sentence=s) for w, m, s in VOCAB],
               syn=[dict(word=a, answer=b, others=c) for a, b, c in SYN], ant=[dict(word=a, answer=b, others=c) for a, b, c in ANT],
               spelling=[dict(id=l["id"], title=l["title"], grade=l["grade"], pattern=l["pattern"],
                              words=[dict(word=w, sentence=s, audio=eid("spell " + w)) for w, s in l["words"]]) for l in SPELL],
               sentences=SENTENCES, fixes=[dict(wrong=a, right=b) for a, b in FIXES],
               passageAudio={p["id"]: eid("passage " + p["id"]) for p in PASSAGES}))

# ---------- Mandarin ----------
from pypinyin import pinyin, Style
def py_of(t): return " ".join(x[0] for x in pinyin(t, style=Style.TONE, heteronym=False))
def norm(s): return re.sub(r"[^a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]", "", s.lower())
review = []
def check(h, p):
    auto = py_of(h)
    if norm(auto) != norm(p): review.append((h, p, auto))
hanzi_data = {}
chars = []
for h, p, en, grp, emo, hint in CHARS:
    check(h, p)
    f = os.path.join(HW, h + ".json")
    d = json.load(open(f)); hanzi_data[h] = d
    chars.append(dict(han=h, py=p, en=en, group=grp, emoji=emo, hint=hint, strokes=len(d["strokes"]), audio=zid(h)))
    audio[zid(h)] = ("zh", h)
assert len(chars) == len(set(c["han"] for c in chars))
tones = []
for base, items in TONES:
    row = []
    for i, (h, p, en) in enumerate(items):
        check(h, p)
        # tone number from the mark
        marks = {1: "āēīōūǖ", 2: "áéíóúǘ", 3: "ǎěǐǒǔǚ", 4: "àèìòùǜ"}
        t = next(k for k, v in marks.items() if any(c in p for c in v))
        if t != i + 1: errors.append(f"tone order {h} {p}")
        row.append(dict(han=h, py=p, en=en, tone=t, audio=zid(h))); audio[zid(h)] = ("zh", h)
    tones.append(dict(base=base, items=row))
phrases = []
for cat, h, p, en in PHRASES:
    check(h, p); phrases.append(dict(cat=cat, han=h, py=p, en=en, audio=zid(h))); audio[zid(h)] = ("zh", h)
listen = []
for h, p, en, emo in LISTEN:
    check(h, p); listen.append(dict(han=h, py=p, en=en, emoji=emo, audio=zid(h))); audio[zid(h)] = ("zh", h)
js("zh", dict(chars=chars, tones=tones, phrases=phrases, listen=listen, initials=INITIALS + ["y", "w"]))
js("hanzi", hanzi_data)

# ---------- USA ----------
paths = {s["name"]: s for s in json.load(open("/tmp/hw/us_paths.json")) if s["name"] in STATES}
assert len(paths) == 50 and set(paths) == set(STATES), set(STATES) ^ set(paths)
regions = {}
for n, (ab, cap, reg, fact) in STATES.items(): regions[reg] = regions.get(reg, 0) + 1
assert regions == {"Northeast": 11, "Southeast": 12, "Midwest": 12, "Southwest": 4, "West": 11}, regions
for h in HUNTS:
    for c, a in h["clues"]: assert a in STATES, a
for f in LEVEL_A + NORTHEAST_ZOOM: assert f in STATES
us = dict(viewBox="0 0 975 610", states=[dict(name=n, abbr=STATES[n][0], capital=STATES[n][1], region=STATES[n][2], fact=STATES[n][3],
          d=paths[n]["d"], c=paths[n]["c"], b=paths[n]["b"], area=paths[n]["a"], flag="flags/" + n.lower().replace(" ", "_") + ".png") for n in sorted(STATES)],
          levelA=LEVEL_A, zoom=NORTHEAST_ZOOM, hunts=[dict(level=h["level"], title=h["title"], clues=[dict(clue=c, answer=a) for c, a in h["clues"]]) for h in HUNTS])
for s in us["states"]: assert os.path.exists(os.path.join(ROOT, s["flag"])), s["flag"]
js("us", us)

# ---------- Spanish ----------
import content_es as ES, content_act as ACT
def sid(t): return "es/" + re.sub(r"[^a-z0-9]+", "_", unicodedata.normalize("NFKD", t.lower()).encode("ascii","ignore").decode()).strip("_")[:48] + ("_acc" if any(c in t for c in "áéíóúñ") else "") + ".mp3"
def sa(t): audio[sid(t)] = ("es", t); return sid(t)
words = [dict(w, audio=sa(w["es"])) for w in ES.W]
assert len(words) >= 120 and 35 <= sum(w["a"] for w in words) <= 50, (len(words), sum(w["a"] for w in words))
assert len({w["es"] for w in words}) == len(words)
pron = [dict(title=p["title"], tip=p["tip"], items=[dict(sound=a, says=b, word=c, audio=sa(c)) for a, b, c in p["items"]]) for p in ES.PRON]
pairs = [[dict(es=a, en=b, audio=sa(a)) for a, b in pr] for pr in ES.PAIRS]
# accented/plain pairs must not collide on audio file names
assert len({sid(a) for pr in ES.PAIRS for a, _ in pr}) == 2 * len(ES.PAIRS)
phr = [dict(cat=c, es=e, en=n, a=a, audio=sa(e)) for c, e, n, a in ES.PHRASES]
verbs = [dict(v, forms=[dict(who=a, form=b) for a, b in v["forms"]], ex=[dict(es=a, en=b, audio=sa(a)) for a, b in v["ex"]]) for v in ES.VERBS]
sents = [dict(es=a, en=b, audio=sa(a)) for a, b in ES.SENTENCES]
js("es", dict(words=words, pron=pron, pairs=pairs, phrases=phr, verbs=verbs, serEstar=[dict(q=a, answer=b, why=c) for a, b, c in ES.SER_ESTAR],
              sentences=sents, countries=[dict(name=a, capital=b, flag=c) for a, b, c in ES.COUNTRIES]))
js("act", {k: getattr(ACT, k) for k in dir(ACT) if k.isupper()})
json.dump(audio, open(os.path.join(ROOT, "tools", "audio_manifest.json"), "w"), ensure_ascii=False, indent=0)
print("audio clips:", len(audio))
print("PINYIN REVIEW (pypinyin differs; check manually):"); [print("  ", r) for r in review]
print("ERRORS:", errors); sys.exit(1 if errors else 0)
