import './lib/fonts';
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {useT, WORDS} from './lib/clock';
import {clamp, stamp} from './lib/motion';
import {Character, Beat} from './Character';
import lines from './lines.json';

const L = lines as {start: number; end: number}[];
export const END = L[L.length - 1].end + 1.0;
const K = {
  stage: '#0E3B2C', floor: '#0A2C21', ring: '#1C5A43', win: '#161514', bar: '#211F1D', line: '#34302B', cream: '#F4EEE4', dim: '#9C948A',
  orange: '#FF6A2B', gold: '#FFC23D', green: '#3DD68C', red: '#FF4B4B', blue: '#4C8DFF', ink: '#141210', clay: '#D97757',
};
const F = {sans: 'Inter', serif: '"Instrument Serif"', mono: '"JetBrains Mono"', big: 'Anton'};
const ease = Easing.bezier(.22, 1, .36, 1);
const io = (t: number, a: number, b: number, x: number, y: number, e = ease) => interpolate(t, [a, b], [x, y], {...clamp, easing: e});
const back = Easing.out(Easing.back(2.2));
const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(io(t, a, b, 0, s.length, Easing.linear)));
const on = (t: number, a: number, b: number) => t >= a && t < b;

// ── word times (from forced alignment of the ElevenLabs VO) ──
const T = {
  ae: 1.16, claude: 2.38, prompt1: 3.68, site: 5.34, n200: 6.16, exact: 8.56, every: 9.92,
  ui: 11.68, kin: 14.46, part: 17.12, charts: 17.94, shapes: 18.64, chars: 19.64,
  pick: 21.38, copy: 22.36, paste: 23.36, own: 24.84, custom: 26.06, brand: 28.44,
  agency: 29.32, money: 30.58, here: 31.8, one: 32.62, follow: 33.68, comment: 34.5, motion: 34.82, send: 35.88, dm: 36.6,
};

// window geometry
const WX = 40, WY = 196, WW = 1000, WH = 562; // content area 16:9, titlebar above

// ───────── video clip helper ─────────
const Clip: React.FC<{src: string; from: number; at: number; dur: number; style?: React.CSSProperties; zoom?: number}> = ({src, from, at, dur, style, zoom = 1}) => (
  <Sequence from={Math.round(at * 30)} durationInFrames={Math.max(1, Math.round(dur * 30))} layout="none">
    <OffthreadVideo src={staticFile(src)} startFrom={Math.round(from * 30)} muted
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, ...style}} />
  </Sequence>
);

