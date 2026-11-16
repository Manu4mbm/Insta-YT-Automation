import React from 'react';
import {AbsoluteFill, interpolate, Easing} from 'remotion';
import {useT, ws} from '../lib/clock';
import {sp, stamp, fadeIn, clamp} from '../lib/motion';
import {C, F} from '../lib/theme';
import {NameTag} from '../props/NameTag';
import {Paper} from '../fx/Paper';
import {Phrase} from '../lib/Phrase';
import {Person, Avatar} from '../props/People';
import {Img, staticFile} from 'remotion';

const Stamp = ({at, children, rot=0, style}:{at:number;children:React.ReactNode;rot?:number;style?:React.CSSProperties}) => {
  const {f, fps} = useT(); const s = stamp(f, fps, at);
  if (!s.hit) return null;
  return <div style={{position:'absolute', opacity:s.opacity, transform:`translate(${s.shake}px,${s.shake*0.4}px) rotate(${rot}deg) scale(${s.scale})`, ...style}}>{children}</div>;
};
const RingStamp = ({at, text, x, y, size=300, color=C.saffron, rot=-12}:{at:number;text:string;x:number;y:number;size?:number;color?:string;rot?:number}) => (
  <Stamp at={at} rot={rot} style={{left:x, top:y, width:size, height:size, borderRadius:'50%', border:`${size*0.05}px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F.loud, fontSize:size*0.36, color, letterSpacing:4, background:'rgba(255,253,248,0.35)', boxShadow:`inset 0 0 0 ${size*0.025}px ${C.white}, inset 0 0 0 ${size*0.04}px ${color}`}}>{text}</Stamp>
);
const Bubble = ({at, text, x, y, flip=false, color=C.ink}:{at:number;text:string;x:number;y:number;flip?:boolean;color?:string}) => {
  const {f, fps} = useT(); const s = sp(f, fps, at, {damping:11, stiffness:260});
  return <div style={{position:'absolute', left:x, top:y, padding:'18px 30px', background:color, color:C.cream, borderRadius:36, borderBottomLeftRadius: flip?36:6, borderBottomRightRadius: flip?6:36, fontFamily:F.sans, fontWeight:800, fontSize:42, opacity:Math.min(1,s*2), transform:`scale(${s}) translateX(${(1-s)*(flip?80:-80)}px)`, transformOrigin: flip?'right bottom':'left bottom'}}>{text}</div>;
};

const Guest = ({at, kind, mood, x, label, flip=false}:{at:number;kind:any;mood:any;x:number;label:string;flip?:boolean}) => {
  const {f, fps} = useT(); const s = sp(f, fps, at, {damping:11, stiffness:200});
  return (
    <div style={{position:'absolute', left:x, top:530, width:220, opacity:Math.min(1,s*2), transform:`translateY(${(1-s)*80}px) scale(${0.85+s*0.15})`}}>
      <Person kind={kind} mood={mood} size={200} style={{transform: flip ? 'scaleX(-1)' : undefined}}/>
      <div style={{position:'absolute', top:-14, [flip?'left':'right']:-20, padding:'10px 22px', background: flip ? C.indigo : C.ink, color:C.cream, borderRadius:28, fontFamily:F.sans, fontWeight:800, fontSize:36}}>{label}</div>
    </div>
  );
};
/* S3 — friends & parents choose for you */
export const S3 = () => {
  const {f, fps, t} = useT();
  const tagIn = sp(f, fps, 7.6, {damping:15, stiffness:150});
  const sink = interpolate(t, [14.3, 14.85], [0, 1], {...clamp, easing:Easing.in(Easing.cubic)});
  const sci = fadeIn(f, fps, ws(21), 0.15) * (1 - fadeIn(f, fps, ws(26), 0.08));
  const note = sp(f, fps, ws(32), {damping:10, stiffness:220});
  return (
    <AbsoluteFill>
      <Paper/>
      <Phrase line={3} top={300}/>
      <Phrase line={4} top={300} heroFont="loud"/>
      <Guest at={ws(19)} kind="friend" mood="happy" x={60} label="Dost"/>
      <Guest at={ws(29)} kind="papa" mood="neutral" x={800} label="Papa" flip/>
      <div style={{position:'absolute', left:180, top:820, transform:`translateY(${(1-tagIn)*500 + sink*1400}px) rotate(${-2 + sink*12}deg)`}}>
        <NameTag w={720} label="TUMHARA CAREER">
          <div style={{position:'absolute', left:36}}><Avatar kind="boy" mood="confused" d={170}/></div>
          <div style={{position:'absolute', left:240, fontFamily:F.serif, fontStyle:'italic', fontSize:100, color:'#8a8478', opacity:sci}}>science?</div>
          <Stamp at={ws(26)} rot={-3} style={{left:232}}><div style={{fontFamily:F.loud, fontSize:124, color:C.ink}}>SCIENCE</div></Stamp>
          <div style={{position:'absolute', left:30, bottom:-8, fontFamily:F.mono, fontSize:28, color:C.ink, opacity:fadeIn(f,fps,ws(36))}}>COACHING · DAY 001</div>
        </NameTag>
        <div style={{position:'absolute', right:-50, top:-60, padding:'16px 26px', background:C.lime, fontFamily:F.sans, fontWeight:800, fontSize:44, color:C.ink, boxShadow:'0 10px 20px rgba(0,0,0,0.18)', opacity: note>0.01?1:0, transform:`rotate(${8 - note*4}deg) scale(${note})`}}>ENGINEERING</div>
        <RingStamp at={ws(34)} text="JEE" x={500} y={290} size={240}/>
      </div>
    </AbsoluteFill>
  );
};

/* S4 — two years pass, heart not in it, marks & confidence fall */
const Bar = ({label, y, at, to, color}:{label:string;y:number;at:number;to:number;color:string}) => {
  const {f, fps} = useT();
  const s = sp(f, fps, at, {damping:7, stiffness:120, mass:1.4});
  const w = Math.max(0.03, interpolate(s, [0,1], [1, to]));
  const drop = interpolate(s, [0,1], [0, 46]);
  return (
    <div style={{position:'absolute', left:96, right:96, top:y + drop}}>
      <div style={{fontFamily:F.loud, fontSize:72, color:C.cream, letterSpacing:3, marginBottom:14}}>{label} <span style={{fontFamily:F.mono, fontSize:40, color:color, marginLeft:16}}>{Math.round(w*100)}%</span></div>
      <div style={{height:84, borderRadius:12, background:'rgba(243,238,228,0.12)', overflow:'hidden'}}>
        <div style={{width:`${w*100}%`, height:'100%', background:color, borderRadius:12}}/>
      </div>
    </div>
  );
};
export const S4 = () => {
  const {f, fps, t} = useT();
  const reveal = interpolate(t, [14.75, 15.15], [0, 1500], {...clamp, easing:Easing.out(Easing.cubic)});
  const month = Math.round(interpolate(t, [ws(38), 16.5], [1, 24], clamp));
  const calOut = 1 - fadeIn(f, fps, 16.85, 0.2);
  const heart = fadeIn(f, fps, 16.9, 0.25) * (1 - fadeIn(f, fps, 18.7, 0.2));
  const flat = interpolate(t, [ws(46), ws(46)+0.6], [0, 1], clamp);
  const bars = fadeIn(f, fps, 18.75, 0.2);
  const k = f - Math.round(ws(52)*fps); const shake = k>=0 && k<12 ? Math.sin(k*2.1)*(12-k)*1.6 : 0;
  return (
    <AbsoluteFill style={{clipPath:`circle(${reveal}px at 540px 960px)`, transform:`translate(${shake}px, ${shake*0.5}px)`}}>
      <Paper bg={C.indigo} dark/>
      <Phrase line={5} top={300} color={C.cream} hero={C.lime}/>
      <Phrase line={6} top={300} color={C.cream} hero={C.saffron}/>
      <Phrase line={7} top={300} color={C.cream} hero={C.saffron} heroFont="loud"/>
      <div style={{position:'absolute', left:96, top:560, opacity:calOut * fadeIn(f,fps,ws(38),0.15)}}>
        <div style={{fontFamily:F.mono, fontSize:40, color:C.lime, letterSpacing:4}}>MAHINA</div>
        <div style={{fontFamily:F.loud, fontSize:420, lineHeight:1, color:C.cream}}>{String(month).padStart(2,'0')}<span style={{fontSize:140, color:'rgba(243,238,228,0.35)'}}> / 24</span></div>
      </div>
      <svg width="1080" height="700" style={{position:'absolute', top:520, opacity:heart}}>
        <path d="M540 610 C 300 450 230 330 270 240 C 310 150 450 140 540 250 C 630 140 770 150 810 240 C 850 330 780 450 540 610 Z" fill="none" stroke={C.cream} strokeWidth="10"/>
        <path d="M120 360 L 380 360 L 430 260 L 480 460 L 530 360 L 960 360" fill="none" stroke={C.saffron} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1300" strokeDashoffset={1300*(1-flat)} transform={`translate(0 0) scale(1 ${1 - flat*0.0})`} opacity={1-flat*0.9}/>
        <path d="M120 360 L 960 360" fill="none" stroke={C.saffron} strokeWidth="12" strokeLinecap="round" strokeDasharray="840" strokeDashoffset={840*(1-flat)}/>
      </svg>
      <div style={{position:'absolute', left:340, top:1170, opacity:fadeIn(f,fps,15.0,0.3)}}><Person kind="boy" mood="sad" acc={['books']} size={400}/></div>
      <div style={{opacity:bars}}>
        <Bar label="MARKS" y={600} at={ws(50)} to={0.34} color={C.lime}/>
        <Bar label="CONFIDENCE" y={900} at={ws(52)} to={0.08} color={C.saffron}/>
      </div>
    </AbsoluteFill>
  );
};

/* S5 — the question holds */
export const S5 = () => {
  const {f, fps, t} = useT();
  const g = sp(f, fps, ws(57), {damping:10, stiffness:200});
  const blink = Math.floor(t*2.2) % 2 === 0 && t > ws(59);
  return (
    <AbsoluteFill>
      <Paper bg={C.indigo} dark/>
      <div style={{position:'absolute', left:560, top:1160, opacity:fadeIn(f,fps,21.3,0.3)}}><Person kind="boy" mood="confused" size={380}/></div>
      <Qs/>
      <div style={{position:'absolute', left:96, top:440, fontFamily:F.sans, fontWeight:600, fontSize:58, color:'rgba(243,238,228,0.7)', opacity:fadeIn(f,fps,ws(53))}}>Aur ab sawaal hai,</div>
      <div style={{position:'absolute', left:90, top:560, fontFamily:F.serif, fontStyle:'italic', fontSize:300, lineHeight:0.95, color:C.saffron, opacity:Math.min(1,g*1.5), transform:`translateY(${(1-g)*60}px)`}}>galti</div>
      <div style={{position:'absolute', left:96, top:870, fontFamily:F.serif, fontStyle:'italic', fontSize:170, lineHeight:1, color:C.cream, opacity:fadeIn(f,fps,ws(58),0.12)}}>
        kahan hui?<span style={{display:'inline-block', width:14, height:150, background:C.lime, marginLeft:18, verticalAlign:'-14px', opacity: blink ? 1 : 0}}/>
      </div>
    </AbsoluteFill>
  );
};

const Qs = () => { const {t} = useT(); return <>{[0,1,2].map(i => <div key={i} style={{position:'absolute', left:600 + i*120, top:1120 - ((t*60 + i*50) % 160), fontFamily:F.serif, fontStyle:'italic', fontSize:110 - i*20, color:C.lime, opacity:0.8}}>?</div>)}</>; };
/* S6 — release: not your fault, deciding blind was */
export const S6 = () => {
  const {f, fps, t} = useT();
  const wipe = interpolate(t, [24.4, 24.85], [0, 100], {...clamp, easing:Easing.inOut(Easing.cubic)});
  const drift = interpolate(t, [24.4, 30], [0, -30]);
  const mark = interpolate(t, [ws(62), ws(62)+0.35], [0, 1], clamp);
  const a = 1 - fadeIn(f, fps, 26.55, 0.2);
  const blur = 16 + Math.sin(t*3)*3;
  return (
    <AbsoluteFill style={{clipPath:`inset(0 ${100-wipe}% 0 0)`}}>
      <Paper/>
      <div style={{position:'absolute', left:620, top:1150, opacity:fadeIn(f,fps,24.6,0.4)}}><Person kind="boy" mood={t > ws(66) ? 'confused' : 'neutral'} blind={interpolate(t, [ws(66), ws(66)+0.3], [0, 1], clamp)} size={360}/></div>
      <div style={{position:'absolute', left:96, top:520 + drift, opacity:a * fadeIn(f,fps,ws(60),0.3)}}>
        <div style={{fontFamily:F.serif, fontStyle:'italic', fontSize:150, lineHeight:1.05, color:C.ink}}>Galti<br/>tumhari</div>
        <div style={{position:'relative', fontFamily:F.serif, fontStyle:'italic', fontSize:190, lineHeight:1.1, color:C.ink, opacity:fadeIn(f,fps,ws(62),0.15)}}>
          <span style={{position:'absolute', left:-10, top:70, height:110, width:`${mark*430}px`, background:C.lime, zIndex:-1}}/>nahi <span style={{fontSize:150}}>thi.</span>
        </div>
      </div>
      <div style={{position:'absolute', left:96, top:480 + drift, opacity:fadeIn(f,fps,ws(64),0.3)}}>
        <div style={{fontFamily:F.serif, fontStyle:'italic', fontSize:120, color:C.ink}}>Galti thi</div>
        <div style={{fontFamily:F.loud, fontSize:250, lineHeight:1, color:C.saffron, filter:`blur(${t > ws(66) ? blur : 0}px)`, opacity:fadeIn(f,fps,ws(66),0.15), transform:`translateX(${Math.sin(t*5)*6}px)`}}>BINA<br/>JAANE</div>
        <div style={{fontFamily:F.sans, fontWeight:600, fontSize:66, color:C.ink, marginTop:30, opacity:fadeIn(f,fps,ws(68),0.15)}}>decide karna.</div>
      </div>
    </AbsoluteFill>
  );
};

/* S7 — the 3 things, measured; test not guess */
const Row = ({label, at, to, color, y}:{label:string;at:number;to:number;color:string;y:number}) => {
  const {f, fps} = useT();
  const s = sp(f, fps, at, {damping:15, stiffness:90});
  const l = sp(f, fps, at - 0.05, {damping:12, stiffness:260});
  return (
    <div style={{position:'absolute', left:50, right:50, top:y, opacity:Math.min(1,l*2), transform:`translateX(${(1-l)*-40}px)`}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
        <span style={{fontFamily:F.loud, fontSize:60, color:C.ink, letterSpacing:2}}>{label}</span>
        <span style={{fontFamily:F.mono, fontSize:30, color:'#6d675c'}}>{Math.round(s*to*100)}%</span>
      </div>
      <div style={{height:22, borderRadius:11, background:'#ebe5d8', marginTop:6}}><div style={{width:`${s*to*100}%`, height:'100%', background:color, borderRadius:11}}/></div>
    </div>
  );
};
export const S7 = () => {
  const {f, fps, t} = useT();
  const tagIn = sp(f, fps, 30.3, {damping:14, stiffness:120});
  const strike = interpolate(t, [ws(89), ws(89)+0.25], [0, 1], clamp);
  const flip = interpolate(t, [40.55, 40.95], [0, 90], {...clamp, easing:Easing.in(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Paper/>
      <Phrase line={11} top={290} size={54} until={37.95}/>
      <div style={{position:'absolute', left:100, top:580, transform:`translateY(${(1-tagIn)*600}px) rotate(${(1-tagIn)*8 - 1}deg) rotateY(${flip}deg)`}}>
        <NameTag w={880} label="TUMHARA PROFILE">
          <div style={{position:'absolute', inset:'14px 0 0 0'}}>
            <Row label="INTEREST" at={ws(80)} to={0.86} color={C.lime} y={10}/>
            <Row label="APTITUDE" at={ws(82)} to={0.72} color={C.saffron} y={120}/>
            <Row label="PERSONALITY" at={ws(85)} to={0.91} color={C.indigo} y={230}/>
          </div>
        </NameTag>
        <RingStamp at={ws(90)} text="TEST" x={600} y={-120} size={300} rot={14}/>
      </div>
      <div style={{position:'absolute', left:96, top:1130, fontFamily:F.sans, fontWeight:600, fontSize:60, color:C.ink, opacity:fadeIn(f,fps,ws(86),0.2)}}>
        Ye <span style={{position:'relative', fontFamily:F.serif, fontStyle:'italic', fontSize:80}}>guess<span style={{position:'absolute', left:-6, top:'52%', height:8, width:`${strike*110}%`, background:C.saffron, transform:'rotate(-4deg)'}}/></span> se nahi,<br/><span style={{opacity:fadeIn(f,fps,ws(90),0.15)}}><span style={{fontFamily:F.loud, fontSize:96, color:C.saffron}}>TEST</span> se pata chalta hai.</span>
      </div>
    </AbsoluteFill>
  );
};

/* S8 — Vision Guiders: test, then report */
export const S8 = () => {
  const {f, fps, t} = useT();
  const mark = sp(f, fps, ws(95), {damping:14, stiffness:150});
  const markOut = interpolate(t, [42.85, 43.1], [1, 0], clamp);
  const sheet = sp(f, fps, ws(101), {damping:14, stiffness:140});
  const filled = Math.floor(interpolate(t, [ws(103), 45.2], [0, 30], clamp));
  const rep = interpolate(t, [ws(105), ws(105)+0.9], [1, 0], {...clamp, easing:Easing.out(Easing.cubic)});
  const hl = interpolate(t, [ws(114), ws(114)+0.3], [0, 1], clamp);
  const tick = sp(f, fps, ws(117), {damping:8, stiffness:300});
  return (
    <AbsoluteFill>
      <Paper/>
      <div style={{position:'absolute', left:96, top:360, opacity:Math.min(mark, markOut), transform:`translateY(${(1-mark)*40}px)`}}>
        <Img src={staticFile('logo.png')} style={{width:640}}/>
        <div style={{fontFamily:F.sans, fontWeight:600, fontSize:58, color:C.ink, marginTop:20, opacity:fadeIn(f,fps,ws(97))}}>mein pehle hota hai</div>
      </div>
      <Phrase line={17} top={300} heroFont="loud"/>
      <Phrase line={18} top={300} heroFont="loud"/>
      <Phrase line={19} top={300} size={54}/>
      <div style={{position:'absolute', left:150, top:560, width:780, height:560, background:C.white, borderRadius:24, boxShadow:'0 20px 40px rgba(23,23,28,0.15)', opacity: t > ws(101)-0.05 ? 1 : 0, transform:`translateY(${(1-sheet)*700}px) rotate(${-2 + (1-sheet)*6}deg)`, padding:40, boxSizing:'border-box'}}>
        <div style={{fontFamily:F.mono, fontSize:30, color:C.saffron, letterSpacing:3}}>PSYCHOMETRIC TEST</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:26, marginTop:40}}>
          {Array.from({length:30}).map((_, i) => <div key={i} style={{width:62, height:62, borderRadius:'50%', border:`5px solid ${C.ink}`, background: i < filled ? ((i*7)%3===0 ? C.saffron : C.ink) : 'transparent', boxSizing:'border-box'}}/>)}
        </div>
      </div>
      <div style={{position:'absolute', left:120, top:620, width:840, height:600, background:C.white, borderRadius:24, boxShadow:'0 30px 60px rgba(23,23,28,0.25)', transform:`translateY(${rep*1400}px) rotate(${2*rep + 1}deg)`, padding:44, boxSizing:'border-box', borderTop:`28px solid ${C.saffron}`}}>
        <div style={{fontFamily:F.loud, fontSize:110, color:C.ink, lineHeight:1}}>REPORT</div>
        <div style={{fontFamily:F.mono, fontSize:26, color:'#6d675c', marginTop:6, letterSpacing:2}}>INTEREST · APTITUDE · PERSONALITY</div>
        {[0.9, 0.7, 0.8].map((w, i) => <div key={i} style={{height:20, width:`${w*100}%`, background:'#e6dfd1', borderRadius:10, marginTop:26}}/>)}
        <div style={{position:'relative', marginTop:36, padding:'14px 18px', fontFamily:F.sans, fontWeight:800, fontSize:46, color:C.ink}}>
          <div style={{position:'absolute', inset:0, width:`${hl*100}%`, background:C.lime, borderRadius:8, zIndex:0}}/>
          <span style={{position:'relative'}}>BEST-FIT FIELD →</span>
          <span style={{position:'absolute', right:20, top:-8, width:76, height:76, borderRadius:'50%', background:C.saffron, color:C.white, display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, transform:`scale(${tick})`}}>✓</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* S9 — 1:1 counselling, confusion → straight answer, India/abroad, checklist */
export const S9 = () => {
  const {f, fps, t} = useT();
  const pair = sp(f, fps, ws(119), {damping:13, stiffness:160});
  const tangle = interpolate(t, [ws(125), ws(125)+0.5], [0, 1], clamp);
  const straight = interpolate(t, [ws(127), ws(127)+0.35], [0, 1], clamp);
  const partOut = 1 - fadeIn(f, fps, 55.6, 0.2);
  const map = fadeIn(f, fps, 55.8, 0.2) * (1 - fadeIn(f, fps, 57.85, 0.2));
  const fly = interpolate(t, [ws(134), ws(136)+0.3], [0, 1], {...clamp, easing:Easing.inOut(Easing.cubic)});
  const px = 230 + fly*620, py = 900 - Math.sin(fly*Math.PI)*300;
  const list = fadeIn(f, fps, 57.9, 0.2);
  const items:[string, number][] = [['SAHI STREAM', ws(138)], ['SAHI COURSE', ws(140)], ['SAHI DIRECTION', ws(142)]];
  return (
    <AbsoluteFill>
      <Paper/>
      <Phrase line={20} top={300} heroFont="loud"/>
      <Phrase line={21} top={300} size={54}/>
      <Phrase line={22} top={300} heroFont="loud"/>
      <Phrase line={23} top={300} size={54} heroFont="loud"/>
      <div style={{opacity:partOut}}>
        {[{x:100, c:C.saffron, l:'COUNSELLOR'}, {x:700, c:C.indigo, l:'TUM'}].map((a, i) => (
          <div key={i} style={{position:'absolute', left:a.x, top:640, width:280, textAlign:'center', transform:`translateX(${(1-pair)*(i? 300:-300)}px)`}}>
            <div style={{margin:'0 auto', width:240}}><Avatar kind={i ? 'boy' : 'counsellor'} mood={t > ws(127) ? 'happy' : (i ? 'confused' : 'neutral')} acc={i ? [] : ['glasses']} d={240} bg={i ? '#DCE5F0' : '#F7DCCB'}/></div>
            <div style={{fontFamily:F.mono, fontSize:28, color:C.ink, marginTop:16, letterSpacing:3}}>{a.l}</div>
          </div>
        ))}
        <div style={{position:'absolute', left:0, right:0, top:700, textAlign:'center', fontFamily:F.loud, fontSize:110, color:C.ink, opacity:fadeIn(f,fps,ws(121),0.15)}}>1:1</div>
        <svg width="1080" height="300" style={{position:'absolute', top:950}}>
          <path d="M240 150 C 300 30, 360 270, 420 120 S 520 20, 560 200 S 680 260, 700 90 S 800 160, 840 150" fill="none" stroke={C.saffron} strokeWidth="10" strokeLinecap="round" strokeDasharray="1600" strokeDashoffset={1600*(1-tangle)} opacity={1-straight}/>
          <path d="M240 150 L 820 150" fill="none" stroke={C.ink} strokeWidth="12" strokeLinecap="round" strokeDasharray="600" strokeDashoffset={600*(1-straight)}/>
          <path d="M790 120 L 840 150 L 790 180" fill="none" stroke={C.ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity={straight}/>
        </svg>
        <Stamp at={ws(128)} rot={-6} style={{left:380, top:1150, fontFamily:F.loud, fontSize:90, color:C.cream, background:C.ink, padding:'4px 28px', borderRadius:10}}>JAWAB</Stamp>
      </div>
      <div style={{opacity:map}}>
        <svg width="1080" height="900" style={{position:'absolute', top:400}}>
          <path d="M230 500 Q 540 -100 850 500" fill="none" stroke={C.ink} strokeWidth="6" strokeDasharray="4 22" strokeLinecap="round"/>
        </svg>
        {[{x:230, l:'INDIA', at:ws(131), c:C.saffron}, {x:850, l:'ABROAD', at:ws(136), c:C.indigo}].map((p, i) => {
          const s = sp(f, fps, p.at, {damping:9, stiffness:260});
          return <div key={i} style={{position:'absolute', left:p.x-110, top:820, width:220, textAlign:'center', transform:`translateY(${(1-s)*-120}px)`, opacity:Math.min(1,s*2)}}>
            <div style={{width:80, height:80, borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg)', background:p.c, margin:'0 auto'}}/>
            <div style={{fontFamily:F.loud, fontSize:64, color:C.ink, marginTop:24}}>{p.l}</div>
          </div>;
        })}
        <div style={{position:'absolute', left:px-40, top:py-40, fontSize:80, transform:`rotate(${interpolate(fly,[0,1],[-35,35])}deg)`, opacity: t > ws(134) ? 1 : 0}}>✈︎</div>
      </div>
      <div style={{position:'absolute', left:96, top:620, opacity:list}}>
        {items.map(([l, at], i) => {
          const s = sp(f, fps, at, {damping:9, stiffness:280});
          const on = t >= at;
          return <div key={i} style={{display:'flex', alignItems:'center', gap:34, marginBottom:44, opacity: on ? 1 : 0.25}}>
            <div style={{width:110, height:110, borderRadius:20, border:`8px solid ${C.ink}`, boxSizing:'border-box', display:'flex', alignItems:'center', justifyContent:'center', background: on ? C.lime : 'transparent'}}>
              <span style={{fontSize:80, color:C.ink, transform:`scale(${on ? s : 0})`}}>✓</span>
            </div>
            <span style={{fontFamily:F.loud, fontSize:100, color:C.ink}}>{l}</span>
          </div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/* S10 — old labels fall; your tag says TUM */
export const S10 = () => {
  const {f, fps, t} = useT();
  const fall = (d:number) => { const k = Math.max(0, t - ws(149) - d); return 0.5*3800*k*k; };
  const tagIn = sp(f, fps, ws(150) - 0.1, {damping:13, stiffness:150});
  const flash = interpolate(t, [ws(154), ws(154)+0.06, ws(154)+0.4], [0, 0.85, 0], clamp);
  return (
    <AbsoluteFill>
      <Paper bg={C.indigo} dark/>
      <Phrase line={24} top={300} color={C.cream}/>
      <Phrase line={25} top={300} color={C.cream} hero={C.saffron} heroFont="loud"/>
      <div style={{position:'absolute', left:80, top:520, transform:`translateY(${fall(0)}px) rotate(${-6 - fall(0)*0.03}deg)`}}><NameTag w={560} label="SHARMA JI KA BETA"><div style={{fontFamily:F.loud, fontSize:120, color:C.ink}}>ENGINEER</div></NameTag></div>
      <div style={{position:'absolute', left:440, top:800, transform:`translateY(${fall(0.08)}px) rotate(${5 + fall(0.08)*0.04}deg)`}}><NameTag w={560} band={C.indigo} label="VERMA JI KI BETI"><div style={{fontFamily:F.loud, fontSize:120, color:C.ink}}>DOCTOR</div></NameTag></div>
      <div style={{position:'absolute', left:100, top:600, opacity: t > ws(150)-0.12 ? 1 : 0, transform:`translateY(${(1-tagIn)*900}px) rotate(${(1-tagIn)*-10 + 2}deg)`}}>
        <NameTag w={880} label="TUMHARA CAREER">
          <div style={{position:'absolute', left:50}}><Avatar kind="boy" mood={t > ws(154) ? 'happy' : 'neutral'} acc={t > ws(154) ? ['cap'] : []} d={260}/></div>
          <Stamp at={ws(154)} rot={-4} style={{left:360}}><div style={{fontFamily:F.loud, fontSize:280, color:C.saffron, lineHeight:1}}>TUM</div></Stamp>
        </NameTag>
      </div>
      <AbsoluteFill style={{background:C.cream, opacity:flash}}/>
    </AbsoluteFill>
  );
};

/* S11 — CTA end card */
export const S11 = () => {
  const {f, fps, t} = useT();
  const bg = interpolate(t, [65.95, 66.35], [0, 1500], {...clamp, easing:Easing.out(Easing.cubic)});
  const mark = sp(f, fps, ws(156), {damping:12, stiffness:160});
  const btn = sp(f, fps, ws(158), {damping:11, stiffness:220});
  const press = interpolate(t, [ws(161), ws(161)+0.08, ws(161)+0.25], [1, 0.92, 1], clamp);
  return (
    <AbsoluteFill style={{clipPath:`circle(${bg}px at 540px 900px)`}}>
      <Paper bg={C.saffron} lines={false}/>
      <div style={{position:'absolute', left:96, right:96, top:300, transform:`translateY(${(1-mark)*60}px)`, opacity:Math.min(1, mark*1.5)}}>
        <div style={{display:'inline-block', background:C.white, borderRadius:32, padding:'36px 48px', transform:'rotate(-2deg)', boxShadow:'0 20px 40px rgba(0,0,0,0.2)'}}>
          <Img src={staticFile('logo.png')} style={{width:560, display:'block'}}/>
        </div>
        <div style={{fontFamily:F.sans, fontWeight:600, fontSize:46, color:C.white, marginTop:44, lineHeight:1.35}}>Psychometric Test · 1:1 Counselling<br/>India &amp; Abroad</div>
      </div>
      <div style={{position:'absolute', left:0, right:0, top:1330, display:'flex', justifyContent:'center', alignItems:'flex-end', gap:0, opacity:fadeIn(f,fps,66.5,0.3)}}>
        <Person kind="papa" mood="happy" size={300}/>
        <div style={{marginLeft:-60, zIndex:2}}><Person kind="boy" mood="happy" acc={['cap']} size={330}/></div>
        <div style={{marginLeft:-60}}><Person kind="mom" mood="happy" size={290}/></div>
      </div>
      <div style={{position:'absolute', left:96, right:96, top:1080, opacity:Math.min(1,btn*1.5), transform:`translateY(${(1-btn)*80}px) scale(${press})`}}>
        <div style={{background:C.ink, color:C.white, borderRadius:80, padding:'34px 40px', fontFamily:F.sans, fontWeight:800, fontSize:46, textAlign:'center', whiteSpace:'nowrap', boxShadow:'0 12px 0 rgba(0,0,0,0.25)'}}>Aaj hi counselling book karo →</div>
        <div style={{fontFamily:F.mono, fontSize:40, color:C.ink, textAlign:'center', marginTop:30, letterSpacing:2}}>visionguiders.com</div>
      </div>
    </AbsoluteFill>
  );
};
