"""Synthesise SFX + soft music bed for the reel, cued from src/words.json.
python sfx/gen.py  ->  public/sfx.wav, public/music.wav  (44.1 kHz mono)"""
import json, os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 44100; ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = json.load(open(f"{ROOT}/src/words.json")); ws = lambda i: W[i]["start"]
DUR = W[-1]["end"] + 0.4; N = int(DUR * SR)
rng = np.random.default_rng(7)
T = lambda d: np.arange(int(d * SR)) / SR
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, hi): return sosfilt(butter(2, hi, 'low', fs=SR, output='sos'), x)
def env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)

def whoosh(d=0.4, lo=300, hi=3000, amp=0.35):
    n = int(d*SR); x = rng.standard_normal(n); t = np.linspace(0, 1, n)
    a = bp(x, lo, hi) * np.sin(np.pi * t) ** 2
    b = bp(x, lo*2, min(hi*2, 16000)) * np.sin(np.pi * np.clip(t*1.4-0.2, 0, 1)) ** 2
    y = a + 0.5*b; return amp * y / (np.abs(y).max() + 1e-9)
def thud(amp=0.9, f0=140, f1=42, d=0.35):
    t = T(d); f = f1 + (f0 - f1) * np.exp(-t * 18)
    body = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t * 9)
    click = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 90) * 0.6
    slap = bp(rng.standard_normal(len(t)), 600, 1800) * np.exp(-t * 40) * 0.5
    y = body + click + slap; return amp * y / np.abs(y).max()
def pop(amp=0.4, f0=500, f1=1100, d=0.09):
    t = T(d); f = f0 + (f1 - f0) * t / d
    return amp * np.sin(2*np.pi*np.cumsum(f)/SR) * env(len(t), 0.002, 0.03)
def tick(amp=0.25, f=2200, d=0.03):
    t = T(d); return amp * (np.sin(2*np.pi*f*t) + 0.5*bp(rng.standard_normal(len(t)), 3000, 8000)) * np.exp(-t*160)
def note(freq, amp=0.25, d=0.9, bell=False):
    t = T(d); parts = [(1, 1), (2.76, 0.35), (5.4, 0.15)] if bell else [(1, 1), (2, 0.3), (4, 0.08)]
    y = sum(a*np.sin(2*np.pi*freq*m*t) * np.exp(-t*(3 + m*2)) for m, a in parts)
    return amp * y * np.minimum(1, t/0.004)
def chime(base=880, amp=0.22): return mix_list([(0, note(base, amp, 1.4, True)), (0.07, note(base*1.5, amp*0.7, 1.2, True))])
def scribble(d=0.5, amp=0.18):
    n = int(d*SR); t = np.arange(n)/SR; x = bp(rng.standard_normal(n), 2000, 6500)
    am = 0.5 + 0.5*np.sin(2*np.pi*(11 + 3*np.sin(2*np.pi*1.7*t))*t)
    return amp * x * am * np.sin(np.pi*t/d) / (np.abs(x).max()+1e-9) * 3
def paper(d=0.3, amp=0.25):
    n = int(d*SR); t = np.linspace(0, 1, n); x = bp(rng.standard_normal(n), 400, 2500)
    return amp * x * np.sin(np.pi*t)**1.5 / (np.abs(x).max()+1e-9)
def heartbeat(amp=0.5):
    b = lambda: thud(amp, 90, 45, 0.18) * 0.8
    return mix_list([(0, b()), (0.22, b()*0.7)])
def flatline(d=0.9, amp=0.06):
    t = T(d); return amp * np.sin(2*np.pi*988*t) * np.minimum(1, t/0.01) * np.minimum(1, (d - t)/0.15)
def marker(d=0.35, amp=0.2):
    n = int(d*SR); t = np.linspace(0, 1, n); x = bp(rng.standard_normal(n), 1200, 5000)
    return amp * x * np.sin(np.pi*t) / (np.abs(x).max()+1e-9) * 1.5
def mix_list(items):
    L = max(int(o*SR) + len(x) for o, x in items); y = np.zeros(L)
    for o, x in items: s = int(o*SR); y[s:s+len(x)] += x
    return y