// ───────── HOOK: rapid montage + "0 After Effects" ─────────
const HOOK: [string, number][] = [['element_5.mp4', 9.8], ['element_1.mp4', 2.0], ['element_next.mp4', 12.6], ['element_5.mp4', 2.1], ['element_1.mp4', 12.0]];
const Hook = ({t}: {t: number}) => {
  if (t >= T.claude) return null;
  const n = HOOK.length, seg = T.claude / n;
  return <>
    {HOOK.map(([s, fr], i) => <Clip key={i} src={s} from={fr} at={i * seg} dur={seg} zoom={io(t, i * seg, i * seg + seg, 1.18, 1.0)} />)}
    {/* AE badge struck */}
    {t > T.ae - 0.1 && <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center'}}>
      <div style={{transform: `scale(${stamp(Math.round(t * 30), 30, T.ae - 0.05).scale}) rotate(-4deg)`, position: 'relative', background: '#00005B', border: '6px solid #9999FF', borderRadius: 26, padding: '18px 40px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: '0 20px 40px rgba(0,0,0,.6)'}}>
        <span style={{display: 'inline-flex', width: 120, height: 120, alignItems: 'center', justifyContent: 'center', border: '5px solid #9999FF', borderRadius: 18, fontFamily: F.sans, fontWeight: 900, fontSize: 64, color: '#9999FF', flexShrink: 0}}>Ae</span>
        <span style={{fontFamily: F.sans, fontWeight: 800, fontSize: 52, color: '#fff', whiteSpace: 'nowrap'}}>After Effects</span>
        <div style={{position: 'absolute', left: -20, right: -20, top: '50%', height: 16, background: K.red, borderRadius: 8, transform: `rotate(-8deg) scaleX(${io(t, T.ae + 0.25, T.ae + 0.45, 0, 1)})`, boxShadow: '0 4px 0 rgba(0,0,0,.4)'}} />
      </div>
    </div>}
  </>;
};

// ───────── Claude chat UI ─────────
const PROMPT = 'make a 15-second motion graphics video that shows off every trick a motion designer knows. go all out.';
const Chat: React.FC<{t: number; text: string; sent: boolean; at: number; result?: boolean; resultAt?: number}> = ({t, text, sent, at, result, resultAt = 0}) => {
  return <AbsoluteFill style={{background: '#F5F1EA', fontFamily: F.sans}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 34, textAlign: 'center', fontFamily: F.serif, fontStyle: 'italic', fontSize: 44, color: '#3B3128'}}>
      <span style={{color: K.clay, fontStyle: 'normal'}}>✳</span> What should we make today?</div>
    {!sent && <div style={{position: 'absolute', left: 70, right: 70, top: 130, background: '#fff', borderRadius: 26, border: '2px solid #E4DCCF', padding: '26px 30px 80px', boxShadow: '0 10px 30px rgba(0,0,0,.08)'}}>
      <div style={{fontSize: 34, lineHeight: 1.4, color: '#2B2520', minHeight: 140}}>{text}<span style={{opacity: Math.floor(t * 3) % 2 ? 1 : 0, color: K.clay}}>|</span></div>
      <div style={{position: 'absolute', right: 24, bottom: 20, width: 62, height: 62, borderRadius: 16, background: K.clay, color: '#fff', fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>↑</div>
    </div>}
    {sent && <>
      <div style={{position: 'absolute', right: 60, top: 120, maxWidth: 640, background: '#EAE3D7', borderRadius: 22, padding: '18px 24px', fontSize: 28, color: '#2B2520', lineHeight: 1.35, transform: `translateY(${io(t, at, at + 0.3, 40, 0)}px)`, opacity: io(t, at, at + 0.2, 0, 1)}}>{text}</div>
      <div style={{position: 'absolute', left: 60, top: 300, display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, color: '#6B5E50'}}>
        <span style={{color: K.clay, fontSize: 40, display: 'inline-block', transform: `rotate(${t * 220}deg)`}}>✳</span>
        {result && t > resultAt ? 'Here\'s your video ✓' : 'Building your video…'}
      </div>
      {result && t > resultAt && <div style={{position: 'absolute', left: 60, top: 360, width: 520, height: 292, borderRadius: 18, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,.25)', transform: `scale(${io(t, resultAt, resultAt + 0.35, 0.6, 1, back)})`, transformOrigin: '0 0'}}>
        <Clip src="element_1.mp4" from={13.2} at={resultAt} dur={2.5} />
      </div>}
      {!(result && t > resultAt) && <div style={{position: 'absolute', left: 60, top: 370, width: 520, height: 16, borderRadius: 8, background: '#E4DCCF'}}>
        <div style={{width: `${io(t, at + 0.1, resultAt || at + 2, 5, 100, Easing.inOut(Easing.cubic))}%`, height: 16, borderRadius: 8, background: K.clay}} /></div>}
    </>}
  </AbsoluteFill>;
};

// ───────── gallery (generic, unbranded) ─────────
const TILES: [string, number][] = [['element_1.mp4', 2.2], ['element_5.mp4', 6.2], ['element_next.mp4', 6.5], ['elements_3.mp4', 1.5], ['element_2.mp4', 6.0], ['element_6.mp4', 54.5]];
const CATS = ['Product UI', 'Kinetic type', 'Particles', 'Charts', '3D Shapes', 'Characters'];
const Gallery: React.FC<{t: number; at: number; dur: number; hot?: number; cursor?: [number, number, number][]}> = ({t, at, dur, hot = -1, cursor}) => {
  const tw = 300, th = 169, gx = 25, gy = 110;
  return <AbsoluteFill style={{background: '#FAFAF8'}}>
    <div style={{position: 'absolute', left: 25, top: 22, right: 25, display: 'flex', gap: 10}}>
      {CATS.map((c, i) => <div key={c} style={{fontFamily: F.sans, fontWeight: 600, fontSize: 21, padding: '9px 16px', borderRadius: 30, border: '2px solid #E2E0DA', color: '#444', background: '#fff', opacity: io(t, at + i * 0.05, at + i * 0.05 + 0.2, 0, 1)}}>{c}</div>)}
    </div>
    {TILES.map(([s, fr], i) => {
      const x = gx + (i % 3) * (tw + 25), y = gy + Math.floor(i / 3) * (th + 50);
      const k = io(t, at + i * 0.06, at + i * 0.06 + 0.35, 0, 1, back);
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: tw, transform: `scale(${k * (hot === i ? 1.04 : 1)})`, opacity: Math.min(1, k * 2)}}>
        <div style={{position: 'relative', width: tw, height: th, borderRadius: 14, overflow: 'hidden', outline: hot === i ? `5px solid ${K.orange}` : '2px solid #E8E6E0', background: '#111'}}>
          <Clip src={s} from={fr} at={at} dur={dur} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: F.sans, fontSize: 18, color: '#666'}}><span>@creator</span><span style={{border: '1.5px solid #DDD', borderRadius: 20, padding: '1px 10px'}}>Prompt</span></div>
      </div>;
    })}
    {cursor && <Cursor t={t} path={cursor} />}
  </AbsoluteFill>;
};
const Cursor: React.FC<{t: number; path: [number, number, number][]}> = ({t, path}) => {
  let x = path[0][1], y = path[0][2];
  for (let i = 1; i < path.length; i++) { const [tt, px, py] = path[i]; const [t0, x0, y0] = path[i - 1]; if (t >= t0) { const k = io(t, t0, tt, 0, 1, Easing.inOut(Easing.cubic)); x = x0 + (px - x0) * k; y = y0 + (py - y0) * k; } }
  const click = path.some(([tt]) => t > tt && t < tt + 0.18);
  return <div style={{position: 'absolute', left: x, top: y, transform: `scale(${click ? 0.82 : 1})`, transformOrigin: '0 0', zIndex: 10}}>
    {click && <div style={{position: 'absolute', left: -30, top: -30, width: 60, height: 60, borderRadius: '50%', border: `4px solid ${K.orange}`, opacity: 0.8}} />}
    <svg width="44" height="54" viewBox="0 0 22 27"><path d="M1 1 L1 22 L7 17 L11 26 L15 24 L11 15 L19 15 Z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /></svg>
  </div>;
};
// modal: video left, prompt card right
const Modal: React.FC<{t: number; at: number; src: string; from: number; copiedAt?: number; custom?: number}> = ({t, at, src, from, copiedAt = 999, custom = -1}) => {
  const k = io(t, at, at + 0.35, 0, 1, back);
  const copied = t > copiedAt;
  const hue = custom >= 0 ? io(t, custom + 0.8, custom + 2.2, 0, 160) : 0;
  return <AbsoluteFill style={{background: 'rgba(0,0,0,.45)'}}>
    <div style={{position: 'absolute', left: 20, top: 20, right: 20, bottom: 20, background: '#fff', borderRadius: 20, transform: `scale(${0.85 + 0.15 * k})`, opacity: k, display: 'flex', overflow: 'hidden'}}>
      <div style={{position: 'relative', width: 560, background: '#111'}}>
        <div style={{position: 'absolute', left: 0, top: 104, width: 560, height: 315, overflow: 'hidden', filter: `hue-rotate(${hue}deg)`}}><Clip src={src} from={from} at={at} dur={8} /></div>
        {custom >= 0 && t > custom + 0.8 && <div style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', fontFamily: F.big, fontSize: 64, color: '#fff', letterSpacing: 2, transform: `scale(${io(t, custom + 0.8, custom + 1.1, 1.6, 1, back)})`}}>YOUR BRAND ✦</div>}
      </div>
      <div style={{flex: 1, padding: '26px 26px', fontFamily: F.sans}}>
        <div style={{fontWeight: 700, fontSize: 28, color: '#111'}}>Motion designer showreel</div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22}}>
          <span style={{fontSize: 20, color: '#777', fontWeight: 600}}>Prompt</span>
          <span style={{display: 'flex', gap: 10}}>
            {custom >= 0 && <span style={{fontSize: 20, fontWeight: 700, padding: '6px 14px', borderRadius: 10, background: '#FFF1E8', color: K.orange}}>⚙ Customize</span>}
            <span style={{fontSize: 20, fontWeight: 700, padding: '6px 14px', borderRadius: 10, background: copied ? K.green : '#F1F0EC', color: copied ? '#fff' : '#333', transform: `scale(${copied ? io(t, copiedAt, copiedAt + 0.25, 1.35, 1, back) : 1})`}}>{copied ? '✓ Copied' : '⧉ Copy'}</span>
          </span>
        </div>
        {custom < 0 ? <div style={{marginTop: 14, background: '#F4F3EF', borderRadius: 14, padding: '18px 20px', fontSize: 22, lineHeight: 1.45, color: '#222', outline: copied ? `3px solid ${K.green}` : 'none'}}>{typed(PROMPT, t, at + 0.2, at + 1.2)}</div>
          : <div style={{marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12}}>
            {[['Brand name', 'YOUR BRAND'], ['Colours', ''], ['Length', '15 sec']].map(([a, b], i) => <div key={a} style={{background: '#F4F3EF', borderRadius: 12, padding: '12px 16px', fontSize: 22, display: 'flex', justifyContent: 'space-between', opacity: io(t, custom + i * 0.15, custom + i * 0.15 + 0.2, 0, 1)}}>
              <span style={{color: '#777'}}>{a}</span>
              {a === 'Colours' ? <span style={{display: 'flex', gap: 8}}>{['#FF6A2B', '#3DD68C', '#4C8DFF'].map((c, j) => <i key={j} style={{width: 28, height: 28, borderRadius: 8, background: c, filter: `hue-rotate(${hue}deg)`}} />)}</span>
                : <b style={{color: '#111'}}>{i === 0 ? typed(b, t, custom + 0.3, custom + 0.9) : b}</b>}
            </div>)}
          </div>}
      </div>
    </div>
  </AbsoluteFill>;
};

