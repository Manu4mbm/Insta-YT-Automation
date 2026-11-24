import React from "react";
import { AbsoluteFill, Easing, staticFile, continueRender, delayRender } from "remotion";

/* ── math helpers ── */
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eo = Easing.out(Easing.cubic);
export const eio = Easing.inOut(Easing.cubic);
export const bk = Easing.out(Easing.back(2.2));
export const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0) / 4294967295; };

export const DEV = "NotoDev, Inter, sans-serif";
export const LAT = "Inter, sans-serif";

/* ── fonts ── */
const fh = typeof window !== "undefined" ? delayRender("fonts") : 0;
if (typeof window !== "undefined") {
  const faces = [
    new FontFace("NotoDev", `url(${staticFile("noto-serif-devanagari-devanagari-800-normal.woff2")})`, { weight: "800" }),
    new FontFace("Inter", `url(${staticFile("inter-latin-800-normal.woff2")})`, { weight: "800" }),
    new FontFace("Inter", `url(${staticFile("inter-latin-600-normal.woff2")})`, { weight: "600" }),
  ];
  Promise.all(faces.map((f) => f.load().then((ff) => (document as any).fonts.add(ff)))).then(() => continueRender(fh));
}

/* ── theme ── */
export type Theme = { bg: string; bg2: string; gold: string; accent: string; red: string; ink: string; water: string; ember: string };
export const THEMES: Record<string, Theme> = {
  yoddha: { bg: "#120406", bg2: "#3a0a0e", gold: "#f0b75e", accent: "#ff6a3d", red: "#d8312a", ink: "#fff4e6", water: "#4fa3d9", ember: "#ffb25e" },
  twist: { bg: "#0a0920", bg2: "#1d1a52", gold: "#f2c14e", accent: "#ff9a3c", red: "#e0483a", ink: "#fff8e8", water: "#5aa9e6", ember: "#ffd98a" },
  rajasthan: { bg: "#1a0a10", bg2: "#5a2235", gold: "#f6c36b", accent: "#ff5c8a", red: "#d8312a", ink: "#fff3ea", water: "#6cc3d5", ember: "#ffc6a0" },
  defence: { bg: "#050b0d", bg2: "#0f2a2e", gold: "#7dffb0", accent: "#3fd0ff", red: "#ff4d4d", ink: "#eafff4", water: "#2f8fbf", ember: "#9dffd0" },
  travel: { bg: "#06141c", bg2: "#0d3b4a", gold: "#ffd166", accent: "#ff7b54", red: "#ef476f", ink: "#f7fbff", water: "#4cc9f0", ember: "#ffe8a3" },
};
export const ThemeCtx = React.createContext<Theme>(THEMES.yoddha);
export const useTheme = () => React.useContext(ThemeCtx);

/* ── rich text: *gold*  _accent_  ~red~ ── */
export const Rich: React.FC<{ s: string }> = ({ s }) => {
  const T = useTheme();
  const parts = s.split(/(\*[^*]+\*|_[^_]+_|~[^~]+~)/g).filter(Boolean);
  return <>{parts.map((p, i) => {
    if (p.startsWith("*")) return <span key={i} style={{ color: T.gold }}>{p.slice(1, -1)}</span>;
    if (p.startsWith("_")) return <span key={i} style={{ color: T.accent }}>{p.slice(1, -1)}</span>;
    if (p.startsWith("~")) return <span key={i} style={{ color: T.red }}>{p.slice(1, -1)}</span>;
    return <span key={i}>{p}</span>;
  })}</>;
};
export const fontFor = (s: string) => (/[ऀ-ॿ]/.test(s) ? DEV : LAT);

