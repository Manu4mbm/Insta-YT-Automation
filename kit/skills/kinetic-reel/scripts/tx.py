import json,sys
import soundfile as sf
from faster_whisper import WhisperModel
a,_=sf.read(sys.argv[1],dtype="float32")
m=WhisperModel("medium",device="cpu",compute_type="int8")
segs,info=m.transcribe(a,language=(sys.argv[2] if len(sys.argv)>2 else "hi"),word_timestamps=True,initial_prompt=None)
out=[]
for s in segs:
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}")
    for w in s.words: out.append({"w":w.word.strip(),"s":round(w.start,3),"e":round(w.end,3),"p":round(w.probability,3)})
json.dump(out,open("whisper_words.json","w"),ensure_ascii=False,indent=0)
