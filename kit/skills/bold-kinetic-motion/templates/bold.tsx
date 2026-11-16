// "Bold motion" kit — flat-colour kinetic typography system (orange / near-black / lime / purple / off-white).
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, Easing} from 'remotion';
import {clamp} from './lib/motion';

export const P = {orange: '#F0501E', ink: '#0E0B14', lime: '#D6F23A', purple: '#6A52F5', paper: '#EEE9E4', white: '#FFFFFF', dim: '#8E879A', card: '#F7F5F2'};
export const FT = {heavy: 'Heavy', serif: 'Serif', mono: 'Mono', body: 'Body'};
export const ease = Easing.bezier(.16, 1, .3, 1);
export const lerp = (t: number, a: number, b: number, f: number, to: number, e: (x: number) => number = ease) => interpolate(t, [a, b], [f, to], {...clamp, easing: e});
export const backOut = (k: number) => { if (k <= 0) return 0; if (k >= 1) return 1; const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export const pop = (t: number, at: number, d = 0.3) => backOut((t - at) / d);

/** full-frame solid colour */
export const Bg: React.FC<{c: string}> = ({c}) => <AbsoluteFill style={{background: c}} />;

/** letters slam in one by one (scale + drop + rotate) */
export const Slam: React.FC<{text: string; t: number; at: number; size: number; color: string; stagger?: number; rot?: number; style?: React.CSSProperties; font?: string; seed?: string}> =
  ({text, t, at, size, color, stagger = 0.045, rot = 0, style, font = FT.heavy, seed = 's'}) =>
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', fontFamily: font, fontSize: size, color, lineHeight: 0.9, letterSpacing: -size * 0.02, whiteSpace: 'pre', ...style}}>
      {text.split('').map((ch, i) => {
        const k = pop(t, at + i * stagger, 0.28);
        const r = (random(seed + i) - 0.5) * rot;
        return <span key={i} style={{display: 'inline-block', opacity: Math.min(1, k * 3), transform: `translateY(${(1 - k) * -size * 0.6}px) scale(${0.4 + 0.6 * k}) rotate(${r * (1 - k) + r * 0.15}deg)`}}>{ch}</span>;
      })}
    </div>;

/** italic serif accent word */
export const Ital: React.FC<{text: string; t: number; at: number; size: number; color: string; style?: React.CSSProperties}> = ({text, t, at, size, color, style}) => {
  const k = lerp(t, at, at + 0.3, 0, 1);
  return <div style={{fontFamily: FT.serif, fontStyle: 'italic', fontSize: size, color, opacity: k, transform: `translateY(${(1 - k) * 20}px)`, whiteSpace: 'nowrap', ...style}}>{text}</div>;
};

/** black pill label */
export const Pill: React.FC<{children: React.ReactNode; bg?: string; color?: string; size?: number; style?: React.CSSProperties}> = ({children, bg = P.ink, color = P.white, size = 30, style}) =>
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: bg, color, borderRadius: 10, padding: `${size * 0.25}px ${size * 0.55}px`, fontFamily: FT.heavy, fontSize: size, whiteSpace: 'nowrap', ...style}}>{children}</div>;

/** toggle switch */
export const Toggle: React.FC<{on: number; label: string}> = ({on, label}) =>
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: P.orange, borderRadius: 999, padding: '10px 14px 10px 24px', fontFamily: FT.body, fontWeight: 800, fontSize: 26, color: P.white}}>
    {label}<div style={{width: 64, height: 34, borderRadius: 17, background: P.ink, position: 'relative'}}><div style={{position: 'absolute', top: 4, left: 4 + on * 30, width: 26, height: 26, borderRadius: '50%', background: P.white}} /></div>
  </div>;

/** hazard stripes */
export const Stripes: React.FC<{t: number; a?: string; b?: string; w?: number}> = ({t, a = P.orange, b = P.ink, w = 90}) =>
  <AbsoluteFill style={{background: `repeating-linear-gradient(-45deg, ${a} 0 ${w}px, ${b} ${w}px ${w * 2}px)`, backgroundPosition: `${t * 120}px 0`}} />;

