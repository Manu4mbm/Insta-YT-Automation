// SaaS product-video kit (dark premium UI, one accent, 3D product screens)
import React from 'react';
import {AbsoluteFill, interpolate, Easing} from 'remotion';
import {clamp} from './lib/motion';

export const K = {
  bg: '#0A0C11', bg2: '#0F1218', card: '#141821', card2: '#1A1F2A', line: '#242A36', line2: '#2F3645',
  text: '#EEF1F6', mute: '#8B94A7', dim: '#5B6375',
  blue: '#4D7CFE', blue2: '#2E57D6', lime: '#C8F560', coral: '#FF6B4A', amber: '#FFC24B', violet: '#9B7BFF',
};
export const FN = {sans: 'Inter', serif: '"Instrument Serif"', mono: '"JetBrains Mono"'};
export const ease = Easing.bezier(.16, 1, .3, 1);
export const lerp = (t: number, a: number, b: number, f: number, to: number, e: (x: number) => number = ease) => interpolate(t, [a, b], [f, to], {...clamp, easing: e});
export const backOut = (k: number) => { if (k <= 0) return 0; if (k >= 1) return 1; const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export const pop = (t: number, at: number, d = 0.4) => backOut((t - at) / d);
export const appear = (t: number, at: number, d = 0.45) => lerp(t, at, at + d, 0, 1);

/** faint engineering grid on solid bg */
export const Grid: React.FC<{t: number; c?: string}> = ({t, c = K.bg}) => <AbsoluteFill style={{background: c}}>
  <AbsoluteFill style={{backgroundImage: `linear-gradient(${K.line}55 1px, transparent 1px), linear-gradient(90deg, ${K.line}55 1px, transparent 1px)`, backgroundSize: '80px 80px', backgroundPosition: `${-t * 6}px ${-t * 3}px`}} />
</AbsoluteFill>;

/** rises in with blur */
export const Rise: React.FC<{t: number; at: number; children: React.ReactNode; y?: number; d?: number; style?: React.CSSProperties}> = ({t, at, children, y = 40, d = 0.5, style}) => {
  const k = appear(t, at, d);
  return <div style={{opacity: k, transform: `translateY(${(1 - k) * y}px)`, filter: `blur(${(1 - k) * 8}px)`, ...style}}>{children}</div>;
};

/** headline with per-word reveal */
export const Words: React.FC<{text: string; t: number; at: number; size: number; color?: string; gap?: number; weight?: number; style?: React.CSSProperties; accent?: Record<string, string>}> =
  ({text, t, at, size, color = K.text, gap = 0.07, weight = 800, style, accent = {}}) =>
    <div style={{fontFamily: FN.sans, fontWeight: weight, fontSize: size, color, letterSpacing: -size * 0.035, lineHeight: 1.02, display: 'flex', flexWrap: 'wrap', gap: `0 ${size * 0.26}px`, ...style}}>
      {text.split(' ').map((w, i) => { const k = appear(t, at + i * gap, 0.5);
        return <span key={i} style={{display: 'inline-block', opacity: k, transform: `translateY(${(1 - k) * size * 0.4}px)`, filter: `blur(${(1 - k) * 6}px)`, color: accent[w] ?? color}}>{w}</span>; })}
    </div>;

export const Serif: React.FC<{children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties}> = ({children, size, color = K.text, style}) =>
  <span style={{fontFamily: FN.serif, fontStyle: 'italic', fontWeight: 400, fontSize: size, color, letterSpacing: 0, ...style}}>{children}</span>;

export const Card: React.FC<{children?: React.ReactNode; style?: React.CSSProperties; glow?: number}> = ({children, style, glow = 0}) =>
  <div style={{background: K.card, border: `1.5px solid ${glow > 0 ? K.blue : K.line}`, borderRadius: 24, boxShadow: `0 30px 80px rgba(0,0,0,0.5)${glow ? `, 0 0 ${60 * glow}px rgba(77,124,254,${0.35 * glow})` : ''}`, ...style}}>{children}</div>;

export const Chip: React.FC<{children: React.ReactNode; c?: string; bg?: string; size?: number; style?: React.CSSProperties}> = ({children, c = K.text, bg = K.card2, size = 22, style}) =>
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: bg, color: c, border: `1.5px solid ${K.line2}`, borderRadius: 999, padding: `${size * 0.4}px ${size * 0.8}px`, fontFamily: FN.sans, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap', ...style}}>{children}</div>;

export const Dot: React.FC<{c: string; s?: number}> = ({c, s = 12}) => <span style={{width: s, height: s, borderRadius: '50%', background: c, display: 'inline-block', flexShrink: 0}} />;

export const Check: React.FC<{p: number; s?: number; c?: string}> = ({p, s = 40, c = K.lime}) =>
  <svg width={s} height={s} viewBox="0 0 40 40" style={{flexShrink: 0, opacity: Math.min(1, p * 2), transform: `scale(${0.6 + 0.4 * Math.min(1, p)})`}}>
    <circle cx="20" cy="20" r="19" fill={c} /><path d="M11 20.5 L17.5 27 L29 14" fill="none" stroke={K.bg} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="28" strokeDashoffset={28 * (1 - Math.min(1, p))} />
  </svg>;

/** macOS-like app window */
export const Window: React.FC<{title: string; children: React.ReactNode; w: number; h: number; style?: React.CSSProperties; sidebar?: string}> = ({title, children, w, h, style, sidebar}) =>
  <div style={{width: w, height: h, background: K.bg2, border: `1.5px solid ${K.line2}`, borderRadius: 28, overflow: 'hidden', boxShadow: '0 50px 120px rgba(0,0,0,0.65)', display: 'flex', flexDirection: 'column', ...style}}>
    <div style={{height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', borderBottom: `1.5px solid ${K.line}`, background: K.card}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <Dot key={c} c={c} s={14} />)}
      <div style={{marginLeft: 18, fontFamily: FN.mono, fontSize: 18, color: K.mute}}>{title}</div>
    </div>
    <div style={{flex: 1, display: 'flex', minHeight: 0}}>
      {sidebar && <div style={{width: 230, borderRight: `1.5px solid ${K.line}`, padding: 22, display: 'flex', flexDirection: 'column', gap: 14}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10}}><LogoMark s={34} /><span style={{fontFamily: FN.sans, fontWeight: 800, fontSize: 22, color: K.text}}>ReelPilot</span></div>
        {['Create', 'Schedule', 'Engage', 'Safety', 'Analytics'].map(it => <div key={it} style={{fontFamily: FN.sans, fontWeight: 600, fontSize: 19, padding: '10px 14px', borderRadius: 12, color: it === sidebar ? K.text : K.mute, background: it === sidebar ? K.card2 : 'transparent', border: `1.5px solid ${it === sidebar ? K.line2 : 'transparent'}`}}>{it}</div>)}
      </div>}
      <div style={{flex: 1, position: 'relative', minWidth: 0}}>{children}</div>
    </div>
  </div>;

/** ReelPilot mark: rounded square + paper plane */
export const LogoMark: React.FC<{s?: number; draw?: number}> = ({s = 120, draw = 1}) =>
  <svg width={s} height={s} viewBox="0 0 120 120" style={{flexShrink: 0}}>
    <rect x="4" y="4" width="112" height="112" rx="30" fill={K.blue} transform={`scale(${0.6 + 0.4 * Math.min(1, draw * 1.5)})`} style={{transformOrigin: '60px 60px'}} />
    <path d="M28 60 L92 32 L74 92 L60 68 Z M60 68 L92 32" fill="none" stroke="#fff" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="300" strokeDashoffset={300 * (1 - draw)} />
  </svg>;

/** section header "01 Create" */
export const Section: React.FC<{t: number; at: number; n: string; title: string; sub?: string; x?: number; y?: number}> = ({t, at, n, title, sub, x = 120, y = 110}) =>
  <div style={{position: 'absolute', left: x, top: y}}>
    <Rise t={t} at={at - 0.15}><div style={{fontFamily: FN.mono, fontSize: 24, color: K.blue, letterSpacing: 4}}>{n} — FEATURE</div></Rise>
    <Words text={title} t={t} at={at} size={86} />
    {sub && <Rise t={t} at={at + 0.25}><div style={{fontFamily: FN.sans, fontWeight: 500, fontSize: 30, color: K.mute, marginTop: 8, maxWidth: 560}}>{sub}</div></Rise>}
  </div>;

/** mouse cursor */
export const Cursor: React.FC<{x: number; y: number; click?: number}> = ({x, y, click = 0}) =>
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - 0.15 * click})`}}>
    {click > 0 && <div style={{position: 'absolute', left: -26, top: -26, width: 52, height: 52, borderRadius: '50%', border: `3px solid ${K.blue}`, transform: `scale(${1 + click})`, opacity: 1 - click}} />}
    <svg width="34" height="40" viewBox="0 0 34 40"><path d="M2 2 L2 32 L10 25 L16 38 L22 35 L16 23 L28 23 Z" fill="#fff" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" /></svg>
  </div>;
