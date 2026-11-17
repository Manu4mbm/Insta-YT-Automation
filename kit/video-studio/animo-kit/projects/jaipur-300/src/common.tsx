import React from "react";
import { Img, staticFile, Easing, continueRender, delayRender } from "remotion";
import data from "./data.json";

export const D: any = data;
export const PL = D.places as Record<string, [number, number]>;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eio = Easing.inOut(Easing.cubic);
export const eout = Easing.out(Easing.cubic);
export const back = Easing.out(Easing.back(1.7));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const GOLD = "#f2c94c";
export const INK = "#2b2414";
export const PINK = "#e58d8a";
export const SERIF = "Cinzel, serif";
export const ITAL = "'Cormorant Garamond', serif";
export const DEV = "'Noto Serif Devanagari', serif";

const fontHandle = typeof window !== "undefined" ? delayRender("fonts") : 0;
if (typeof window !== "undefined") {
  const faces = [
    new FontFace("Cinzel", `url(${staticFile("cinzel-latin-700-normal.woff2")})`, { weight: "700" }),
    new FontFace("Cinzel", `url(${staticFile("cinzel-latin-900-normal.woff2")})`, { weight: "900" }),
    new FontFace("Cormorant Garamond", `url(${staticFile("cormorant-garamond-latin-600-italic.woff2")})`, { weight: "600", style: "italic" }),
    new FontFace("Noto Serif Devanagari", `url(${staticFile("noto-serif-devanagari-devanagari-800-normal.woff2")})`, { weight: "800" }),
  ];
  Promise.all(faces.map((f) => f.load().then((ff) => (document as any).fonts.add(ff)))).then(() => continueRender(fontHandle));
}

// keyframe interpolation: [t, value]
export const keys = (t: number, ks: [number, number][], ease = eio) => {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 0; i < ks.length - 1; i++) {
    const [a, va] = ks[i], [b, vb] = ks[i + 1];
    if (t <= b) return lerp(va, vb, ease(ramp(t, a, b)));
  }
  return ks[ks.length - 1][1];
};
type CK = [number, number, number, number];
export const camAt = (t: number, ks: CK[]) => {
  let i = 0;
  while (i < ks.length - 2 && t > ks[i + 1][0]) i++;
  const a = ks[i], b = ks[i + 1];
  const travel = Math.min(1.4, b[0] - a[0]);
  const k = eio(ramp(t, b[0] - travel, b[0]));
  const drift = ramp(t, a[0], b[0] - travel) * 0.035;
  return { x: lerp(a[1], b[1], k), y: lerp(a[2], b[2], k), z: lerp(a[3], b[3], k) * (1 + drift) };
};

export type MapOpts = { year: number; walledDraw?: number; grid?: number; gates?: number; pink?: number; mi?: number; metro?: number; river?: number; unesco?: number; route?: number; capital?: number; pins: { at: [number, number]; name: string; k: number; color?: string; size?: number }[]; z: number };

