import React from 'react';
import {AbsoluteFill, Audio, staticFile, random} from 'remotion';
import './lib/fonts';
import {useT, WORDS, ws} from './lib/clock';
import {K, FN, Grid, Rise, Words, Serif, Card, Chip, Dot, Check, Window, LogoMark, Section, Cursor, lerp, pop, appear} from './saas';

export const DUR = 84.2;
const W = (i: number) => ws(i);
const S = [0, 7.2, 10.3, 12.45, 16.95, 21.6, 33.4, 44.85, 54.9, 62.35, 70.8, 74.85, 78.2, DUR];

const Scene: React.FC<{i: number; t: number; children: React.ReactNode}> = ({i, t, children}) => {
  const a = S[i], b = S[i + 1];
  if (t < a - 0.01 || t > b + 0.4) return null;
  const e = lerp(t, a, a + 0.45, 0, 1), x = lerp(t, b, b + 0.4, 0, 1);
  const push = 1 + (t - a) * 0.006;
  return <AbsoluteFill style={{opacity: e * (1 - x), transform: `scale(${(1.06 - 0.06 * e) * push * (1 - 0.04 * x)})`, filter: `blur(${(1 - e) * 10 + x * 8}px)`}}>{children}</AbsoluteFill>;
};

/* 0 — problem: so much work */
const Problem: React.FC<{t: number}> = ({t}) => {
  const items: [string, number, number, number, number, React.ReactNode][] = [
    ['Script', 8, 250, 330, -8, <>{[0.9, 0.75, 0.85, 0.6, 0.8].map((w, i) => <div key={i} style={{height: 12, borderRadius: 6, background: K.line2, marginTop: 16, width: `${w * 100}%`}} />)}</>],
    ['Editing', 10, 760, 300, 4, <div style={{marginTop: 18}}>{[0, 1, 2].map(r => <div key={r} style={{display: 'flex', gap: 6, marginTop: 10}}>{[0.3, 0.2, 0.35, 0.15].map((w, i) => <div key={i} style={{height: 26, borderRadius: 6, flex: w, background: [K.blue, K.violet, K.coral][r], opacity: 0.85}} />)}</div>)}</div>],
    ['Posting', 12, 1270, 340, 7, <div style={{display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginTop: 18}}>{Array.from({length: 21}).map((_, i) => <div key={i} style={{height: 26, borderRadius: 6, background: [2, 5, 9, 12, 16, 19].includes(i) ? K.amber : K.card2}} />)}</div>],
  ];
  return <AbsoluteFill>
    <Grid t={t} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center'}}>
      <Words text="Behind every reel… so much work." t={t} at={W(0)} size={84} accent={{'work.': K.coral}} />
    </div>
    {items.map(([label, wi, x, y, r, body]) => {
      const p = pop(t, W(wi) - 0.05, 0.5);
      return <div key={label} style={{position: 'absolute', left: x, top: y + Math.sin(t * 1.4 + x) * 8, transform: `perspective(1400px) rotateY(${r * 2}deg) rotate(${r}deg) scale(${p})`, opacity: Math.min(1, p * 2)}}>
        <Card style={{width: 420, height: 300, padding: 30}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FN.sans, fontWeight: 800, fontSize: 30, color: K.text}}><Dot c={K.coral} />{label}</div>{body}
        </Card>
      </div>;
    })}
    <div style={{position: 'absolute', left: 0, right: 0, top: 720, display: 'flex', justifyContent: 'center', gap: 40, opacity: appear(t, W(12) + 0.4)}}>
      <Serif size={54} color={K.mute}>and you do all of it, every single day.</Serif>
    </div>
  </AbsoluteFill>;
};

