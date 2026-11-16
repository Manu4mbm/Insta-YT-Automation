import React from 'react';
import {AbsoluteFill, Audio, staticFile, random} from 'remotion';
import './lib/fonts';
import {useT, ws} from './lib/clock';
import {P, FT, Bg, Slam, Ital, Pill, Toggle, Stripes, DotMorph, DotWall, Halftone, Burst, Blob, lerp, pop} from './bold';

export const DUR = 36.9;
const W = (i: number) => ws(i);
// scene cut times (on spoken words)
const CUTS = [0, W(4), W(10), W(19), W(22), W(24), W(42), W(47), W(57), W(60), W(67) - 0.05, W(69) - 0.05, W(71) - 0.05, W(73) - 0.05, W(76), W(81) - 0.05, W(84), DUR];
const sceneOf = (t: number) => { let i = 0; while (i < CUTS.length - 1 && t >= CUTS[i + 1]) i++; return i; };

const Center: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) =>
  <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...style}}>{children}</AbsoluteFill>;

/* ---------- prompt card ---------- */
const PROMPT: [string, number, boolean][] = [['15 second', 29, true], ['ki', 31, false], ['premium', 32, true], ['motion graphic', 33, false], ['banao:', 35, false], ['smooth', 36, false], ['3D camera,', 37, true], ['morphing shapes,', 39, true], ['glow.', 41, true]];
const PromptScene: React.FC<{t: number}> = ({t}) => {
  const a = W(24);
  const ry = lerp(t, a, W(42), -16, 10, x => x), rx = lerp(t, a, W(42), 12, 4, x => x);
  const ring = Math.round(lerp(t, W(29), W(41) + 0.4, 12, 98, x => x));
  const glow = lerp(t, W(41), W(41) + 0.5, 0, 1);
  const chips: [string, number, number, number, string][] = [['15 SEC', 30, 1560, 330, P.lime], ['PREMIUM', 32, 250, 560, P.lime], ['3D CAMERA', 37, 1580, 520, P.purple], ['MORPHING', 39, 230, 780, P.orange], ['GLOW', 41, 1600, 760, P.lime]];
  return <AbsoluteFill style={{background: P.ink}}>
    <div style={{position: 'absolute', left: 120, top: 90, display: 'flex', alignItems: 'center', gap: 20}}>
      <Ital text="aur bas itna type kiya:" t={t} at={W(24)} size={52} color={P.white} />
    </div>
    <div style={{position: 'absolute', left: 1360, top: 90, transform: `scale(${pop(t, W(33), 0.3)})`}}><Toggle on={lerp(t, W(33) + 0.1, W(33) + 0.3, 0, 1)} label="Motion system" /></div>
    <div style={{position: 'absolute', left: 960 - 520, top: 540 - 290, width: 1040, height: 580, perspective: 1600}}>
      <div style={{width: '100%', height: '100%', transform: `rotateY(${ry}deg) rotateX(${rx}deg) scale(${lerp(t, a, a + 0.5, 0.85, 1)})`, background: P.card, borderRadius: 34, padding: 46,
        boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 ${glow * 120}px ${glow * 30}px rgba(214,242,58,${0.55 * glow})`, border: `4px solid ${glow > 0.1 ? P.lime : 'transparent'}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: FT.body, fontWeight: 800, fontSize: 30, color: '#3a3542'}}>
          <svg width="40" height="40" viewBox="-50 -50 100 100">{Array.from({length: 6}).map((_, i) => <rect key={i} x={-6} y={-46} width={12} height={46} rx={6} fill={P.orange} transform={`rotate(${i * 60})`} />)}</svg> Evening, Aman
        </div>
        <div style={{marginTop: 34, minHeight: 260, borderRadius: 22, border: '3px solid #E2DED8', background: '#fff', padding: 30, fontFamily: FT.body, fontWeight: 700, fontSize: 44, lineHeight: 1.45, color: P.ink}}>
          {t < W(29) ? <span style={{color: P.dim}}>How can I help you today?</span> : PROMPT.map(([w, wi, hl], i) => t >= W(wi) &&
            <span key={i} style={{background: hl ? P.lime : 'transparent', borderRadius: 8, padding: hl ? '0 8px' : 0, marginRight: 12}}>{w}</span>)}
          {t >= W(29) && <span style={{color: P.orange, opacity: Math.floor(t * 3) % 2 ? 1 : 0}}>|</span>}
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 26}}><div style={{width: 74, height: 74, borderRadius: 18, background: P.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FT.heavy, fontSize: 40}}>↑</div></div>
      </div>
    </div>
    {chips.map(([s, wi, x, y, c]) => t >= W(wi) && <div key={s} style={{position: 'absolute', left: x, top: y, transform: `scale(${pop(t, W(wi), 0.3)}) rotate(${(random(s) - 0.5) * 10}deg)`}}><Pill bg={c} color={c === P.lime ? P.ink : P.white} size={34}>{s}</Pill></div>)}
    <div style={{position: 'absolute', right: 140, bottom: 90, display: 'flex', alignItems: 'center', gap: 16, background: P.ink, border: '3px solid #2b2733', borderRadius: 20, padding: '14px 24px', opacity: lerp(t, W(29), W(29) + 0.3, 0, 1)}}>
      <svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#2b2733" strokeWidth="8" /><circle cx="32" cy="32" r="26" fill="none" stroke={P.orange} strokeWidth="8" strokeDasharray={`${(ring / 100) * 163} 163`} transform="rotate(-90 32 32)" strokeLinecap="round" /></svg>
      <div style={{fontFamily: FT.heavy, fontSize: 48, color: P.white}}>{ring}%</div>
    </div>
  </AbsoluteFill>;
};