// ───────── window content by time ─────────
const CATSEQ: [number, number, string, number, string][] = [
  [T.ui, T.ui + 1.4, 'element_2.mp4', 6.0, 'Product UI'],
  [T.ui + 1.4, T.kin, 'elements_3.mp4', 1.2, 'Product UI'],
  [T.kin, T.kin + 1.2, 'element_1.mp4', 11.0, 'Kinetic type'],
  [T.kin + 1.2, T.part, 'element_1.mp4', 11.9, 'Kinetic type'],
  [T.part, T.charts, 'element_5.mp4', 10.0, 'Particles'],
  [T.charts, T.shapes, 'element_next.mp4', 2.6, 'Charts'],
  [T.shapes, T.chars, 'element_5.mp4', 6.0, '3D Shapes'],
  [T.chars, T.pick, 'element_6.mp4', 54.0, 'Characters'],
];
const WinContent = ({t}: {t: number}) => {
  if (t < T.claude) return <Hook t={t} />;
  if (t < T.site - 0.4) return <Chat t={t} text={typed(PROMPT, t, T.claude + 0.1, T.prompt1 + 0.2)} sent={t > T.prompt1 + 0.35} at={T.prompt1 + 0.35} result resultAt={T.prompt1 + 0.8} />;
  if (t < T.ui - 0.05) return <>
    <Gallery t={t} at={T.site - 0.4} dur={T.ui - T.site + 0.4} hot={t > T.exact - 0.5 ? 0 : -1} cursor={[[T.site, 980, 600], [T.exact - 0.45, 160, 100]]} />
    {t > T.exact - 0.2 && <Modal t={t} at={T.exact - 0.2} src="element_1.mp4" from={2.0} />}
  </>;
  if (t < T.pick) { const c = CATSEQ.find(([a, b]) => on(t, a - 0.05, b))!; return <Clip src={c[2]} from={c[3]} at={c[0] - 0.05} dur={c[1] - c[0] + 0.05} zoom={io(t, c[0], c[1], 1.12, 1)} />; }
  if (t < T.paste - 0.15) return <>
    <Gallery t={t} at={T.pick - 0.1} dur={2} hot={t > T.pick + 0.3 ? 1 : -1} cursor={[[T.pick, 900, 560], [T.pick + 0.3, 480, 110]]} />
    {t > T.pick + 0.45 && <Modal t={t} at={T.pick + 0.45} src="element_5.mp4" from={2.0} copiedAt={T.copy + 0.1} />}
    {t > T.pick + 0.45 && <Cursor t={t} path={[[T.pick + 0.45, 480, 110], [T.copy, 905, 100], [T.paste, 905, 100]]} />}
  </>;
  if (t < T.custom - 0.1) return <Chat t={t} text={t < T.paste + 0.05 ? '' : PROMPT} sent={t > T.paste + 0.75} at={T.paste + 0.75} result resultAt={T.own} />;
  if (t < T.agency - 0.1) return <Modal t={t} at={T.custom - 0.1} src="element_5.mp4" from={4.0} custom={T.custom} />;
  if (t < T.follow - 0.1) return <Versus t={t} />;
  return <Cta t={t} />;
};

