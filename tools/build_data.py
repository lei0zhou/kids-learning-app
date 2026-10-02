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
              sentences=sents, countries=[dict(name=a, capital=b, flag="flags/world/" + "".join(chr(ord(ch) - 0x1F1E6 + 97) for ch in c) + ".svg", audio=sa(a)) for a, b, c in ES.COUNTRIES]))
js("act", {k: getattr(ACT, k) for k in dir(ACT) if k.isupper()})

# ---------- World Explorer ----------
import content_world as WD, shutil, subprocess
NM = "/tmp/hw"  # node_modules with world-atlas, flag-icons, world-countries, d3-geo, topojson-client
oc_pts = [[f"o{i}", ll] for i, (_, ll) in enumerate(WD.OCEANS)]
if os.path.exists(NM + "/node_modules/world-atlas"):
    shutil.copy(os.path.join(ROOT, "tools", "mk_world.mjs"), NM)
    subprocess.run(["node", "mk_world.mjs", json.dumps(oc_pts), os.path.join(ROOT, "tools", "world_paths.json")], cwd=NM, check=True)
    wc = json.load(open(NM + "/node_modules/world-countries/countries.json"))
    snap = {c["ccn3"]: dict(cca2=c["cca2"], capital=c["capital"], region=c["region"], subregion=c["subregion"],
                            zh=c["translations"]["zho"]["common"], es=c["translations"]["spa"]["common"]) for c in wc if c.get("ccn3")}
    json.dump(snap, open(os.path.join(ROOT, "tools", "world_countries_snapshot.json"), "w"), ensure_ascii=False, indent=0)
wp = json.load(open(os.path.join(ROOT, "tools", "world_paths.json")))
snap = json.load(open(os.path.join(ROOT, "tools", "world_countries_snapshot.json")))
def continent(cid, name):
    extra = {"N. Cyprus": "Asia", "Somaliland": "Africa", "Kosovo": "Europe", "Antarctica": "Antarctica"}
    if name in extra: return extra[name]
    s = snap.get(cid)
    if not s or s["region"] == "Antarctic": return None
    if s["region"] == "Americas": return "South America" if s["subregion"] == "South America" else "North America"
    return s["region"]
ZH_FIX = {"cd": "刚果民主共和国"}
ES_FIX = {"cd": "República Democrática del Congo", "ir": "Irán"}
PY_FIX = {"秘鲁": "Bìlǔ", "朝鲜": "Cháoxiǎn", "尼泊尔": "Níbó'ěr", "厄瓜多尔": "Èguāduō'ěr", "巴拉圭": "Bālāguī", "乌拉圭": "Wūlāguī",
          "加拿大": "Jiānádà", "意大利": "Yìdàlì", "沙特阿拉伯": "Shātè Ālābó", "阿尔及利亚": "Ā'ěrjílìyà", "哥伦比亚": "Gēlúnbǐyà",
          "委内瑞拉": "Wěinèiruìlā", "危地马拉": "Wēidìmǎlā", "哥斯达黎加": "Gēsīdálíjiā", "巴拿马": "Bānámǎ", "西班牙": "Xībānyá",
          "葡萄牙": "Pútáoyá", "荷兰": "Hélán", "比利时": "Bǐlìshí", "瑞士": "Ruìshì", "奥地利": "Àodìlì", "波兰": "Bōlán",
          "瑞典": "Ruìdiǎn", "挪威": "Nuówēi", "芬兰": "Fēnlán", "丹麦": "Dānmài", "爱尔兰": "Ài'ěrlán", "希腊": "Xīlà",
          "乌克兰": "Wūkèlán", "土耳其": "Tǔ'ěrqí", "冰岛": "Bīngdǎo", "捷克": "Jiékè", "匈牙利": "Xiōngyálì", "罗马尼亚": "Luómǎníyà",
          "伊朗": "Yīlǎng", "伊拉克": "Yīlākè", "以色列": "Yǐsèliè", "巴基斯坦": "Bājīsītǎn", "阿富汗": "Āfùhàn", "哈萨克斯坦": "Hāsàkèsītǎn",
          "蒙古": "Ménggǔ", "韩国": "Hánguó", "越南": "Yuènán", "泰国": "Tàiguó", "印度尼西亚": "Yìndùníxīyà", "菲律宾": "Fēilǜbīn",
          "马来西亚": "Mǎláixīyà", "孟加拉国": "Mèngjiālāguó", "新西兰": "Xīnxīlán", "巴布亚新几内亚": "Bābùyà Xīnjǐnèiyà",
          "尼日利亚": "Nírìlìyà", "肯尼亚": "Kěnníyà", "埃塞俄比亚": "Āisài'ébǐyà", "摩洛哥": "Móluògē", "加纳": "Jiānà",
          "坦桑尼亚": "Tǎnsāngníyà", "马达加斯加": "Mǎdájiāsījiā", "刚果民主共和国": "Gāngguǒ Mínzhǔ Gònghéguó", "安哥拉": "Āngēlā",
          "苏丹": "Sūdān", "利比亚": "Lìbǐyà", "美国": "Měiguó", "墨西哥": "Mòxīgē", "巴西": "Bāxī", "阿根廷": "Āgēntíng",
          "英国": "Yīngguó", "法国": "Fǎguó", "俄罗斯": "Éluósī", "中国": "Zhōngguó", "印度": "Yìndù", "日本": "Rìběn",
          "澳大利亚": "Àodàlìyà", "埃及": "Āijí", "南非": "Nánfēi", "智利": "Zhìlì", "玻利维亚": "Bōlìwéiyà", "古巴": "Gǔbā",
          "德国": "Déguó", "朝鲜": "Cháoxiǎn"}
