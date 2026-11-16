import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, Easing, continueRender, delayRender } from "remotion";
import geo from "./geo.json";
import { GROUPS, HILITE } from "./timeline";

const G: any = geo;
const P = G.places as Record<string, [number, number]>;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eio = Easing.inOut(Easing.cubic);
const eout = Easing.out(Easing.cubic);
const back = Easing.out(Easing.back(1.7));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const mix = (c1: number[], c2: number[], k: number) => `rgb(${c1.map((v, i) => Math.round(lerp(v, c2[i], k))).join(",")})`;

const GOLD = "#f2c94c";
const SAFFRON = [240, 138, 36];
const INK = "#2b2414";
const SERIF = "Cinzel, serif";
const ITAL = "'Cormorant Garamond', serif";

// ---------- fonts ----------
const fontHandle = typeof window !== "undefined" ? delayRender("fonts") : 0;
if (typeof window !== "undefined") {
  const faces = [
    new FontFace("Cinzel", `url(${staticFile("cinzel-latin-700-normal.woff2")})`, { weight: "700" }),
    new FontFace("Cinzel", `url(${staticFile("cinzel-latin-900-normal.woff2")})`, { weight: "900" }),
    new FontFace("Cormorant Garamond", `url(${staticFile("cormorant-garamond-latin-600-italic.woff2")})`, { weight: "600", style: "italic" }),
  ];
  Promise.all(faces.map((f) => f.load().then((ff) => (document as any).fonts.add(ff)))).then(() => continueRender(fontHandle));
}

// ---------- camera ----------
const full = [1120, 1200];
const jkC = [P.srinagar[0] + 60, P.srinagar[1] - 10];
type K = [number, number, number, number];
const KEYS: K[] = [
  [0, 1100, 1160, 0.66], [5.6, 1100, 1190, 0.62], [16.9, 1110, 1200, 0.62],
  [18.3, P.delhi[0], P.delhi[1] + 60, 1.32], [22.7, P.delhi[0], P.delhi[1] + 40, 1.45],
  [24.0, P.delhi[0], P.delhi[1] + 120, 1.05], [30.3, P.delhi[0] - 40, P.delhi[1] + 160, 0.98],
  [31.6, full[0], full[1], 0.62], [36.0, full[0], full[1] + 10, 0.6],
  [37.4, P.jun[0] + 30, P.jun[1] + 10, 2.2], [42.3, P.jun[0] + 30, P.jun[1], 2.4],
  [43.6, P.hyd[0], P.hyd[1] + 30, 1.95], [50.4, P.hyd[0], P.hyd[1] + 20, 2.1],
  [51.7, jkC[0], jkC[1] + 40, 1.45], [57.9, jkC[0], jkC[1] + 30, 1.6],
  [59.3, full[0], full[1], 0.6], [65.6, full[0], full[1] - 10, 0.57], [71.7, full[0], full[1] - 20, 0.54],
];
const cam = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  // hold on each key, travel during the last 1.3 s before the next key (or the whole gap if shorter)
  const travel = Math.min(1.3, b[0] - a[0]);
  const k = eio(ramp(t, b[0] - travel, b[0]));
  const slow = ramp(t, a[0], b[0] - travel) * 0.04;
  return { x: lerp(a[1], b[1], k), y: lerp(a[2], b[2], k), z: lerp(a[3], b[3], k) * (1 + slow) };
};
const SHAKES = [4.79, 46.8, 60.55];

// ---------- small pieces ----------
const Badge: React.FC<{ t: number; a: number; b: number; title: string; sub?: string; x?: number; y?: number }> = ({ t, a, b, title, sub, x = 70, y = 110 }) => {
  const k = back(ramp(t, a, a + 0.45)) * (1 - ramp(t, b - 0.3, b));
  if (k <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: "left top", opacity: clamp(k * 1.4), background: "linear-gradient(#efe4c4,#d9c99a)", border: "3px solid #8a7240", borderRadius: 6, padding: "14px 26px 12px", boxShadow: "0 10px 30px rgba(0,0,0,.55)" }}>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 46, color: INK, letterSpacing: 2, whiteSpace: "nowrap" }}>{title}</div>
      {sub && <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 30, color: "#5a4a2a", textAlign: "center", whiteSpace: "nowrap" }}>{sub}</div>}
    </div>
  );
};

const Card: React.FC<{ k: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ k, style, children }) =>
  k <= 0.001 ? null : (
    <div style={{ position: "absolute", opacity: clamp(k * 1.3), background: "linear-gradient(160deg,#f2e8cb,#dccb9b)", border: "3px solid #8a7240", borderRadius: 10, boxShadow: "0 18px 50px rgba(0,0,0,.6)", ...style }}>{children}</div>
  );