const Versus = ({t}: {t: number}) => {
  const a = T.agency - 0.1, h = T.here - 0.05;
  return <AbsoluteFill style={{background: '#111', fontFamily: F.sans}}>
    <div style={{position: 'absolute', left: 40, top: 60, width: 440, height: 440, borderRadius: 24, background: '#1E1E1E', border: '3px solid #333', padding: 34, transform: `translateY(${io(t, a, a + 0.35, 80, 0)}px)`, opacity: io(t, a, a + 0.25, 0, 1)}}>
      <div style={{fontSize: 30, color: '#999', fontWeight: 700, letterSpacing: 3}}>AGENCY</div>
      <div style={{fontSize: 120, fontWeight: 900, color: K.red, marginTop: 30, letterSpacing: -4}}>₹₹₹₹</div>
      <div style={{fontSize: 30, color: '#bbb', marginTop: 20}}>quote · revisions · wait</div>
      {t > T.money && <div style={{position: 'absolute', right: 20, top: 20, fontSize: 70, transform: `scale(${stamp(Math.round(t * 30), 30, T.money).scale})`}}>💸</div>}
    </div>
    <div style={{position: 'absolute', right: 40, top: 60, width: 440, height: 440, borderRadius: 24, background: '#FFF4EC', border: `4px solid ${K.orange}`, padding: 34, transform: `scale(${io(t, h, h + 0.35, 0.5, 1, back)})`, opacity: io(t, h, h + 0.15, 0, 1)}}>
      <div style={{fontSize: 30, color: K.orange, fontWeight: 800, letterSpacing: 3}}>✳ CLAUDE</div>
      <div style={{fontSize: 150, fontWeight: 900, color: K.ink, marginTop: 10, lineHeight: 1}}>1</div>
      <div style={{fontSize: 56, fontWeight: 900, color: K.ink}}>prompt.</div>
    </div>
  </AbsoluteFill>;
};

