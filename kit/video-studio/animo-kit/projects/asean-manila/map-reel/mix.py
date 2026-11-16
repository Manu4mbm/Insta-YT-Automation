import subprocess
S = [(0.0,'boom',0.5),(2.5,'chime',0.6),(4.69,'chime',0.45),(6.4,'tick',0.6),(9.27,'stamp',0.5),(11.39,'stamp',0.5),(12.9,'chime',0.5),(13.53,'stamp',0.45),
     (25.6,'chime',0.5),(31.13,'stamp',0.45),(34.1,'tick',0.9),(37.7,'tick',0.9),(39.9,'tick',0.9),(42.1,'chime',0.55),
     (46.5,'tick',0.7),(52.37,'stamp',0.6),(55.0,'stamp',0.5),(59.62,'stamp',0.5),(62.74,'drum',0.6),(67.57,'tick',0.8),(68.3,'tick',0.8),(68.9,'tick',0.8),(70.46,'shimmer',0.4),
     (73.83,'stamp',0.6),(74.96,'tick',0.8),(76.22,'chime',0.5)]
for i,t in enumerate([18.6,19.0,19.4,19.8,20.2,20.6,21.0,21.4,21.9,22.3,24.2]): S.append((t,'tick',0.55))
inp=['-i','public/vo.mp3','-i','public/music.wav']
fl=['[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[vo][sc]','[1:a]volume=0.28[mu]','[mu][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[mud]']
lab=[]
for j,(t,n,g) in enumerate(S):
    inp+=['-i',f'public/{n}.wav']; ms=int(t*1000)
    fl.append(f'[{j+2}:a]volume={g*0.5},adelay={ms}|{ms}[s{j}]'); lab.append(f'[s{j}]')
fl.append(f"{''.join(lab)}amix=inputs={len(lab)}:normalize=0[sfx]")
fl.append('[vo][mud][sfx]amix=inputs=3:normalize=0:duration=first,apad=pad_dur=0.5,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]')
subprocess.run(['ffmpeg','-y','-v','error',*inp,'-filter_complex',';'.join(fl),'-map','[out]','-ac','2','-ar','48000','out/mix.wav'],check=True)
print('ok')
