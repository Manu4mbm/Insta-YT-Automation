"""Textures, synthesized SFX and music bed for the India-unification reel (all generated here, no third-party media)."""
import numpy as np, wave, os
from PIL import Image, ImageFilter
from scipy.ndimage import gaussian_filter

os.makedirs("public", exist_ok=True)
rng = np.random.default_rng(3)

# ---------- textures ----------
def fbm(h, w, octaves=6):
    out = np.zeros((h, w))
    for o in range(octaves):
        s = 2 ** o
        n = rng.random((h // (256 // s) + 2, w // (256 // s) + 2)) if 256 // s >= 1 else rng.random((h, w))
        n = np.array(Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)) / 255.0
        out += n / (o + 1.4)
    out -= out.min(); out /= out.max()
    return out

h, w = 1200, 1000
n = fbm(h, w)
grain = gaussian_filter(rng.random((h, w)), 0.7)
tex = 0.78 + 0.22 * n + 0.06 * (grain - 0.5)
img = (np.clip(tex, 0, 1) * 255).astype(np.uint8)
Image.fromarray(img).resize((2000, 2400), Image.BICUBIC).save("public/parchment.png")

h2, w2 = 960, 540
yy, xx = np.mgrid[0:h2, 0:w2]
r = np.hypot((xx - w2 / 2) / w2, (yy - h2 * 0.45) / h2)
base = np.clip(1 - r * 1.25, 0, 1)
n2 = fbm(h2, w2, 5)
v = 14 + 26 * base + 8 * n2
table = np.stack([v * 0.82, v * 0.92, v * 1.05], -1)
Image.fromarray(np.clip(table, 0, 255).astype(np.uint8)).resize((1080, 1920), Image.BICUBIC).save("public/table.png")

# ---------- audio ----------
SR = 48000
def save(name, x):
    x = np.clip(x, -1, 1)
    st = np.stack([x, x], -1) if x.ndim == 1 else x
    with wave.open(f"public/{name}.wav", "wb") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((st * 32767).astype(np.int16).tobytes())

def t_(d): return np.arange(int(SR * d)) / SR
def env(d, a=0.005, rel=0.3):
    t = t_(d); e = np.minimum(1, t / a) * np.exp(-t / rel); return e
def lp(x, sigma): return gaussian_filter(x, sigma)
noise = lambda d: rng.standard_normal(int(SR * d))

# boom / impact
t = t_(2.2)
boom = (np.sin(2 * np.pi * (48 * t + 30 * (1 - np.exp(-t * 6)) / 6)) * np.exp(-t * 2.2) * 0.9
        + lp(noise(2.2), 3) * np.exp(-t * 9) * 0.5)
save("boom", boom * 0.9)

# whoosh: noise swept through a moving low-pass
d = 1.1; t = t_(d); x = noise(d)
e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
y = np.zeros_like(x); acc = 0
cut = 0.02 + 0.25 * e
for i in range(len(x)):
    acc += cut[i] * (x[i] - acc); y[i] = acc
save("whoosh", y * e * 1.6)

# tick (map pin pop)
t = t_(0.09)
tick = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 70) * 0.5 + lp(noise(0.09), 1) * np.exp(-t * 120) * 0.25
save("tick", tick)

# stamp / thud
t = t_(0.6)
stamp = np.sin(2 * np.pi * 85 * t) * np.exp(-t * 14) * 0.9 + lp(noise(0.6), 2) * np.exp(-t * 30) * 0.7
save("stamp", stamp)

# paper rustle
d = 0.8; t = t_(d)
r_ = noise(d) - lp(noise(d), 8)
mod = np.abs(lp(rng.standard_normal(len(t)), 900)); mod /= mod.max()
save("paper", r_ * mod * np.sin(np.pi * t / d) * 0.5)

# pen scratch
d = 1.6; t = t_(d)
sc = (noise(d) - lp(noise(d), 2)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 5.5 * t)))
save("pen", sc * np.sin(np.pi * t / d) * 0.25)

# sword clash / metal hit
t = t_(1.2)
clash = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(2210, 6), (3350, 8), (4710, 10), (1530, 5)]) * 0.18
clash += (noise(1.2) - lp(noise(1.2), 1)) * np.exp(-t * 25) * 0.6
save("clash", clash)

# rising shimmer
d = 2.4; t = t_(d)
sh = sum(np.sin(2 * np.pi * f * t * (1 + 0.15 * t / d)) for f in [880, 1320, 1760, 2640]) / 4
sh *= (t / d) ** 2 * np.exp(-np.maximum(0, t - d * 0.85) * 12) * 0.35
save("shimmer", sh)

# alarm pulse (holdouts)
t = t_(0.5)
save("pulse", np.sin(2 * np.pi * 220 * t) * np.sin(np.pi * t / 0.5) ** 2 * 0.45)

# war drum
t = t_(0.9)
drum = np.sin(2 * np.pi * (62 * t + 40 * (1 - np.exp(-t * 18)) / 18)) * np.exp(-t * 5) + lp(noise(0.9), 4) * np.exp(-t * 20) * 0.4
save("drum", drum * 0.8)

# march footsteps (rhythmic low thumps)
d = 3.2; t = t_(d); m = np.zeros_like(t)
for k in np.arange(0, d, 0.42):
    i = int(k * SR); seg = t_(0.2)
    m[i:i + len(seg)] += (np.sin(2 * np.pi * 70 * seg) * np.exp(-seg * 30) + lp(noise(0.2), 3) * np.exp(-seg * 40) * 0.5)[: len(m) - i]
save("march", m * 0.5)

# ---------- music bed: slow cinematic drone + low strings + war drums, D minor ----------
D = 72.0; t = t_(D)
def pad(freqs, amp):
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.6, 0, 0.6):
            ph = rng.random() * 6.28
            s += np.sin(2 * np.pi * (f + det) * t + ph) + 0.35 * np.sin(2 * np.pi * 2 * (f + det) * t + ph) + 0.15 * np.sin(2 * np.pi * 3 * (f + det) * t)
    return s * amp
chords = [(0, [73.42, 110.0, 146.83]), (8, [58.27, 87.31, 116.54]), (16, [65.41, 98.0, 130.81]), (24, [55.0, 82.41, 110.0])]
bed = np.zeros_like(t)
for start in range(0, int(D), 32):
    for off, fr in chords:
        a = start + off
        if a >= D: break
        seg = (t >= a) & (t < a + 8.6)
        local = np.clip((t - a) / 1.2, 0, 1) * np.clip((a + 8.6 - t) / 1.2, 0, 1)
        bed += pad(fr, 0.05) * local * seg
bed *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.15 * t)
# drums: 70 bpm, heavier from 42 s (Operation Polo) and the finale
beat = 60 / 70
dr = np.zeros_like(t); seg = t_(0.9)
dshape = np.sin(2 * np.pi * (55 * seg + 35 * (1 - np.exp(-seg * 18)) / 18)) * np.exp(-seg * 5)
k = 0.0
while k < D - 1:
    lvl = 0.10 if k < 17 else 0.16
    if 42.7 < k < 50.5 or 58.4 < k < 65.5: lvl = 0.30
    if int(round(k / beat)) % 2 == 0 or lvl > 0.2:
        i = int(k * SR); dr[i:i + len(seg)] += dshape[: len(dr) - i] * lvl
    k += beat
music = lp(bed, 1.5) + dr
fade = np.clip(t / 1.5, 0, 1) * np.clip((D - t) / 3.0, 0, 1)
music *= fade
music /= np.abs(music).max() * 1.05
save("music", music)
print("assets ok")
