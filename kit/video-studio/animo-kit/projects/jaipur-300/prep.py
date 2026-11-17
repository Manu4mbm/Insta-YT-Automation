import json, math, random
W = H = 2400
LON0, LAT1, SC = 75.66, 27.04, 2400 / 0.28
K = math.cos(math.radians(26.9))
def P(lon, lat): return [round((lon - LON0) * K * SC + 130, 1), round((LAT1 - lat) * SC, 1)]
def d_of(pts, close=True): return "M" + " L".join(f"{x},{y}" for x, y in (P(*p) for p in pts)) + ("Z" if close else "")

wards = json.load(open("../wards.geojson"))["features"]
WC = (75.825, 26.924)
def cen(g):
    pts = []
    def w(c):
        if isinstance(c[0], (int, float)): pts.append(c)
        else:
            for k in c: w(k)
    w(g["coordinates"]); return sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)
WALLED = [(75.8085, 26.9265), (75.8120, 26.9345), (75.8215, 26.9395), (75.8330, 26.9400), (75.8405, 26.9350), (75.8425, 26.9250), (75.8370, 26.9140), (75.8250, 26.9115), (75.8105, 26.9135)]
out_w = []
for f in wards:
    g = f["geometry"]; polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
    d = " ".join(d_of(r) for poly in polys for r in poly)
    x, y = cen(g); km = math.hypot((x - WC[0]) * K * 111, (y - WC[1]) * 111)
    yr = 1876 + km / 1.6 * 66 if km < 1.6 else 1942 + (km - 1.6) / 1.8 * 18 if km < 3.4 else 1960 + (km - 3.4) / 3.8 * 30 if km < 7.2 else 1990 + min(1, (km - 7.2) / 6) * 22
    out_w.append({"d": d, "y": round(yr), "c": P(x, y)})

random.seed(4)
hills = []
for i in range(420):
    x = 75.78 + random.random() * 0.13; y = 26.942 + random.random() * 0.09
    if y < 26.94 + (x - 75.78) * 0.22: continue
    px, py = P(x, y); h = 22 + random.random() * 10
    hills.append(f"M{px-11:.1f},{py:.1f} L{px:.1f},{py-h:.1f} L{px+11:.1f},{py:.1f}")
roads = {
    "ajmer": [(75.8085, 26.9265), (75.79, 26.915), (75.75, 26.9), (75.70, 26.88), (75.64, 26.86)],
    "sikar": [(75.8085, 26.9265), (75.79, 26.935), (75.75, 26.96), (75.70, 26.99), (75.66, 27.02)],
    "tonk": [(75.8250, 26.9115), (75.815, 26.88), (75.80, 26.84), (75.79, 26.80), (75.78, 26.76)],
    "agra": [(75.8425, 26.925), (75.87, 26.92), (75.91, 26.91), (75.96, 26.90)],
    "delhi": [(75.8405, 26.935), (75.85, 26.96), (75.851, 26.985), (75.87, 27.04)],
}
MI = [(75.795, 26.9155), (75.806, 26.9160), (75.8105, 26.9165), (75.8205, 26.9160)]
metro = [(75.7611, 26.8727), (75.7700, 26.8840), (75.7780, 26.8950), (75.7870, 26.9060), (75.7880, 26.9190), (75.7990, 26.9230), (75.8110, 26.9262), (75.8270, 26.9240)]
river = [(75.755, 26.975), (75.742, 26.94), (75.745, 26.90), (75.758, 26.865), (75.785, 26.84), (75.82, 26.825), (75.86, 26.81), (75.90, 26.79)]
L = lambda lon, lat: P(lon, lat)
places = {
    "hawa": L(75.8267, 26.9239), "jantar": L(75.8246, 26.9248), "palace": L(75.8237, 26.9258), "govind": L(75.8240, 26.9290),
    "isarlat": L(75.8195, 26.9225), "albert": L(75.8195, 26.9116), "amer": L(75.8513, 26.9855), "nahargarh": L(75.8155, 26.9375),
    "chandpole": L(75.8086, 26.9265), "surajpole": L(75.8425, 26.9250), "sanganeri": L(75.8275, 26.9150),
    "malviya": L(75.8230, 26.8540), "mansarovar": L(75.7600, 26.8700), "vaishali": L(75.7400, 26.9100), "jagatpura": L(75.8550, 26.8250),
    "wc": L(*WC), "mi": L(75.806, 26.9175),
}
data = {"W": W, "H": H, "wards": out_w, "walled": d_of(WALLED), "hills": " ".join(hills),
        "roads": {k: d_of(v, False) for k, v in roads.items()}, "mi": d_of(MI, False), "metro": d_of(metro, False),
        "metroPts": [P(*p) for p in metro], "river": d_of(river, False), "places": places}