const Stamp: React.FC<{ k: number; text: string; size?: number; style?: React.CSSProperties }> = ({ k, text, size = 54, style }) =>
  k <= 0.001 ? null : (
    <div style={{ position: "absolute", transform: `scale(${lerp(2.2, 1, eout(k))}) rotate(-6deg)`, opacity: clamp(k * 2), border: "6px solid #b3261e", color: "#b3261e", fontFamily: SERIF, fontWeight: 900, fontSize: size, padding: "6px 22px", borderRadius: 8, letterSpacing: 3, background: "rgba(255,240,220,.15)", whiteSpace: "nowrap", ...style }}>{text}</div>
  );

// Upright little Indian Army column with a tricolour flag (stands up out of the tilted map)
const Column: React.FC<{ n?: number }> = ({ n = 12 }) => (
  <svg width="150" height="120" viewBox="0 0 150 120">
    <line x1="18" y1="8" x2="18" y2="70" stroke="#3a2c18" strokeWidth="3" />
    <rect x="19" y="8" width="42" height="9" fill="#ff9933" />
    <rect x="19" y="17" width="42" height="9" fill="#ffffff" />
    <rect x="19" y="26" width="42" height="9" fill="#138808" />
    <circle cx="40" cy="21.5" r="3.4" fill="none" stroke="#000080" strokeWidth="1.2" />
    {Array.from({ length: n }).map((_, i) => {
      const cx = 22 + (i % 6) * 19, cy = 72 + Math.floor(i / 6) * 22;
      return (
        <g key={i}>
          <rect x={cx - 6} y={cy - 4} width="12" height="18" rx="3" fill="#5b6b3a" stroke="#1d2410" strokeWidth="1.5" />
          <circle cx={cx} cy={cy - 9} r="5.5" fill="#c99a6b" stroke="#1d2410" strokeWidth="1.2" />
          <rect x={cx - 6} y={cy - 16} width="12" height="5" fill="#4a5a2e" />
        </g>
      );
    })}
  </svg>
);

const Ballot: React.FC<{ k: number }> = ({ k }) => (
  <svg width="120" height="130" viewBox="0 0 120 130">
    <rect x="35" y={lerp(-10, 34, eout(k))} width="50" height="34" fill="#fff8e6" stroke="#5a4a2a" strokeWidth="3" />
    <rect x="12" y="52" width="96" height="70" rx="6" fill="#7a5a2e" stroke="#2b2414" strokeWidth="4" />
    <rect x="30" y="50" width="60" height="8" fill="#2b2414" />
    <text x="60" y="98" textAnchor="middle" fontFamily="Cinzel" fontWeight="900" fontSize="18" fill="#f2e8cb">VOTE</text>
  </svg>
);

const Crown: React.FC = () => (
  <svg width="64" height="48" viewBox="0 0 64 48">
    <path d="M6 40 L10 12 L22 26 L32 6 L42 26 L54 12 L58 40 Z" fill={GOLD} stroke="#5a4210" strokeWidth="3" strokeLinejoin="round" />
    <rect x="6" y="38" width="52" height="7" fill="#c99a2e" stroke="#5a4210" strokeWidth="2" />
  </svg>
);

