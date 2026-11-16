import json,re,sys,torch,torchaudio,soundfile as sf
R=sys.argv[1]; wav=sys.argv[2]
lines=[l.rstrip("\n") for l in open(f"{R}/script.txt",encoding="utf-8") if l.strip()]
words=[]
for li,l in enumerate(lines):
    for tok in l.split():
        hero=tok.count("*")>=1
        words.append({"text":tok.replace("*",""),"line":li,"hero":hero})
# merge hero spans across tokens like *bina jaane*
for li,l in enumerate(lines):
    inside=False
    idx=[i for i,w in enumerate(words) if w["line"]==li]
    for i,tok in zip(idx,l.split()):
        st=tok.startswith("*") or tok.lstrip('"').startswith("*")
        en=tok.rstrip('.,?:"').endswith("*")
        if st: inside=True
        words[i]["hero"]=inside
        if en: inside=False
def norm(t): return re.sub(r"[^a-z']","",t.lower())
a,sr=sf.read(wav,dtype="float32"); w=torch.tensor(a).unsqueeze(0)
b=torchaudio.pipelines.MMS_FA
model=b.get_model(with_star=False); tok=b.get_tokenizer(); aligner=b.get_aligner()
with torch.inference_mode(): em,_=model(w)
# spoken forms for digits (Hinglish default); extend per reel if needed
NUM={"0":"zero","1":"ek","2":"do","3":"teen","4":"chaar","5":"paanch","6":"chhe","7":"saat","8":"aath","9":"nau","10":"das","11":"gyarah","12":"barah","100":"sau"}
def spoken(t):
    raw=re.sub(r"[^0-9a-zA-Z']","",t)
    if raw.isdigit(): return NUM.get(raw, " ".join(NUM.get(c,"") for c in raw)).replace(" ","")
    return norm(t)
T=[spoken(x["text"]) for x in words]
keep=[i for i,t in enumerate(T) if t]
spans=aligner(em[0],tok([T[i] for i in keep]))
ratio=w.size(1)/em.size(1)/sr
for i,sp in zip(keep,spans):
    x=words[i]; x["start"]=round(sp[0].start*ratio,3); x["end"]=round(sp[-1].end*ratio,3)
    x["score"]=round(float(sum(s.score*len(s) for s in sp)/sum(len(s) for s in sp)),3)
for i,x in enumerate(words):   # untokenisable words: squeeze between neighbours
    if "start" not in x:
        x["start"]=words[i-1]["end"] if i else 0.0
        x["end"]=next((y["start"] for y in words[i+1:] if "start" in y), x["start"]+0.3); x["score"]=0.0
json.dump(words,open(sys.argv[3],"w"),ensure_ascii=False,indent=1)
for i,x in enumerate(words): print(i,x["line"],x["text"],x["start"],x["end"],x["score"],"H" if x["hero"] else "")