const Cta = ({t}: {t: number}) => {
  const a = T.follow - 0.1;
  const following = t > T.follow + 0.35;
  return <AbsoluteFill style={{background: '#000', fontFamily: F.sans}}>
    <div style={{position: 'absolute', left: 40, top: 40, display: 'flex', alignItems: 'center', gap: 22, opacity: io(t, a, a + 0.2, 0, 1)}}>
      <div style={{width: 110, height: 110, borderRadius: '50%', background: `conic-gradient(#F58529,#DD2A7B,#8134AF,#F58529)`, padding: 5}}><div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#0E3B2C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50}}>🧑🏻‍💻</div></div>
      <div><div style={{color: '#fff', fontWeight: 800, fontSize: 36}}>yourhandle</div><div style={{color: '#aaa', fontSize: 26}}>Claude · AI tools · free guides</div></div>
      <div style={{marginLeft: 30, padding: '16px 34px', borderRadius: 14, fontWeight: 800, fontSize: 32, background: following ? '#262626' : '#0095F6', color: '#fff', transform: `scale(${following ? io(t, T.follow + 0.35, T.follow + 0.6, 1.25, 1, back) : 1 + Math.sin(t * 12) * 0.03})`}}>{following ? 'Following ✓' : 'Follow'}</div>
    </div>
    <div style={{position: 'absolute', left: 40, right: 40, top: 220, display: 'flex', alignItems: 'center', gap: 18, background: '#1A1A1A', borderRadius: 40, padding: '20px 28px', opacity: io(t, T.comment - 0.2, T.comment, 0, 1)}}>
      <span style={{fontSize: 40}}>💬</span>
      <span style={{color: '#fff', fontSize: 40, fontWeight: 800, letterSpacing: 2}}>{typed('MOTION', t, T.motion - 0.1, T.motion + 0.4)}<span style={{opacity: Math.floor(t * 3) % 2, color: K.blue}}>|</span></span>
      <span style={{marginLeft: 'auto', color: '#0095F6', fontWeight: 800, fontSize: 32}}>Post</span>
    </div>
    {t > T.send - 0.1 && <div style={{position: 'absolute', left: 40, top: 360, display: 'flex', gap: 16, alignItems: 'flex-end', transform: `translateY(${io(t, T.send - 0.1, T.send + 0.25, 60, 0, back)}px)`, opacity: io(t, T.send - 0.1, T.send + 0.1, 0, 1)}}>
      <div style={{fontSize: 30, color: '#aaa', marginBottom: 8}}>DM</div>
      <div style={{background: 'linear-gradient(90deg,#7B2FF7,#F107A3)', color: '#fff', borderRadius: 30, padding: '20px 30px', fontSize: 34, fontWeight: 700}}>Here's the website 🔗 <span style={{background: 'rgba(255,255,255,.25)', borderRadius: 10, padding: '2px 12px', filter: 'blur(5px)'}}>prompt-site.com</span></div>
    </div>}
  </AbsoluteFill>;
};