export const JaipurMap: React.FC<MapOpts> = (o) => {
  const pulse = 0.5;
  const wc = PL.wc;
  const s = 1 / Math.max(0.7, Math.pow(o.z, 0.85)); // keep labels readable at any zoom
  const mp: number[][] = D.metroPts;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: D.W, height: D.H }}>
      <div style={{ position: "absolute", left: -3000, top: -3000, width: D.W + 6000, height: D.H + 6000, background: "#b3a873" }} />
      <svg width={D.W} height={D.H} viewBox={`0 0 ${D.W} ${D.H}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          <clipPath id="wcl"><path d={D.walled} /></clipPath>
          <filter id="gl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>
        <rect x={-3000} y={-3000} width={D.W + 6000} height={D.H + 6000} fill="#bdb27e" />
        {Object.values(D.roads as Record<string, string>).map((d, i) => <path key={i} d={d} fill="none" stroke="#7a6a44" strokeWidth={6} opacity={0.55} />)}
        <path d={D.river} fill="none" stroke="#6fb7bb" strokeWidth={7} opacity={0.55} />
        {o.river ? <g opacity={o.river}><path d={D.river} fill="none" stroke="#7fe0f0" strokeWidth={46} opacity={0.55} filter="url(#gl)" /><path d={D.river} fill="none" stroke="#1f8fb0" strokeWidth={16} /></g> : null}
        <path d={D.hills} fill="#a4925e" stroke="#5a5132" strokeWidth={2} />
        {D.wards.map((w: any, i: number) => {
          const k = ramp(o.year, w.y - 4, w.y + 1);
          if (k <= 0) return null;
          const col = w.y < 1942 ? "#e7b08f" : w.y < 1960 ? "#e0a83a" : w.y < 1990 ? "#cdb86a" : "#a7b67e";
          return <path key={i} d={w.d} fill={col} stroke="#5a4a2a" strokeWidth={1.6} opacity={0.88 * k} />;
        })}
        {/* walled city */}
        <path d={D.walled} fill={PINK} opacity={0.35 + 0.55 * (o.pink ?? 0)} />
        <path d={D.walled} fill="none" stroke="#ffb3a8" strokeWidth={26} opacity={0.6 * (o.pink ?? 0)} filter="url(#gl)" />
        {o.grid ? (
          <g clipPath="url(#wcl)" opacity={o.grid}>
            {[1, 2].map((i) => <line key={"v" + i} x1={wc[0] - 140 + i * 93} y1={wc[1] - 160} x2={wc[0] - 140 + i * 93} y2={wc[1] + 160} stroke="#7a1e16" strokeWidth={4} strokeDasharray="12 7" />)}
            {[1, 2].map((i) => <line key={"h" + i} x1={wc[0] - 170} y1={wc[1] - 135 + i * 85} x2={wc[0] + 170} y2={wc[1] - 135 + i * 85} stroke="#7a1e16" strokeWidth={4} strokeDasharray="12 7" />)}
          </g>
        ) : null}
        <path d={D.walled} fill="none" stroke="#7a1e16" strokeWidth={7 + 5 * (o.gates ?? 0)} strokeDasharray="1400" strokeDashoffset={1400 * (1 - (o.walledDraw ?? 1))} />
        {o.unesco ? <path d={D.walled} fill="none" stroke={GOLD} strokeWidth={14} opacity={o.unesco} filter="url(#gl)" /> : null}
        {o.mi ? <path d={D.mi} fill="none" stroke="#2b2414" strokeWidth={9} strokeDasharray="400" strokeDashoffset={400 * (1 - o.mi)} /> : null}
        {o.metro ? (
          <g>
            <path d={D.metro} fill="none" stroke="#e05a8a" strokeWidth={22} opacity={0.35} filter="url(#gl)" strokeDasharray="1200" strokeDashoffset={1200 * (1 - o.metro)} />
            <path d={D.metro} fill="none" stroke="#d6336c" strokeWidth={10} strokeDasharray="1200" strokeDashoffset={1200 * (1 - o.metro)} />
            {mp.map((p, i) => (i / (mp.length - 1) <= o.metro! + 0.01 ? <circle key={i} cx={p[0]} cy={p[1]} r={11} fill="#fff" stroke="#d6336c" strokeWidth={5} /> : null))}
          </g>
        ) : null}
        {o.route ? <path d={`M${PL.amer[0]},${PL.amer[1]} Q${PL.amer[0] + 30},${(PL.amer[1] + wc[1]) / 2} ${wc[0]},${wc[1] - 40}`} fill="none" stroke="#7a1e16" strokeWidth={8} strokeDasharray="20 14" pathLength={1000} strokeDashoffset={0} opacity={o.route} /> : null}
        {o.capital ? (
          <g opacity={o.capital} transform={`translate(${wc[0] + 150},${wc[1] - 150}) scale(${s * 1.6})`}>
            <path d="M0,-34 L10,-10 L36,-10 L15,6 L23,32 L0,16 L-23,32 L-15,6 L-36,-10 L-10,-10 Z" fill={GOLD} stroke="#5a4210" strokeWidth={4} />
          </g>
        ) : null}
        {o.pins.map((p, i) =>
          p.k <= 0.01 ? null : (
            <g key={i} opacity={clamp(p.k * 1.4)} transform={`translate(${p.at[0]},${p.at[1]}) scale(${s * back(clamp(p.k))})`}>
              <circle r={13} fill="#f2e8cb" stroke={p.color ?? "#7a1e16"} strokeWidth={5} />
              <circle r={5} fill={p.color ?? "#7a1e16"} />
              {p.name === "" && <text y={58} textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize={p.size ?? 40} letterSpacing={3} fill={p.color ?? "#7a1e16"} stroke="#efe6c2" strokeWidth={9} paintOrder="stroke">HAWA MAHAL</text>}
              {p.name && <text y={-26} textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize={p.size ?? 40} letterSpacing={3} fill={p.color ?? "#7a1e16"} stroke="#efe6c2" strokeWidth={9} paintOrder="stroke">{p.name}</text>}
            </g>
          ),
        )}
      </svg>
      <Img src={staticFile("parchment.png")} style={{ position: "absolute", left: -1200, top: -1200, width: D.W + 2400, height: D.H + 2400, mixBlendMode: "multiply", opacity: 0.5 }} />
    </div>
  );
};

export const Card: React.FC<{ k: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ k, style, children }) =>
  k <= 0.001 ? null : <div style={{ position: "absolute", opacity: clamp(k * 1.3), background: "linear-gradient(160deg,#f2e8cb,#dccb9b)", border: "3px solid #8a7240", borderRadius: 10, boxShadow: "0 18px 50px rgba(0,0,0,.6)", ...style }}>{children}</div>;

export const Badge: React.FC<{ t: number; a: number; b: number; title: string; sub?: string; x?: number; y?: number; size?: number }> = ({ t, a, b, title, sub, x = 60, y = 150, size = 48 }) => {
  const k = back(ramp(t, a, a + 0.45)) * (1 - ramp(t, b - 0.3, b));
  if (k <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: "left top", opacity: clamp(k * 1.4), background: "linear-gradient(#efe4c4,#d9c99a)", border: "3px solid #8a7240", borderRadius: 6, padding: "14px 26px 12px", boxShadow: "0 10px 30px rgba(0,0,0,.55)" }}>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: size, color: INK, letterSpacing: 2, whiteSpace: "nowrap" }}>{title}</div>
      {sub && <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: size * 0.68, color: "#5a4a2a", whiteSpace: "nowrap" }}>{sub}</div>}
    </div>
  );
};

export const Stamp: React.FC<{ k: number; text: string; size?: number; color?: string; style?: React.CSSProperties }> = ({ k, text, size = 60, color = "#b3261e", style }) =>
  k <= 0.001 ? null : <div style={{ position: "absolute", transform: `scale(${lerp(2, 1, eout(clamp(k)))}) rotate(-5deg)`, opacity: clamp(k * 2), border: `6px solid ${color}`, color, fontFamily: SERIF, fontWeight: 900, fontSize: size, padding: "6px 24px", borderRadius: 8, letterSpacing: 3, background: "rgba(255,240,220,.18)", whiteSpace: "nowrap", ...style }}>{text}</div>;

// simple monument icons
export const Icon: React.FC<{ kind: string; w?: number }> = ({ kind, w = 180 }) => {
  const st = { fill: "#f2e8cb", stroke: "#2b2414", strokeWidth: 4, strokeLinejoin: "round" as const };
  if (kind === "hawa")
    return (
      <svg width={w} height={w} viewBox="0 0 200 200">
        <path d="M20 190 L20 110 L40 110 L40 80 L60 80 L60 50 L80 50 L80 25 L100 10 L120 25 L120 50 L140 50 L140 80 L160 80 L160 110 L180 110 L180 190 Z" {...st} fill="#e8a08f" />
        {Array.from({ length: 5 }).map((_, r) => Array.from({ length: 7 - r }).map((__, c) => <rect key={r + "-" + c} x={30 + r * 10 + c * 21} y={170 - r * 30} width={12} height={16} rx={6} fill="#7a3a2e" />))}
      </svg>
    );
  if (kind === "jantar")
    return (
      <svg width={w} height={w} viewBox="0 0 200 200">
        <path d="M20 180 L120 40 L120 180 Z" {...st} fill="#e8c79a" />
        <path d="M120 180 L120 140 A60 60 0 0 1 180 180 Z" {...st} fill="#d9b07a" />
        <line x1="120" y1="40" x2="120" y2="180" stroke="#2b2414" strokeWidth={4} />
        {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={40 + i * 14} y1={152 - i * 19.5} x2={52 + i * 14} y2={152 - i * 19.5} stroke="#2b2414" strokeWidth={3} />)}
      </svg>
    );
  if (kind === "albert")
    return (
      <svg width={w} height={w} viewBox="0 0 200 200">
        <rect x="20" y="110" width="160" height="70" {...st} fill="#efe0c0" />
        <path d="M70 110 Q100 40 130 110 Z" {...st} fill="#e8c79a" />
        <path d="M30 110 Q45 80 60 110 Z M140 110 Q155 80 170 110 Z" {...st} fill="#e8c79a" />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${38 + i * 30} 180 L${38 + i * 30} 140 Q${50 + i * 30} 126 ${62 + i * 30} 140 L${62 + i * 30} 180`} fill="#7a3a2e" />)}
      </svg>
    );
  if (kind === "metro")
    return (
      <svg width={w * 1.6} height={w * 0.7} viewBox="0 0 320 140">
        <rect x="10" y="20" width="300" height="90" rx="26" {...st} fill="#f6d6e1" />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={36 + i * 54} y={38} width={40} height={30} rx={6} fill="#2b2414" />)}
        <rect x="10" y="78" width="300" height="12" fill="#d6336c" />
        {[60, 130, 190, 260].map((x) => <circle key={x} cx={x} cy={118} r={14} fill="#2b2414" />)}
      </svg>
    );
  if (kind === "people")
    return (
      <svg width={w} height={w * 0.6} viewBox="0 0 200 120">
        {[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${20 + i * 40},${i % 2 ? 10 : 0})`}><circle cx="20" cy="30" r="14" {...st} /><path d="M0 110 Q0 55 20 55 Q40 55 40 110 Z" {...st} /></g>)}
      </svg>
    );
  return null;
};

export type Grp = { words: [string, number, number][]; s: number; e: number };
export const groups = (ws: [string, number, number][], n = 3): Grp[] => {
  const out: Grp[] = [];
  let cur: [string, number, number][] = [];
  for (let i = 0; i < ws.length; i++) {
    cur.push(ws[i]);
    const endPunct = /[।?,.]$|\.\.\.$/.test(ws[i][0]);
    const gap = ws[i + 1] ? ws[i + 1][1] - ws[i][2] : 9;
    if (cur.length >= n || endPunct || gap > 0.35) {
      out.push({ words: cur, s: cur[0][1], e: cur[cur.length - 1][2] });
      cur = [];
    }
  }
  if (cur.length) out.push({ words: cur, s: cur[0][1], e: cur[cur.length - 1][2] });
  return out;
};
const HI = /(\d|सत्रह|अठारह|उन्नीस|हज़ार|जयपुर|परकोटा|परकोटे|गुलाबी|पिंक|हवा|जंतर|मेट्रो|यूनेस्को|राजधानी|विद्याधर|आमेर|तीन|सौवें|लाख|बयासी|बयालीस|उनचास|छिहत्तर|निन्यानवे|चौंतीस)/;
export const Captions: React.FC<{ t: number; gs: Grp[]; top: number; size: number; until?: number }> = ({ t, gs, top, size, until = 1e9 }) => {
  if (t > until) return null;
  const i = gs.findIndex((g, j) => t >= g.s - 0.06 && t < (gs[j + 1] ? Math.min(gs[j + 1].s - 0.06, g.e + 0.7) : g.e + 0.8));
  if (i < 0) return null;
  const g = gs[i];
  return (
    <div style={{ position: "absolute", top, left: 40, right: 40, textAlign: "center", lineHeight: 1.3 }}>
      {g.words.map(([w, s], j) => {
        const k = back(ramp(t, s - 0.05, s + 0.15));
        if (k <= 0) return null;
        return (
          <span key={j} style={{ display: "inline-block", margin: "0 10px", transform: `translateY(${(1 - k) * 20}px) scale(${0.86 + 0.14 * k})`, opacity: clamp(k * 1.5), fontFamily: DEV, fontWeight: 800, fontSize: size, color: HI.test(w) ? GOLD : "#fbf6ea", textShadow: "0 3px 0 #2a2010, 0 6px 18px rgba(0,0,0,.95)" }}>
            {w.replace(/[।,]+$/, "").replace(/\.\.\.$/, "")}
          </span>
        );
      })}
    </div>
  );
};

export const YearCard: React.FC<{ year: number; style?: React.CSSProperties; size?: number }> = ({ year, style, size = 96 }) => (
  <div style={{ position: "absolute", background: "linear-gradient(160deg,#f2e8cb,#dccb9b)", border: "3px solid #8a7240", borderRadius: 10, boxShadow: "0 14px 40px rgba(0,0,0,.6)", padding: "6px 26px 10px", textAlign: "center", ...style }}>
    <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: size * 0.3, color: "#5a4a2a" }}>saal</div>
    <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: size, color: INK, lineHeight: 1 }}>{Math.round(year)}</div>
  </div>
);