byid = {c["id"]: c for c in wp["countries"]}
wcs = []
for cid, name, iso, cap, lvl, fact in WD.COUNTRIES:
    g = byid.get(cid); s = snap[cid]
    if not g: errors.append(f"world: {name} missing from map"); continue
    if s["cca2"].lower() != iso: errors.append(f"world: iso mismatch {name}")
    zh = ZH_FIX.get(iso, s["zh"]); es = ES_FIX.get(iso, s["es"])
    py = PY_FIX.get(zh) or py_of(zh).replace(" ", "")
    if zh not in PY_FIX: review.append(f"world pinyin auto: {zh} {py}")
    if norm(py_of(zh)) != norm(py): review.append(f"world pinyin override {zh}: pypinyin={py_of(zh)} ours={py}")
    src_flag = f"{NM}/node_modules/flag-icons/flags/4x3/{iso}.svg"; dst = os.path.join(ROOT, "flags", "world", iso + ".svg")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(src_flag): shutil.copy(src_flag, dst)
    if not os.path.exists(dst): errors.append(f"world: no flag {iso}")
    cont = continent(cid, g["name"])
    audio[zid(zh)] = ("zh", zh); audio[sid(es)] = ("es", es)
    wcs.append(dict(id=cid, name=name, iso=iso, capital=cap, level=lvl, fact=fact, continent=cont,
                    alt=WD.TWO_CONTINENTS.get(name, [cont]), zh=zh, py=py, es=es, flag=f"flags/world/{iso}.svg",
                    zhAudio=zid(zh), esAudio=sid(es)))
names = {c["name"] for c in wcs}
assert len(wcs) >= 75 and sum(c["level"] == "A" for c in wcs) == 15, len(wcs)
for h in WD.HUNTS:
    for _, a in h["clues"]:
        if a not in names: errors.append(f"world hunt answer unknown: {a}")
for a, t in WD.PASSAGES:
    if a not in names: errors.append(f"world passage answer unknown: {a}")
    if a.lower() in t.lower(): errors.append(f"world passage names its answer: {a}")
    audio[eid("world " + a)] = ("en", t)
shapes = [dict(id=c["id"], name=c["name"], d=c["d"], b=c["b"], mb=c["mb"], c=c["c"], a=c["a"], continent=continent(c["id"], c["name"])) for c in wp["countries"]]
oceans = {}
for i, (n, _) in enumerate(WD.OCEANS): oceans.setdefault(n, []).append(wp["pt"][f"o{i}"])
js("world", dict(viewBox=wp["viewBox"], sphere=wp["sphere"], shapes=shapes, countries=wcs, continents=WD.CONTINENTS,
                 oceans=[dict(name=k, pts=v) for k, v in oceans.items()], zooms=wp["zooms"],
                 hunts=[dict(level=h["level"], title=h["title"], clues=[dict(clue=c, answer=a) for c, a in h["clues"]]) for h in WD.HUNTS],
                 passages=[dict(answer=a, text=t, audio=eid("world " + a)) for a, t in WD.PASSAGES]))
json.dump(audio, open(os.path.join(ROOT, "tools", "audio_manifest.json"), "w"), ensure_ascii=False, indent=0)
print("audio clips:", len(audio))
print("PINYIN REVIEW (pypinyin differs; check manually):"); [print("  ", r) for r in review]
print("ERRORS:", errors); sys.exit(1 if errors else 0)