/* 1 — DM flood */
const Flood: React.FC<{t: number}> = ({t}) => {
  const n = Math.floor(lerp(t, W(15), W(21), 0, 14, x => x));
  const names = ['@arjun.codes', '@meera.ai', '@rohit_dev', '@sana.creates', '@kabir.tech', '@ishita.mp4', '@dev_yash', '@nidhi.ux', '@aman.builds', '@zoya.reels', '@karan_ai', '@tara.studio', '@vivek.io', '@pooja.ai'];
  return <AbsoluteFill>
    <Grid t={t} />
    <div style={{position: 'absolute', left: 140, top: 330, width: 980}}>
      <Words text="Then — hundreds" t={t} at={W(13)} size={96} accent={{hundreds: K.coral}} />
      <Words text="of comments" t={t} at={W(15)} size={96} />
      <div style={{height: 20}} />
      <Words text="waiting for a DM." t={t} at={W(18)} size={76} color={K.mute} />
    </div>
    <div style={{position: 'absolute', right: 110, top: 120, width: 600, height: 840}}>
      {names.slice(0, n).map((nm, i) => {
        const k = pop(t, W(15) + i * 0.13, 0.35);
        return <div key={nm} style={{position: 'absolute', left: (random('fx' + i) - 0.5) * 60, top: 40 + (n - 1 - i) * 64, width: 560, transform: `scale(${k})`, opacity: Math.max(0, 1 - (n - 1 - i) * 0.08)}}>
          <Card style={{padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, borderRadius: 18}}>
            <div style={{width: 40, height: 40, borderRadius: '50%', background: [K.blue, K.violet, K.coral, K.amber][i % 4]}} />
            <div style={{flex: 1}}><div style={{fontFamily: FN.sans, fontWeight: 700, fontSize: 21, color: K.text}}>{nm}</div><div style={{fontFamily: FN.sans, fontSize: 18, color: K.mute}}>commented: "GUIDE 🙏"</div></div>
            <div style={{fontFamily: FN.mono, fontSize: 16, color: K.coral}}>Reply</div>
          </Card>
        </div>;
      })}
      {n > 4 && <div style={{position: 'absolute', right: -30, top: -10, transform: `scale(${pop(t, W(17), 0.3)})`}}><Chip bg={K.coral} c="#fff" size={30}>99+ unread</Chip></div>}
    </div>
  </AbsoluteFill>;
};

/* 2 — whole day gone */
const Gone: React.FC<{t: number}> = ({t}) => {
  const spin = (t - S[2]) * 900;
  return <AbsoluteFill>
    <Grid t={t} />
    <div style={{position: 'absolute', left: 260, top: 300}}>
      <svg width="480" height="480" viewBox="-240 -240 480 480">
        <circle r="220" fill={K.card} stroke={K.line2} strokeWidth="6" />
        {Array.from({length: 12}).map((_, i) => <rect key={i} x="-4" y="-205" width="8" height={i % 3 ? 18 : 34} rx="4" fill={K.mute} transform={`rotate(${i * 30})`} />)}
        <path d={`M0 0 L0 -190 A190 190 0 ${(spin % 360) > 180 ? 1 : 0} 1 ${Math.sin((spin % 360) * Math.PI / 180) * 190} ${-Math.cos((spin % 360) * Math.PI / 180) * 190} Z`} fill={K.coral} opacity="0.35" />
        <line x1="0" y1="0" x2="0" y2="-170" stroke={K.coral} strokeWidth="10" strokeLinecap="round" transform={`rotate(${spin})`} />
        <line x1="0" y1="0" x2="0" y2="-110" stroke={K.text} strokeWidth="12" strokeLinecap="round" transform={`rotate(${spin / 12})`} />
        <circle r="14" fill={K.text} />
      </svg>
    </div>
    <div style={{position: 'absolute', left: 880, top: 380}}>
      <Words text="Your whole day —" t={t} at={W(22)} size={92} />
      <div style={{fontFamily: FN.sans, fontWeight: 900, fontSize: 200, color: K.coral, letterSpacing: -8, lineHeight: 1, transform: `scale(${pop(t, W(26) - 0.05, 0.4)})`, transformOrigin: 'left', opacity: appear(t, W(26) - 0.05, 0.15)}}>gone.</div>
    </div>
  </AbsoluteFill>;
};

/* 3 — introducing ReelPilot */
const Intro: React.FC<{t: number}> = ({t}) => {
  const d = lerp(t, W(28) - 0.3, W(28) + 0.6, 0, 1);
  const path = lerp(t, W(28) - 0.4, W(28) + 0.5, 0, 1);
  return <AbsoluteFill style={{background: K.bg}}>
    <svg width="1920" height="1080" style={{position: 'absolute'}}><path d="M-50 820 C 400 860, 600 560, 960 470" fill="none" stroke={K.blue} strokeWidth="4" strokeDasharray="14 14" strokeDashoffset={-t * 60} opacity={path} style={{clipPath: `inset(0 ${100 - path * 100}% 0 0)`}} /></svg>
    <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <Rise t={t} at={W(27)}><div style={{fontFamily: FN.mono, fontSize: 26, color: K.mute, letterSpacing: 8, marginBottom: 30}}>INTRODUCING</div></Rise>
      <div style={{display: 'flex', alignItems: 'center', gap: 34}}>
        <div style={{transform: `rotate(${(1 - d) * -30}deg)`}}><LogoMark s={150} draw={d} /></div>
        <div style={{fontFamily: FN.sans, fontWeight: 900, fontSize: 170, color: K.text, letterSpacing: -7, clipPath: `inset(0 ${100 - lerp(t, W(28), W(28) + 0.6, 0, 100)}% 0 0)`}}>ReelPilot</div>
      </div>
      <Rise t={t} at={W(30)}><div style={{marginTop: 28, fontFamily: FN.sans, fontWeight: 500, fontSize: 44, color: K.mute}}><Serif size={56} color={K.text}>Autopilot</Serif> for your Instagram & YouTube.</div></Rise>
      <div style={{display: 'flex', gap: 22, marginTop: 40}}>
        <div style={{transform: `scale(${pop(t, W(33), 0.35)})`}}><Chip size={28}><Dot c="#E1306C" s={16} /> Instagram</Chip></div>
        <div style={{transform: `scale(${pop(t, W(35), 0.35)})`}}><Chip size={28}><Dot c="#FF3B30" s={16} /> YouTube</Chip></div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>;
};