// ───────── the app window frame ─────────
const AppWindow = ({t}: {t: number}) => {
  const k = io(t, 0, 0.25, 0.9, 1, back);
  // punch on each section change
  const cuts = [T.claude, T.site - 0.4, T.ui, T.kin, T.part, T.charts, T.shapes, T.chars, T.pick, T.paste - 0.15, T.custom - 0.1, T.agency - 0.1, T.follow - 0.1];
  let punch = 1; cuts.forEach(c => { if (t >= c && t < c + 0.3) punch = io(t, c, c + 0.3, 1.035, 1); });
  const label = t < T.claude ? 'made with claude — not after effects' : t < T.site - 0.4 ? 'claude · one prompt' : t < T.custom - 0.1 && t >= T.pick ? 'pick → copy → paste' : t < T.pick && t >= T.ui ? 'browse by category' : t >= T.follow - 0.1 ? 'comment MOTION' : 'the gallery · 200+ videos + prompts';
  return <div style={{position: 'absolute', left: WX, top: WY - 52, width: WW, transform: `scale(${k * punch})`, transformOrigin: '50% 40%'}}>
    <div style={{height: 52, background: K.bar, borderRadius: '22px 22px 0 0', display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px'}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <i key={c} style={{width: 16, height: 16, borderRadius: '50%', background: c}} />)}
      <span style={{marginLeft: 16, fontFamily: F.mono, fontSize: 22, color: K.dim}}>{label}</span>
      <span style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 20, color: '#6F675E'}}>{String(Math.floor(t)).padStart(2, '0')}s</span>
    </div>
    <div style={{position: 'relative', width: WW, height: WH, background: K.win, overflow: 'hidden', borderRadius: '0 0 22px 22px', boxShadow: '0 30px 60px rgba(0,0,0,.45)'}}>
      <WinContent t={t} />
      {t < T.pick && t >= T.ui && <div style={{position: 'absolute', right: 14, bottom: 10, fontFamily: F.mono, fontSize: 16, color: 'rgba(255,255,255,.7)', background: 'rgba(0,0,0,.45)', padding: '3px 10px', borderRadius: 6}}>made with Claude · by gallery creators</div>}
    </div>
  </div>;
};

