"""Cross-checks the 50 state capitals in content_us.py against a saved Wikipedia snapshot
(List of capitals in the United States, fetched 2026-10-02, saved as tools/wikipedia_capitals_snapshot.txt)."""
import re, os, sys
sys.path.insert(0, os.path.dirname(__file__)); from content_us import STATES
raw = open(os.path.join(os.path.dirname(__file__), 'wikipedia_capitals_snapshot.txt')).read()
pairs = re.findall(r"\|\s*\{\{flagicon\|([^}]+)\}\}\s*\[\[([^\]]+)\]\]\s*\n!scope=row\|\[\[([^\]]+)\]\]", raw)
wiki = {}
for _, state, cap in pairs:
    state = state.split('|')[-1].strip(); cap = cap.split('|')[-1].strip(); wiki.setdefault(state, cap)
bad = [(s, STATES[s][1], wiki.get(s)) for s in STATES if wiki.get(s) != STATES[s][1]]
print(f"{len(wiki)} states parsed; mismatches: {bad}"); sys.exit(1 if bad or len([s for s in STATES if s in wiki]) != 50 else 0)
