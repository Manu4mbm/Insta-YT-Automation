import {AbsoluteFill, interpolate} from 'remotion';
import {useT, ws} from '../lib/clock';
import {sp, stamp, exitX, fadeIn, clamp} from '../lib/motion';
import {C, F} from '../lib/theme';
import {NameTag} from '../props/NameTag';
import {Paper} from '../fx/Paper';
import {Avatar} from '../props/People';
const Stamp = ({text, at, rot}:{text:string;at:number;rot:number}) => {
  const {f, fps} = useT(); const s = stamp(f, fps, at);
  return <div style={{fontFamily:F.loud, fontSize:118, color:C.ink, letterSpacing:2, opacity:s.opacity, transform:`translate(${s.shake}px,${s.shake*0.4}px) rotate(${rot}deg) scale(${s.scale})`}}>{text}</div>;
};
export const S1 = () => {
  const {f, fps, t} = useT();
  const exitAt = 4.42;
  const tag1Y = interpolate(sp(f, fps, ws(0), {damping:13, stiffness:140}), [0,1], [-1100, 0]);
  const tag2X = interpolate(sp(f, fps, ws(6), {damping:13, stiffness:140}), [0,1], [1300, 0]);
  const ex1 = exitX(f, fps, exitAt, -1500), ex2 = exitX(f, fps, exitAt+0.07, -1700);
  const cam = interpolate(t, [0, 4.5], [1, 1.035], clamp);
  // tag1 gets pushed aside a little when tag2 lands
  const nudge = interpolate(sp(f, fps, ws(6)+0.12, {damping:9, stiffness:260}), [0,1], [0, -26]);
  return (
    <AbsoluteFill>
      <Paper/>
      <AbsoluteFill style={{transform:`scale(${cam})`}}>
        <div style={{position:'absolute', left:70, top:370, transform:`translate(${ex1 + nudge}px, ${tag1Y}px) rotate(-5deg)`}}>
          <NameTag w={700} label="SHARMA JI KA BETA"><div style={{display:'flex', alignItems:'center', gap:22}}><Avatar kind="boy" acc={['helmet']} d={190}/><Stamp text="ENGINEER" at={ws(4)} rot={-3}/></div></NameTag>
        </div>
        <div style={{position:'absolute', left:300, top:870, transform:`translate(${tag2X + ex2}px, 0) rotate(4deg)`}}>
          <NameTag w={700} band={C.indigo} label="VERMA JI KI BETI"><div style={{display:'flex', alignItems:'center', gap:30}}><Avatar kind="girl" acc={['stethoscope']} d={190}/><Stamp text="DOCTOR" at={ws(10)} rot={2}/></div></NameTag>
        </div>
      </AbsoluteFill>
      <Ticker/>
    </AbsoluteFill>
  );
};
const Ticker = () => {
  const {t} = useT();
  const txt = 'SHARMA JI KA BETA · VERMA JI KI BETI · GUPTA JI KA BETA · ';
  return (<>
    {[0,1].map(r => (
      <div key={r} style={{position:'absolute', top:1390 + r*190, left:0, whiteSpace:'nowrap', fontFamily:F.loud, fontSize:170, color:'transparent', WebkitTextStroke:`2px rgba(23,23,28,${0.16 - r*0.05})`, transform:`translateX(${(r? -1: 1)*t*-90 - (r?600:0)}px)`}}>{txt.repeat(4)}</div>
    ))}
  </>);
};