// ───────── headline zone (between window and caption) ─────────
const Headline = ({t}: {t: number}) => {
  const y = 800;
  const box = (key: string, at: number, node: React.ReactNode) => <div key={key} style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', transform: `scale(${io(t, at, at + 0.25, 0.6, 1, back)})`, opacity: io(t, at, at + 0.12, 0, 1)}}>{node}</div>;
  const chip = (txt: React.ReactNode, bg = K.cream, fg = K.ink) => <div style={{background: bg, color: fg, borderRadius: 20, padding: '10px 30px', fontFamily: F.sans, fontWeight: 900, fontSize: 60, letterSpacing: -1, boxShadow: '0 8px 0 rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', gap: 16}}>{txt}</div>;
  if (t < T.claude) return t > T.ae - 0.1 ? box('h0', T.ae, chip(<><span style={{color: K.red}}>0</span> After Effects</>)) : null;
  if (t < T.site - 0.4) return t > T.prompt1 - 0.1 ? box('h1', T.prompt1, chip(<><span style={{color: K.orange}}>1</span> prompt</>)) : null;
  if (t < T.ui) {
    if (t < T.n200 - 0.1) return null;
    const n = Math.round(io(t, T.n200 - 0.1, T.n200 + 0.6, 0, 200, Easing.out(Easing.cubic)));
    return box('h2', T.n200 - 0.1, chip(<><span style={{color: K.orange}}>{n}+</span>{t > T.exact - 0.1 ? <span>videos <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, color: K.green}}>+ prompts</span></span> : 'videos'}</>));
  }
  if (t < T.pick) { const c = CATSEQ.find(([a, b]) => on(t, a - 0.05, b))!; const cnt = c[4] === 'Product UI' ? '100+' : c[4] === 'Kinetic type' ? '~100' : '';
    return box('c' + c[4], c[0] - 0.05, chip(<>{c[4]}{cnt && <span style={{background: K.orange, color: '#fff', borderRadius: 12, padding: '2px 14px', fontSize: 44}}>{cnt}</span>}</>)); }
  if (t < T.custom - 0.1) { const steps = ['Pick', 'Copy', 'Paste']; const act = t < T.copy - 0.05 ? 0 : t < T.paste - 0.05 ? 1 : 2; const done = t > T.own;
    return <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', gap: 14}}>
      {steps.map((s, i) => <div key={s} style={{background: i <= act ? (i === act && !done ? K.orange : K.green) : 'rgba(244,238,228,.25)', color: i <= act ? '#fff' : K.cream, borderRadius: 18, padding: '10px 26px', fontFamily: F.sans, fontWeight: 900, fontSize: 52, transform: `scale(${i === act ? io(t, [T.pick, T.copy, T.paste][i] - 0.05, [T.pick, T.copy, T.paste][i] + 0.2, 1.3, 1, back) : 1})`, boxShadow: '0 7px 0 rgba(0,0,0,.3)'}}>{i <= act && (i < act || done) ? '✓ ' : `${i + 1} `}{s}</div>)}
    </div>; }
  if (t < T.agency - 0.1) return t > T.custom ? box('h4', T.custom, chip(<>your brand · <span style={{color: K.orange}}>your colours</span></>)) : null;
  if (t < T.follow - 0.1) return null;
  return box('h6', T.follow, chip(<>comment <span style={{background: K.orange, color: '#fff', borderRadius: 12, padding: '0 16px'}}>MOTION</span> 👇</>));
};

