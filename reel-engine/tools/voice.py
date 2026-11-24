#!/usr/bin/env python3
"""Tighten an ElevenLabs voice file and produce word timings + a caption draft.
usage: python3 tools/voice.py <voice.mp3> <slug> [tempo=1.08]
writes public/<slug>.wav and specs/<slug>.words.json; prints voiceEnd and words.
needs: ffmpeg, pip install faster-whisper numpy"""
import sys, json, subprocess, numpy as np
src, slug = sys.argv[1], sys.argv[2]; T = float(sys.argv[3]) if len(sys.argv) > 3 else 1.08
sr = 48000
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ar", str(sr), "-ac", "1", "-f", "f32le", "-"], capture_output=True).stdout
b = np.frombuffer(raw, dtype=np.float32); dur = len(b) / sr
log = subprocess.run(["ffmpeg", "-i", src, "-af", "silencedetect=n=-38dB:d=0.3", "-f", "null", "-"], capture_output=True, text=True).stderr
st = [float(l.split("silence_start: ")[1].split()[0]) for l in log.splitlines() if "silence_start" in l]
en = [float(l.split("silence_end: ")[1].split()[0]) for l in log.splitlines() if "silence_end" in l]
if en and st and en[0] < st[0]: en = en[1:]
keep = 0.13; segs = []; cur = 0.0
for s, e in zip(st, en):
    if e >= dur - 0.05: segs.append((cur, s + keep)); cur = None; break
    segs.append((cur, s + keep)); cur = e - keep
if cur is not None: segs.append((cur, dur))
out = np.concatenate([b[int(x * sr):int(y * sr)] for x, y in segs])
def mp(t):
    acc = 0
    for x, y in segs:
        if t <= y: return acc + max(0, t - x)
        acc += y - x
    return acc
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-", "-af", f"atempo={T},loudnorm=I=-16:TP=-1.5", "-ar", str(sr), f"public/{slug}.wav"], input=out.astype("<f4").tobytes())
from faster_whisper import WhisperModel
a16 = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", f"public/{slug}.wav", "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], capture_output=True).stdout, dtype=np.float32)
m = WhisperModel("small", device="cpu", compute_type="int8")
segs2, _ = m.transcribe(a16, language="hi", word_timestamps=True)
w = [[round(x.start, 2), round(x.end, 2), x.word.strip()] for s in segs2 for x in s.words]
json.dump(w, open(f"specs/{slug}.words.json", "w"), ensure_ascii=False)
print("voiceEnd", round(len(out) / sr / T, 2))
print(" ".join(f"{x[0]}:{x[2]}" for x in w))