// ---------- main ----------
export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const c = cam(t);
  let sx = 0, sy = 0;
  for (const s of SHAKES) {
    const k = 1 - ramp(t, s, s + 0.55);
    if (t >= s && k > 0) { sx += Math.sin(t * 90) * 14 * k; sy += Math.cos(t * 77) * 10 * k; }
  }

  const hatch = useMemo(() => {
    const out: string[] = [];
    for (const name of ["himalaya", "ghats", "vindhya"]) {
      const pts: number[][] = G.hills[name];
      for (let i = 0; i < pts.length - 1; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
        const L = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(L / 13);
        const ux = (x2 - x1) / L, uy = (y2 - y1) / L;
        for (let j = 0; j < n; j++) {
          const px = x1 + ux * j * 13, py = y1 + uy * j * 13;
          const h = name === "himalaya" ? 26 : 16;
          const wob = ((j * 37) % 7) - 3;
          out.push(`M${(px - uy * 2).toFixed(1)},${(py + ux * 2).toFixed(1)} L${(px + ux * 6 - uy * (h + wob)).toFixed(1)},${(py + uy * 6 + ux * -(h + wob)).toFixed(1)} L${(px + ux * 12).toFixed(1)},${(py + uy * 12).toFixed(1)}`);
        }
      }
    }
    return out.join(" ");
  }, []);

  // ---- per-element timing ----
  const dotsIn = (i: number) => ramp(t, 6.35 + (i / 562) * 2.7, 6.35 + (i / 562) * 2.7 + 0.25);
  const joinT = (dd: number) => 30.9 + clamp(dd / 2300) * 2.8;
  const mergeK = eio(ramp(t, 60.4, 61.6));
  const indiaSaff = mergeK;
  const pakK = ramp(t, 15.01, 15.5) * (1 - ramp(t, 16.9, 17.6)) + 0.35;
  const pulse = 0.5 + 0.5 * Math.sin(t * 7);
  const junJoin = ramp(t, 40.4, 41.2), hydJoin = ramp(t, 48.4, 49.4), jkJoin = ramp(t, 56.2, 57.0);
  const holdK = ramp(t, 34.5, 35.0) * (1 - mergeK);
  const routeW = 0.8 * eio(ramp(t, 44.0, 46.8)), routeE = 0.8 * eio(ramp(t, 44.3, 46.8));
  const clash = ramp(t, 46.8, 47.6);
  const ink = (base: number[], k: number) => mix(base, SAFFRON, k);

  // route geometry for Operation Polo
  const rW = [P.sholapur, P.hyd], rE = [P.vijayawada, P.hyd];
  const along = (r: number[][], k: number) => [lerp(r[0][0], r[1][0], k), lerp(r[0][1], r[1][1], k)];
  const lenOf = (r: number[][]) => Math.hypot(r[1][0] - r[0][0], r[1][1] - r[0][1]);

  // upright figurine helper (inside the tilted plane); size counter-scaled a little against zoom
  const Up: React.FC<{ at: number[]; children: React.ReactNode; k?: number; s?: number }> = ({ at, children, k = 1, s = 1 }) =>
    k <= 0.001 ? null : (
      <div style={{ position: "absolute", left: at[0], top: at[1], transform: `translate(-50%,-100%) rotateX(-26deg) scale(${(s * lerp(0.4, 1, back(clamp(k)))) / Math.max(0.8, c.z)})`, transformOrigin: "50% 100%", opacity: clamp(k * 1.5) }}>
        {children}
      </div>
    );

  const City: React.FC<{ at: number[]; name: string; k?: number; sub?: string; size?: number; color?: string }> = ({ at, name, k = 1, sub, size = 30, color = "#2b2414" }) =>
    k <= 0.001 ? null : (
      <g opacity={k}>
        <circle cx={at[0]} cy={at[1]} r={9} fill="#f2e8cb" stroke={color} strokeWidth={3.5} />
        <circle cx={at[0]} cy={at[1]} r={3.5} fill={color} />
        <text x={at[0]} y={at[1] - 18} textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize={size} letterSpacing={4} fill={color} stroke="#efe6c2" strokeWidth={5} paintOrder="stroke">{name}</text>
        {sub && <text x={at[0]} y={at[1] + 38} textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontWeight={600} fontSize={size * 0.8} fill="#3a301a" stroke="#efe6c2" strokeWidth={4} paintOrder="stroke">{sub}</text>}
      </g>
    );

  const ring = (at: number[], k: number, col: string, r0 = 30) =>
    k <= 0.001 ? null : (
      <g opacity={k}>
        <circle cx={at[0]} cy={at[1]} r={r0 + pulse * 14} fill="none" stroke={col} strokeWidth={6} opacity={0.9 - pulse * 0.4} />
        <circle cx={at[0]} cy={at[1]} r={r0 * 0.45} fill={col} opacity={0.85} />
      </g>
    );

  // ---- caption ----
  const grp = GROUPS.find((g, i) => t >= g.s - 0.05 && t < (GROUPS[i + 1] ? Math.min(GROUPS[i + 1].s - 0.05, g.e + 0.6) : g.e + 0.8));
  const showCaps = t < 65.7;

  return (
    <AbsoluteFill style={{ background: "#0b0e12" }}>
      <Img src={staticFile("table.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
      {/* tilted map table */}
      <div style={{ position: "absolute", inset: 0, perspective: 2100, perspectiveOrigin: "50% 35%" }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `translate(${sx}px,${sy}px) rotateX(26deg)`, transformOrigin: "50% 62%" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: G.W, height: G.H, transformStyle: "preserve-3d", transformOrigin: "0 0", transform: `translate(${540 - c.x * c.z}px, ${1010 - c.y * c.z}px) scale(${c.z})`, boxShadow: "0 60px 120px rgba(0,0,0,.8)" }}>
            <svg width={G.W} height={G.H} viewBox={`0 0 ${G.W} ${G.H}`} style={{ position: "absolute", left: 0, top: 0 }}>
              <defs>
                <clipPath id="ind"><path d={G.india} /></clipPath>
                <radialGradient id="sea" cx="55%" cy="45%" r="70%"><stop offset="0" stopColor="#2f6a6e" /><stop offset="1" stopColor="#1d4448" /></radialGradient>
                <pattern id="hatchR" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="18" height="18" fill="#a1342a" opacity="0.35" /><line x1="0" y1="0" x2="0" y2="18" stroke="#7a1e16" strokeWidth="6" opacity="0.7" /></pattern>
                <pattern id="hatchY" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="16" height="16" fill="#c9a43c" opacity="0.4" /><line x1="0" y1="0" x2="0" y2="16" stroke="#8a6a1a" strokeWidth="5" opacity="0.6" /></pattern>
                <pattern id="hatchG" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="18" height="18" fill="#4f7246" opacity="0.45" /><line x1="0" y1="0" x2="0" y2="18" stroke="#2f4a2a" strokeWidth="5" opacity="0.55" /></pattern>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
              </defs>
              <rect width={G.W} height={G.H} fill="url(#sea)" />
              <path d={G.land} fill="none" stroke="#d6d8a8" strokeWidth={22} opacity={0.18} />
              <path d={G.land} fill="#8c8a57" stroke="#4d4a2c" strokeWidth={2} />
              <path d={G.pak} fill="#7f8a55" stroke="#3b3a22" strokeWidth={3} />
              <path d={G.bdesh} fill="#7f8a55" stroke="#3b3a22" strokeWidth={3} />
              <path d={G.pak} fill="url(#hatchG)" opacity={pakK} />
              <path d={G.bdesh} fill="url(#hatchG)" opacity={pakK} />
              <path d={G.india} fill="none" stroke="#e2e2b0" strokeWidth={24} opacity={0.22} />
              <path d={G.india} fill={ink([170, 165, 104], 0)} />
              {/* saffron unification fill */}
              <path d={G.india} fill="rgb(240,138,36)" opacity={0.62 * indiaSaff} />
              <path d={G.india} fill="none" stroke="#ffb347" strokeWidth={16} opacity={0.8 * indiaSaff * (0.7 + 0.3 * pulse)} filter="url(#glow)" />
              {/* hills */}
              <path d={hatch} fill="none" stroke="#5a5132" strokeWidth={2.6} strokeLinejoin="round" opacity={0.85} />
              {/* rivers */}
              {Object.entries(G.rivers as Record<string, string>).map(([n, d]) => (
                <g key={n}>
                  <path d={d} fill="none" stroke="#9ff3f5" strokeWidth={9} opacity={0.18} />
                  <path d={d} fill="none" stroke="#7ad8de" strokeWidth={3.4} />
                </g>
              ))}
              {/* holdouts */}
              <path d={G.jun} fill={junJoin > 0 ? ink([180, 50, 40], junJoin) : "url(#hatchR)"} opacity={(holdK + junJoin) > 0 ? Math.max(holdK, junJoin) * (1 - mergeK) : 0} stroke="#7a1e16" strokeWidth={3} />
              <path d={G.hyd} fill={hydJoin > 0 ? ink([201, 164, 60], hydJoin) : "url(#hatchY)"} opacity={Math.max(ramp(t, 34.5, 35) , hydJoin) * (1 - mergeK) * (hydJoin > 0 ? 0.75 : 1)} stroke="#6a4e10" strokeWidth={4} strokeDasharray="14 8" />
              <g clipPath="url(#ind)">
                <path d={G.jk} fill={jkJoin > 0 ? ink([180, 50, 40], jkJoin) : "url(#hatchR)"} opacity={Math.max(holdK, jkJoin) * (1 - mergeK) * (jkJoin > 0 ? 0.75 : 1)} />
              </g>
              <path d={G.india} fill="none" stroke="#3e3820" strokeWidth={3} />
              {/* princely-state dots */}
              {G.dots.map((d: any, i: number) => {
                const a = dotsIn(i);
                if (a <= 0) return null;
                const j = ramp(t, joinT(d.dd), joinT(d.dd) + 0.35);
                const r = ((5.5 + 3 * (1 - a)) / Math.max(1, Math.pow(c.z, 0.8))) * (1 - mergeK) * (1 + 0.6 * Math.max(0, 1 - Math.abs(t - joinT(d.dd) - 0.15) * 6));
                if (r <= 0.1) return null;
                return <circle key={i} cx={d.x} cy={d.y} r={r} fill={j > 0 ? ink([236, 219, 160], j) : "#ecdba0"} stroke="#3a2c14" strokeWidth={1.6} opacity={a} />;
              })}
              {/* labels */}
              <text x={P.indiaL[0]} y={P.indiaL[1]} textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize={70} letterSpacing={26} fill={ink([58, 50, 26], ramp(t, 14.2, 14.5) * (1 - ramp(t, 16.9, 17.5)) + mergeK)} opacity={0.75 + 0.25 * ramp(t, 14.2, 14.5)} stroke="#efe6c2" strokeWidth={ramp(t, 14.2, 14.5) * 6} paintOrder="stroke">BHARAT</text>
              <text x={P.pakW[0]} y={P.pakW[1]} textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize={44} letterSpacing={12} fill="#2f3a20" opacity={0.6 + 0.4 * pakK}>PAKISTAN</text>
              <text x={P.pakE[0]} y={P.pakE[1] + 60} textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontWeight={600} fontSize={34} fill="#2f3a20" opacity={0.6 + 0.4 * pakK}>East Pakistan</text>
              <text x={P.arab[0]} y={P.arab[1]} textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontWeight={600} fontSize={52} letterSpacing={8} fill="#a9d6d4" opacity={0.75}>Arabian Sea</text>
              <text x={P.bay[0]} y={P.bay[1]} textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontWeight={600} fontSize={52} letterSpacing={8} fill="#a9d6d4" opacity={0.75}>Bay of Bengal</text>
              <City at={P.delhi} name="DELHI" k={ramp(t, 17.2, 17.8) + 0.55} size={34} />
              {/* holdout rings + labels */}
              {ring(P.jun, holdK * (1 - junJoin), "#c0392b", 34)}
              {ring(P.hyd, holdK * (1 - hydJoin), "#c0392b", 40)}
              {ring(P.srinagar, holdK * (1 - jkJoin), "#c0392b", 40)}
              <City at={P.jun} name="JUNAGADH" k={ramp(t, 34.6, 35.0) * (1 - mergeK)} size={c.z > 2 ? 20 : 30} color="#7a1e16" />
              <City at={P.hyd} name="HYDERABAD" k={ramp(t, 34.8, 35.2) * (1 - mergeK)} size={34} color="#7a1e16" sub={t > 42.7 && t < 50.9 ? "Hyderabad State (approx.)" : undefined} />
              <City at={P.srinagar} name="JAMMU & KASHMIR" k={ramp(t, 35.0, 35.4) * (1 - mergeK)} size={30} color="#7a1e16" />
              {/* Operation Polo routes */}
              {[rW, rE].map((r, i) => {
                const k = i === 0 ? routeW : routeE;
                if (k <= 0 || t > 51) return null;
                const L = lenOf(r);
                return (
                  <g key={i} opacity={1 - ramp(t, 49.5, 50.6)}>
                    <line x1={r[0][0]} y1={r[0][1]} x2={r[1][0]} y2={r[1][1]} stroke="#fff3c4" strokeWidth={14} opacity={0.35} strokeDasharray={`${L * k} ${L}`} filter="url(#glow)" />
                    <line x1={r[0][0]} y1={r[0][1]} x2={r[1][0]} y2={r[1][1]} stroke="#fff6d6" strokeWidth={5} strokeDasharray={`${L * k} ${L}`} />
                    <City at={r[0]} name="" sub={i === 0 ? "Sholapur" : "Vijayawada"} size={30} k={ramp(t, 43.9, 44.3)} />
                  </g>
                );
              })}
              {clash > 0 && clash < 1 && (
                <g>
                  <circle cx={P.hyd[0]} cy={P.hyd[1]} r={20 + clash * 260} fill="none" stroke="#fff2c0" strokeWidth={14 * (1 - clash)} opacity={1 - clash} />
                  <circle cx={P.hyd[0]} cy={P.hyd[1]} r={60 * (1 - clash)} fill="#fff6d6" opacity={(1 - clash) * 0.9} filter="url(#glow)" />
                </g>
              )}
              {/* Patel & Menon: States Department marker */}
              {t > 17.3 && t < 30.6 && <circle cx={P.delhi[0]} cy={P.delhi[1]} r={26 + pulse * 10} fill="none" stroke={GOLD} strokeWidth={5} opacity={ramp(t, 17.4, 18) * (1 - ramp(t, 30, 30.6))} />}
              {/* J&K accession signing marker */}
              {t > 52 && t < 58.4 && <path d={`M${P.srinagar[0] - 70},${P.srinagar[1] + 70} q30,-30 50,0 t50,0 t50,0`} fill="none" stroke="#1d2a6b" strokeWidth={6} strokeDasharray="300" strokeDashoffset={300 * (1 - ramp(t, 52.5, 55.6))} />}
            </svg>
            {/* parchment texture */}
            <Img src={staticFile("parchment.png")} style={{ position: "absolute", left: 0, top: 0, width: G.W, height: G.H, mixBlendMode: "multiply", opacity: 0.55 }} />
            {/* upright figurines */}
            <Up at={[P.jaipur[0], P.jaipur[1] - 6]} k={ramp(t, 9.72, 10.1) * (1 - ramp(t, 16.7, 17.3))} s={1.6}><div style={{ textAlign: "center" }}><Crown /><div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 26, color: INK, background: "#efe4c4", padding: "2px 10px", border: "2px solid #8a7240", borderRadius: 4, whiteSpace: "nowrap" }}>RAJA · JAIPUR</div></div></Up>
            <Up at={[P.bhopal[0], P.bhopal[1] - 6]} k={ramp(t, 10.25, 10.6) * (1 - ramp(t, 16.7, 17.3))} s={1.6}><div style={{ textAlign: "center" }}><Crown /><div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 26, color: INK, background: "#efe4c4", padding: "2px 10px", border: "2px solid #8a7240", borderRadius: 4, whiteSpace: "nowrap" }}>NAWAB · BHOPAL</div></div></Up>
            <Up at={[P.mysore[0], P.mysore[1] - 6]} k={ramp(t, 10.6, 10.95) * (1 - ramp(t, 16.7, 17.3))} s={1.6}><div style={{ textAlign: "center" }}><Crown /><div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 26, color: INK, background: "#efe4c4", padding: "2px 10px", border: "2px solid #8a7240", borderRadius: 4, whiteSpace: "nowrap" }}>MAHARAJA · MYSORE</div></div></Up>
            <Up at={[P.jun[0] + 70, P.jun[1] - 20]} k={ramp(t, 37.8, 38.3) * (1 - ramp(t, 42.2, 42.7))} s={0.75}><Ballot k={ramp(t, 38.5, 39.4)} /></Up>
            <Up at={along(rW, routeW)} k={ramp(t, 43.9, 44.3) * (1 - ramp(t, 49.6, 50.4))} s={1.7}><Column /></Up>
            <Up at={along(rE, routeE)} k={ramp(t, 44.2, 44.6) * (1 - ramp(t, 49.6, 50.4))} s={1.7}><Column /></Up>
          </div>
        </div>
      </div>

      {/* vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,.6) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,.7))" }} />

      {/* hook title (visible from frame 0 = thumbnail) */}
      {t < 6.4 && (
        <div style={{ position: "absolute", top: 190, width: "100%", textAlign: "center", opacity: 1 - ramp(t, 5.8, 6.35) }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 112, color: GOLD, letterSpacing: 4, textShadow: "0 6px 0 #6b4a10, 0 14px 30px rgba(0,0,0,.8)", lineHeight: 1 }}>565 RIYASATEIN</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 74, color: "#fff", letterSpacing: 6, textShadow: "0 5px 18px rgba(0,0,0,.9)", marginTop: 16 }}>EK BHARAT</div>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 44, color: "#efe4c4", marginTop: 10, textShadow: "0 3px 10px #000" }}>Sardar Patel ne desh kaise joda · 1947</div>
        </div>
      )}
      <Badge t={t} a={-1} b={6.3} title="15 AUGUST 1947" sub="Azaadi ka din" x={300} y={1230} />

      {/* counters */}
      {t > 6.3 && t < 17.2 && (
        <Card k={ramp(t, 6.3, 6.7) * (1 - ramp(t, 16.8, 17.2))} style={{ left: 300, top: 170, width: 480, padding: "18px 0 14px", textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 120, color: INK, lineHeight: 1 }}>{Math.round(565 * eout(ramp(t, 6.4, 9.2)))}</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 34, color: "#7a1e16", letterSpacing: 6 }}>RIYASATEIN</div>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 28, color: "#5a4a2a" }}>princely states, 1947</div>
        </Card>
      )}
      {/* India / Pakistan / Azaadi choice */}
      {t > 14.1 && t < 17.3 && (
        <div style={{ position: "absolute", top: 520, width: "100%", display: "flex", justifyContent: "center", gap: 22, opacity: 1 - ramp(t, 16.9, 17.3) }}>
          {[["INDIA", 14.2, "#d9731a"], ["PAKISTAN", 15.01, "#3f6b3a"], ["AZAADI?", 15.98, "#7a1e16"]].map(([w, s, col]) => {
            const k = back(ramp(t, s as number, (s as number) + 0.35));
            return k <= 0 ? null : (
              <div key={w as string} style={{ transform: `scale(${k})`, background: "#efe4c4", border: `5px solid ${col}`, color: col as string, fontFamily: SERIF, fontWeight: 900, fontSize: 46, padding: "10px 22px", borderRadius: 10, boxShadow: "0 10px 26px rgba(0,0,0,.6)" }}>{w as string}</div>
            );
          })}
        </div>
      )}

      {/* Patel & Menon cards */}
      {[["SARDAR VALLABHBHAI PATEL", "Grih Mantri · States Ministry", "SVP", 18.4, 170], ["V. P. MENON", "Secretary, States Department", "VPM", 20.7, 380]].map(([name, role, mono, s, y]) => {
        const k = eout(ramp(t, s as number, (s as number) + 0.5)) * (1 - ramp(t, 22.7, 23.2));
        return (
          <Card key={mono as string} k={k} style={{ left: lerp(-700, 70, k), top: y as number, width: 940, padding: "20px 26px", display: "flex", alignItems: "center", gap: 26 }}>
            <div style={{ width: 120, height: 120, borderRadius: 60, background: "#7a5a2e", border: "5px solid #f2c94c", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 900, fontSize: 40, color: "#f2e8cb" }}>{mono as string}</div>
            <div>
              <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 46, color: INK, lineHeight: 1.05 }}>{name as string}</div>
              <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 36, color: "#5a4a2a" }}>{role as string}</div>
            </div>
          </Card>
        );
      })}

      {/* Instrument of Accession document */}
      {t > 23 && t < 31 && (() => {
        const k = back(ramp(t, 23.1, 23.7)) * (1 - ramp(t, 30.2, 30.8));
        const items = [["RAKSHA", "Defence", 27.9], ["VIDESH", "External Affairs", 28.6], ["SANCHAR", "Communications", 29.35]];
        return (
          <Card k={k} style={{ left: 130, top: 300, width: 820, padding: "34px 40px 40px", transform: `scale(${0.7 + 0.3 * k}) rotate(${lerp(-8, -1.5, k)}deg)` }}>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 54, color: INK, textAlign: "center", lineHeight: 1.1, borderBottom: "3px double #8a7240", paddingBottom: 16 }}>INSTRUMENT OF<br />ACCESSION</div>
            <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 34, color: "#5a4a2a", textAlign: "center", marginTop: 10 }}>Riyasat Bharat ko sirf in vishayon par adhikaar deti hai</div>
            <div style={{ marginTop: 26 }}>
              {items.map(([a, b, s], i) => {
                const q = ramp(t, s as number, (s as number) + 0.3);
                return (
                  <div key={a as string} style={{ display: "flex", alignItems: "center", gap: 20, margin: "16px 0", opacity: 0.25 + 0.75 * q }}>
                    <div style={{ width: 62, height: 62, border: "4px solid #2b2414", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, color: "#1e7a2e", fontWeight: 900, transform: `scale(${q ? back(q) : 1})` }}>{q > 0.05 ? "✓" : ""}</div>
                    <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 52, color: INK }}>{i + 1}. {a as string}</div>
                    <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 36, color: "#5a4a2a" }}>{b as string}</div>
                  </div>
                );
              })}
            </div>
            <Stamp k={ramp(t, 26.34, 26.7)} text="SIRF 3 VISHAY" size={46} style={{ right: -30, top: -40 }} />
            <div style={{ position: "absolute", right: 46, bottom: -40, width: 110, height: 110, borderRadius: 55, background: "radial-gradient(#c0392b,#7a1e16)", boxShadow: "0 6px 14px rgba(0,0,0,.5)", border: "4px solid #5a140e", opacity: ramp(t, 29.6, 29.9) }} />
          </Card>
        );
      })()}

      {/* joining counter */}
      {t > 30.7 && t < 36.5 && (
        <Card k={ramp(t, 30.8, 31.2) * (1 - ramp(t, 36.0, 36.5))} style={{ left: 290, top: 170, width: 500, padding: "16px 0 12px", textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 34, color: "#d9731a", letterSpacing: 6 }}>BHARAT SE JUDI</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 104, color: INK, lineHeight: 1 }}>{Math.round(562 * eout(ramp(t, 30.9, 33.8)))}<span style={{ fontSize: 50, color: "#5a4a2a" }}> / 565</span></div>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 30, color: "#7a1e16", opacity: ramp(t, 34.5, 34.9) }}>3 riyasatein abhi baaki</div>
        </Card>
      )}

      {/* event badges */}
      <Badge t={t} a={37.8} b={42.6} title="FEBRUARY 1948" sub="Junagadh · Janmat sangrah" x={170} y={170} />
      <Stamp k={ramp(t, 40.4, 40.7) * (1 - ramp(t, 42.3, 42.7))} text="BHARAT ✓" size={60} style={{ left: 330, top: 420 }} />
      <Badge t={t} a={43.87} b={47.5} title="13 SEPTEMBER 1948" sub="Operation Polo · Indian Army" x={130} y={170} />
      <Badge t={t} a={47.57} b={50.7} title="17 SEPTEMBER 1948" sub="Nizam ne haar maani" x={130} y={170} />
      <Stamp k={ramp(t, 48.4, 48.7) * (1 - ramp(t, 50.3, 50.7))} text="BHARAT ✓" size={60} style={{ left: 330, top: 420 }} />
      <Badge t={t} a={52.2} b={58.2} title="26 OCTOBER 1947" sub="Maharaja Hari Singh · Instrument of Accession" x={60} y={170} />
      <Stamp k={ramp(t, 56.2, 56.5) * (1 - ramp(t, 57.9, 58.3))} text="BHARAT ✓" size={60} style={{ left: 330, top: 470 }} />

      {/* finale */}
      {t > 58.3 && t < 65.9 && (() => {
        const k = ramp(t, 58.45, 58.9) * (1 - ramp(t, 61.6, 62.0));
        const n = t < 60.55 ? 565 : 1;
        const flip = back(ramp(t, 60.55, 60.95));
        return (
          <div style={{ position: "absolute", top: 210, width: "100%", textAlign: "center", opacity: k }}>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 200, color: GOLD, lineHeight: 1, textShadow: "0 8px 0 #6b4a10, 0 18px 40px rgba(0,0,0,.8)", transform: `scale(${t < 60.55 ? 1 : 0.7 + 0.3 * flip})` }}>{n}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: "#fff", letterSpacing: 8, textShadow: "0 4px 16px #000" }}>{t < 60.55 ? "TUKDE" : "NAKSHA"}</div>
          </div>
        );
      })()}
      {t > 61.7 && t < 66 && (
        <div style={{ position: "absolute", top: 190, width: "100%", textAlign: "center", opacity: ramp(t, 61.82, 62.2) * (1 - ramp(t, 65.4, 65.9)), transform: `scale(${0.8 + 0.2 * back(ramp(t, 61.82, 62.4))})` }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 132, color: GOLD, letterSpacing: 6, lineHeight: 1, textShadow: "0 7px 0 #6b4a10, 0 16px 36px rgba(0,0,0,.85)" }}>LOH PURUSH</div>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 48, color: "#efe4c4", marginTop: 14, textShadow: "0 3px 10px #000" }}>Sardar Vallabhbhai Patel · Iron Man of India</div>
        </div>
      )}

      {/* comment card */}
      {t > 65.7 && (() => {
        const k = back(ramp(t, 65.81, 66.4));
        return (
          <Card k={k} style={{ left: 120, top: 560, width: 840, padding: "40px 40px 34px", textAlign: "center", transform: `scale(${0.6 + 0.4 * k}) rotate(-2deg)` }}>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 52, color: INK, lineHeight: 1.15 }}>AISI AUR KAHANIYON<br />KE LIYE</div>
            <div style={{ display: "inline-block", marginTop: 28, border: "7px solid #b3261e", color: "#b3261e", borderRadius: 10, padding: "12px 34px", fontFamily: SERIF, fontWeight: 900, fontSize: 70, transform: `scale(${lerp(1.8, 1, eout(ramp(t, 67.2, 67.6)))}) rotate(-4deg)`, opacity: ramp(t, 67.2, 67.4) }}>COMMENT<br />"SARDAR"</div>
            <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 40, color: "#5a4a2a", marginTop: 26, opacity: ramp(t, 69.0, 69.4) }}>Follow · India by Bharat</div>
          </Card>
        );
      })()}

      {/* engraved captions, lower third */}
      {showCaps && grp && (
        <div style={{ position: "absolute", top: 1450, left: 60, right: 60, textAlign: "center", lineHeight: 1.15 }}>
          {grp.words.map((w, i) => {
            const k = back(ramp(t, w.s - 0.04, w.s + 0.16));
            if (k <= 0) return null;
            const key = w.w.toUpperCase().replace(/[^A-Z0-9-]/g, "");
            const hi = HILITE.has(key);
            return (
              <span key={i} style={{ display: "inline-block", margin: "0 12px", transform: `translateY(${(1 - k) * 22}px) scale(${0.85 + 0.15 * k})`, opacity: clamp(k * 1.5), fontFamily: SERIF, fontWeight: 900, fontSize: 66, letterSpacing: 2, color: hi ? GOLD : "#fbf6ea", textShadow: "0 3px 0 #2a2010, 0 6px 18px rgba(0,0,0,.95)" }}>
                {w.w.toUpperCase().replace(/[.,:]+$/, "")}
              </span>
            );
          })}
        </div>
      )}
      {t > 50.8 && t < 58.4 && (
        <div style={{ position: "absolute", bottom: 40, width: "100%", textAlign: "center", fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 24, color: "rgba(239,228,196,.75)" }}>Map: present-day borders of India (Survey of India) · historical areas approximate</div>
      )}
    </AbsoluteFill>
  );
};
