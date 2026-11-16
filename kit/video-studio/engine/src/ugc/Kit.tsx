import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {useT} from '../lib/clock';
import {C, F} from '../lib/theme';

/* ---------- backgrounds ---------- */
export const Room = ({dim=0}:{dim?:number}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background:`linear-gradient(180deg, #F9EBDA 0%, ${C.wall} 60%)`}}/>
    {/* window */}
    <div style={{position:'absolute', left:70, top:300, width:300, height:360, borderRadius:16, background:'linear-gradient(180deg,#BFE3F5,#E7F4FA)', border:'16px solid #FFFFFF', boxShadow:'0 6px 0 rgba(0,0,0,0.06)'}}>
      <div style={{position:'absolute', left:'50%', top:0, bottom:0, width:12, background:'#fff', transform:'translateX(-50%)'}}/>
      <div style={{position:'absolute', top:'50%', left:0, right:0, height:12, background:'#fff'}}/>
      <div style={{position:'absolute', left:30, top:40, width:90, height:30, borderRadius:20, background:'#fff', opacity:0.9}}/>
    </div>
    {/* frames on wall */}
    <div style={{position:'absolute', right:110, top:330, width:170, height:210, background:'#fff', borderRadius:10, padding:14, boxSizing:'border-box', boxShadow:'0 6px 14px rgba(0,0,0,0.08)'}}><div style={{width:'100%', height:'100%', background:'linear-gradient(160deg,#F6C28B,#E58E62)', borderRadius:4}}/></div>
    <div style={{position:'absolute', right:300, top:400, width:120, height:120, background:'#fff', borderRadius:'50%', boxShadow:'0 6px 14px rgba(0,0,0,0.08)', display:'flex', alignItems:'center', justifyContent:'center'}}><div style={{width:8, height:44, background:C.ink, borderRadius:4, transformOrigin:'50% 90%', transform:'translateY(-18px) rotate(30deg)'}}/></div>
    {/* floor + plant + sofa */}
    <div style={{position:'absolute', left:0, right:0, top:1290, bottom:0, background:`linear-gradient(180deg, ${C.floor}, #CBA77D)`}}/>
    <div style={{position:'absolute', left:0, right:0, top:1270, height:26, background:'#EAD3B6'}}/>
    <svg width="220" height="420" style={{position:'absolute', right:40, top:900}}><path d="M110 300 C 60 230 40 150 70 90 C 100 160 105 220 110 300 Z" fill="#3E9B6B"/><path d="M110 300 C 150 220 180 140 160 70 C 125 140 115 210 110 300 Z" fill="#2F8A5C"/><path d="M110 300 C 80 250 20 230 10 190 C 60 200 95 240 110 300 Z" fill="#4DB07B"/><path d="M60 300 L160 300 L145 410 L75 410 Z" fill={C.saffron}/></svg>
    <AbsoluteFill style={{background:'#0E1726', opacity:dim}}/>
  </AbsoluteFill>
);
export const Spot = ({x=540, y=820}:{x?:number;y?:number}) => (
  <AbsoluteFill style={{background:`radial-gradient(ellipse 420px 620px at ${x}px ${y}px, rgba(255,240,200,0.35), rgba(14,23,38,0.0) 60%), ${C.dark}`}}/>
);
export const Sky = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{background:'linear-gradient(180deg,#9FD7F2 0%, #DDF1F9 55%, #F8EFD9 70%)'}}/>
    <svg width="1080" height="1920" style={{position:'absolute'}}>
      <circle cx="820" cy="420" r="90" fill="#FFD66B"/>
      <path d="M0 1100 C 200 1000 380 1060 560 1010 C 760 950 900 1020 1080 980 L1080 1920 L0 1920 Z" fill="#8FCB7A"/>
      <path d="M0 1250 C 260 1160 520 1240 760 1180 C 900 1150 1000 1170 1080 1160 L1080 1920 L0 1920 Z" fill="#6DB765"/>
      <path d="M0 1420 C 300 1360 600 1440 1080 1380 L1080 1920 L0 1920 Z" fill="#58A957"/>
    </svg>
  </AbsoluteFill>
);

