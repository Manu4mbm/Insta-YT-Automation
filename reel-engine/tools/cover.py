#!/usr/bin/env python3
"""Make a 1080x1920 cover from the spec's "cover" block with headless Chrome.
usage: python3 tools/cover.py specs/<slug>.json  -> out/<slug>-cover.jpg
cover block: {"top": "badge text", "headline": "line1\\nline2 *gold*", "chip": "SARAIGHAT · 1671", "bottom": "name", "sprite": "boat|fort|temple|king|soldier|zero"}"""
import sys, json, re, subprocess, shutil, os
spec = json.load(open(sys.argv[1])); slug = spec["slug"]; c = spec.get("cover", {})
TH = {"yoddha": ("#6a1a12", "#120406", "#f0b75e", "#ff6a3d"), "twist": ("#1d1a52", "#0a0920", "#f2c14e", "#ff9a3c"),
      "rajasthan": ("#7a2a45", "#1a0a10", "#f6c36b", "#ff5c8a"), "defence": ("#0f2a2e", "#050b0d", "#7dffb0", "#3fd0ff"), "travel": ("#0d3b4a", "#06141c", "#ffd166", "#ff7b54")}
c1, c2, gold, acc = TH.get(spec.get("theme"), TH["yoddha"])
bgimg = ""
GRAD = '<div style="position:absolute;inset:0;background:url(_coverbg.jpg) center/cover"></div><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.82) 0%,rgba(0,0,0,.25) 45%,rgba(0,0,0,.25) 70%,rgba(0,0,0,.85) 100%)"></div>'
if c.get("cleanShot") is not None:
    # render one shot with no captions, headline, stamp, chip or series pill -> clean background
    sh = dict(spec["shots"][c["cleanShot"]]); L = sh["b"] - sh["a"]
    for k in ("head", "stamp", "chip", "label", "impact"): sh.pop(k, None)
    sh["a"], sh["b"] = 0, 4
    tmp = dict(spec, captions=[], shots=[sh], voiceEnd=4, endCard=0, series="", badge="", clean=True)
    json.dump(tmp, open("out/_cleancover.json", "w"), ensure_ascii=False)
    subprocess.run(["npx", "remotion", "still", "src/index.ts", "Reel", "public/_coverbg.jpg", "--props=out/_cleancover.json", f"--frame={int(c.get('cleanAt', 1.5) * 30)}", "--log=error"], check=True)
    bgimg = GRAD
elif c.get("frameAt") is not None and os.path.exists(f"out/{slug}.mp4"):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(c["frameAt"]), "-i", f"out/{slug}.mp4", "-frames:v", "1", "public/_coverbg.jpg"])
    bgimg = '<div style="position:absolute;inset:0;background:url(_coverbg.jpg) center/cover"></div><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.82) 0%,rgba(0,0,0,.25) 45%,rgba(0,0,0,.25) 70%,rgba(0,0,0,.85) 100%)"></div>'
rich = lambda s: re.sub(r"_([^_]+)_", rf'<span style="color:{acc}">\1</span>', re.sub(r"\*([^*]+)\*", rf'<span style="color:{gold}">\1</span>', s)).replace("\n", "<br>")
art = {"boat": f'<g transform="translate(540,1250) scale(4)"><path d="M-70 0 Q0 34 70 0 L52 -10 L-52 -10Z" fill="{gold}"/><line x1="0" y1="-10" x2="0" y2="-84" stroke="{gold}" stroke-width="5"/><path d="M0 -82 L48 -40 L0 -32Z" fill="{gold}" opacity=".85"/></g><rect y="1250" width="1080" height="300" fill="#4fa3d9" opacity=".3"/>',
       "fort": '<path transform="translate(540,1350) scale(2.2)" fill="#140608" d="M-200 0 L-200 -120 L-180 -120 L-180 -140 L-160 -140 L-160 -120 L-120 -120 L-120 -200 Q-90 -250 -60 -200 L-60 -120 L60 -120 L60 -200 Q90 -250 120 -200 L120 -120 L160 -120 L160 -140 L180 -140 L180 -120 L200 -120 L200 0Z"/>',
       "temple": '<g transform="translate(540,1350) scale(2)" fill="#140608"><rect x="-160" y="-60" width="320" height="60"/><rect x="-120" y="-120" width="240" height="60"/><path d="M-80 -120 Q-80 -260 0 -330 Q80 -260 80 -120Z"/></g>',
       "zero": f'<text x="540" y="1350" text-anchor="middle" font-family="I" font-size="620" fill="{gold}" opacity=".9">0</text>'}.get(c.get("sprite", "boat"), "")
html = f"""<html><head><style>@font-face{{font-family:D;src:url(noto-serif-devanagari-devanagari-800-normal.woff2)}}@font-face{{font-family:I;src:url(inter-latin-800-normal.woff2)}}
body{{margin:0;width:1080px;height:1920px;overflow:hidden;background:radial-gradient(ellipse 120% 80% at 50% 45%,{c1},{c2} 75%);position:relative;font-family:D,I}}</style></head><body>
{bgimg}<svg width="1080" height="1920" style="position:absolute;inset:0"><circle cx="540" cy="1000" r="420" fill="{gold}" opacity=".08"/>{art}</svg>
<div style="position:absolute;top:120px;width:100%;text-align:center"><span style="display:inline-block;border:4px solid {gold};border-radius:50px;padding:10px 40px;font-size:48px;color:{gold}">{c.get('top', spec.get('series',''))}</span></div>
<div style="position:absolute;top:300px;width:100%;text-align:center;font-size:{c.get('size',120)}px;line-height:1.25;color:#fff4e6;text-shadow:0 8px 30px #000">{rich(c.get('headline',''))}</div>
{f'<div style="position:absolute;top:{c.get("chipTop",660)}px;width:100%;text-align:center"><span style="background:#d8312a;color:#fff;font-family:I;font-size:62px;padding:6px 34px;border-radius:14px">{c["chip"]}</span></div>' if c.get('chip') else ''}
<div style="position:absolute;top:1580px;width:100%;text-align:center;font-size:76px;color:{gold};text-shadow:0 6px 20px #000">{c.get('bottom','')}</div>
<div style="position:absolute;top:1720px;width:100%;text-align:center;font-family:I;font-size:40px;color:rgba(255,244,230,.75);letter-spacing:3px">@INDIABYBHARAT</div></body></html>"""
os.makedirs("out", exist_ok=True); open("public/_cover.html", "w").write(html)
chrome = shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chrome") or r"C:\Program Files\Google\Chrome\Application\chrome.exe"
subprocess.run([chrome, "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--window-size=1080,1920", f"--screenshot={os.path.abspath('out/_cover.png')}", "file://" + os.path.abspath("public/_cover.html")], capture_output=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "out/_cover.png", "-q:v", "2", f"out/{slug}-cover.jpg"]); print(f"out/{slug}-cover.jpg")
