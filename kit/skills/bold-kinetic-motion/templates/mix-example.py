import subprocess, numpy as np, json
SR=48000; S='./sfx-src/'; R='./public/'
def load(p):
    r=subprocess.run(['ffmpeg','-v','quiet','-i',p,'-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(r,np.float32).reshape(-1,2).copy()
w=json.load(open('./src/words.json')); W=lambda i:w[i]['start']
DUR=36.9; N=int(DUR*SR); out=np.zeros((N,2),np.float32)
vo=load(R+'audio.mp3')[:N]; out[:len(vo)]+=vo*0.95
def place(name,t,db,maxlen=1.0):
    a=load(S+name)[:int(maxlen*SR)]; f=min(len(a),int(0.08*SR)); a[-f:]*=np.linspace(1,0,f)[:,None]
    i=int(max(0,t)*SR); j=min(N,i+len(a)); out[i:j]+=a[:j-i]*10**(db/20)
cuts=[W(4),W(10),W(19),W(22),W(24),W(42),W(47),W(57),W(60),W(67)-.05,W(69)-.05,W(71)-.05,W(73)-.05,W(76),W(81)-.05,W(84)]
for k,t in enumerate(cuts): place(f'whoosh_{[1,4][k%2]}.mp3',t-0.1,-14,0.6)
for t in [W(2)-0.08,W(7)-0.06,W(14)-0.05,W(19),W(45)-0.05,W(53),W(59)-0.05,W(67)-.05,W(69)-.05,W(71)-.05,W(73),W(86)-.05]: place('impact_2.mp3',t,-11,0.9)
for wi in [30,32,37,39,41,33]: place('pop_2.mp3',W(wi),-12,0.35)
for t in np.arange(W(29),W(41)+0.4,0.11): place('click_1.mp3',t,-26,0.08)
for t in np.arange(W(47)+0.3,W(53),0.09): place('pop_1.mp3',t,-30,0.15)
for t in np.arange(W(62),W(65)+0.3,0.1): place('click_1.mp3',t,-26,0.08)
place('swoosh_3.mp3',W(23)-0.1,-14,1.0); place('notification_3.mp3',W(41),-15,1.0); place('impact_3.mp3',W(69)-0.05,-12,1.4)
for t in np.linspace(W(86),W(86)+0.6,6): place('click_2.mp3',t,-17,0.15)
place('notification_3.mp3',W(86)+0.75,-15,1.0)
m=load('./music.mp3')[:N]; tt=np.arange(N)/SR
env=np.abs(vo[:,0]); k=int(0.2*SR); env=np.convolve(env,np.ones(k)/k,'same'); env=np.pad(env,(0,N-len(env)))
g=10**((-14-7*np.clip(env*8,0,1))/20); g=np.convolve(g,np.ones(int(0.08*SR))/int(0.08*SR),'same')*np.clip((DUR-tt)/1.2,0,1)
out+=m[:N]*g[:,None]; print('peak',np.abs(out).max()); out.astype(np.float32).tofile('/tmp/claude-0/ac/mix11.f32')
subprocess.run(['ffmpeg','-y','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','/tmp/claude-0/ac/mix11.f32','-af','loudnorm=I=-14:TP=-1.0:LRA=11','-ar','48000','-b:a','256k',R+'mix.mp3'],check=True); print('ok')