/* ---------- icons (SVG, 100x100) ---------- */
export const Icon = ({name, size=100, color=C.ink}:{name:string;size?:number;color?:string}) => {
  const s = {width:size, height:size};
  switch (name) {
    case 'flask': return <svg viewBox="0 0 100 100" style={s}><path d="M38 10 H62 M42 10 V40 L18 84 Q14 92 24 92 H76 Q86 92 82 84 L58 40 V10" fill="none" stroke={color} strokeWidth="7" strokeLinejoin="round"/><path d="M28 70 H72 L80 86 H20 Z" fill={color} opacity="0.5"/><circle cx="44" cy="76" r="4" fill="#fff"/><circle cx="58" cy="80" r="3" fill="#fff"/></svg>;
    case 'chart': return <svg viewBox="0 0 100 100" style={s}><rect x="14" y="58" width="16" height="30" rx="3" fill={color}/><rect x="42" y="40" width="16" height="48" rx="3" fill={color}/><rect x="70" y="20" width="16" height="68" rx="3" fill={color}/><text x="12" y="38" fontFamily="Inter" fontWeight="800" fontSize="30" fill={color}>₹</text></svg>;
    case 'palette': return <svg viewBox="0 0 100 100" style={s}><path d="M50 10 C 22 10 8 32 10 54 C 12 76 32 92 50 90 C 60 89 60 80 54 74 C 48 68 54 60 62 62 C 80 66 92 58 90 42 C 88 22 72 10 50 10 Z" fill={color}/><circle cx="32" cy="40" r="7" fill="#FFE14D"/><circle cx="50" cy="28" r="7" fill="#E5484D"/><circle cx="70" cy="38" r="7" fill="#2FB36B"/><circle cx="30" cy="62" r="7" fill="#fff"/></svg>;
    case 'guitar': return <svg viewBox="0 0 100 100" style={s}><path d="M62 38 L86 14" stroke={C.ink} strokeWidth="7" strokeLinecap="round"/><path d="M50 40 C 30 30 12 44 18 62 C 10 72 18 92 36 86 C 56 92 66 70 58 56 C 66 50 62 40 50 40 Z" fill="#D9822B"/><circle cx="40" cy="62" r="7" fill={C.ink}/></svg>;
    case 'brush': return <svg viewBox="0 0 100 100" style={s}><path d="M80 12 L44 56" stroke="#8A63D2" strokeWidth="10" strokeLinecap="round"/><path d="M42 54 C 28 52 22 64 24 74 C 26 84 14 86 12 88 C 30 92 48 86 50 70 C 51 62 48 56 42 54 Z" fill="#E5484D"/></svg>;
    case 'code': return <svg viewBox="0 0 100 100" style={s}><rect x="8" y="16" width="84" height="58" rx="8" fill={C.indigo}/><path d="M36 34 L24 45 L36 56 M64 34 L76 45 L64 56 M54 30 L46 60" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="78" width="96" height="8" rx="4" fill="#9AA7B2"/></svg>;
    case 'bat': return <svg viewBox="0 0 100 100" style={s}><path d="M70 10 L90 30 L46 74 L26 54 Z" fill="#E7C08A"/><path d="M30 58 L12 88" stroke="#7A4E2D" strokeWidth="9" strokeLinecap="round"/><circle cx="80" cy="76" r="10" fill={C.red}/></svg>;
    case 'camera': return <svg viewBox="0 0 100 100" style={s}><rect x="8" y="28" width="84" height="56" rx="10" fill={C.ink}/><rect x="34" y="18" width="32" height="14" rx="4" fill={C.ink}/><circle cx="50" cy="56" r="18" fill="#fff"/><circle cx="50" cy="56" r="10" fill={C.sci}/></svg>;
    case 'dice': return <svg viewBox="0 0 100 100" style={s}><rect x="8" y="8" width="84" height="84" rx="16" fill="#fff" stroke={C.ink} strokeWidth="6"/>{[[30,30],[70,30],[50,50],[30,70],[70,70]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="8" fill={C.ink}/>)}</svg>;
    case 'heart': return <svg viewBox="0 0 100 100" style={s}><path d="M50 86 C 20 64 8 48 12 32 C 16 16 38 12 50 28 C 62 12 84 16 88 32 C 92 48 80 64 50 86 Z" fill={color}/></svg>;
    default: return null;
  }
};