/* 4 — one system: creates, publishes, talks */
const System: React.FC<{t: number}> = ({t}) => {
  const P: [string, string, number, string][] = [['Creates', 'your content', 39, K.blue], ['Publishes', 'it for you', 42, K.violet], ['Talks', 'to your audience', 45, K.lime]];
  return <AbsoluteFill>
    <Grid t={t} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center'}}><Words text="One system." t={t} at={W(36)} size={96} /></div>
    <svg width="1920" height="1080" style={{position: 'absolute'}}><line x1="420" y1="610" x2={420 + 1080 * lerp(t, W(39), W(45) + 0.3, 0, 1)} y2="610" stroke={K.line2} strokeWidth="4" strokeDasharray="10 10" /></svg>
    {P.map(([h, s, wi, c], i) => {
      const p = pop(t, W(wi) - 0.05, 0.45);
      return <div key={h} style={{position: 'absolute', left: 230 + i * 540, top: 430, transform: `translateY(${(1 - p) * 80}px) scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 2)}}>
        <Card style={{width: 420, height: 360, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}} glow={t > W(wi) && t < W(wi) + 1.2 ? 1 : 0}>
          <div style={{width: 84, height: 84, borderRadius: 24, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FN.mono, fontSize: 34, color: K.bg}}>0{i + 1}</div>
          <div><div style={{fontFamily: FN.sans, fontWeight: 800, fontSize: 64, color: K.text, letterSpacing: -2}}>{h}</div><Serif size={40} color={K.mute}>{s}</Serif></div>
        </Card>
      </div>;
    })}
  </AbsoluteFill>;
};

/* 5 — 01 Create */
const Create: React.FC<{t: number}> = ({t}) => {
  const fileIn = (at: number) => lerp(t, at, at + 0.6, 0, 1);
  const script = ['HOOK  Behind every reel…', 'BEAT  The script, the editing…', 'BEAT  Hundreds of comments…', 'CTA   Comment AUTO'];
  const sl = lerp(t, W(62), W(64) + 0.6, 0, script.length, x => x);
  const syncP = lerp(t, W(65), W(70) + 0.4, 0, 1, x => x);
  const render = lerp(t, W(72), W(78) + 0.3, 0, 1, x => x);
  const phase = t < W(61) ? 0 : t < W(72) ? 1 : 2;
  return <AbsoluteFill>
    <Grid t={t} />
    <Section t={t} at={W(51) - 0.05} n="01" title="Create" sub="Drop a reference reel + your voiceover." />
    <div style={{position: 'absolute', left: 760, top: 120, perspective: 2000}}>
      <div style={{transform: `rotateY(${lerp(t, S[5], S[6], -14, -4, x => x)}deg) rotateX(4deg)`}}>
        <Window title="reelpilot.app / create" w={1050} h={820} sidebar="Create">
          <div style={{padding: 30, height: '100%'}}>
            {phase === 0 && <div style={{height: 680, borderRadius: 22, border: `2.5px dashed ${K.line2}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
              <div style={{fontFamily: FN.sans, fontWeight: 700, fontSize: 30, color: K.mute}}>Drop files to start</div>
              {[['reference.mp4', W(56), K.violet], ['voiceover.mp3', W(59), K.blue]].map(([f, at, c]) => {
                const k = fileIn(at as number);
                return <div key={f as string} style={{transform: `translate(${(1 - k) * 500}px, ${(1 - k) * -260}px) rotate(${(1 - k) * 18}deg)`, opacity: Math.min(1, k * 2)}}>
                  <Card style={{padding: '18px 26px', display: 'flex', alignItems: 'center', gap: 16, width: 440}}><div style={{width: 46, height: 46, borderRadius: 12, background: c as string}} /><div style={{fontFamily: FN.mono, fontSize: 24, color: K.text}}>{f as string}</div><div style={{marginLeft: 'auto'}}><Check p={lerp(t, (at as number) + 0.5, (at as number) + 0.8, 0, 1)} s={34} /></div></Card>
                </div>;
              })}
            </div>}
            {phase >= 1 && <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
              <Card style={{padding: 26}}>
                <div style={{fontFamily: FN.mono, fontSize: 18, color: K.blue, marginBottom: 10}}>SCRIPT · written by Claude</div>
                {script.map((l, i) => sl > i && <div key={i} style={{fontFamily: FN.mono, fontSize: 22, color: K.text, marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', width: `${Math.min(1, sl - i) * 100}%`}}>{l}</div>)}
              </Card>
              <Card style={{padding: 26, opacity: appear(t, W(65) - 0.2)}}>
                <div style={{fontFamily: FN.mono, fontSize: 18, color: K.blue, marginBottom: 14}}>WORD SYNC · forced alignment</div>
                <svg width="740" height="90" viewBox="0 0 740 90">{Array.from({length: 92}).map((_, i) => { const h = 10 + 70 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)); return <rect key={i} x={i * 8} y={45 - h / 2} width="5" height={h} rx="2.5" fill={i / 92 < syncP ? K.blue : K.line2} />; })}</svg>
                <div style={{display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap'}}>{['Behind', 'every', 'reel', 'so', 'much', 'work'].map((w, i) => <Chip key={w} size={18} bg={i / 6 < syncP ? K.blue : K.card2} c={K.text}>{w}</Chip>)}</div>
              </Card>
              {phase === 2 && <Card style={{padding: 26}} glow={render > 0.99 ? 1 : 0}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FN.mono, fontSize: 18, color: K.blue}}><span>RENDER · motion graphics in code</span><span style={{color: K.text}}>{Math.round(render * 100)}%</span></div>
                <div style={{display: 'flex', gap: 10, marginTop: 16}}>{Array.from({length: 8}).map((_, i) => <div key={i} style={{flex: 1, height: 70, borderRadius: 10, background: render * 8 > i ? [K.blue, K.violet, K.coral, K.lime][i % 4] : K.card2}} />)}</div>
              </Card>}
            </div>}
          </div>
        </Window>
      </div>
    </div>
    {t > W(80) && <div style={{position: 'absolute', left: 120, top: 520, transform: `scale(${pop(t, W(80), 0.4)})`, transformOrigin: 'left'}}>
      <Chip size={30} bg={K.card}><span style={{color: K.coral, fontSize: 34}}>✕</span> No editing app needed</Chip>
      <div style={{marginTop: 18, transform: `scale(${pop(t, W(75), 0.4)})`, transformOrigin: 'left'}}><Chip size={30} bg={K.card}><Check p={1} s={30} /> final.mp4 · 1080×1920</Chip></div>
    </div>}
  </AbsoluteFill>;
};

/* 6 — 02 Schedule */
const Schedule: React.FC<{t: number}> = ({t}) => {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const hours = ['09:00', '12:00', '13:30', '16:00', '19:30'];
  const clickP = lerp(t, W(87), W(87) + 0.35, 0, 1);
  const best = t > W(117) - 0.1;
  const heat = [[0.2, 0.7, 0.9, 0.5, 0.25], [0.15, 0.75, 0.95, 0.45, 0.2], [0.25, 0.8, 0.85, 0.5, 0.3], [0.2, 0.7, 0.9, 0.55, 0.2], [0.1, 0.65, 0.8, 0.4, 0.35], [0.3, 0.6, 0.7, 0.5, 0.4], [0.3, 0.5, 0.6, 0.45, 0.35]];
  const guess = t > W(105) - 0.1;
  return <AbsoluteFill>
    <Grid t={t} />
    <Section t={t} at={W(86) - 0.05} n="02" title="Schedule" sub="Instagram Reel + YouTube Short, at the same time." />
    <div style={{position: 'absolute', left: 760, top: 130, perspective: 2000}}>
      <div style={{transform: `rotateY(${lerp(t, S[6], S[7], -12, -3, x => x)}deg) rotateX(4deg)`}}>
        <Window title="reelpilot.app / schedule" w={1050} h={800} sidebar="Schedule">
          <div style={{padding: 26}}>
            <div style={{display: 'grid', gridTemplateColumns: '90px repeat(7, 1fr)', gap: 8}}>
              <div />{days.map(d => <div key={d} style={{fontFamily: FN.mono, fontSize: 17, color: d === 'THU' ? K.text : K.mute, textAlign: 'center'}}>{d}</div>)}
              {hours.map((h, r) => <React.Fragment key={h}>
                <div style={{fontFamily: FN.mono, fontSize: 17, color: K.mute, paddingTop: 30}}>{h}</div>
                {days.map((d, c) => {
                  const v = heat[c][r];
                  const isSlot = d === 'THU' && (h === '12:00' || h === '13:30');
                  const bestSlot = best && (h === '12:00' || h === '13:30');
                  const bg = guess ? `rgba(77,124,254,${0.08 + v * 0.55 * appear(t, W(111), 1)})` : K.card;
                  return <div key={d} style={{height: 100, borderRadius: 12, background: bg, border: `1.5px solid ${bestSlot ? K.lime : K.line}`, position: 'relative', overflow: 'hidden'}}>
                    {isSlot && t > W(91) - 0.1 && <div style={{position: 'absolute', inset: 6, borderRadius: 9, background: K.card2, border: `1.5px solid ${K.line2}`, padding: 8, transform: `translateY(${(1 - pop(t, W(91) + (h === '13:30' ? 0.25 : 0), 0.45)) * -120}px)`, display: 'flex', flexDirection: 'column', gap: 5}}>
                      <div style={{display: 'flex', gap: 5}}><Dot c="#E1306C" s={10} /><Dot c="#FF3B30" s={10} /></div>
                      <div style={{fontFamily: FN.sans, fontWeight: 700, fontSize: 14, color: K.text}}>{h === '12:00' ? 'Reel 10' : 'Reel 11'}</div>
                      {t > W(97) && <div style={{fontFamily: FN.mono, fontSize: 12, color: K.lime}}>● LIVE</div>}
                    </div>}
                  </div>;
                })}
              </React.Fragment>)}
            </div>
            <div style={{display: 'flex', gap: 14, marginTop: 22, alignItems: 'center'}}>
              <div style={{transform: `scale(${1 - 0.08 * Math.sin(clickP * Math.PI)})`}}><Chip bg={K.blue} c="#fff" size={22}>Schedule ▸</Chip></div>
              {t > W(91) && <Chip size={20}><Dot c="#E1306C" s={12} /> Instagram Reel</Chip>}
              {t > W(94) && <Chip size={20}><Dot c="#FF3B30" s={12} /> YouTube Short</Chip>}
            </div>
          </div>
        </Window>
      </div>
      {t > W(87) - 0.6 && t < W(87) + 0.8 && <Cursor x={lerp(t, W(87) - 0.6, W(87), 700, 330)} y={lerp(t, W(87) - 0.6, W(87), 500, 742)} click={lerp(t, W(87), W(87) + 0.4, 0, 1)} />}
    </div>
    {t > W(100) - 0.1 && <div style={{position: 'absolute', left: 120, top: 520}}>
      <div style={{transform: `scale(${pop(t, W(100) - 0.1, 0.4)})`, transformOrigin: 'left'}}><Chip size={30} bg={K.card}><Check p={1} s={30} /> Same time · both platforms</Chip></div>
      {guess && <div style={{marginTop: 18, transform: `scale(${pop(t, W(105) - 0.1, 0.4)})`, transformOrigin: 'left'}}><Chip size={30} bg={K.card}><span style={{color: K.amber}}>◔</span> {best ? 'Best slots picked from data' : 'No more guessing…'}</Chip></div>}
      {best && <div style={{marginTop: 18, display: 'flex', gap: 14, transform: `scale(${pop(t, W(117), 0.4)})`, transformOrigin: 'left'}}><Chip size={34} bg={K.lime} c={K.bg}>12:00</Chip><Chip size={34} bg={K.lime} c={K.bg}>13:30</Chip></div>}
    </div>}
  </AbsoluteFill>;
};

/* 7 — 03 Engage */
const Engage: React.FC<{t: number}> = ({t}) => {
  const n1 = pop(t, W(124), 0.45), n2 = pop(t, W(131) - 0.1, 0.45), n3 = pop(t, W(134), 0.45);
  const l1 = lerp(t, W(128), W(131), 0, 1), l2 = lerp(t, W(132), W(134), 0, 1);
  return <AbsoluteFill>
    <Grid t={t} />
    <Section t={t} at={W(122) - 0.05} n="03" title="Engage" sub="Comment → follow check → guide in DMs." />
    <svg width="1920" height="1080" style={{position: 'absolute'}}>
      <path d="M640 640 C 760 640, 760 640, 880 640" stroke={K.blue} strokeWidth="5" fill="none" strokeDasharray="240" strokeDashoffset={240 * (1 - l1)} />
      <path d="M1240 640 C 1300 640, 1300 640, 1360 640" stroke={K.blue} strokeWidth="5" fill="none" strokeDasharray="140" strokeDashoffset={140 * (1 - l2)} />
    </svg>
    <div style={{position: 'absolute', left: 140, top: 520, transform: `scale(${n1})`, opacity: Math.min(1, n1 * 2)}}>
      <Card style={{width: 500, padding: 26}}>
        <div style={{fontFamily: FN.mono, fontSize: 18, color: K.mute}}>NEW COMMENT</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14}}><div style={{width: 52, height: 52, borderRadius: '50%', background: K.violet}} /><div><div style={{fontFamily: FN.sans, fontWeight: 700, fontSize: 22, color: K.text}}>@meera.ai</div><div style={{fontFamily: FN.sans, fontWeight: 800, fontSize: 34, color: K.text}}>GUIDE 🙏</div></div></div>
      </Card>
    </div>
    <div style={{position: 'absolute', left: 880, top: 540, transform: `scale(${n2})`, opacity: Math.min(1, n2 * 2)}}>
      <Card style={{width: 360, padding: 26, display: 'flex', alignItems: 'center', gap: 18}} glow={t > W(131) && t < W(133) ? 1 : 0}>
        <Check p={lerp(t, W(131), W(131) + 0.4, 0, 1)} s={60} />
        <div><div style={{fontFamily: FN.mono, fontSize: 18, color: K.mute}}>FOLLOW CHECK</div><div style={{fontFamily: FN.sans, fontWeight: 800, fontSize: 32, color: K.text}}>Follows you</div></div>
      </Card>
    </div>
    <div style={{position: 'absolute', left: 1360, top: 430, transform: `scale(${n3})`, opacity: Math.min(1, n3 * 2)}}>
      <Card style={{width: 440, padding: 24}}>
        <div style={{fontFamily: FN.mono, fontSize: 18, color: K.mute}}>DIRECT MESSAGE · sent</div>
        <div style={{marginTop: 14, background: K.blue, color: '#fff', borderRadius: '22px 22px 22px 6px', padding: '16px 20px', fontFamily: FN.sans, fontWeight: 600, fontSize: 22}}>Here's your guide 👇</div>
        <div style={{marginTop: 12, border: `1.5px solid ${K.line2}`, borderRadius: 16, overflow: 'hidden'}}>
          <div style={{height: 110, background: K.card2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LogoMark s={60} /></div>
          <div style={{padding: 14, fontFamily: FN.sans, fontWeight: 700, fontSize: 20, color: K.text}}>Free guide · open link ↗</div>
        </div>
      </Card>
    </div>
    <div style={{position: 'absolute', left: 140, top: 860, display: 'flex', gap: 18}}>
      {t > W(142) && <div style={{transform: `scale(${pop(t, W(142), 0.4)})`}}><Chip size={28} bg={K.card}>1 resource per reel</Chip></div>}
      {t > W(147) && <div style={{transform: `scale(${pop(t, W(147), 0.4)})`}}><Chip size={28} bg={K.card}><span style={{color: K.lime}}>0</span> spam</Chip></div>}
    </div>
  </AbsoluteFill>;
};

/* 8 — 04 Safety */
const Safety: React.FC<{t: number}> = ({t}) => {
  const cnt = Math.round(lerp(t, W(156) - 0.3, W(158) + 0.6, 120, 3400, x => x * x));
  const needle = lerp(t, W(159), W(160) + 0.6, 80, -20) + Math.sin(t * 9) * 3;
  const shield = pop(t, W(162), 0.5);
  const safe = t > W(166) - 0.05;
  return <AbsoluteFill>
    <Grid t={t} />
    <Section t={t} at={W(151) - 0.05} n="04" title="Safety" sub="Viral reel? Your account stays safe." />
    <div style={{position: 'absolute', left: 140, top: 560, opacity: appear(t, W(155) - 0.2)}}>
      <div style={{fontFamily: FN.mono, fontSize: 22, color: K.mute}}>COMMENTS ON THIS REEL</div>
      <div style={{fontFamily: FN.sans, fontWeight: 900, fontSize: 150, color: K.text, letterSpacing: -6, lineHeight: 1}}>{cnt.toLocaleString('en-US')}<span style={{color: K.coral}}>↑</span></div>
    </div>
    <div style={{position: 'absolute', left: 820, top: 170}}>
      <Card style={{width: 520, height: 520, padding: 30, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontFamily: FN.mono, fontSize: 20, color: K.mute, alignSelf: 'flex-start'}}>SMART PACING</div>
        <svg width="440" height="300" viewBox="-220 -220 440 300">
          <path d="M-180 0 A180 180 0 0 1 -60 -170" stroke={K.lime} strokeWidth="26" fill="none" />
          <path d="M-60 -170 A180 180 0 0 1 90 -156" stroke={K.amber} strokeWidth="26" fill="none" />
          <path d="M90 -156 A180 180 0 0 1 180 0" stroke={K.coral} strokeWidth="26" fill="none" />
          <line x1="0" y1="0" x2="0" y2="-150" stroke={K.text} strokeWidth="10" strokeLinecap="round" transform={`rotate(${needle})`} />
          <circle r="18" fill={K.text} />
        </svg>
        <div style={{fontFamily: FN.sans, fontWeight: 800, fontSize: 34, color: needle < 0 ? K.lime : K.amber}}>{needle < 0 ? 'Safe pace' : 'Slowing down…'}</div>
      </Card>
    </div>
    <div style={{position: 'absolute', left: 1400, top: 170, transform: `scale(${shield})`, opacity: Math.min(1, shield * 2)}}>
      <Card style={{width: 380, height: 520, padding: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'}} glow={safe ? 1 : 0}>
        <div style={{fontFamily: FN.mono, fontSize: 20, color: K.mute, alignSelf: 'flex-start'}}>AUTO-COOLDOWN</div>
        <svg width="220" height="250" viewBox="0 0 220 250"><path d="M110 10 L200 45 V120 Q200 200 110 240 Q20 200 20 120 V45 Z" fill={safe ? K.lime : K.card2} stroke={safe ? K.lime : K.line2} strokeWidth="6" />{safe && <path d="M70 125 L100 155 L155 95" fill="none" stroke={K.bg} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />}</svg>
        <div style={{fontFamily: FN.sans, fontWeight: 800, fontSize: 34, color: safe ? K.lime : K.text}}>{safe ? 'Account safe' : 'Protecting…'}</div>
      </Card>
    </div>
  </AbsoluteFill>;
};

/* 9 — 05 Analytics */
const Analytics: React.FC<{t: number}> = ({t}) => {
  const M: [string, number, string][] = [['Views', 170, K.blue], ['Reach', 171, K.violet], ['Shares', 172, K.coral], ['Saves', 174, K.lime]];
  const ticks: [string, number][] = [['1h', 179], ['6h', 180], ['24h', 181], ['48h', 183]];
  const prog = ticks.filter(([, wi]) => t >= W(wi)).length;
  return <AbsoluteFill>
    <Grid t={t} />
    <Section t={t} at={W(169) - 0.05} n="05" title="Analytics" sub="Captured automatically for every reel." />
    <div style={{position: 'absolute', left: 140, top: 520, display: 'flex', gap: 26}}>
      {M.map(([m, wi, c], i) => {
        const p = pop(t, W(wi) - 0.05, 0.45);
        return <div key={m} style={{transform: `translateY(${(1 - p) * 60}px)`, opacity: Math.min(1, p * 2)}}>
          <Card style={{width: 390, height: 300, padding: 28}}>
            <div style={{fontFamily: FN.mono, fontSize: 20, color: K.mute}}>{m.toUpperCase()}</div>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, height: 170, marginTop: 30}}>
              {[0.25, 0.4, 0.55, 0.7, 0.85, 1].map((h, j) => <div key={j} style={{flex: 1, borderRadius: 8, background: j < 2 + prog ? c : K.card2, height: `${h * 100 * lerp(t, W(wi), W(wi) + 0.8, 0.1, 1)}%`}} />)}
            </div>
          </Card>
        </div>;
      })}
    </div>
    <div style={{position: 'absolute', left: 140, top: 870, right: 140, display: 'flex', alignItems: 'center', gap: 0}}>
      {ticks.map(([l, wi], i) => <React.Fragment key={l}>
        <div style={{transform: `scale(${t >= W(wi) ? pop(t, W(wi), 0.35) : 0.8})`}}><Chip size={26} bg={t >= W(wi) ? K.blue : K.card} c="#fff">{l}</Chip></div>
        {i < 3 && <div style={{flex: 1, height: 4, background: t >= W(ticks[i + 1][1]) ? K.blue : K.line2, margin: '0 16px'}} />}
      </React.Fragment>)}
    </div>
    <div style={{position: 'absolute', right: 140, top: 140, fontFamily: FN.mono, fontSize: 18, color: K.dim}}>demo data</div>
  </AbsoluteFill>;
};

/* 10 — full funnel */
const Funnel: React.FC<{t: number}> = ({t}) => {
  const N = ['Script', 'Reel', 'Schedule', 'Post', 'Comment', 'DM', 'Analytics'];
  const lit = lerp(t, W(186) - 0.1, W(188) + 0.6, 0, N.length, x => x);
  const box = appear(t, W(192), 0.6);
  return <AbsoluteFill>
    <Grid t={t} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 190, display: 'flex', justifyContent: 'center'}}><Words text="From script to DM —" t={t} at={W(185)} size={84} /></div>
    <div style={{position: 'absolute', left: 120, right: 120, top: 470, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {N.map((n, i) => <React.Fragment key={n}>
        <div style={{padding: '20px 26px', borderRadius: 18, background: lit > i ? K.blue : K.card, border: `1.5px solid ${lit > i ? K.blue : K.line}`, fontFamily: FN.sans, fontWeight: 800, fontSize: 28, color: K.text, transform: `scale(${lit > i ? 1 : 0.92})`}}>{n}</div>
        {i < N.length - 1 && <div style={{width: 46, height: 4, background: lit > i + 1 ? K.blue : K.line2}} />}
      </React.Fragment>)}
    </div>
    <div style={{position: 'absolute', left: 100, right: 100, top: 430, height: 170, borderRadius: 30, border: `3px dashed ${K.lime}`, opacity: box, transform: `scale(${1.05 - 0.05 * box})`}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', opacity: box}}><div style={{fontFamily: FN.sans, fontWeight: 800, fontSize: 70, color: K.text, letterSpacing: -2}}>your entire funnel, <Serif size={84} color={K.lime}>in one place.</Serif></div></div>
  </AbsoluteFill>;
};

/* 11 — you be the creator */
const Creator: React.FC<{t: number}> = ({t}) => <AbsoluteFill>
  <Grid t={t} />
  <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30}}>
    <Rise t={t} at={W(196)}><Serif size={130} color={K.text}>You be the creator…</Serif></Rise>
    <div style={{display: 'flex', alignItems: 'center', gap: 26, opacity: appear(t, W(200) - 0.1)}}><LogoMark s={96} draw={lerp(t, W(200) - 0.1, W(200) + 0.5, 0, 1)} /><Words text="ReelPilot does the rest." t={t} at={W(200)} size={96} accent={{'rest.': K.blue}} /></div>
  </AbsoluteFill>
</AbsoluteFill>;

/* 12 — end card */
const End: React.FC<{t: number}> = ({t}) => {
  const typed = 'AUTO'.slice(0, Math.floor(lerp(t, W(211) + 0.1, W(212) + 0.3, 0, 4.99, x => x)));
  const sent = t > W(212) + 0.5;
  return <AbsoluteFill style={{background: K.bg}}>
    <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 34, transform: `scale(${pop(t, W(204) - 0.1, 0.5)})`}}><LogoMark s={150} draw={lerp(t, W(204) - 0.1, W(204) + 0.6, 0, 1)} /><div style={{fontFamily: FN.sans, fontWeight: 900, fontSize: 170, color: K.text, letterSpacing: -7}}>ReelPilot</div></div>
      <Rise t={t} at={W(205)}><div style={{fontFamily: FN.sans, fontWeight: 600, fontSize: 56, color: K.mute, marginTop: 10}}>Reels on <Serif size={72} color={K.lime}>autopilot.</Serif></div></Rise>
      <div style={{marginTop: 60, width: 760, display: 'flex', alignItems: 'center', gap: 18, background: K.card, border: `1.5px solid ${K.line2}`, borderRadius: 999, padding: '18px 26px', opacity: appear(t, W(208))}}>
        <div style={{width: 52, height: 52, borderRadius: '50%', background: K.blue}} />
        <div style={{flex: 1, fontFamily: FN.sans, fontWeight: 700, fontSize: 32, color: typed ? K.text : K.mute}}>{typed || 'Want the setup? Comment…'}{!sent && <span style={{color: K.blue, opacity: Math.floor(t * 3) % 2 ? 1 : 0}}>|</span>}</div>
        <div style={{fontFamily: FN.sans, fontWeight: 800, fontSize: 28, color: sent ? K.lime : K.blue}}>{sent ? 'Posted ✓' : 'Post'}</div>
      </div>
      <Rise t={t} at={W(209)}><div style={{marginTop: 28, fontFamily: FN.mono, fontSize: 24, color: K.dim}}>@yourhandle</div></Rise>
    </AbsoluteFill>
  </AbsoluteFill>;
};

/* subtitles */
const Subs: React.FC<{t: number}> = ({t}) => {
  const cur = WORDS.filter(w => w.start <= t + 0.05).pop(); if (!cur) return null;
  const line = WORDS.filter(w => w.line === cur.line && w.text !== '—');
  if (t > line[line.length - 1].end + 0.3) return null;
  const idx = Math.max(0, line.findIndex(w => w === cur));
  const from = Math.floor(idx / 7) * 7; const chunk = line.slice(from, from + 7);
  return <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: 'rgba(10,12,17,0.78)', border: `1px solid ${K.line}`, borderRadius: 14, padding: '10px 22px', fontFamily: FN.sans, fontWeight: 600, fontSize: 30, color: K.mute, display: 'flex', gap: 10}}>
      {chunk.map((w, i) => <span key={i} style={{color: w.start <= t + 0.03 ? K.text : K.dim}}>{w.text.replace(/[*]/g, '')}</span>)}
    </div>
  </div>;
};

export const Reel: React.FC = () => {
  const {t} = useT();
  const sc = [Problem, Flood, Gone, Intro, System, Create, Schedule, Engage, Safety, Analytics, Funnel, Creator, End];
  return <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
    {sc.map((C, i) => <Scene key={i} i={i} t={t}><C t={t} /></Scene>)}
    <Subs t={t} />
    <Audio src={staticFile('mix.mp3')} />
  </AbsoluteFill>;
};

export const Cover: React.FC = () => <AbsoluteFill style={{background: K.bg}}>
  <Grid t={0} />
  <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 34}}><LogoMark s={170} /><div style={{fontFamily: FN.sans, fontWeight: 900, fontSize: 190, color: K.text, letterSpacing: -8}}>ReelPilot</div></div>
    <div style={{fontFamily: FN.sans, fontWeight: 600, fontSize: 64, color: K.mute, marginTop: 10}}>Reels on <Serif size={84} color={K.lime}>autopilot.</Serif></div>
  </AbsoluteFill>
</AbsoluteFill>;