/* ── camera: every shot keeps moving ── */
export type CamKind = "push" | "pull" | "panL" | "panR" | "tiltU" | "tiltD" | "dutch" | "still";
export const CAMS: CamKind[] = ["push", "pull", "panL", "panR", "tiltU", "tiltD", "dutch"];
export const Cam: React.FC<{ lt: number; len: number; kind?: CamKind; ox?: number; oy?: number; amt?: number; children: React.ReactNode }> = ({ lt, len, kind = "push", ox = 540, oy = 960, amt = 1, children }) => {
  const p = clamp(lt / len);
  let z = 1, x = 0, y = 0, r = 0;
  if (kind === "push") z = 1 + 0.13 * amt * p;
  if (kind === "pull") z = 1 + 0.13 * amt * (1 - p);
  if (kind === "panL") { z = 1.12; x = 60 * amt - 120 * amt * p; }
  if (kind === "panR") { z = 1.12; x = -60 * amt + 120 * amt * p; }
  if (kind === "tiltU") { z = 1.12; y = 70 * amt - 140 * amt * p; }
  if (kind === "tiltD") { z = 1.12; y = -70 * amt + 140 * amt * p; }
  if (kind === "dutch") { z = 1.1 + 0.05 * p; r = -2.5 * amt + 5 * amt * p; }
  return <AbsoluteFill style={{ transformOrigin: `${ox}px ${oy}px`, transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${z})` }}>{children}</AbsoluteFill>;
};

/* ── slam typography (scale-in with chromatic split) ── */
export const Slam: React.FC<{ lt: number; text: string; size?: number; color?: string; top: number; delay?: number; sub?: string; style?: "slam" | "rise" | "type" | "blur" }> = ({ lt, text, size, color, top, delay = 0, sub, style = "slam" }) => {
  const T = useTheme();
  if (lt < delay) return null;
  const d = lt - delay;
  const fs = size ?? Math.max(80, Math.min(190, Math.round(1500 / Math.max(6, [...text.replace(/[*_~]/g, "")].length))));
  const p = clamp(d / 0.22);
  let tf = "", op = clamp(p * 3), filt = "", shown = text;
  if (style === "slam") tf = `scale(${2.4 - 1.4 * Easing.out(Easing.exp)(p)})`;
  if (style === "rise") { const q = eo(clamp(d / 0.4)); tf = `translateY(${(1 - q) * 80}px)`; op = q; }
  if (style === "blur") { const q = eo(clamp(d / 0.5)); filt = `blur(${(1 - q) * 18}px)`; op = q; tf = `scale(${1.1 - 0.1 * q})`; }
  if (style === "type") { const n = Math.ceil(clamp(d / 0.7) * text.length); shown = text.slice(0, Math.max(1, n)); op = 1; }
  const split = style === "slam" ? (1 - p) * 18 + 3 : 0;
  return (
    <div style={{ position: "absolute", top, width: "100%", textAlign: "center", transform: tf, opacity: op, filter: filt, padding: "0 50px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: fontFor(text), fontWeight: 800, fontSize: fs, lineHeight: 1.18, color: color ?? T.ink, textShadow: `${split}px 0 0 rgba(255,40,40,.5), ${-split}px 0 0 rgba(60,200,255,.4), 0 10px 40px rgba(0,0,0,.85)` }}><Rich s={shown} /></div>
      {sub && <div style={{ marginTop: 12, fontFamily: fontFor(sub), fontWeight: 600, fontSize: 40, letterSpacing: /[ऀ-ॿ]/.test(sub) ? 1 : 6, color: T.gold, opacity: clamp((d - 0.3) / 0.3) }}>{sub}</div>}
    </div>
  );
};

/* stacked lines, each slams on its own beat */
export const Lines: React.FC<{ lt: number; lines: string[]; top?: number; gap?: number; stagger?: number; delay?: number; size?: number; style?: any; colors?: string[] }> = ({ lt, lines, top = 600, gap, stagger = 0.6, delay = 0, size, style, colors }) => {
  const sz = size ?? Math.max(90, Math.min(150, Math.round(1300 / Math.max(...lines.map((l) => [...l.replace(/[*_~]/g, "")].length), 6))));
  const g = gap ?? sz * 1.45;
  const t0 = top - ((lines.length - 1) * g) / 2 + 200;
  return <>{lines.map((l, i) => <Slam key={i} lt={lt} delay={delay + i * stagger} text={l} size={sz} top={t0 + i * g} style={style} color={colors?.[i]} />)}</>;
};

export const Stamp: React.FC<{ lt: number; text: string; top: number; color?: string; rot?: number; size?: number }> = ({ lt, text, top, color, rot = -8, size = 100 }) => {
  const T = useTheme();
  if (lt < 0) return null;
  const c = color ?? T.red;
  const p = clamp(lt / 0.16);
  return (
    <div style={{ position: "absolute", top, width: "100%", textAlign: "center", opacity: clamp(p * 2) }}>
      <span style={{ display: "inline-block", transform: `rotate(${rot}deg) scale(${1.8 - 0.8 * eo(p)})`, border: `8px solid ${c}`, color: c, fontFamily: fontFor(text), fontWeight: 800, fontSize: size, padding: "4px 34px", borderRadius: 16, background: "rgba(0,0,0,.5)", boxShadow: `0 0 40px ${c}55` }}>{text}</span>
    </div>
  );
};

export const Chip: React.FC<{ text: string; top: number; lt: number; delay?: number; color?: string }> = ({ text, top, lt, delay = 0, color }) => {
  const T = useTheme();
  const p = eo(clamp((lt - delay) / 0.3));
  return <div style={{ position: "absolute", top, width: "100%", textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
    <span style={{ background: color ?? T.gold, color: "#140808", fontFamily: fontFor(text), fontWeight: 800, fontSize: 56, padding: "6px 32px", borderRadius: 14 }}>{text}</span>
  </div>;
};

/* ── backgrounds & texture ── */
export const Sky: React.FC<{ top?: string; bot?: string }> = ({ top, bot }) => {
  const T = useTheme();
  return <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top ?? T.bg2}, ${bot ?? T.bg})` }} />;
};
export const Embers: React.FC<{ t: number; n?: number; color?: string }> = ({ t, n = 40, color }) => {
  const T = useTheme();
  return <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: n }, (_, i) => {
      const sp = 60 + (i * 37) % 90, ph = (i * 0.37) % 1;
      const y = 1950 - (((t * sp) / 1920 + ph) % 1) * 2100;
      return <circle key={i} cx={(i * 211) % 1080 + Math.sin(t * 1.3 + i) * 30} cy={y} r={1.5 + (i % 4)} fill={color ?? T.ember} opacity={0.35 + (i % 3) * 0.2} />;
    })}
  </svg>;
};
export const Rays: React.FC<{ t: number; cx?: number; cy?: number; n?: number; op?: number }> = ({ t, cx = 540, cy = 900, n = 14, op = 0.08 }) => {
  const T = useTheme();
  return <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 + t * 0.15; return <path key={i} d={`M${cx} ${cy} L${cx + Math.cos(a) * 1500} ${cy + Math.sin(a) * 1500} L${cx + Math.cos(a + 0.12) * 1500} ${cy + Math.sin(a + 0.12) * 1500}Z`} fill={T.gold} opacity={op} />; })}
  </svg>;
};
export const Stars: React.FC<{ t: number; n?: number }> = ({ t, n = 40 }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: n }, (_, i) => <circle key={i} cx={(i * 137) % 1080} cy={160 + ((i * 89) % 640)} r={1.5 + (i % 3)} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 3 + i)} />)}
  </svg>
);
export const Waves: React.FC<{ t: number; y?: number; op?: number }> = ({ t, y = 1100, op = 1 }) => {
  const T = useTheme();
  return <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: op }}>
    {[0, 1, 2, 3].map((k) => <path key={k} d={`M-100 ${y + k * 90} ${Array.from({ length: 14 }, (_, i) => `Q ${i * 100 - 50 + ((t * (40 + k * 30)) % 100)} ${y - 20 + k * 90} ${i * 100 + ((t * (40 + k * 30)) % 100)} ${y + k * 90}`).join(" ")} L1200 1920 L-100 1920Z`} fill={T.water} opacity={0.18 + k * 0.12} />)}
  </svg>;
};
export const Flames: React.FC<{ t: number; y?: number }> = ({ t, y = 1500 }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
    {Array.from({ length: 26 }, (_, i) => { const x = (i * 43) % 1080, h = 260 + 160 * Math.abs(Math.sin(t * 4 + i * 1.7)); return <path key={i} d={`M${x - 40} ${y} Q${x - 10 + Math.sin(t * 6 + i) * 20} ${y - h * 0.6} ${x} ${y - h} Q${x + 10 + Math.sin(t * 5 + i) * 20} ${y - h * 0.5} ${x + 40} ${y}Z`} fill={i % 3 ? "#ff6a1a" : "#ffc04d"} opacity={0.55} />; })}
    <rect x={0} y={y} width={1080} height={1920 - y} fill="#1a0500" />
  </svg>
);
export const Heart: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  const T = useTheme();
  return <svg width="1080" height="200" style={{ position: "absolute", top }}>
    <path d={`M0 100 ${Array.from({ length: 54 }, (_, i) => { const x = i * 20; const ph = (x / 1080 + t * 0.8) % 1; return `L${x} ${ph > 0.48 && ph < 0.52 ? 20 : ph > 0.52 && ph < 0.55 ? 170 : 100}`; }).join(" ")}`} fill="none" stroke={T.red} strokeWidth={6} />
  </svg>;
};
export const Grain: React.FC<{ f: number }> = ({ f }) => (
  <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.22, pointerEvents: "none" }}>
    <filter id={`g${f % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 6} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="1080" height="1920" filter={`url(#g${f % 6})`} />
  </svg>
);
export const Vignette: React.FC<{ k?: number }> = ({ k = 0.75 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 65% at 50% 45%, transparent 45%, rgba(0,0,0,${k}) 100%)`, pointerEvents: "none" }} />;
export const LightLeak: React.FC<{ t: number }> = ({ t }) => <AbsoluteFill style={{ background: `linear-gradient(${110 + Math.sin(t * 0.4) * 20}deg, transparent 30%, rgba(255,140,60,${0.1 + 0.06 * Math.sin(t * 0.9)}) 50%, transparent 70%)`, mixBlendMode: "screen" }} />;
export const Glow: React.FC<{ x: number; y: number; r: number; c1: string; c2: string; op?: number }> = ({ x, y, r, c1, c2, op = 0.85 }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: `radial-gradient(circle, ${c1}, ${c2} 55%, transparent 70%)`, opacity: op }} />
);

/* ── impact shake / flash ── */
export const shake = (t: number, impacts: number[]) => {
  let x = 0, y = 0, r = 0;
  for (const s of impacts) { const d = t - s; if (d >= 0 && d < 0.5) { const k = Math.exp(-d * 9) * 22; x += Math.sin(d * 90) * k; y += Math.cos(d * 70) * k * 0.7; r += Math.sin(d * 60) * k * 0.02; } }
  return { x, y, r };
};
export const flashA = (t: number, impacts: number[]) => { let a = 0; for (const s of impacts) { const d = t - s; if (d >= 0 && d < 0.15) a = Math.max(a, 1 - d / 0.15); } return a * 0.5; };