/* ---------- doors (throughline) ---------- */
export const DOORS = [
  {name:'SCIENCE', icon:'flask', color:C.sci},
  {name:'COMMERCE', icon:'chart', color:C.com},
  {name:'ARTS', icon:'palette', color:C.art},
];
export const Door = ({i, open=0, glow=0, w=260, dim=0}:{i:number;open?:number;glow?:number;w?:number;dim?:number}) => {
  const d = DOORS[i]; const h = w*2;
  return (
    <div style={{position:'relative', width:w, height:h + w*0.42, filter: dim ? `grayscale(${dim}) brightness(${1-dim*0.4})` : undefined}}>
      <div style={{height:w*0.36, borderRadius:w*0.06, background:d.color, display:'flex', alignItems:'center', justifyContent:'center', gap:w*0.04, color:'#fff', fontFamily:F.ugc, fontWeight:800, fontSize:w*0.13, boxShadow:'0 6px 0 rgba(0,0,0,0.12)'}}>
        <Icon name={d.icon} size={w*0.22} color="#fff"/>{d.name}
      </div>
      <div style={{position:'relative', marginTop:w*0.06, width:w, height:h, background:'#5A3E2B', borderRadius:`${w*0.05}px ${w*0.05}px 0 0`, padding:w*0.05, boxSizing:'border-box', perspective:900}}>
        <div style={{position:'absolute', inset:w*0.05, background: glow ? `radial-gradient(ellipse at 50% 60%, #FFF6C9, #FFD66B ${40 + glow*30}%, #F2A93B)` : '#22180F', borderRadius:4}}/>
        <div style={{position:'absolute', inset:w*0.05, background:`linear-gradient(180deg, ${d.color}, ${d.color}DD)`, borderRadius:4, transformOrigin:'left center', transform:`rotateY(${-open*78}deg)`, boxShadow:'inset 0 0 0 6px rgba(255,255,255,0.18)'}}>
          <div style={{position:'absolute', left:'14%', right:'14%', top:'8%', height:'36%', border:'5px solid rgba(255,255,255,0.35)', borderRadius:8}}/>
          <div style={{position:'absolute', left:'14%', right:'14%', top:'52%', height:'38%', border:'5px solid rgba(255,255,255,0.35)', borderRadius:8}}/>
          <div style={{position:'absolute', right:'10%', top:'50%', width:w*0.07, height:w*0.07, borderRadius:'50%', background:'#FFD66B'}}/>
        </div>
      </div>
      {glow > 0 && <div style={{position:'absolute', left:-w*0.3, right:-w*0.3, bottom:-w*0.2, height:w*0.4, background:'radial-gradient(ellipse, rgba(255,214,107,0.7), transparent 70%)', opacity:glow}}/>}
    </div>
  );
};

