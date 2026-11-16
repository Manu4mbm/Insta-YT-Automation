import json,re,difflib,uroman as ur
S=__import__("sys").argv[1]
mms=json.load(open(f"{S}/mms.json")); wh=json.load(open(f"{S}/whisper_words.json"))
U=ur.Uroman()
def n(t): return re.sub(r"[^a-z]","",t.lower())
def sk(t): # crude phonetic skeleton
    t=n(t); t=t.replace("ph","f").replace("sh","s").replace("ch","c").replace("aa","a").replace("ee","i").replace("oo","u").replace("w","v").replace("z","j")
    return re.sub(r"(.)\1+",r"\1",t)
A=[sk(x["text"]) for x in mms]
B=[sk(U.romanize_string(x["w"])) for x in wh]
# DP alignment
import numpy as np
INF=1e9;m,k=len(A),len(B)
D=np.full((m+1,k+1),INF);D[0,:]=np.arange(k+1)*0.6;D[:,0]=np.arange(m+1)*0.6;P={}
for i in range(1,m+1):
  for j in range(1,k+1):
    s=1-difflib.SequenceMatcher(None,A[i-1],B[j-1]).ratio()
    opts=[(D[i-1,j-1]+s,1),(D[i-1,j]+0.6,2),(D[i,j-1]+0.6,3)]
    D[i,j],P[i,j]=min(opts)
i,j=m,k;pairs={}
while i>0 and j>0:
  p=P[i,j]
  if p==1: pairs[i-1]=j-1;i-=1;j-=1
  elif p==2:i-=1
  else:j-=1
res=[]
for i,x in enumerate(mms):
  j=pairs.get(i); x["wh_start"]=wh[j]["s"] if j is not None else None
json.dump(mms,open(f"{S}/mms_x.json","w"),ensure_ascii=False,indent=1)
lines={}
for x in mms: lines.setdefault(x["line"],[]).append(x)
for li,ws in lines.items():
  d=[abs(x["start"]-x["wh_start"]) for x in ws if x["wh_start"] is not None]
  print(li, f"matched {len(d)}/{len(ws)}", f"median {np.median(d):.2f}" if d else "", f"max {max(d):.2f}" if d else "", round(float(np.mean([x['score'] for x in ws])),2), " ".join(x["text"] for x in ws)[:50])