/** 3D rotating dot sphere that morphs into a text dot-matrix */
export const DotMorph: React.FC<{t: number; t0: number; morphAt: number; text: string; color?: string; w?: number; h?: number; cx?: number; cy?: number; r?: number}> =
  ({t, t0, morphAt, text, color = P.white, w = 1920, h = 1080, cx = 960, cy = 540, r = 300}) => {
    const targets = useMemo(() => {
      if (typeof document === 'undefined') return [] as [number, number][];
      const c = document.createElement('canvas'); c.width = 1400; c.height = 300; const g = c.getContext('2d')!;
      g.fillStyle = '#fff'; g.font = '260px Heavy'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 700, 160);
      const d = g.getImageData(0, 0, 1400, 300).data; const pts: [number, number][] = [];
      for (let y = 0; y < 300; y += 9) for (let x = 0; x < 1400; x += 9) if (d[(y * 1400 + x) * 4 + 3] > 128) pts.push([x - 700, y - 160]);
      return pts;
    }, [text]);
    const n = Math.max(targets.length, 600);
    const m = lerp(t, morphAt, morphAt + 0.7, 0, 1);
    const spin = (t - t0) * 0.9;
    return <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: n}).map((_, i) => {
        const k = i + 0.5, phi = Math.acos(1 - 2 * k / n), th = Math.PI * (1 + Math.sqrt(5)) * k + spin;
        let x = Math.sin(phi) * Math.cos(th), y = Math.cos(phi), z = Math.sin(phi) * Math.sin(th);
        const sx = cx + x * r, sy = cy + y * r * 0.98, depth = (z + 1) / 2;
        const tg = targets[i % Math.max(1, targets.length)] ?? [0, 0];
        const tx = cx + tg[0], ty = cy + tg[1];
        const px = sx + (tx - sx) * m, py = sy + (ty - sy) * m;
        const hide = i >= targets.length && m > 0.5;
        return <circle key={i} cx={px} cy={py} r={(1.6 + depth * 2.6) * (1 - m) + 3.6 * m} fill={color} opacity={hide ? 0 : (0.25 + 0.75 * depth) * (1 - m) + m} />;
      })}
    </svg>;
  };

/** colourful dot wall that fills in, then waves */
export const DotWall: React.FC<{t: number; t0: number; full: number; cols?: number; rows?: number}> = ({t, t0, full, cols = 40, rows = 22}) => {
  const cs = [P.purple, P.lime, P.white, P.orange, '#B9B2C9'];
  const wave = lerp(t, full, full + 1.2, 0, 1);
  return <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: cols * rows}).map((_, i) => {
      const cx = (i % cols) * 48 + 30, cy = Math.floor(i / cols) * 48 + 34;
      const at = t0 + random('a' + i) * (full - t0);
      if (t < at) return null;
      const k = pop(t, at, 0.25);
      const dy = Math.sin((cx / 160) + t * 5) * 40 * wave;
      const sq = random('q' + i) > 0.55;
      const s = 15 * k;
      const c = cs[Math.floor(random('c' + i) * cs.length)];
      return sq ? <rect key={i} x={cx - s} y={cy + dy - s} width={s * 2} height={s * 2} rx={4} fill={c} /> : <circle key={i} cx={cx} cy={cy + dy} r={s} fill={c} />;
    })}
  </svg>;
};

/** concentric halftone rings pulsing */
export const Halftone: React.FC<{t: number; color?: string}> = ({t, color = 'rgba(255,255,255,0.85)'}) =>
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 14}).map((_, ring) => {
      const rr = 60 + ring * 52; const n = Math.floor(rr / 9);
      const pulse = 0.5 + 0.5 * Math.sin(t * 6 - ring * 0.6);
      return Array.from({length: n}).map((_, j) => {
        const a = (j / n) * Math.PI * 2;
        return <circle key={ring + '-' + j} cx={960 + Math.cos(a) * rr} cy={540 + Math.sin(a) * rr} r={2 + pulse * 5} fill={color} />;
      });
    })}
  </svg>;

/** light burst rays */
export const Burst: React.FC<{t: number; at: number; color?: string}> = ({t, at, color = P.white}) => {
  const k = lerp(t, at, at + 0.5, 0, 1);
  return <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 48}).map((_, i) => {
      const a = (i / 48) * Math.PI * 2 + t * 0.4; const L = (300 + random('b' + i) * 500) * k;
      return <line key={i} x1={960 + Math.cos(a) * 120} y1={540 + Math.sin(a) * 120} x2={960 + Math.cos(a) * (120 + L)} y2={540 + Math.sin(a) * (120 + L)} stroke={i % 3 ? color : P.lime} strokeWidth={i % 4 ? 3 : 6} strokeLinecap="round" opacity={0.9 - 0.5 * k} />;
    })}
  </svg>;
};

/** glossy blob (soft shading is the one place a gradient is used) */
export const Blob: React.FC<{x: number; y: number; r: number; t: number; seed: string; sx?: number}> = ({x, y, r, t, seed, sx = 1}) => {
  const fx = Math.sin(t * (0.8 + random(seed) * 0.6) + random(seed + 'p') * 6) * 30, fy = Math.cos(t * (0.7 + random(seed + 'y') * 0.6)) * 26;
  return <div style={{position: 'absolute', left: x - r + fx, top: y - r * sx + fy, width: r * 2, height: r * 2 * sx, borderRadius: '50%',
    background: `radial-gradient(circle at 32% 28%, #ffffff 0%, #cfe8ff 10%, #9b8cff 34%, #ff9fd1 58%, #5a3fd8 82%, #2a1d6e 100%)`, boxShadow: '0 30px 80px rgba(0,0,0,0.45)', transform: `rotate(${t * 20 + random(seed + 'r') * 90}deg)`}} />;
};