/* ---------- phone + chat ---------- */
export const Phone = ({w=760, h=1180, children, style, header}:{w?:number;h?:number;children?:React.ReactNode;style?:React.CSSProperties;header?:React.ReactNode}) => (
  <div style={{width:w, height:h, borderRadius:70, background:'#111', padding:22, boxSizing:'border-box', boxShadow:'0 40px 80px rgba(0,0,0,0.35)', ...style}}>
    <div style={{position:'relative', width:'100%', height:'100%', borderRadius:52, overflow:'hidden', background:'#ECE5DD'}}>
      {header}
      <div style={{position:'absolute', left:'50%', top:14, width:150, height:34, borderRadius:20, background:'#111', transform:'translateX(-50%)', zIndex:5}}/>
      {children}
    </div>
  </div>
);
export const Typing = () => {
  const {t} = useT();
  return <div style={{display:'inline-flex', gap:10, padding:'22px 28px', background:'#fff', borderRadius:30}}>{[0,1,2].map(i => <div key={i} style={{width:16, height:16, borderRadius:'50%', background:'#8A8A8A', transform:`translateY(${Math.sin(t*12 - i)*5}px)`}}/>)}</div>;
};

/* ---------- confetti ---------- */
export const Confetti = ({at, x=540, y=700, n=40}:{at:number;x?:number;y?:number;n?:number}) => {
  const {t} = useT(); const k = t - at;
  if (k < 0 || k > 2.2) return null;
  const cols = [C.saffron, C.cap, C.sci, C.com, C.art, C.red];
  return <>{Array.from({length:n}).map((_, i) => {
    const a = random(`a${i}`)*Math.PI*2, v = 500 + random(`v${i}`)*700;
    const px = x + Math.cos(a)*v*k, py = y + Math.sin(a)*v*k*0.8 + 900*k*k;
    return <div key={i} style={{position:'absolute', left:px, top:py, width:16, height:26, background:cols[i%6], borderRadius:3, opacity:Math.max(0, 1 - k/2.2), transform:`rotate(${k*720*(random(`r${i}`)-0.5)}deg)`}}/>;
  })}</>;
};

/* ---------- red UGC annotation: scribble circle + X ---------- */
export const RedCircle = ({p, w=360, h=260, style}:{p:number;w?:number;h?:number;style?:React.CSSProperties}) => (
  <svg width={w} height={h} viewBox="0 0 360 260" style={{position:'absolute', overflow:'visible', ...style}}>
    <path d="M40 130 C 40 40 320 30 330 120 C 340 220 60 240 30 150 C 20 110 90 60 200 56" fill="none" stroke={C.red} strokeWidth="12" strokeLinecap="round" strokeDasharray="1400" strokeDashoffset={1400*(1-p)}/>
  </svg>
);
export const BigX = ({p, size=300, style}:{p:number;size?:number;style?:React.CSSProperties}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{position:'absolute', overflow:'visible', ...style}}>
    <path d="M15 15 L85 85" stroke={C.red} strokeWidth="12" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100*(1-Math.min(1,p*2))}/>
    <path d="M85 15 L15 85" stroke={C.red} strokeWidth="12" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100*(1-Math.max(0,p*2-1))}/>
  </svg>
);
export const Tick = ({p, size=300, style, color=C.green}:{p:number;size?:number;style?:React.CSSProperties;color?:string}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{position:'absolute', overflow:'visible', ...style}}>
    <circle cx="50" cy="50" r="46" fill={color} transform={`scale(${Math.min(1,p*1.6)})`} style={{transformOrigin:'50px 50px'}}/>
    <path d="M28 52 L44 68 L74 34" stroke="#fff" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="80" strokeDashoffset={80*(1-Math.max(0,(p-0.3)/0.7))}/>
  </svg>
);
export const Sticker = ({children, rot=-3, bg='#fff', color=C.ink, style}:{children:React.ReactNode;rot?:number;bg?:string;color?:string;style?:React.CSSProperties}) => (
  <div style={{position:'absolute', padding:'16px 30px', background:bg, color, borderRadius:22, fontFamily:F.ugc, fontWeight:800, fontSize:46, transform:`rotate(${rot}deg)`, boxShadow:'0 8px 0 rgba(0,0,0,0.15), 0 0 0 6px #fff', whiteSpace:'nowrap', ...style}}>{children}</div>
);
