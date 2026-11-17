import subprocess, json, sys
D = json.load(open('src/data.json'))
def mix(vo, music, sfx, out):
    inp = ['-i', vo, '-i', music]
    fl = ['[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[vo][sc]', '[1:a]volume=0.26[mu]', '[mu][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[mud]']
    lab = []
    for j, (t, n, g) in enumerate(sfx):
        inp += ['-i', f'public/{n}.wav']; ms = int(t * 1000)
        fl.append(f'[{j+2}:a]volume={g*0.5},adelay={ms}|{ms}[s{j}]'); lab.append(f'[s{j}]')
    fl.append(f"{''.join(lab)}amix=inputs={len(lab)}:normalize=0[sfx]")
    fl.append('[vo][mud][sfx]amix=inputs=3:normalize=0:duration=first,apad=pad_dur=0.8,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', *inp, '-filter_complex', ';'.join(fl), '-map', '[out]', '-ac', '2', '-ar', '48000', out], check=True)
r = D['cue']['r']
RS = [(0.0, 'boom', 0.5), (r['aaj'], 'shimmer', 0.5), (r['n1727'], 'stamp', 0.6), (r['nau'], 'tick', 0.8), (r['parkota'], 'stamp', 0.5),
      (r['y1734'], 'chime', 0.5), (r['y1799'], 'chime', 0.5), (r['y1876'], 'stamp', 0.6), (r['pink'], 'stamp', 0.8), (r['y1942'], 'tick', 0.8),
      (r['y1949'], 'stamp', 0.6), (r['y1982'], 'drum', 0.6), (r['malviya'], 'tick', 0.7), (r['mansarovar'], 'tick', 0.7), (r['vaishali'], 'tick', 0.7),
      (r['y2015'], 'chime', 0.5), (r['y2019'], 'shimmer', 0.5), (r['y1901'], 'tick', 0.6), (r['y2011'], 'chime', 0.5), (r['cta'], 'stamp', 0.7)]
y = D['cue']['y']
YS = [(0.0, 'boom', 0.45)] + [(y[k], 'chime', 0.45) for k in ['c2', 'c3', 'c4', 'c5', 'c6', 'c7']] + \
     [(y[k], 'tick', 0.7) for k in ['y1734', 'y1735', 'y1749', 'y1799', 'y1942', 'y1947', 'y1951', 'y1981', 'malviya', 'mansarovar', 'vaishali', 'y2013', 'y2015', 'y2018', 'y2011', 'y2026']] + \
     [(y['pink'], 'stamp', 0.7), (y['y1949'], 'stamp', 0.6), (y['c6'], 'drum', 0.5), (y['y2019'], 'shimmer', 0.45), (y['y2027'], 'shimmer', 0.5), (y['outro'], 'stamp', 0.6)]
if 'reel' in sys.argv: mix('public/vo_reel.mp3', 'public/music.wav', RS, 'out/mix_reel.wav')
if 'yt' in sys.argv: mix('public/vo_yt.mp3', 'public/music_yt.wav', YS, 'out/mix_yt.wav')
print('mixed')