# ---- word timings
words = json.load(open("../words.json"))
def shift(ws, sp, off): return [[w, round(s / sp + off, 3), round(e / sp + off, 3)] for w, s, e in ws]
o2 = (76.199 + 0.8) / 1.06; o3 = o2 + (67.161 + 0.8) / 1.06; o4 = o3 + (58.828 + 0.8) / 1.06
data["reelWords"] = shift(words["reel"], 1.1, 0)
data["ytWords"] = shift(words["yt1"], 1.06, 0) + shift(words["yt2"], 1.06, o2) + shift(words["yt3"], 1.06, o3) + shift(words["yt4"], 1.06, o4)
def find(ws, sub, after=0, nth=1):
    n = 0
    for w, s, e in ws:
        if s >= after and sub in w:
            n += 1
            if n == nth: return s
    raise SystemExit(f"not found {sub} after {after}")
R = data["reelWords"]; Y = data["ytWords"]
cue = {}
cue["r"] = {
    "aaj": find(R, "आज"), "n1727": find(R, "अठारह"), "vidya": find(R, "विद्याधर"), "nau": find(R, "नौ"), "parkota": find(R, "चारों"),
    "y1734": find(R, "चौंतीस"), "jm": find(R, "जंतर"), "y1799": find(R, "निन्यानवे"), "hm": find(R, "हवा"), "y1876": find(R, "छिहत्तर"),
    "gulabi": find(R, "गुलाबी"), "pink": find(R, "पिंक"), "y1942": find(R, "बयालीस"), "mi": find(R, "एम"), "y1949": find(R, "उनचास"),
    "capital": find(R, "राजधानी"), "y1982": find(R, "बयासी"), "faila": find(R, "फैला"), "malviya": find(R, "मालवीय"), "mansarovar": find(R, "मानसरोवर"),
    "vaishali": find(R, "वैशाली"), "y2015": find(R, "पंद्रह"), "metro": find(R, "मेट्रो"), "y2019": find(R, "उन्नीस", find(R, "मेट्रो")),
    "unesco": find(R, "यूनेस्को"), "y1901": find(R, "एक", find(R, "हेरिटेज")), "y2011": find(R, "ग्यारह"), "cta": find(R, "जयपुर", find(R, "ज़्यादा")),
    "follow": find(R, "फ़ॉलो"), "end": R[-1][2],
}
cue["y"] = {
    "amer": find(Y, "आमेर"), "pani": find(Y, "पानी"), "jaisingh": find(Y, "सवाई"), "gyarah": find(Y, "ग्यारह"), "aaj": find(Y, "आज"),
    "kahani": find(Y, "कहानी"), "c2": find(Y, "अठारह", find(Y, "कहानी")), "vidya": find(Y, "विद्याधर"), "nau": find(Y, "नौ"), "sadak": find(Y, "सीधी"),
    "chaupad": find(Y, "चौपड़"), "parkota": find(Y, "परकोटा", find(Y, "चौपड़")), "chandpole": find(Y, "चाँदपोल"), "vyapar": find(Y, "व्यापार"),
    "c3": o2, "y1734": find(Y, "चौंतीस"), "y1735": find(Y, "पैंतीस"), "y1749": find(Y, "उनचास"), "y1799": find(Y, "निन्यानवे"), "hm": find(Y, "हवा"),
    "jharokhe": find(Y, "झरोखे"), "c4": find(Y, "छिहत्तर"), "gulabi": find(Y, "गुलाबी"), "pink": find(Y, "पिंक"), "albert": find(Y, "अल्बर्ट", find(Y, "पिंक")),
    "y1887": find(Y, "सत्तासी"), "y1901": find(Y, "उन्नीस", find(Y, "परकोटे", find(Y, "सत्तासी"))),
    "c5": o3, "y1942": find(Y, "बयालीस"), "paanch": find(Y, "पाँच"), "mi": find(Y, "मिर्ज़ा"), "y1947": find(Y, "सैंतालीस"), "y1949": find(Y, "उनचास", o3),
    "y1951": find(Y, "इक्यावन"), "y1981": find(Y, "इक्यासी"), "c6": find(Y, "बयासी"), "faila": find(Y, "फैला", o3), "malviya": find(Y, "मालवीय"),
    "mansarovar": find(Y, "मानसरोवर", o3), "vaishali": find(Y, "वैशाली"),
    "y2013": o4, "y2015": find(Y, "पंद्रह", o4), "y2018": find(Y, "अठारह", o4), "y2019": find(Y, "उन्नीस", o4), "y2011": find(Y, "ग्यारह", o4),
    "y2026": find(Y, "छब्बीस", o4), "c7": find(Y, "अब", o4), "y2027": find(Y, "सत्ताईस", o4), "natgeo": find(Y, "नेशनल"), "jlf": find(Y, "लिटरेचर"),
    "outro": find(Y, "अगर", o4), "end": Y[-1][2],
}
data["cue"] = cue
json.dump(data, open("src/data.json", "w"), ensure_ascii=False)
print(json.dumps(cue, ensure_ascii=False))
