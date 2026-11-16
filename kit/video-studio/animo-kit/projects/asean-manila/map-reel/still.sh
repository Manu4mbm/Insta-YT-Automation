#!/bin/bash
# usage: still.sh t1 t2 ... -> out/sheet.png
cd /home/claude/work/asean; rm -f out/st_*.png; i=0
for t in "$@"; do f=$(python3 -c "print(int($t*30))"); npx remotion still src/index.ts Asean out/st_$(printf %02d $i).png --frame=$f --browser-executable=/usr/bin/google-chrome --scale=0.3 --log=error >/dev/null 2>&1 & i=$((i+1)); if (( i % 2 == 0 )); then wait; fi; done; wait
python3 - "$@" <<'P'
import sys,glob
from PIL import Image, ImageDraw
fs=sorted(glob.glob('out/st_*.png')); ims=[Image.open(f) for f in fs]
w,h=ims[0].size; cols=min(5,len(ims)); rows=(len(ims)+cols-1)//cols
s=Image.new('RGB',(w*cols,h*rows))
for i,(im,t) in enumerate(zip(ims,sys.argv[1:])):
  s.paste(im,((i%cols)*w,(i//cols)*h)); ImageDraw.Draw(s).text(((i%cols)*w+5,(i//cols)*h+5),t,fill=(255,0,0))
s.save('out/sheet.png')
P
