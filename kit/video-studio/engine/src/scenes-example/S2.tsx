import {AbsoluteFill, interpolate, random} from 'remotion';
import {useT, ws} from '../lib/clock';
import {sp, stamp, fadeIn, clamp} from '../lib/motion';
import {C, F} from '../lib/theme';
import {NameTag} from '../props/NameTag';
import {Paper} from '../fx/Paper';
import {Avatar} from '../props/People';
export const S2 = () => {
  const {f, fps, t} = useT();
  const enter = interpolate(sp(f, fps, 4.42, {damping:16, stiffness:120}), [0,1], [0,1]);
  const aur = sp(f, fps, ws(11), {damping:12, stiffness:200});
  const tum = sp(f, fps, ws(12), {damping:9, stiffness:240});
  const tagIn = sp(f, fps, ws(13), {damping:12, stiffness:180});
  const copyAt = ws(15);
  const N = 7;
  const big = stamp(f, fps, copyAt + 0.04);
  const kbd = sp(f, fps, copyAt + 0.22, {damping:10, stiffness:300});
  // tum? shrinks & moves up when the copies arrive, to give COPY the moment
  const yield_ = interpolate(sp(f, fps, copyAt - 0.05, {damping:18, stiffness:160}), [0,1], [0,1]);
  const cam = interpolate(t, [4.4, 7.9], [1.02, 1.0], clamp);
  return (
    <AbsoluteFill style={{opacity:enter}}>
      <Paper/>
      <AbsoluteFill style={{transform:`scale(${cam})`}}>
        <div style={{position:'absolute', left:92, top:interpolate(yield_,[0,1],[360,280]), transformOrigin:'left top', transform:`scale(${interpolate(yield_,[0,1],[1,0.55])})`}}>
          <div style={{fontFamily:F.serif, fontStyle:'italic', fontSize:140, color:C.ink, lineHeight:1, opacity:aur, transform:`translateY(${(1-aur)*40}px)`}}>Aur</div>
          <div style={{fontFamily:F.serif, fontStyle:'italic', fontSize:330, color:C.saffron, lineHeight:0.9, opacity:Math.min(1,tum*1.5), transform:`translateY(${(1-tum)*80}px) rotate(${(1-tum)*-6}deg)`}}>tum?</div>
        </div>
        <div style={{position:'absolute', right:-60, top:1180, fontFamily:F.serif, fontStyle:'italic', fontSize:900, lineHeight:1, color:'transparent', WebkitTextStroke:`3px rgba(238,106,44,${0.35*(1-yield_)})`, transform:`rotate(${8 + t*2}deg)`}}>?</div>
        <div style={{position:'absolute', left:96, top:700, fontFamily:F.sans, fontWeight:600, fontSize:58, color:C.ink, opacity:fadeIn(f,fps,ws(13))}}>
          Bas <span style={{opacity:fadeIn(f,fps,ws(14))}}>unki</span>
        </div>
        {Array.from({length:N}).map((_, k) => {
          const at = k===0 ? ws(13) : copyAt + (k-1)*0.055;
          const s = k===0 ? tagIn : sp(f, fps, at, {damping:14, stiffness:320});
          const dx = k*22 + (random(`x${k}`)-0.5)*10, dy = k*30;
          const rot = -3 + (random(`r${k}`)-0.5)*6;
          return (
            <div key={k} style={{position:'absolute', left:280 + dx, top:790 + dy, opacity: s>0.01 ? 1 : 0, transform:`translate(${(1-s)*-60}px, ${(1-s)*30}px) rotate(${rot}deg) scale(${0.9+s*0.1})`, zIndex:N-k}}>
              <NameTag w={560} tone={1 - k*0.11} label="TUMHARA CAREER">
                <div style={{display:'flex', alignItems:'center', gap:24}}><Avatar kind="boy" mood="confused" d={150}/><div style={{width:240, height:8, background:C.paper, borderRadius:4}}/></div>
              </NameTag>
            </div>
          );
        })}
        <div style={{position:'absolute', left:110, top:930, zIndex:20, fontFamily:F.loud, fontSize:300, color:C.saffron, letterSpacing:6, opacity:big.opacity, WebkitTextStroke:`6px ${C.ink}`, transform:`translate(${big.shake}px,0) rotate(-7deg) scale(${big.scale})`, textShadow:`10px 10px 0 ${C.ink}`}}>COPY</div>
        <div style={{position:'absolute', right:80, top:1210, zIndex:21, fontFamily:F.mono, fontSize:38, color:C.ink, background:C.lime, padding:'8px 18px', opacity:kbd, transform:`scale(${0.7+kbd*0.3}) rotate(2deg)`}}>CTRL+C · CTRL+V</div>
        <div style={{position:'absolute', left:96, top:1300, zIndex:21, fontFamily:F.sans, fontWeight:600, fontSize:54, color:C.cream, background:C.ink, padding:'6px 22px', borderRadius:8, opacity:fadeIn(f,fps,ws(16))}}>
          kar rahe <span style={{fontFamily:F.serif, fontStyle:'italic', fontWeight:400, fontSize:68, color:C.lime, opacity:fadeIn(f,fps,ws(18))}}>ho.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