/* ---------- scenes ---------- */
const Scenes: React.FC<{t: number}> = ({t}) => {
  const s = sceneOf(t);
  switch (s) {
    case 0: return <><Bg c={P.orange} /><Center>
      <Ital text="ye kya" t={t} at={W(0)} size={90} color={P.ink} />
      <div style={{position: 'relative'}}><Slam text="BAWAAL" t={t} at={W(2) - 0.08} size={330} color={P.ink} stagger={0.04} rot={30} />
        {t > W(3) && <div style={{position: 'absolute', right: -250, top: 20, fontFamily: FT.heavy, fontSize: 300, color: P.purple, transform: `skewX(-12deg) translateX(${Math.sin(t * 60) * 4}px)`}}>?!</div>}</div>
    </Center></>;
    case 1: {
      const ready = t > W(7) - 0.06;
      return ready ? <><Bg c={P.orange} /><Center>
        <Slam text="READY." t={t} at={W(7) - 0.06} size={380} color={P.ink} stagger={0.05} rot={70} seed="rd" />
        <Ital text="iske liye nahi thi." t={t} at={W(8)} size={80} color={P.ink} style={{marginTop: 10}} />
      </Center></> : <><Bg c={P.ink} /><Center>
        <div style={{fontFamily: FT.mono, fontSize: 40, letterSpacing: 24, color: P.dim, opacity: lerp(t, W(4), W(4) + 0.2, 0, 1)}}>THE</div>
        <Slam text="DUNIYA" t={t} at={W(4)} size={260} color={P.white} stagger={0.03} />
      </Center></>;
    }
    case 2: {
      const bina = t > W(14) - 0.05;
      if (!bina) return <><Bg c={P.ink} /><div style={{position: 'absolute', left: 520, top: 380, display: 'flex', gap: 40, alignItems: 'center'}}>
        <div style={{width: 34, height: lerp(t, W(10), W(10) + 0.3, 0, 300), background: P.white}} />
        <div><Slam text="MAINE BANAYA" t={t} at={W(13) - 0.1} size={130} color={P.white} stagger={0.02} style={{justifyContent: 'flex-start'}} /><Ital text="ye motion graphic" t={t} at={W(10)} size={90} color={P.lime} /></div>
      </div></>;
      const cross = lerp(t, W(16), W(16) + 0.25, 0, 1);
      return <><Bg c={P.paper} /><Center style={{flexDirection: 'row', gap: 80}}>
        <Slam text="BINA" t={t} at={W(14) - 0.05} size={300} color={P.ink} stagger={0.04} />
        <div style={{position: 'relative', transform: `perspective(1200px) rotateY(-14deg) scale(${pop(t, W(15) - 0.05, 0.35)})`}}>
          <div style={{width: 640, height: 400, borderRadius: 26, background: P.purple, padding: 34}}>
            <div style={{fontFamily: FT.serif, fontStyle: 'italic', fontSize: 70, color: P.white}}>After Effects</div>
            {[0.9, 0.6, 0.75, 0.5].map((w, i) => <div key={i} style={{height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.35)', marginTop: 26, width: `${w * 100}%`, marginLeft: `${i * 8}%`}} />)}
          </div>
          <svg width="640" height="400" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <line x1="40" y1="40" x2={40 + 560 * cross} y2={40 + 320 * cross} stroke={P.orange} strokeWidth="30" strokeLinecap="round" />
            <line x1="600" y1="40" x2={600 - 560 * Math.max(0, cross * 1.3 - 0.3)} y2={40 + 320 * Math.max(0, cross * 1.3 - 0.3)} stroke={P.orange} strokeWidth="30" strokeLinecap="round" />
          </svg>
        </div>
      </Center></>;
    }
    case 3: return <><Stripes t={t} /><Center>
      <div style={{position: 'relative', background: P.ink, padding: '10px 50px', transform: `scale(${pop(t, W(19), 0.3)})`}}>
        <div style={{fontFamily: FT.heavy, fontSize: 170, color: P.white}}>HIGGSFIELD</div>
        <div style={{position: 'absolute', left: 30, right: 30, top: '52%', height: 18, background: P.orange, transform: `scaleX(${lerp(t, W(21), W(21) + 0.2, 0, 1)})`, transformOrigin: 'left'}} />
      </div>
      <Ital text="bhi nahi." t={t} at={W(20)} size={70} color={P.white} style={{marginTop: 10}} />
    </Center></>;
    case 4: return <><Bg c="#120E22" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center'}}><Ital text="sirf…" t={t} at={W(22)} size={80} color={P.white} /></div>
      <DotMorph t={t} t0={W(22) - 0.1} morphAt={W(23) - 0.05} text="CLAUDE" color="#C9C2FF" />
    </>;
    case 5: return <PromptScene t={t} />;
    case 6: return <><Bg c="#160F2E" />
      {[[420, 360, 140, 'a', 1.3], [1500, 300, 110, 'b', 1], [1380, 800, 170, 'c', 1.5], [560, 830, 90, 'd', 1], [960, 180, 70, 'e', 1]].map(([x, y, r, k, sx]) =>
        <Blob key={k as string} x={x as number} y={y as number} r={(r as number) * pop(t, W(42) + (x as number) / 9000, 0.5)} t={t} seed={k as string} sx={sx as number} />)}
      <Center><Ital text="aur Claude ne…" t={t} at={W(42)} size={80} color={P.white} /><Slam text="BANA DIYA!" t={t} at={W(45) - 0.05} size={250} color={P.white} stagger={0.035} rot={20} seed="bd" /></Center>
    </>;
    case 7: return <><Bg c={P.ink} /><DotWall t={t} t0={W(47) + 0.3} full={W(53)} />
      <div style={{position: 'absolute', left: 90, top: 70, background: P.ink, padding: '14px 26px', opacity: lerp(t, W(47), W(47) + 0.2, 0, 1)}}>
        <div style={{fontFamily: FT.serif, fontStyle: 'italic', fontSize: 46, color: P.white}}>baaki</div>
        <div style={{fontFamily: FT.heavy, fontSize: 64, color: P.white}}>AI VIDEO TOOLS</div>
        <div style={{fontFamily: FT.heavy, fontSize: 40, color: P.dim, opacity: lerp(t, W(54), W(54) + 0.2, 0, 1)}}>GENERATE KARTE HAIN</div>
      </div>
      {t > W(51) && <Center><div style={{background: P.ink, padding: '18px 60px', borderRadius: 24, transform: `scale(${pop(t, W(51), 0.3)})`}}>
        {t < W(53) ? <Slam text="HAR EK" t={t} at={W(51)} size={190} color={P.white} stagger={0.03} /> : <Slam text="FRAME." t={t} at={W(53)} size={230} color={P.white} stagger={0.03} seed="fr" />}
      </div></Center>}
    </>;
    case 8: {
      const cr = Math.round(lerp(t, W(58), W(59) + 0.4, 1000, 0));
      return <><Bg c={P.paper} />
        <div style={{position: 'absolute', left: 130, top: 120}}><Ital text="aur credits…" t={t} at={W(57)} size={80} color={P.ink} /><Slam text="KHATAM." t={t} at={W(59) - 0.05} size={230} color={P.orange} stagger={0.04} style={{justifyContent: 'flex-start'}} /></div>
        <div style={{position: 'absolute', left: 130, top: 640, display: 'flex', gap: 30}}>
          <div style={{width: 560, height: 280, borderRadius: 28, background: P.white, border: '3px solid #ddd6cf', padding: 30, transform: `scale(${pop(t, W(57), 0.35)})`}}>
            <div style={{fontFamily: FT.body, fontWeight: 800, fontSize: 30, color: P.dim}}>Credits left</div>
            <div style={{fontFamily: FT.heavy, fontSize: 120, color: cr < 200 ? P.orange : P.ink}}>{cr}</div>
          </div>
          <div style={{width: 380, height: 280, borderRadius: 28, background: P.orange, padding: 30, transform: `scale(${pop(t, W(58), 0.35)})`, fontFamily: FT.heavy, fontSize: 40, color: P.white}}>Generate<br />every frame <span style={{fontSize: 70}}>↻</span></div>
          <div style={{width: 300, height: 280, borderRadius: 28, background: P.ink, padding: 30, transform: `scale(${pop(t, W(58) + 0.12, 0.35)})`}}>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 200}}>{[1, 0.8, 0.55, 0.35, 0.15].map((h, i) => <div key={i} style={{width: 34, height: `${h * 100 * lerp(t, W(58), W(59) + 0.5, 1, 0.4 + i * 0.05)}%`, background: i > 2 ? P.orange : P.lime, borderRadius: 6}} />)}</div>
          </div>
        </div>
      </>;
    }
    case 9: {
      const lines = ['const scene = useCurrentFrame();', 'const glow = spring({frame, fps});', '<Camera3D orbit={0.4} />', '<Morph from="circle" to="CLAUDE"/>', 'render("1920x1080")'];
      const n = lerp(t, W(62), W(65) + 0.3, 0, lines.length, x => x);
      return <><Bg c={P.ink} />
        <div style={{position: 'absolute', left: 150, top: 250}}><Ital text="Claude?" t={t} at={W(60)} size={130} color={P.orange} />
          <Slam text="WO BAS" t={t} at={W(61)} size={90} color={P.white} stagger={0.03} style={{justifyContent: 'flex-start'}} />
          <Slam text="CODE" t={t} at={W(63) - 0.05} size={230} color={P.lime} stagger={0.04} style={{justifyContent: 'flex-start'}} />
          <Ital text="likhta hai." t={t} at={W(64)} size={90} color={P.white} /></div>
        <div style={{position: 'absolute', left: 1080, top: 230, width: 700, height: 560, borderRadius: 28, background: '#1A1622', border: '3px solid #2b2733', padding: 34, transform: `perspective(1400px) rotateY(-16deg) scale(${pop(t, W(61), 0.4)})`}}>
          <div style={{display: 'flex', gap: 10, marginBottom: 24}}>{[P.orange, P.lime, P.purple].map(c => <div key={c} style={{width: 18, height: 18, borderRadius: '50%', background: c}} />)}</div>
          {lines.map((l, i) => n > i && <div key={i} style={{fontFamily: FT.mono, fontSize: 30, color: i % 2 ? P.lime : '#E8E2F0', marginTop: 20, whiteSpace: 'nowrap', overflow: 'hidden', width: `${Math.min(1, n - i) * 100}%`}}>{l}</div>)}
        </div>
      </>;
    }
    case 10: return <><Bg c={P.purple} /><Halftone t={t} /><Center><Ital text="har" t={t} at={W(66)} size={80} color={P.white} /><Slam text="FRAME" t={t} at={W(67) - 0.05} size={300} color={P.white} stagger={0.03} /></Center></>;
    case 11: return <><Bg c={P.ink} /><Burst t={t} at={W(69) - 0.05} /><Center><Slam text="EFFECT" t={t} at={W(69) - 0.05} size={280} color={P.white} stagger={0.03} seed="ef" /></Center></>;
    case 12: return <><Bg c={P.orange} /><Center>
      <div style={{display: 'flex'}}>{'MOTION'.split('').map((c, i) => {
        const k = t - W(71) - i * 0.04; const wob = Math.sin(k * 10 + i) * 24 * Math.max(0, 1 - k);
        return <span key={i} style={{display: 'inline-block', fontFamily: FT.heavy, fontSize: 300, color: P.ink, transform: `translateY(${wob}px) rotate(${wob * 0.6}deg) scale(${pop(t, W(71) - 0.05 + i * 0.04, 0.3)})`}}>{c === 'O' && i === 4 ? <span style={{display: 'inline-block', width: 230, height: 230, borderRadius: lerp(t, W(71), W(71) + 0.6, 0, 115), background: P.purple, verticalAlign: 'middle', marginTop: -40}} /> : c}</span>;
      })}</div></Center></>;
    case 13: return <><Bg c={P.paper} /><div style={{position: 'absolute', left: 150, top: 300, display: 'flex', alignItems: 'flex-end', gap: 40}}>
      <Slam text="ALL" t={t} at={W(73)} size={420} color={P.ink} stagger={0.05} />
      <div style={{marginBottom: 70}}><Ital text="made with" t={t} at={W(73) + 0.1} size={90} color={P.ink} />
        <div style={{fontFamily: FT.heavy, fontSize: 170, color: P.orange, transform: `scale(${pop(t, W(74) - 0.05, 0.3)})`, transformOrigin: 'left'}}><span style={{color: P.purple}}>&lt;/&gt;</span> CODE.</div></div>
    </div></>;
    case 14: {
      const bills = Array.from({length: 14});
      return <><Bg c={P.orange} />
        {bills.map((_, i) => { const k = t - W(78) - random('m' + i) * 0.6; if (k < 0) return null; const x = 100 + random('x' + i) * 1700, y = -150 + k * (500 + random('v' + i) * 400);
          return <div key={i} style={{position: 'absolute', left: x, top: y, width: 190, height: 96, background: P.lime, border: `5px solid ${P.ink}`, borderRadius: 10, transform: `rotate(${k * 140 + random('r' + i) * 90}deg)`, fontFamily: FT.heavy, fontSize: 56, color: P.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>₹</div>; })}
        <Center><Ital text="to bhai —" t={t} at={W(76)} size={90} color={P.ink} />
          <div style={{display: 'flex', gap: 30, alignItems: 'center'}}><div style={{background: P.ink, padding: '6px 30px'}}><Slam text="PAISE" t={t} at={W(78) - 0.05} size={170} color={P.white} stagger={0.03} /></div><Slam text="MAT UDAAO." t={t} at={W(79)} size={140} color={P.ink} stagger={0.025} /></div></Center></>;
    }
    case 15: {
      const ang = (t - W(81)) * 540;
      return <><Bg c={P.purple} />
        <div style={{position: 'absolute', left: 260, top: 290}}><svg width="500" height="500" viewBox="-250 -250 500 500">
          {Array.from({length: 60}).map((_, i) => { const a = i / 60 * Math.PI * 2; return <circle key={i} cx={Math.cos(a) * 210} cy={Math.sin(a) * 210} r={i % 5 ? 4 : 9} fill={P.white} />; })}
          <line x1="0" y1="0" x2="0" y2="-170" stroke={P.lime} strokeWidth="14" strokeLinecap="round" transform={`rotate(${ang})`} />
          <line x1="0" y1="0" x2="0" y2="-110" stroke={P.white} strokeWidth="16" strokeLinecap="round" transform={`rotate(${ang / 12})`} />
          <circle r="16" fill={P.white} /></svg></div>
        <div style={{position: 'absolute', left: 860, top: 360}}><div style={{background: P.ink, display: 'inline-block', padding: '4px 22px', transform: `scale(${pop(t, W(81), 0.3)})`, transformOrigin: 'left'}}><div style={{fontFamily: FT.heavy, fontSize: 110, color: P.white}}>TIME</div></div>
          <Slam text="MAT UDAAO." t={t} at={W(82)} size={150} color={P.lime} stagger={0.025} style={{justifyContent: 'flex-start'}} /></div>
      </>;
    }
    default: {
      const typed = 'MOTION'.slice(0, Math.floor(lerp(t, W(86), W(86) + 0.6, 0, 6.99, x => x)));
      const sent = t > W(86) + 0.75;
      return <><Bg c={P.ink} /><Center>
        <Ital text="comment" t={t} at={W(84)} size={90} color={P.white} />
        <Slam text="MOTION" t={t} at={W(86) - 0.05} size={300} color={P.white} stagger={0.04} seed="mo" />
        <Ital text="poora prompt DM mein" t={t} at={W(87)} size={70} color={P.orange} style={{marginTop: -10}} />
        <div style={{marginTop: 40, width: 900, display: 'flex', alignItems: 'center', gap: 20, background: '#1d1926', border: '3px solid #2b2733', borderRadius: 999, padding: '18px 26px', opacity: lerp(t, W(84) + 0.2, W(84) + 0.5, 0, 1)}}>
          <div style={{width: 54, height: 54, borderRadius: '50%', background: P.orange}} />
          <div style={{flex: 1, fontFamily: FT.body, fontWeight: 800, fontSize: 40, color: typed ? P.white : P.dim}}>{typed ? `"${typed}"` : 'Add a comment…'}</div>
          <div style={{fontFamily: FT.heavy, fontSize: 32, color: sent ? P.lime : P.dim}}>{sent ? 'Posted ✓' : 'Post'}</div>
        </div>
        <div style={{marginTop: 30, fontFamily: FT.mono, fontSize: 26, color: P.dim, opacity: lerp(t, W(89), W(89) + 0.3, 0, 1)}}>@yourhandle</div>
      </Center></>;
    }
  }
};

export const Reel: React.FC = () => {
  const {t} = useT();
  const s = sceneOf(t);
  const since = t - CUTS[s];
  const punch = 1 + 0.06 * Math.max(0, 1 - since / 0.25);   // camera punch on every cut
  const drift = Math.sin(t * 0.7) * 1.2;
  const flash = since < 0.05 && s > 0 ? 0.35 : 0;
  return <AbsoluteFill style={{background: P.ink, overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `scale(${punch}) rotate(${drift * 0.15}deg)`}}><Scenes t={t} /></AbsoluteFill>
    {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash}} />}
    <Audio src={staticFile('mix.mp3')} />
  </AbsoluteFill>;
};

export const Cover: React.FC = () => <AbsoluteFill style={{background: P.orange}}>
  <Center><div style={{fontFamily: FT.serif, fontStyle: 'italic', fontSize: 100, color: P.ink}}>bina After Effects</div>
    <div style={{fontFamily: FT.heavy, fontSize: 300, color: P.ink, lineHeight: 0.9}}>SIRF <span style={{background: P.ink, color: P.white, padding: '0 30px'}}>CLAUDE</span></div></Center>
</AbsoluteFill>;