// ───────── caption pill (word-synced) ─────────
type Chunk = {words: typeof WORDS; start: number; end: number};
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = []; const by = new Map<number, typeof WORDS>();
  WORDS.forEach(w => { if (!by.has(w.line)) by.set(w.line, []); by.get(w.line)!.push(w); });
  by.forEach(arr => { let cur: typeof WORDS = []; arr.forEach((w, k) => { cur.push(w); if (/[,.…?!]$/.test(w.text) || cur.length >= 3 || k === arr.length - 1) { out.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end}); cur = []; } }); });
  return out;
})();
const Caption = ({t}: {t: number}) => {
  let k = -1; CHUNKS.forEach((c, i) => { if (c.start - 0.05 <= t) k = i; });
  if (k < 0) return null;
  const c = CHUNKS[k];
  if (t > c.end + 0.45 && (k + 1 >= CHUNKS.length || CHUNKS[k + 1].start - 0.05 > t)) return null;
  const pop = io(t, c.start - 0.05, c.start + 0.12, 0.8, 1, Easing.out(Easing.back(3)));
  return <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: K.ink, borderRadius: 18, padding: '8px 26px', transform: `scale(${pop}) rotate(-1.5deg)`, boxShadow: '0 8px 0 rgba(0,0,0,.35)', display: 'flex', gap: 14, border: `3px solid ${K.cream}`}}>
      {c.words.map(w => {
        const said = t >= w.start - 0.03;
        return <span key={w.i} style={{fontFamily: w.hero ? F.serif : F.sans, fontStyle: w.hero ? 'italic' : 'normal', fontWeight: w.hero ? 400 : 900, fontSize: w.hero ? 70 : 56, lineHeight: 1.15, color: w.hero ? K.gold : K.cream, opacity: said ? 1 : 0.3, letterSpacing: w.hero ? 0 : -1}}>{w.text.replace(/[,.…?!*"]/g, '')}</span>;
      })}
    </div>
  </div>;
};

// open-loop sticker (retention)
const Loop = ({t}: {t: number}) => {
  const a = 2.6, b = 11.4;
  if (t < a || t > b) return null;
  const k = io(t, a, a + 0.3, 0, 1, back) * io(t, b - 0.3, b, 1, 0);
  return <div style={{position: 'absolute', right: 34, top: 900, transform: `rotate(6deg) scale(${k})`, background: K.gold, color: K.ink, fontFamily: F.sans, fontWeight: 900, fontSize: 30, padding: '10px 18px', borderRadius: 12, boxShadow: '0 6px 0 rgba(0,0,0,.35)'}}>🔒 website link at the end</div>;
};

const BEATS: Beat[] = [
  {at: 0, pose: 'shrug', face: 'wow'},
  {at: T.claude, pose: 'present', face: 'happy'},
  {at: T.site, pose: 'point', face: 'wow'},
  {at: T.exact, pose: 'present', face: 'smile'},
  {at: T.ui, pose: 'point', face: 'happy'},
  {at: T.part, pose: 'cheer', face: 'happy'},
  {at: T.pick, pose: 'point', face: 'smile'},
  {at: T.own, pose: 'thumbs', face: 'happy'},
  {at: T.custom, pose: 'think', face: 'smile'},
  {at: T.agency, pose: 'shrug', face: 'sad'},
  {at: T.here, pose: 'thumbs', face: 'cool', glasses: true},
  {at: T.follow, pose: 'wave', face: 'happy'},
  {at: T.comment, pose: 'point', face: 'wink'},
];

export const Reel = () => {
  const {f, t} = useT();
  const shake = [T.ae, T.n200, T.here].reduce((s, a) => s + (t > a && t < a + 0.25 ? Math.sin((t - a) * 80) * (0.25 - (t - a)) * 40 : 0), 0);
  return (
    <AbsoluteFill style={{background: K.stage, overflow: 'hidden'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[300, 440, 580].map(r => <circle key={r} cx={540} cy={1560} r={r} fill="none" stroke={K.ring} strokeWidth={3} />)}
        <ellipse cx={540} cy={1772} rx={330} ry={52} fill={K.floor} />
      </svg>
      <div style={{position: 'absolute', left: 60, right: 60, top: 60, display: 'flex', alignItems: 'center'}}>
        <div style={{background: K.green, color: K.ink, fontFamily: F.mono, fontWeight: 700, fontSize: 26, padding: '6px 16px', borderRadius: 10, letterSpacing: 3}}>FREE</div>
        <div style={{marginLeft: 16, fontFamily: F.mono, fontSize: 26, color: K.cream}}>Claude motion prompts</div>
        <div style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 24, color: '#8DB8A6'}}>@yourhandle</div>
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${shake}px)`}}>
        <AppWindow t={t} />
        <Headline t={t} />
      </div>
      <Loop t={t} />
      <div style={{position: 'absolute', left: 540 - 230, top: 1115, width: 460, height: 736}}>
        <Character t={t} f={f} beats={BEATS} />
      </div>
      <Caption t={t} />
      <Audio src={staticFile('audio.mp3')} />
      <Audio src={staticFile('sfx.wav')} volume={0.45} />
      <Audio src={staticFile('music.wav')} volume={0.35} />
    </AbsoluteFill>
  );
};
