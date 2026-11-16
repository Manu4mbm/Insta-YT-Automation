"""Pass 02: python timing.py <reel-folder>
Forced-aligns script.txt to audio.mp3 (MMS_FA) + cross-checks with faster-whisper.
Writes <reel>/timing/{words.json,lines.json,report.md}. Work files go to <reel>/.work/"""
import os, subprocess, sys
R = os.path.abspath(sys.argv[1]); H = os.path.dirname(os.path.abspath(__file__)); W = os.path.join(R, ".work")
lang = sys.argv[2] if len(sys.argv) > 2 else "hi"   # whisper language hint: hi / en
os.makedirs(W, exist_ok=True); os.makedirs(os.path.join(R, "timing"), exist_ok=True)
run = lambda *a: subprocess.run(a, check=True)
run("ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", os.path.join(R, "audio.mp3"), "-ac", "1", "-ar", "16000", os.path.join(W, "a16.wav"))
py = sys.executable
run(py, os.path.join(H, "align.py"), R, os.path.join(W, "a16.wav"), os.path.join(W, "mms.json"))
os.chdir(W); run(py, os.path.join(H, "tx.py"), os.path.join(W, "a16.wav"), lang)
run(py, os.path.join(H, "xcheck.py"), W)
run(py, os.path.join(H, "write_timing.py"), W, R)
print("\nDone →", os.path.join(R, "timing", "report.md"))
