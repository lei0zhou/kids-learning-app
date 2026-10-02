"""Pre-generates speech MP3s with edge-tts (Microsoft neural voices), then transcodes to 32 kbps mono."""
import asyncio, json, os, subprocess, edge_tts
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
man = json.load(open(os.path.join(ROOT, "tools", "audio_manifest.json")))
VOICE = {"zh": ("zh-CN-XiaoxiaoNeural", "-15%"), "en": ("en-US-JennyNeural", "-10%"), "es": ("es-MX-DaliaNeural", "-15%")}
sem = asyncio.Semaphore(6)
async def one(path, lang, text):
    out = os.path.join(ROOT, "audio", path)
    if os.path.exists(out) and os.path.getsize(out) > 1000: return
    os.makedirs(os.path.dirname(out), exist_ok=True); tmp = out + ".raw.mp3"; v, r = VOICE[lang]
    async with sem:
        for i in range(4):
            try:
                await edge_tts.Communicate(text, v, rate=r).save(tmp); break
            except Exception as e:
                print("retry", path, e); await asyncio.sleep(2 + i * 3)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-ac", "1", "-ar", "22050", "-b:a", "32k", out], check=True)
    os.remove(tmp)
async def main():
    await asyncio.gather(*(one(p, l, t) for p, (l, t) in man.items()))
asyncio.run(main())
missing = [p for p in man if not os.path.exists(os.path.join(ROOT, "audio", p))]
print("done", len(man), "missing", missing)
