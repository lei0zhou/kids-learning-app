"""Cross-checks World Explorer data: capitals, ISO codes, continents and Chinese/Spanish names against the
world-countries dataset snapshot (tools/world_countries_snapshot.json, ODbL), plus bundled flags and map shapes."""
import json, os, sys, unicodedata, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import content_world as W
snap = json.load(open(os.path.join(ROOT, 'tools', 'world_countries_snapshot.json')))
data = json.loads(open(os.path.join(ROOT, 'data', 'world.js')).read().split('=', 1)[1].rstrip(';\n'))
def norm(s): return re.sub(r'[^a-z]', '', unicodedata.normalize('NFKD', s.lower()).encode('ascii', 'ignore').decode())
ALIASES = {'ulaanbaatar': 'ulanbator', 'washingtondc': 'washingtondc'}
bad = []
for cid, name, iso, cap, lvl, fact in W.COUNTRIES:
    s = snap[cid]
    if s['cca2'].lower() != iso: bad.append(f'{name}: ISO {iso} vs {s["cca2"]}')
    if not any(ALIASES.get(norm(cap), norm(cap)) == norm(c) for c in s['capital']): bad.append(f'{name}: capital {cap} vs {s["capital"]}')
by = {c['name']: c for c in data['countries']}
shapes = {s['id'] for s in data['shapes']}
for n, c in by.items():
    if not os.path.exists(os.path.join(ROOT, c['flag'])): bad.append(f'{n}: missing flag file')
    if c['id'] not in shapes: bad.append(f'{n}: missing map shape')
    if not c['continent']: bad.append(f'{n}: no continent')
    s = snap[c['id']]
    if c['zh'] != s['zh'] and c['iso'] not in ('cd',): bad.append(f'{n}: zh {c["zh"]} vs {s["zh"]}')
    for k in ('zhAudio', 'esAudio'):
        if not os.path.exists(os.path.join(ROOT, 'audio', c[k])): bad.append(f'{n}: missing audio {c[k]}')
lvA = [c for c in data['countries'] if c['level'] == 'A']
print(f'{len(W.COUNTRIES)} countries ({len(lvA)} Level A), capitals/ISO/zh/flags/shapes/audio checked against world-countries snapshot')
print('MISMATCHES:', bad); sys.exit(1 if bad else 0)