C5, E5, G5, C6 = 523.25, 659.25, 783.99, 1046.5
cues = [
 # S1
 (ws(0)-0.05, whoosh(0.35, 250, 2500, 0.3)), (ws(4), thud()), (ws(6)-0.05, whoosh(0.35, 250, 2500, 0.3)), (ws(6)+0.12, pop(0.18, 300, 500)), (ws(10), thud()), (4.40, whoosh(0.4, 200, 4000, 0.35)),
 # S2
 (ws(12), pop(0.35, 420, 900)), (ws(13), paper()), *[(ws(15) + k*0.055, tick(0.22, 1800 + k*120)) for k in range(6)], (ws(15)+0.04, thud(0.8, 160, 50)), (ws(15)+0.22, tick(0.3, 3200)), (ws(15)+0.3, tick(0.3, 3000)),
 # S3
 (7.58, whoosh(0.4, 200, 2000, 0.25)), (ws(19), pop(0.3, 500, 1000)), (ws(21), scribble(0.45)), (ws(26), thud(0.85)), (ws(29), pop(0.3, 400, 800)), (ws(32), paper(0.22, 0.3)), (ws(34), thud(1.0, 120, 38, 0.45)), (14.3, whoosh(0.5, 150, 1500, 0.3)),
 # S4
 (14.75, whoosh(0.5, 100, 900, 0.4)), *[(ws(38) + (16.5-ws(38))*k/23, tick(0.12, 1500)) for k in range(24)], (16.95, heartbeat()), (17.45, heartbeat(0.35)), (ws(46), flatline()), (ws(50), thud(0.7, 110, 40, 0.4)), (ws(52), thud(1.0, 90, 30, 0.6)),
 # S5 / S6
 (ws(57), pop(0.25, 300, 600)), (23.9, tick(0.12, 2400)), (24.4, whoosh(0.5, 300, 3000, 0.22)), (ws(62), marker()), (ws(66), whoosh(0.6, 80, 600, 0.35)),
 # S7 — rising notes on each bar = "positive"
 (30.25, whoosh(0.45, 200, 2500, 0.25)), (ws(80), note(C5)), (ws(82), note(E5)), (ws(85), note(G5)), (ws(89), scribble(0.3, 0.2)), (ws(90), thud(0.8, 150, 50)), (ws(90)+0.02, note(C6, 0.15)), (40.55, whoosh(0.4, 300, 4000, 0.3)),
 # S8
 (ws(95), chime(880, 0.2)), (ws(101), paper()), *[(ws(103) + k*0.075, tick(0.1, 2000 + (k%3)*300)) for k in range(24)], (ws(105), paper(0.6, 0.3)), (ws(114), marker()), (ws(117), chime(1046.5, 0.18)),
 # S9
 (50.05, whoosh(0.4, 200, 2500, 0.22)), (ws(119), pop(0.25)), (ws(119)+0.1, pop(0.25, 600, 1200)), (ws(121), pop(0.3, 300, 700)), (ws(125), scribble(0.5, 0.15)), (ws(127), whoosh(0.3, 800, 6000, 0.25)), (ws(128), thud(0.6, 180, 60, 0.25)),
 (ws(131), pop(0.3, 350, 700)), (ws(134), whoosh(0.9, 300, 3000, 0.22)), (ws(136), pop(0.3, 450, 900)), (ws(138), note(C5, 0.25)), (ws(140), note(E5, 0.25)), (ws(142), note(G5, 0.28)),
 # S10 / S11
 (ws(149), whoosh(0.6, 100, 1200, 0.35)), (ws(150)-0.1, whoosh(0.35, 300, 3000, 0.25)), (ws(154), thud(1.0)), (ws(154)+0.01, chime(1046.5, 0.25)),
 (65.95, whoosh(0.5, 200, 4000, 0.3)), (ws(156), chime(784, 0.22)), (ws(158), pop(0.25)), (ws(161), tick(0.35, 1500)), (ws(161)+0.01, thud(0.3, 200, 90, 0.12)),
]
sfx = np.zeros(N)
for o, x in cues:
    s = int(max(0, o) * SR); e = min(N, s + len(x)); sfx[s:e] += x[:e-s]
sfx = sfx / max(1, np.abs(sfx).max() / 0.9)

# soft warm pad: tense minor in the problem section, hopeful I–V–vi–IV after
def chord(freqs, d, amp):
    t = T(d); y = sum(np.sin(2*np.pi*f*t) + 0.5*np.sin(2*np.pi*f*1.003*t) + 0.15*np.sin(2*np.pi*f*2*t) for f in freqs)
    a = np.minimum(1, t/0.8) * np.minimum(1, (d - t)/0.8); return amp * y * a / len(freqs)
mus = np.zeros(N)
def put(o, x):
    s = int(o*SR); e = min(N, s+len(x)); mus[s:e] += x[:e-s]
hope = [[261.6, 329.6, 392.0], [196.0, 246.9, 293.7], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6]]  # C G Am F
tense = [[220.0, 261.6, 329.6], [207.7, 261.6, 311.1]]
t0 = 0.0
while t0 < 14.8: put(t0, chord(hope[int(t0/3.7) % 4], 4.5, 0.05)); t0 += 3.7
t0 = 14.8
while t0 < 24.4: put(t0, chord([f/2 for f in tense[int((t0-14.8)/4.8) % 2]], 5.6, 0.06)); t0 += 4.8
t0 = 24.4
while t0 < DUR: put(t0, chord(hope[int((t0-24.4)/3.6) % 4], 4.4, 0.055)); t0 += 3.6
# gentle pluck arpeggio from the solution onwards
arp = [523.25, 659.25, 783.99, 659.25]; k = 0; t0 = 30.3
while t0 < DUR - 0.5: put(t0, note(arp[k % 4], 0.035, 0.5)); t0 += 0.45; k += 1
mus = lp(mus, 3500)
fade = np.ones(N); fade[:SR] = np.linspace(0, 1, SR); fade[-SR:] = np.linspace(1, 0, SR); mus *= fade
os.makedirs(f"{ROOT}/public", exist_ok=True)
sf.write(f"{ROOT}/public/sfx.wav", sfx.astype(np.float32), SR)
sf.write(f"{ROOT}/public/music.wav", mus.astype(np.float32), SR)
print("cues:", len(cues), "dur:", round(DUR, 2))
