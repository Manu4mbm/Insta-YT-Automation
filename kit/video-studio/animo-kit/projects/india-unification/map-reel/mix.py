import subprocess
S = [  # (time s, sfx, gain)
 (0.0,'boom',0.9),(2.97,'shimmer',0.5),(4.79,'clash',0.35),(4.79,'boom',0.5),
 (14.2,'stamp',0.7),(15.01,'stamp',0.7),(15.98,'stamp',0.8),
 (17.3,'whoosh',0.7),(18.4,'paper',0.6),(20.7,'paper',0.6),
 (23.1,'paper',0.9),(23.1,'whoosh',0.5),(26.34,'stamp',0.9),(27.9,'tick',1.0),(28.6,'tick',1.0),(29.35,'tick',1.0),(29.6,'stamp',0.6),
 (30.6,'whoosh',0.7),(30.9,'shimmer',0.6),(34.5,'pulse',0.8),(35.0,'pulse',0.7),(35.5,'pulse',0.6),
 (36.3,'whoosh',0.8),(38.5,'paper',0.6),(40.4,'stamp',0.9),
 (42.5,'whoosh',0.8),(43.87,'drum',0.9),(44.0,'march',0.9),(46.8,'clash',0.9),(46.8,'boom',0.7),(47.57,'drum',0.8),(48.4,'stamp',0.9),
 (50.6,'whoosh',0.8),(52.5,'pen',0.9),(56.2,'stamp',0.9),
 (58.2,'whoosh',0.8),(58.44,'drum',0.9),(60.55,'boom',1.0),(61.82,'shimmer',0.7),(61.82,'drum',0.8),
 (65.81,'paper',0.8),(67.2,'stamp',1.0),
]
# 565-dot appear ticks
for i in range(24): S.append((6.4 + i * 0.115, 'tick', 0.35))
inp = ['-i', 'public/vo.mp3', '-i', 'public/music.wav']
fl = ['[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[vo][sc]', '[1:a]volume=0.30[mu]', '[mu][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[mud]']
labels = []
for j, (t, n, g) in enumerate(S):
    inp += ['-i', f'public/{n}.wav']; k = j + 2; ms = int(t * 1000)
    fl.append(f'[{k}:a]volume={g*0.55},adelay={ms}|{ms}[s{j}]'); labels.append(f'[s{j}]')
fl.append(f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0[sfx]")
fl.append('[vo][mud][sfx]amix=inputs=3:normalize=0:duration=first,apad=pad_dur=0.2,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]')
cmd = ['ffmpeg', '-y', '-v', 'error', *inp, '-filter_complex', ';'.join(fl), '-map', '[out]', '-ac', '2', '-ar', '48000', 'out/mix.wav']
subprocess.run(cmd, check=True)
print('mix ok')
