import json,subprocess
W=json.load(open('timing/words.json'));w=lambda i:W[i]['start']
S='./sfx-src/'
ev=[(w(8),'pop_1',-14),(w(10),'pop_2',-14),(w(12),'pop_3',-14)]
ev+=[(w(15)+i*0.13*2,'notification_%d'%(1+i%4),-20) for i in range(7)]
ev+=[(w(26)-0.05,'impact_2',-10),(12.45,'whoosh_1',-12),(w(28),'impact_1',-11)]
ev+=[(w(33),'pop_4',-16),(w(35),'pop_4',-16),(16.95,'swoosh_1',-15)]
ev+=[(w(i)-0.05,'pop_1',-15) for i in (39,42,45)]
ev+=[(21.6,'whoosh_2',-13),(w(56),'swoosh_2',-15),(w(59),'swoosh_3',-15),(w(80),'pop_2',-15)]
ev+=[(33.4,'whoosh_3',-13),(w(87),'click_1',-10),(w(91),'pop_3',-16),(w(117),'pop_1',-14)]
ev+=[(44.85,'whoosh_4',-13),(w(124),'notification_1',-14),(w(131),'click_2',-12),(w(134),'notification_3',-13),(w(142),'pop_2',-16),(w(147),'pop_2',-16)]
ev+=[(54.9,'whoosh_1',-13),(w(162),'impact_3',-14),(w(166),'pop_4',-14)]
ev+=[(62.35,'whoosh_2',-13)]+[(w(i),'click_3',-15) for i in (179,180,181,183)]
ev+=[(70.8,'whoosh_3',-13),(w(192),'impact_4',-13),(74.85,'swoosh_4',-15),(78.2,'whoosh_4',-12),(w(204),'impact_1',-11)]
ev+=[(w(211)+0.1+i*0.17,'click_4',-18) for i in range(4)]+[(w(212)+0.5,'pop_3',-13)]
inp=['-i','audio.mp3','-i','./music.mp3'];f=[]
for k,(t,n,db) in enumerate(ev):
  inp+=['-i',S+n+'.mp3'];d=int(t*1000)
  f.append(f'[{k+2}]volume={db}dB,adelay={d}|{d}[s{k}]')
f.append('[0]volume=0.95,asplit[vo][sc]')
f.append('[1]atrim=0:84.4,afade=t=in:d=1,afade=t=out:st=82.4:d=2,volume=-20dB[mu]')
f.append('[mu][sc]sidechaincompress=threshold=0.04:ratio=5:attack=20:release=350[md]')
f.append('[vo][md]'+''.join(f'[s{k}]' for k in range(len(ev)))+f'amix=inputs={len(ev)+2}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[o]')
subprocess.run(['ffmpeg','-y','-v','error',*inp,'-filter_complex',';'.join(f),'-map','[o]','-ar','48000','-b:a','192k','reel/public/mix.mp3'],check=True)
print(len(ev))
