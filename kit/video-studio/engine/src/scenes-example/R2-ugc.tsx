import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, Easing, random} from 'remotion';
import {useT, ws} from '../lib/clock';
import {sp, stamp, fadeIn, clamp} from '../lib/motion';
import {C, F} from '../lib/theme';
import {Person, Avatar} from '../props/People';
import {Room, Spot, Sky, Icon, Door, DOORS, Phone, Typing, Confetti, RedCircle, BigX, Tick, Sticker} from '../props/Kit';
import {Handheld} from '../fx/Handheld';

const Pop = ({at, children, style, from=0.4, cfg={damping:10, stiffness:240}}:{at:number;children:React.ReactNode;style?:React.CSSProperties;from?:number;cfg?:any}) => {
  const {f, fps, t} = useT(); const s = sp(f, fps, at, cfg);
  if (t < at - 0.02) return null;
  return <div style={{position:'absolute', transform:`scale(${from + (1-from)*s})`, opacity:Math.min(1, s*2), ...style}}>{children}</div>;
};
const Bubble = ({children, x, y, at, flip=false}:{children:React.ReactNode;x:number;y:number;at:number;flip?:boolean}) => (
  <Pop at={at} style={{left:x, top:y, transformOrigin: flip ? 'right bottom' : 'left bottom'}}>
    <div style={{padding:'18px 28px', background:'#fff', borderRadius:34, [flip ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']:6, fontFamily:F.ugc, fontWeight:800, fontSize:64, color:C.ink, boxShadow:'0 10px 24px rgba(0,0,0,0.12)'}}>{children}</div>
  </Pop>
);

/* A — result day: confetti, then the whole family asks */
export const A = () => {
  const {f, fps, t} = useT();
  const happy = t < 3.3;
  const fam = [{k:'papa', x:30, at:ws(5)+0.05, acc:[]}, {k:'mom', x:760, at:ws(6), acc:[]}, {k:'papa', x:400, at:ws(8), acc:['glasses'], small:true}];
  return (
    <AbsoluteFill>
      <Handheld punches={[ws(4), ws(10)]}>
        <Room/>
        <Sticker rot={-3} style={{left:90, top:300}}>POV: Class 10 result aaya 📄</Sticker>
        {fam.map((p, i) => {
          const s = sp(f, fps, p.at, {damping:12, stiffness:180});
          return <div key={i} style={{position:'absolute', left:p.x, top: p.small ? 560 : 640, opacity: t > p.at - 0.02 ? 1 : 0, transform:`translateY(${(1-s)*500}px)`}}>
            <Person kind={p.k as any} mood="neutral" acc={p.acc as any} size={p.small ? 240 : 290}/>
            <Bubble x={p.small ? 150 : 170} y={-60} at={p.at + 0.2} flip={i===1}>?</Bubble>
          </div>;
        })}
        <div style={{position:'absolute', left:300, top:700, zIndex:3}}>
          <Person kind="boy" mood={happy ? 'happy' : 'confused'} size={480}/>
          {/* phone in hand */}
          <div style={{position:'absolute', left:150, top:450, width:140, height:230, borderRadius:24, background:'#111', padding:8, boxSizing:'border-box', transform:'rotate(-8deg)'}}>
            <div style={{width:'100%', height:'100%', borderRadius:18, background: t > ws(4) ? C.green : '#2A3644', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F.ugc, fontWeight:800, fontSize:30, color:'#fff', textAlign:'center'}}>{t > ws(4) ? <span>PASS<br/>✅</span> : '…'}</div>
          </div>
        </div>
        <Confetti at={ws(4)} x={540} y={760} n={60}/>
        <Pop at={ws(10)} from={1.6} cfg={{damping:9, stiffness:300}} style={{left:420, top:420, zIndex:6}}>
          <div style={{fontFamily:F.loud, fontSize:300, color:C.saffron, WebkitTextStroke:`8px ${C.ink}`, textShadow:`10px 10px 0 ${C.ink}`, transform:'rotate(8deg)'}}>?</div>
        </Pop>
      </Handheld>
    </AbsoluteFill>
  );
};

/* B — the three doors appear; student looks left/right */
export const B = () => {
  const {f, fps, t} = useT();
  const pan = interpolate(t, [4.8, 9.9], [40, -40]);
  const look = t > 8.7 && t < 10 ? (Math.floor((t - 8.7) / 0.35) % 2 ? -1 : 1) : 1;
  return (
    <AbsoluteFill>
      <Handheld punches={[ws(13)]}>
        <AbsoluteFill style={{background:'linear-gradient(180deg,#F3D9BD,#EBCBA6)'}}/>
        <div style={{position:'absolute', left:0, right:0, top:1270, bottom:0, background:'#C49B6E'}}/>
        <div style={{position:'absolute', left:0, top:0, width:1080, height:1920, transform:`translateX(${pan}px)`}}>
          {[0,1,2].map(i => {
            const at = [ws(15), ws(16), ws(17)][i];
            const s = sp(f, fps, at, {damping:11, stiffness:170});
            return <div key={i} style={{position:'absolute', left:70 + i*330, top:470, opacity: t > at - 0.02 ? 1 : 0, transform:`translateY(${(1-s)*700}px) rotate(${(1-s)*(i-1)*8}deg)`}}><Door i={i} w={280}/></div>;
          })}
        </div>
        <div style={{position:'absolute', left:330, top:1060, zIndex:3, transform:`scaleX(${look})`}}>
          <Person kind="boy" mood="confused" size={420}/>
        </div>
      </Handheld>
    </AbsoluteFill>
  );
};

/* C — family WhatsApp group: everyone has an opinion */
const MSGS = [
  {at:ws(18), who:'Chacha ji', kind:'papa', acc:['glasses'], text:'Beta Science lo, scope hai 👍', col:'#C2410C'},
  {at:ws(24), who:"Teacher ma'am", kind:'mom', acc:['glasses'], text:'Marks dekho beta 📊', col:'#7C3AED'},
  {at:ws(29), who:'Rohan', kind:'friend', acc:[], text:'Jo hum le rahe hain, wahi le lo 😎', col:'#0F766E'},
  {at:ws(40), who:'Bua ji', kind:'mom', acc:[], text:'Doctor bano! 🩺', col:'#BE185D'},
  {at:ws(40)+0.18, who:'Mama ji', kind:'papa', acc:[], text:'Engineering best hai 🛠️', col:'#1D4ED8'},
  {at:ws(42)-0.1, who:'Padosi aunty', kind:'mom', acc:['glasses'], text:'CA karo, paisa hai 💼', col:'#B45309'},
  {at:ws(42)+0.12, who:'Chacha ji', kind:'papa', acc:['glasses'], text:'Govt job pakki 🏛️', col:'#C2410C'},
];
export const Cc = () => {
  const {f, fps, t} = useT();
  const enter = sp(f, fps, 9.95, {damping:14, stiffness:120});
  const shown = MSGS.filter(m => t >= m.at - 0.02);
  const flood = t > ws(42);
  const shake = flood ? Math.sin(t*60)*4 : 0;
  const count = Math.min(99, Math.round(interpolate(t, [ws(40), ws(43)], [3, 99], clamp)));
  return (
    <AbsoluteFill>
      <Handheld>
        <Room dim={0.35}/>
        <div style={{position:'absolute', left:160, top:250, transform:`translateY(${(1-enter)*1400}px) translateX(${shake}px) rotate(${-2 + (1-enter)*10}deg)`}}>
          <Phone w={760} h={1220} header={
            <div style={{position:'absolute', left:0, right:0, top:0, height:170, background:C.waHead, display:'flex', alignItems:'flex-end', padding:'0 30px 22px', gap:20, color:'#fff', zIndex:4}}>
              <div style={{width:80, height:80, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:46, fontFamily:F.emoji}}>👨‍👩‍👧</div>
              <div><div style={{fontFamily:F.ugc, fontWeight:800, fontSize:38}}>Family Group ❤️</div><div style={{fontFamily:F.sans, fontSize:24, opacity:0.8}}>{t > ws(40) ? 'Sab type kar rahe hain…' : 'Chacha ji, Bua ji, Mama ji…'}</div></div>
              {count > 3 && <div style={{marginLeft:'auto', marginBottom:20, background:C.red, borderRadius:30, padding:'6px 18px', fontFamily:F.ugc, fontWeight:800, fontSize:30}}>{count}{count >= 99 ? '+' : ''}</div>}
            </div>}>
            <div style={{position:'absolute', left:24, right:24, bottom:30, display:'flex', flexDirection:'column', gap:18}}>
              {shown.slice(-5).map((m, i) => {
                const s = sp(f, fps, m.at, {damping:12, stiffness:260});
                return <div key={m.at} style={{display:'flex', gap:14, alignItems:'flex-end', transform:`scale(${0.6+0.4*s}) translateY(${(1-s)*40}px)`, transformOrigin:'left bottom', opacity:s}}>
                  <Avatar kind={m.kind as any} acc={m.acc as any} d={78}/>
                  <div style={{background:'#fff', borderRadius:26, borderBottomLeftRadius:6, padding:'16px 22px', maxWidth:520, boxShadow:'0 2px 0 rgba(0,0,0,0.08)'}}>
                    <div style={{fontFamily:F.sans, fontWeight:800, fontSize:26, color:m.col}}>{m.who}</div>
                    <div style={{fontFamily:F.sans, fontWeight:600, fontSize:40, color:C.ink, lineHeight:1.25}}>{m.text}</div>
                  </div>
                </div>;
              })}
              {(MSGS.some(m => t > m.at - 0.5 && t < m.at - 0.02)) && <div style={{marginLeft:92}}><Typing/></div>}
            </div>
          </Phone>
        </div>
      </Handheld>
    </AbsoluteFill>
  );
};

/* D — nobody asks the student; spotlight + thought bubble of what he loves */
export const D = () => {
  const {f, fps, t} = useT();
  const items = ['guitar', 'brush', 'code', 'bat', 'camera'];
  const cloud = sp(f, fps, ws(49), {damping:12, stiffness:160});
  return (
    <AbsoluteFill>
      <Handheld amp={0.6} punches={[ws(50)]}>
        <Spot x={540} y={1000}/>
        <div style={{position:'absolute', left:270, top:880}}><Person kind="boy" mood={t > ws(50) ? 'neutral' : 'sad'} size={540}/></div>
        {/* faded chat bubbles drifting away */}
        {['Science!', 'Marks!', 'Wahi lo!'].map((s, i) => (
          <div key={i} style={{position:'absolute', left:80 + i*320, top:320 - (t - 19.6)*40*(i+1), opacity:Math.max(0, 0.5 - (t-19.6)*0.2), fontFamily:F.ugc, fontWeight:800, fontSize:42, color:'#fff', background:'rgba(255,255,255,0.12)', padding:'12px 24px', borderRadius:30}}>{s}</div>
        ))}
        <div style={{position:'absolute', left:180, top:330, width:720, height:500, opacity:cloud, transform:`scale(${0.6 + 0.4*cloud})`}}>
          <svg width="720" height="560" style={{position:'absolute'}}><path d="M120 330 C 30 330 30 200 130 200 C 120 100 260 70 320 130 C 380 40 560 60 570 170 C 690 170 700 330 590 340 C 600 420 470 450 420 400 C 360 460 220 450 200 390 C 150 420 80 390 120 330 Z" fill="#fff"/><circle cx="330" cy="470" r="26" fill="#fff"/><circle cx="350" cy="530" r="14" fill="#fff"/></svg>
          {items.map((n, i) => {
            const at = ws(49) + 0.15 + i*0.12; const s = sp(f, fps, at, {damping:9, stiffness:260});
            const ang = i/items.length*Math.PI*2 + t*0.4;
            return <div key={n} style={{position:'absolute', left:300 + Math.cos(ang)*190, top:220 + Math.sin(ang)*90, transform:`scale(${s})`}}><Icon name={n} size={120}/></div>;
          })}
          <div style={{position:'absolute', left:310, top:220, fontSize:90, fontFamily:F.emoji, opacity:fadeIn(f,fps,ws(50),0.15)}}>❤️</div>
        </div>
      </Handheld>
    </AbsoluteFill>
  );
};

/* E — wrong choice: dark door, 2 years of books crushing, career graph cracks */
export const E = () => {
  const {f, fps, t} = useT();
  const doorOpen = interpolate(t, [ws(53), ws(53)+0.5], [0, 1], {...clamp, easing:Easing.out(Easing.cubic)});
  const doorOut = interpolate(t, [24.85, 25.1], [1, 0], clamp);
  const month = Math.round(interpolate(t, [ws(59), ws(62)+0.3], [1, 24], clamp));
  const books = [0,1,2,3,4].map(i => { const at = ws(62) + i*0.09; const k = Math.max(0, t - at); return Math.min(1, k*k*30); });
  const squash = t > ws(62) ? 1 - 0.08*Math.exp(-(t - ws(62))*3) - 0.05 : 1;
  const graph = interpolate(t, [ws(63), ws(68)], [0, 1], clamp);
  const crash = interpolate(t, [ws(68), ws(68)+0.5], [0, 1], {...clamp, easing:Easing.in(Easing.quad)});
  const k = f - Math.round(ws(68)*fps); const shake = k>=0 && k<14 ? Math.sin(k*2.2)*(14-k)*1.8 : 0;
  const bc = [C.sci, C.saffron, C.sci, C.lime, '#6A8CC7'];
  return (
    <AbsoluteFill style={{transform:`translate(${shake}px, ${shake*0.6}px)`}}>
      <Handheld amp={0.8}>
        <AbsoluteFill style={{background:'linear-gradient(180deg,#2A2F45,#1B1F30)'}}/>
        {/* the wrong door */}
        <div style={{position:'absolute', left:390, top:420, opacity:doorOut, transform:`scale(${1 + doorOpen*0.4})`}}>
          <Door i={0} w={300} open={doorOpen}/>
          <Sticker rot={6} bg={C.red} color="#fff" style={{left:-90, top:220, opacity:fadeIn(f,fps,ws(55),0.1)}}>GALAT CHOICE ❌</Sticker>
        </div>
        {/* calendar */}
        <div style={{position:'absolute', left:70, top:300, opacity:fadeIn(f,fps,ws(59),0.15)}}>
          <div style={{width:280, background:'#fff', borderRadius:22, overflow:'hidden', boxShadow:'0 14px 30px rgba(0,0,0,0.35)', transform:`rotate(-6deg)`}}>
            <div style={{background:C.red, color:'#fff', fontFamily:F.ugc, fontWeight:800, fontSize:34, padding:'10px 0', textAlign:'center'}}>MAHINA</div>
            <div style={{fontFamily:F.loud, fontSize:170, textAlign:'center', color:C.ink, lineHeight:1.1}}>{String(month).padStart(2,'0')}</div>
          </div>
        </div>
        {/* student crushed by books */}
        <div style={{position:'absolute', left:300, top:860, opacity:fadeIn(f,fps,ws(59),0.2), transformOrigin:'50% 100%', transform:`scaleY(${squash})`}}>
          <Person kind="boy" mood="sad" size={480}/>
          {books.map((b, i) => <div key={i} style={{position:'absolute', left:60 + (i%2)*20, top:-40 - i*58 - (1-b)*900, width:360 - i*16, height:56, background:bc[i], borderRadius:8, boxShadow:'inset 0 -8px 0 rgba(0,0,0,0.15)', transform:`rotate(${(i%2?3:-3)}deg)`}}/>)}
          {t > ws(62) && [0,1].map(i => <div key={i} style={{position:'absolute', left:[90, 380][i], top:120 + ((t*80 + i*40) % 80), width:16, height:24, borderRadius:'50% 50% 50% 50%/60% 60% 40% 40%', background:'#7CC6F2'}}/>)}
        </div>
        {/* career graph that cracks */}
        <svg width="1080" height="600" style={{position:'absolute', top:280, left:0, opacity:fadeIn(f,fps,ws(63),0.15)}}>
          <text x="620" y="60" fontFamily="Poppins" fontWeight="800" fontSize="40" fill="#fff">CAREER 📈</text>
          <path d="M600 520 L700 440 L780 470 L880 330 L980 250" fill="none" stroke={C.green} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="700" strokeDashoffset={700*(1-graph)} opacity={1-crash}/>
          <path d={`M600 520 L700 440 L780 470 L830 ${470 + crash*40} L880 ${520 + crash*60} L980 ${560 + crash*20}`} fill="none" stroke={C.red} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" opacity={crash}/>
          {crash > 0 && <path d="M820 300 L800 380 L840 420 L810 520" stroke="#fff" strokeWidth="6" fill="none" opacity={crash}/>}
        </svg>
      </Handheld>
    </AbsoluteFill>
  );
};

/* F — marks don't decide; understanding you does */
export const Fs = () => {
  const {f, fps, t} = useT();
  const sheet = sp(f, fps, 28.5, {damping:13, stiffness:150});
  const x = interpolate(t, [ws(72), ws(72)+0.35], [0, 1], clamp);
  const sheetOut = interpolate(t, [30.5, 30.85], [0, 1], {...clamp, easing:Easing.in(Easing.cubic)});
  const lens = interpolate(t, [ws(75), ws(79)], [0, 1], {...clamp, easing:Easing.inOut(Easing.cubic)});
  const lx = 140 + lens*360, ly = 760 - Math.sin(lens*Math.PI)*120;
  const badges = [{t:'🎨 Creative', c:C.art}, {t:'🧮 Logical', c:C.sci}, {t:'🗣️ Communication', c:C.com}];
  return (
    <AbsoluteFill>
      <Handheld punches={[ws(79)]}>
        <Room/>
        <div style={{position:'absolute', left:220, top:300, transform:`translateY(${(1-sheet)*900 + sheetOut*-1300}px) rotate(${-4 + sheetOut*-30}deg)`}}>
          <div style={{width:640, height:720, background:'#fff', borderRadius:18, boxShadow:'0 20px 40px rgba(0,0,0,0.18)', padding:44, boxSizing:'border-box'}}>
            <div style={{fontFamily:F.ugc, fontWeight:800, fontSize:44, color:C.indigo}}>MARKSHEET 📄</div>
            {[['Maths','A'], ['Science','A'], ['English','B'], ['SST','A']].map(([s, g], i) => <div key={i} style={{display:'flex', justifyContent:'space-between', fontFamily:F.sans, fontWeight:600, fontSize:40, color:C.ink, borderBottom:'3px dashed #ddd', padding:'18px 0'}}><span>{s}</span><span>{g}</span></div>)}
            <div style={{fontFamily:F.loud, fontSize:150, color:C.ink, marginTop:10}}>%</div>
          </div>
          <BigX p={x} size={560} style={{left:40, top:80}}/>
        </div>
        <div style={{position:'absolute', left:300, top:700, opacity:fadeIn(f,fps,30.6,0.25)}}>
          <Person kind="boy" mood={t > ws(79) ? 'happy' : 'neutral'} size={480}/>
          {/* x-ray reveal under the lens */}
          <div style={{position:'absolute', left:lx - 300 - 90, top:ly - 700 - 90, width:180, height:180, borderRadius:'50%', overflow:'hidden', opacity: lens > 0 && lens < 1 ? 1 : (t > ws(79) ? 1 : 0)}}>
            <div style={{position:'absolute', inset:0, background:'rgba(255,225,77,0.35)'}}/>
            <div style={{position:'absolute', left:40, top:40, fontSize:90, fontFamily:F.emoji}}>💡</div>
          </div>
        </div>
        <svg width="260" height="300" style={{position:'absolute', left:lx - 130, top:ly - 130, opacity: t > ws(75) - 0.1 && t < ws(82) ? 1 : 0}}>
          <circle cx="130" cy="130" r="96" fill="none" stroke={C.ink} strokeWidth="18"/>
          <path d="M200 200 L250 280" stroke={C.ink} strokeWidth="26" strokeLinecap="round"/>
        </svg>
        {badges.map((b, i) => (
          <Pop key={i} at={ws(83) + i*0.2} style={{left:[60, 600, 220][i], top:[460, 520, 340][i]}}>
            <div style={{background:b.c, color:'#fff', fontFamily:F.ugc, fontWeight:800, fontSize:44, padding:'14px 28px', borderRadius:40, boxShadow:'0 8px 0 rgba(0,0,0,0.15)', transform:`rotate(${[-6, 5, -2][i]}deg)`}}>{b.t}</div>
          </Pop>
        ))}
      </Handheld>
    </AbsoluteFill>
  );
};

/* G — brain + compass; guessing = dice, crossed out */
export const G = () => {
  const {f, fps, t} = useT();
  const needle = t < ws(89) ? t*900 : 45 + Math.sin((t - ws(89))*8)*12*Math.exp(-(t - ws(89))*3);
  const brain = sp(f, fps, 34.9, {damping:12, stiffness:150});
  const dice = sp(f, fps, ws(95) - 0.2, {damping:10, stiffness:120});
  const roll = t < ws(95) + 0.4 ? t*720 : (ws(95)+0.4)*720;
  const circ = interpolate(t, [ws(97), ws(97)+0.4], [0, 1], clamp);
  const x = interpolate(t, [ws(97)+0.3, ws(97)+0.6], [0, 1], clamp);
  const part1 = t < 37.45;
  return (
    <AbsoluteFill>
      <Handheld punches={[ws(89), ws(95)]}>
        <AbsoluteFill style={{background:'radial-gradient(circle at 50% 40%, #FDF3E4, #F3DCC0)'}}/>
        {part1 ? <div style={{position:'absolute', left:190, top:330, transform:`scale(${brain})`}}>
          <svg width="700" height="700" viewBox="0 0 700 700">
            <circle cx="350" cy="350" r="330" fill="none" stroke={C.indigo} strokeWidth="14" strokeDasharray="6 28" strokeLinecap="round"/>
            {['N','E','S','W'].map((d, i) => <text key={d} x={350 + Math.sin(i*Math.PI/2)*290} y={365 - Math.cos(i*Math.PI/2)*290} textAnchor="middle" fontFamily="Poppins" fontWeight="800" fontSize="46" fill={C.indigo}>{d}</text>)}
            <path d="M230 360 C 190 250 280 180 350 210 C 420 170 520 230 480 330 C 540 380 480 480 410 460 C 380 520 290 510 280 460 C 210 470 180 400 230 360 Z" fill="#F4A6B8"/>
            <path d="M350 215 C 330 290 370 360 350 460 M280 300 C 310 320 300 360 270 380 M420 280 C 400 320 430 350 460 360 M300 420 C 320 400 360 410 380 430" stroke="#D97590" strokeWidth="10" fill="none" strokeLinecap="round"/>
            <g transform={`rotate(${needle} 350 350)`}><path d="M350 90 L372 350 L350 380 L328 350 Z" fill={C.red}/><path d="M350 610 L372 350 L328 350 Z" fill={C.indigo}/><circle cx="350" cy="350" r="22" fill="#fff" stroke={C.ink} strokeWidth="6"/></g>
          </svg>
        </div> : <>
          <div style={{position:'absolute', left:300, top:420, transform:`translateY(${(1-dice)*-700}px) rotate(${roll}deg)`}}><Icon name="dice" size={260}/></div>
          <div style={{position:'absolute', left:560, top:520, transform:`translateY(${(1-dice)*-900}px) rotate(${-roll*0.8}deg)`}}><Icon name="dice" size={200}/></div>
          <RedCircle p={circ} w={720} h={520} style={{left:180, top:330}}/>
          <BigX p={x} size={300} style={{left:390, top:420}}/>
          <Sticker rot={-4} style={{left:330, top:900, opacity:fadeIn(f,fps,ws(95),0.1)}}>GUESS 🎲</Sticker>
        </>}
      </Handheld>
    </AbsoluteFill>
  );
};

/* H — Vision Guiders psychometric test on the phone, then a radar chart measures you */
const Radar = ({vals, p}:{vals:number[];p:number[]}) => {
  const ax = ['INTEREST', 'APTITUDE', 'PERSONALITY'];
  const pt = (i:number, r:number) => [300 + Math.sin(i*2*Math.PI/3)*r, 300 - Math.cos(i*2*Math.PI/3)*r];
  const poly = vals.map((v, i) => pt(i, 230*v*p[i]).join(',')).join(' ');
  return (
    <svg width="640" height="640" viewBox="-70 -20 740 700">
      {[0.33, 0.66, 1].map(r => <polygon key={r} points={[0,1,2].map(i => pt(i, 230*r).join(',')).join(' ')} fill="none" stroke="#D5CCBE" strokeWidth="4"/>)}
      {[0,1,2].map(i => <line key={i} x1="300" y1="300" x2={pt(i,230)[0]} y2={pt(i,230)[1]} stroke="#D5CCBE" strokeWidth="4"/>)}
      <polygon points={poly} fill="rgba(238,106,44,0.35)" stroke={C.saffron} strokeWidth="8" strokeLinejoin="round"/>
      {ax.map((a, i) => { const [x, y] = pt(i, 275); return <text key={a} x={x} y={y + (i ? 30 : -6)} textAnchor="middle" fontFamily="Poppins" fontWeight="800" fontSize="30" fill={C.ink} opacity={p[i] > 0 ? 1 : 0.3}>{a}</text>; })}
    </svg>
  );
};
export const H = () => {
  const {f, fps, t} = useT();
  const enter = sp(f, fps, 39.6, {damping:14, stiffness:130});
  const taps = [41.0, 41.55, 42.1, 42.65];
  const sel = taps.filter(x => t > x).length;
  const prog = interpolate(t, [40.6, 43.0], [0.15, 0.92], clamp);
  const quiz = t < 43.05;
  const ax = [ws(109), ws(110), ws(112)].map(a => sp(f, fps, a, {damping:12, stiffness:120}));
  const scan = (t - ws(113)) % 0.9 / 0.9;
  const opts = ['🔧 Gadgets kholna', '✍️ Kahaani likhna', '🧮 Hisaab-kitaab', '🤝 Logon se milna'];
  return (
    <AbsoluteFill>
      <Handheld amp={0.6}>
        <Room dim={0.25}/>
        <div style={{position:'absolute', left:160, top:250, transform:`translateY(${(1-enter)*1400}px)`}}>
          <Phone w={760} h={1220}>
            <AbsoluteFill style={{background:'#FBF7F0'}}/>
            <div style={{position:'absolute', left:0, right:0, top:70, display:'flex', flexDirection:'column', alignItems:'center'}}>
              <Img src={staticFile('logo.png')} style={{width:300}}/>
              <div style={{fontFamily:F.ugc, fontWeight:800, fontSize:40, color:C.indigo, marginTop:6}}>Psychometric Test</div>
              <div style={{width:600, height:20, background:'#E8E0D2', borderRadius:10, marginTop:18}}><div style={{width:`${prog*100}%`, height:'100%', background:C.saffron, borderRadius:10}}/></div>
            </div>
            {quiz ? <div style={{position:'absolute', left:40, right:40, top:470}}>
              <div style={{fontFamily:F.ugc, fontWeight:800, fontSize:44, color:C.ink, lineHeight:1.2, marginBottom:28}}>Weekend pe kya karna pasand hai?</div>
              {opts.map((o, i) => {
                const on = sel > i && i === sel - 1;
                return <div key={i} style={{fontFamily:F.sans, fontWeight:600, fontSize:38, padding:'24px 28px', marginBottom:18, borderRadius:24, background: on ? C.indigo : '#fff', color: on ? '#fff' : C.ink, border:`4px solid ${on ? C.indigo : '#E3DACB'}`, transform:`scale(${on ? 1.03 : 1})`}}>{o}</div>;
              })}
              {taps.map((x, i) => { const k = t - x; if (k < 0 || k > 0.5) return null; return <div key={i} style={{position:'absolute', left:520, top:150 + i*130, width:60 + k*200, height:60 + k*200, marginLeft:-(k*100), marginTop:-(k*100), borderRadius:'50%', border:`6px solid ${C.saffron}`, opacity:1 - k*2}}/>; })}
            </div> : <div style={{position:'absolute', left:40, top:420}}>
              <div style={{fontFamily:F.ugc, fontWeight:800, fontSize:40, color:C.ink, textAlign:'center', width:640}}>{t > ws(113) ? 'Measuring… 🔍' : 'Analysing…'}</div>
              <div style={{position:'relative', marginLeft:0, marginTop:30}}>
                <Radar vals={[0.82, 0.66, 0.9]} p={ax}/>
                {t > ws(113) && <div style={{position:'absolute', left:0, right:0, top:scan*560, height:8, background:'linear-gradient(90deg, transparent, #2FB36B, transparent)'}}/>}
              </div>
            </div>}
          </Phone>
        </div>
        {/* finger */}
        {quiz && t > 40.8 && <div style={{position:'absolute', left:700, top:900 + Math.min(3, sel)*130 - (taps.some(x => t > x - 0.12 && t < x + 0.08) ? 20 : 0), fontSize:120, fontFamily:F.emoji, transform:'rotate(-20deg)'}}>👆</div>}
      </Handheld>
    </AbsoluteFill>
  );
};

/* I — the report: which stream is best for YOU, and why */
export const I = () => {
  const {f, fps, t} = useT();
  const card = sp(f, fps, ws(116), {damping:13, stiffness:140});
  const vals = [0.64, 0.88, 0.71];
  const why = sp(f, fps, ws(127), {damping:11, stiffness:200});
  return (
    <AbsoluteFill>
      <Handheld punches={[ws(125)]}>
        <Room/>
        <div style={{position:'absolute', left:110, top:300, width:860, transform:`translateY(${(1-card)*1300}px) rotate(${(1-card)*-8 - 1}deg)`, background:'#fff', borderRadius:34, boxShadow:'0 30px 60px rgba(0,0,0,0.22)', padding:'40px 46px', boxSizing:'border-box'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{fontFamily:F.ugc, fontWeight:800, fontSize:52, color:C.indigo}}>TUMHARI REPORT 📋</div>
            <Img src={staticFile('logo.png')} style={{width:140}}/>
          </div>
          {DOORS.map((d, i) => {
            const s = sp(f, fps, ws(120) + i*0.3, {damping:15, stiffness:90});
            const best = i === 1 && t > ws(125);
            return <div key={i} style={{marginTop:34, padding:best ? '16px 18px' : '16px 0', borderRadius:20, background: best ? '#FFF6C9' : 'transparent', boxShadow: best ? `0 0 0 6px ${C.cap}` : 'none'}}>
              <div style={{display:'flex', alignItems:'center', gap:16, fontFamily:F.ugc, fontWeight:800, fontSize:44, color:C.ink}}>
                <div style={{width:70, height:70, borderRadius:18, background:d.color, display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name={d.icon} size={46} color="#fff"/></div>
                {d.name}<span style={{marginLeft:'auto', fontFamily:F.mono, fontSize:34, color:'#666'}}>{Math.round(s*vals[i]*100)}%</span>
              </div>
              <div style={{height:26, background:'#EEE6D8', borderRadius:13, marginTop:12}}><div style={{width:`${s*vals[i]*100}%`, height:'100%', background:d.color, borderRadius:13}}/></div>
            </div>;
          })}
        </div>
        <Pop at={ws(125)} from={1.8} cfg={{damping:9, stiffness:320}} style={{left:600, top:648, zIndex:4}}>
          <div style={{background:C.cap, color:C.ink, fontFamily:F.ugc, fontWeight:800, fontSize:40, padding:'10px 24px', borderRadius:18, border:`5px solid ${C.ink}`, transform:'rotate(6deg)'}}>BEST FIT ⭐</div>
        </Pop>
        <div style={{position:'absolute', left:150, top:1085, opacity:why, transform:`rotate(-3deg) scale(${0.7 + 0.3*why})`, background:C.lime, padding:'22px 30px', width:520, boxShadow:'0 12px 24px rgba(0,0,0,0.18)'}}>
          <div style={{fontFamily:F.ugc, fontWeight:800, fontSize:44, color:C.ink}}>Aur kyun? 🤔</div>
          {[0.9, 0.7, 0.8].map((w, i) => <div key={i} style={{height:14, width:`${w*100}%`, background:'rgba(23,23,28,0.35)', borderRadius:7, marginTop:14}}/>)}
        </div>
      </Handheld>
    </AbsoluteFill>
  );
};

/* J — video call: counsellor + student, then parents join; decision together, no pressure */
const Tile = ({at, children, name, x, y, w, h}:{at:number;children:React.ReactNode;name:string;x:number;y:number;w:number;h:number}) => {
  const {f, fps, t} = useT(); const s = sp(f, fps, at, {damping:13, stiffness:170});
  if (t < at - 0.02) return null;
  return <div style={{position:'absolute', left:x, top:y, width:w, height:h, borderRadius:30, overflow:'hidden', background:'#26324A', transform:`scale(${0.5 + 0.5*s})`, opacity:s, boxShadow:'0 10px 30px rgba(0,0,0,0.35)', transition:'none'}}>
    <div style={{position:'absolute', inset:0, display:'flex', alignItems:'flex-end', justifyContent:'center'}}>{children}</div>
    <div style={{position:'absolute', left:18, bottom:16, background:'rgba(0,0,0,0.55)', color:'#fff', fontFamily:F.sans, fontWeight:600, fontSize:28, padding:'6px 16px', borderRadius:12}}>{name}</div>
  </div>;
};
export const J = () => {
  const {f, fps, t} = useT();
  const four = t > ws(138);
  const lay = interpolate(sp(f, fps, ws(138), {damping:15, stiffness:140}), [0,1], [0,1]);
  const happy = t > ws(144);
  const gauge = interpolate(t, [ws(146), ws(148)+0.3], [0.85, 0.12], {...clamp, easing:Easing.inOut(Easing.cubic)});
  const g = fadeIn(f, fps, ws(146) - 0.1, 0.2);
  const W1 = interpolate(lay, [0,1], [860, 420]);
  return (
    <AbsoluteFill>
      <Handheld amp={0.5}>
        <AbsoluteFill style={{background:C.dark}}/>
        <div style={{position:'absolute', left:110, top:270, display:'flex', alignItems:'center', gap:14, color:'#fff', fontFamily:F.sans, fontWeight:600, fontSize:30}}><div style={{width:18, height:18, borderRadius:'50%', background:C.red}}/>Vision Guiders · 1:1 Session</div>
        <Tile at={ws(129)} name="Counsellor" x={110} y={330} w={W1} h={four ? 350 : 360}><Person kind="counsellor" mood={happy ? 'happy' : 'neutral'} acc={['glasses']} size={four ? 280 : 300}/></Tile>
        <Tile at={ws(134)} name="Tum" x={four ? 110 + 440*lay : 110} y={four ? 330 : 710} w={W1} h={four ? 350 : 360}><Person kind="boy" mood={happy ? 'happy' : 'neutral'} size={four ? 280 : 300}/></Tile>
        <Tile at={ws(138)} name="Papa" x={110} y={700} w={420} h={350}><Person kind="papa" mood={happy ? 'happy' : 'neutral'} size={280}/></Tile>
        <Tile at={ws(138)+0.15} name="Mummy" x={550} y={700} w={420} h={350}><Person kind="mom" mood={happy ? 'happy' : 'neutral'} size={270}/></Tile>
        <Pop at={ws(134)} style={{left:470, top:t > ws(138) ? 650 : 655, zIndex:5}}><div style={{background:C.saffron, color:'#fff', fontFamily:F.loud, fontSize:64, padding:'4px 30px', borderRadius:16}}>1:1</div></Pop>
        {happy && ['❤️','👍','🙌','❤️','😊','👏'].map((e, i) => { const k = t - ws(144) - i*0.12; if (k < 0) return null; return <div key={i} style={{position:'absolute', left:150 + i*130, top:1150 - k*500, fontSize:80, fontFamily:F.emoji, opacity:Math.max(0, 1 - k*0.7)}}>{e}</div>; })}
        {/* pressure gauge */}
        <div style={{position:'absolute', left:340, top:560, opacity:g, background:'rgba(14,23,38,0.85)', borderRadius:30, padding:'20px 0 26px', zIndex:8}}>
          <svg width="400" height="240" viewBox="0 0 400 240">
            <path d="M40 200 A160 160 0 0 1 120 61" stroke={C.green} strokeWidth="34" fill="none"/>
            <path d="M120 61 A160 160 0 0 1 280 61" stroke={C.cap} strokeWidth="34" fill="none"/>
            <path d="M280 61 A160 160 0 0 1 360 200" stroke={C.red} strokeWidth="34" fill="none"/>
            <g transform={`rotate(${-90 + gauge*180} 200 200)`}><path d="M200 70 L212 200 L188 200 Z" fill="#fff"/></g>
            <circle cx="200" cy="200" r="18" fill="#fff"/>
          </svg>
          <div style={{textAlign:'center', fontFamily:F.ugc, fontWeight:800, fontSize:34, color:'#fff', marginTop:-10}}>PRESSURE</div>
        </div>
      </Handheld>
    </AbsoluteFill>
  );
};

/* K — the road: not 2 years, a whole life */
export const K = () => {
  const {f, fps, t} = useT();
  const zoom = interpolate(t, [ws(155), ws(156)+0.6], [1.9, 1], {...clamp, easing:Easing.inOut(Easing.cubic)});
  const seg = fadeIn(f, fps, ws(151), 0.2);
  const ms = [{e:'🎓', l:'College', x:640, y:930, at:ws(156)+0.1}, {e:'💼', l:'Career', x:380, y:790, at:ws(156)+0.35}, {e:'🏡', l:'Life', x:560, y:640, at:ws(158)}];
  return (
    <AbsoluteFill>
      <Handheld amp={0.5}>
        <AbsoluteFill style={{transform:`scale(${zoom})`, transformOrigin:'50% 85%'}}>
          <Sky/>
          <svg width="1080" height="1920" style={{position:'absolute'}}>
            <path d="M380 1920 C 420 1600 760 1500 700 1300 C 650 1130 360 1100 420 930 C 470 800 640 780 600 660 C 580 600 540 590 540 560 L560 560 C 570 600 620 610 640 660 C 690 790 520 810 480 930 C 430 1080 720 1120 780 1300 C 850 1520 520 1600 700 1920 Z" fill="#9C8B78"/>
            <path d="M540 1920 C 580 1600 740 1500 740 1300 C 720 1120 380 1100 450 930 C 500 800 620 790 620 660 C 615 610 560 590 550 560" fill="none" stroke="#fff" strokeWidth="10" strokeDasharray="34 30"/>
          </svg>
          <div style={{position:'absolute', left:110, top:1480, opacity:seg}}><Sticker rot={-4} bg={C.saffron} color="#fff" style={{fontSize:40}}>2 saal ⏳</Sticker></div>
          {ms.map((m, i) => (
            <Pop key={i} at={m.at} style={{left:m.x, top:m.y}}>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                <div style={{fontSize:80, fontFamily:F.emoji, lineHeight:1}}>{m.e}</div>
                <div style={{background:'#fff', borderRadius:20, padding:'6px 18px', fontFamily:F.ugc, fontWeight:800, fontSize:30, color:C.ink, marginTop:6}}>{m.l}</div>
              </div>
            </Pop>
          ))}
        </AbsoluteFill>
        <div style={{position:'absolute', left:380, top:1250 + Math.sin(t*6)*4}}><Person kind="boy" mood="happy" acc={['cap']} size={300}/></div>
      </Handheld>
    </AbsoluteFill>
  );
};

/* L — guess ❌ test ✅, then end card */
export const L = () => {
  const {f, fps, t} = useT();
  const x = interpolate(t, [ws(160)+0.1, ws(162)], [0, 1], clamp);
  const tk = interpolate(t, [ws(163), ws(163)+0.45], [0, 1], clamp);
  const end = t > 64.95;
  const mark = sp(f, fps, ws(165), {damping:12, stiffness:160});
  const btn = sp(f, fps, ws(167), {damping:11, stiffness:220});
  const press = interpolate(t, [ws(170), ws(170)+0.08, ws(170)+0.25], [1, 0.92, 1], clamp);
  return (
    <AbsoluteFill>
      <Handheld amp={end ? 0.3 : 1} punches={[ws(163)]}>
        {!end ? <>
          <AbsoluteFill style={{background:'linear-gradient(180deg,#FDF3E4,#F3DCC0)'}}/>
          <div style={{position:'absolute', left:110, top:420}}><Icon name="dice" size={330}/><BigX p={x} size={330} style={{left:0, top:0}}/></div>
          <div style={{position:'absolute', left:620, top:400, width:330, height:420}}>
            <Phone w={300} h={440} style={{transform:`rotate(6deg) scale(${0.7 + 0.3*Math.min(1, tk*2)})`}}><AbsoluteFill style={{background:'#FBF7F0', display:'flex', alignItems:'center', justifyContent:'center'}}><Img src={staticFile('logo.png')} style={{width:200}}/></AbsoluteFill></Phone>
            <Tick p={tk} size={190} style={{left:170, top:300}}/>
          </div>
          <Sticker rot={-5} bg={C.red} color="#fff" style={{left:150, top:860, opacity:fadeIn(f,fps,ws(160),0.1)}}>GUESS ❌</Sticker>
          <Sticker rot={4} bg={C.green} color="#fff" style={{left:620, top:880, opacity:fadeIn(f,fps,ws(163),0.1)}}>TEST ✅</Sticker>
        </> : <>
          <AbsoluteFill style={{background:`linear-gradient(180deg, ${C.indigo}, #0A2D4D)`}}/>
          <div style={{position:'absolute', left:0, right:0, top:280, display:'flex', justifyContent:'center', transform:`translateY(${(1-mark)*60}px)`, opacity:Math.min(1, mark*1.5)}}>
            <div style={{background:'#fff', borderRadius:34, padding:'30px 50px', boxShadow:'0 20px 40px rgba(0,0,0,0.3)'}}><Img src={staticFile('logo.png')} style={{width:500, display:'block'}}/></div>
          </div>
          <div style={{position:'absolute', left:0, right:0, top:790, display:'flex', justifyContent:'center', gap:30, opacity:fadeIn(f,fps,65.3,0.3)}}>
            {[0,1,2].map(i => <div key={i} style={{transform:`scale(0.62)`, transformOrigin:'top center', margin:'0 -50px'}}><Door i={i} w={260} glow={i===1 ? 1 : 0} open={i===1 ? 0.6 : 0} dim={i===1 ? 0 : 0.5}/></div>)}
          </div>
          <div style={{position:'absolute', left:96, right:96, top:1180, opacity:Math.min(1,btn*1.5), transform:`translateY(${(1-btn)*80}px) scale(${press})`}}>
            <div style={{background:C.cap, color:C.ink, borderRadius:80, padding:'30px 30px', fontFamily:F.ugc, fontWeight:800, fontSize:46, textAlign:'center', whiteSpace:'nowrap', boxShadow:'0 10px 0 rgba(0,0,0,0.3)'}}>Aaj hi counselling book karo 👉</div>
            <div style={{fontFamily:F.mono, fontSize:38, color:'#fff', textAlign:'center', marginTop:26}}>visionguiders.com</div>
          </div>
          <div style={{position:'absolute', left:0, right:0, top:1430, display:'flex', justifyContent:'center', alignItems:'flex-end', opacity:fadeIn(f,fps,65.5,0.3)}}>
            <Person kind="papa" mood="happy" size={280}/><div style={{marginLeft:-60, zIndex:2}}><Person kind="boy" mood="happy" acc={['cap']} size={310}/></div><div style={{marginLeft:-60}}><Person kind="mom" mood="happy" size={270}/></div>
          </div>
        </>}
      </Handheld>
    </AbsoluteFill>
  );
};
