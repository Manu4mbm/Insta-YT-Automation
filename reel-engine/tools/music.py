#!/usr/bin/env python3
"""Original music bed from a spec: tanpura drone + tabla pulse + impact booms (+ heartbeat on 'pulse' shots).
usage: python3 tools/music.py specs/<slug>.json out/<slug>-music.wav"""
import sys, json, wave, numpy as np
spec = json.load(open(sys.argv[1])); outp = sys.argv[2]
sr = 48000; VE = spec["voiceEnd"]; D = VE + spec.get("endCard", 3); n = int(sr * D)
L = np.zeros(n); R = np.zeros(n)
note = lambda m: 440 * 2 ** ((m - 69) / 12)
sa = {"yoddha": 50, "twist": 50, "rajasthan": 52, "defence": 45, "travel": 55}.get(spec.get("theme"), 50)
seq = [sa - 5, sa, sa, sa - 12]; cyc = 2.4
for k in range(int(D / (cyc / 4)) + 1):
    s = int(k * cyc / 4 * sr); e = min(n, s + int(3.2 * sr)); tt = np.arange(e - s) / sr
    x = sum((0.6 / h) * np.sin(2 * np.pi * note(seq[k % 4]) * h * tt * (1 + 0.0007 * h)) for h in range(1, 9)) * np.minimum(1, tt / 0.05) * np.exp(-tt * 0.9)
    pan = 0.3 + 0.4 * ((k % 4) / 3); L[s:e] += 0.10 * x * (1 - pan) * 2; R[s:e] += 0.10 * x * pan * 2
b = 60 / 84; pat = [1.0, 0.7, 0.7, 0.9, 0.9, 0.7, 0.7, 0.9]; i = 0
while 2.5 + i * b / 2 < VE - 0.3:
    s = int((2.5 + i * b / 2) * sr); e = min(n, s + int(0.5 * sr)); tt = np.arange(e - s) / sr
    bass = np.sin(2 * np.pi * (70 + 60 * np.exp(-tt * 25)) * tt) * np.exp(-tt * 6) if i % 8 in (0, 1, 2, 3, 4) else 0
    hi = np.sin(2 * np.pi * note(sa + 24) * tt) * np.exp(-tt * 14) * 0.6 + np.sin(2 * np.pi * note(sa + 31) * tt) * np.exp(-tt * 20) * 0.3
    x = (0.5 * bass + hi) * pat[i % 8]; L[s:e] += 0.07 * x; R[s:e] += 0.07 * x; i += 1
imp = spec.get("impacts") or [s["a"] for s in spec["shots"] if s.get("impact")]
rs = np.random.RandomState(1)
for st in imp:
    s = int(st * sr); e = min(n, s + int(1.2 * sr)); tt = np.arange(e - s) / sr
    f = 45 + 70 * np.exp(-tt * 18); x = np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-tt * 3.5) + rs.randn(e - s) * np.exp(-tt * 30) * 0.25
    L[s:e] += 0.55 * x; R[s:e] += 0.55 * x
for sh in spec["shots"]:
    if sh["type"] == "pulse":
        k = sh["a"]
        while k < sh["b"]:
            for off, g in ((0, 0.7), (0.18, 0.5)):
                s = int((k + off) * sr); e = min(n, s + int(0.3 * sr)); tt = np.arange(e - s) / sr
                hb = np.sin(2 * np.pi * 50 * tt) * np.exp(-tt * 14) * g; L[s:e] += hb; R[s:e] += hb
            k += 1 / 1.2
s = int((VE - 0.2) * sr); tt = np.arange(n - s) / sr
ch = sum(np.sin(2 * np.pi * note(m) * tt) for m in [sa, sa + 7, sa + 12, sa + 16]) / 4 * np.minimum(1, tt / 0.3) * np.exp(-tt * 0.5)
L[s:] += 0.12 * ch; R[s:] += 0.12 * ch
fade = np.ones(n); fade[:int(.5 * sr)] = np.linspace(0, 1, int(.5 * sr)); fade[-int(1.5 * sr):] = np.linspace(1, 0, int(1.5 * sr))
x = np.stack([L, R], 1) * fade[:, None]; x /= np.abs(x).max() / 0.8
with wave.open(outp, "wb") as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((x * 32767).astype("<i2").tobytes())
print("music", outp, round(D, 2), "s")
