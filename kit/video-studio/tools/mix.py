import subprocess, numpy as np, json
SR=48000; S='./sfx-src/'; R='./'
def load(p):
    r=subprocess.run(['ffmpeg','-v','quiet','-i',p,'-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(r,np.float32).reshape(-1,2).copy()
DUR=45.3; N=int(DUR*SR); out=np.zeros((N,2),np.float32)
vo=load(R+'public/audio.mp3'); out[:len(vo)]+=vo[:N]
def place(name,t,gain_db,maxlen=1.2):
    a=load(S+name)[:int(maxlen*SR)]
    f=min(len(a),int(0.15*SR)); a[-f:]*=np.linspace(1,0,f)[:,None]
    i=int(t*SR); j=min(N,i+len(a)); out[i:j]+=a[:j-i]*10**(gain_db/20)
W=[5.62,8.55,12.98,16.55,22.38,25.5,32.82,37.78,41.0]
for k,t in enumerate(W): place(f'whoosh_{[1,4,3,4,1,3,4,1,3][k]}.mp3',t-0.12,-14,0.8)
for t in [4.30,32.10,34.34]: place('impact_1.mp3',t-0.02,-9,1.6)
for t in [0.12,0.46,1.28,7.57,19.08,19.94,24.85,35.96,36.8,42.37,43.93,18.36]: place('pop_2.mp3',t-0.01,-12,0.4)
for t in [15.62,38.5,42.62,8.73,9.69,10.85,11.91]: place('click_2.mp3',t-0.01,-12,0.5)
for t in [22.87,24.31]: place('notification_3.mp3',t,-13,1.0)
for t in [3.24,17.84,30.68]: place('swoosh_3.mp3',t-0.05,-15,0.9)
place('pop_3.mp3',41.83,-10,0.4)
# music bed with ducking
m=load(S+'music_digital_clouds.mp3'); off=int(8.0*SR); m=m[off:off+N]
amp=np.array(json.load(open(R+'src/amp.json'))); tt=np.arange(N)/SR
env=np.interp(tt,np.arange(len(amp))/30,amp)
# smooth envelope
k=int(0.25*SR); env=np.convolve(env,np.ones(k)/k,'same')
g=10**((-15 - 9*np.clip(env*1.6,0,1))/20)
for a,b in [(3.92,4.30),(29.6,32.10)]:
    g*=np.where((tt>a)&(tt<b),0.12,1.0)
g=np.convolve(g,np.ones(int(0.06*SR))/int(0.06*SR),'same')
g*=np.clip((DUR-tt)/1.2,0,1)
out+=m[:N]*g[:,None]
out.astype(np.float32).tofile('/tmp/claude-0/mix.f32')
subprocess.run(['ffmpeg','-y','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','/tmp/claude-0/mix.f32','-af','loudnorm=I=-14:TP=-1.0:LRA=11','-ar','48000','-b:a','192k',R+'public/mix.mp3'],check=True)
print('ok')
