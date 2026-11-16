import React from "react";
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
const GOLD = "#f2c94c";
const INK = "#2b2414";
const SERIF = "Cinzel, serif";
const ITAL = "'Cormorant Garamond', serif";

const fontHandle = typeof window !== "undefined" ? delayRender("fonts") : 0;
if (typeof window !== "undefined") {
  const faces = [
    new FontFace("Cinzel", `url(${staticFile("cinzel-latin-700-normal.woff2")})`, { weight: "700" }),
    new FontFace("Cinzel", `url(${staticFile("cinzel-latin-900-normal.woff2")})`, { weight: "900" }),
    new FontFace("Cormorant Garamond", `url(${staticFile("cormorant-garamond-latin-600-italic.woff2")})`, { weight: "600", style: "italic" }),
  ];
  Promise.all(faces.map((f) => f.load().then((ff) => (document as any).fonts.add(ff)))).then(() => continueRender(fontHandle));
}

const route: number[][] = G.route;
const routeAt = (k: number) => {
  const f = clamp(k) * (route.length - 1), i = Math.min(route.length - 2, Math.floor(f)), r = f - i;
  return [lerp(route[i][0], route[i + 1][0], r), lerp(route[i][1], route[i + 1][1], r), Math.atan2(route[i + 1][1] - route[i][1], route[i + 1][0] - route[i][0])];
};
const FLY = [6.4, 11.4];
const wide = [1560, 1250];
type K = [number, number, number, number];
const KEYS: K[] = [
  [0, wide[0], wide[1], 0.47], [6.2, wide[0], wide[1] - 40, 0.44],
  [12.9, P.manila[0], P.manila[1] + 40, 1.25], [17.2, P.manila[0], P.manila[1] + 30, 1.4],
  [18.4, 1880, 1520, 0.6], [25.1, 1880, 1540, 0.58],
  [26.3, 1700, 1300, 0.5], [33.6, 1700, 1320, 0.48],
  [34.8, wide[0], wide[1], 0.46], [45.6, wide[0], wide[1] + 20, 0.45],
  [46.8, 1500, 1500, 0.52], [54.3, 1500, 1520, 0.55],
  [55.5, 1650, 1050, 0.55], [62.3, 1650, 1060, 0.56],
  [63.5, 1450, 1580, 0.56], [72.2, 1450, 1600, 0.6],
  [73.4, wide[0], wide[1], 0.46], [78.4, wide[0], wide[1] - 20, 0.44],
];
const cam = (t: number) => {
  // follow the plane during the flight
  if (t > FLY[0] - 0.4 && t < 12.9) {
    const k = eio(ramp(t, FLY[0], FLY[1]));
    const [x, y] = routeAt(k);
    const zin = eio(ramp(t, FLY[0] - 0.4, FLY[0] + 0.8));
    const zout = eio(ramp(t, FLY[1], 12.9));
    const base = { x: lerp(wide[0], x, zin), y: lerp(wide[1] - 40, y + 60, zin), z: lerp(0.44, 0.62, zin) };
    return { x: lerp(base.x, P.manila[0], zout), y: lerp(base.y, P.manila[1] + 40, zout), z: lerp(base.z, 1.25, zout) };
  }
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const travel = Math.min(1.2, b[0] - a[0]);
  const k = eio(ramp(t, b[0] - travel, b[0]));
  const slow = ramp(t, a[0], b[0] - travel) * 0.04;
  return { x: lerp(a[1], b[1], k), y: lerp(a[2], b[2], k), z: lerp(a[3], b[3], k) * (1 + slow) };
};

const Badge: React.FC<{ t: number; a: number; b: number; title: string; sub?: string; x?: number; y?: number }> = ({ t, a, b, title, sub, x = 70, y = 150 }) => {
  const k = back(ramp(t, a, a + 0.45)) * (1 - ramp(t, b - 0.3, b));
  if (k <= 0.001) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: "left top", opacity: clamp(k * 1.4), background: "linear-gradient(#efe4c4,#d9c99a)", border: "3px solid #8a7240", borderRadius: 6, padding: "14px 26px 12px", boxShadow: "0 10px 30px rgba(0,0,0,.55)" }}>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 46, color: INK, letterSpacing: 2, whiteSpace: "nowrap" }}>{title}</div>
      {sub && <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 32, color: "#5a4a2a", textAlign: "center", whiteSpace: "nowrap" }}>{sub}</div>}
    </div>
  );
};
const Card: React.FC<{ k: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ k, style, children }) =>
  k <= 0.001 ? null : <div style={{ position: "absolute", opacity: clamp(k * 1.3), background: "linear-gradient(160deg,#f2e8cb,#dccb9b)", border: "3px solid #8a7240", borderRadius: 10, boxShadow: "0 18px 50px rgba(0,0,0,.6)", ...style }}>{children}</div>;
const Pill: React.FC<{ k: number; text: string; color?: string }> = ({ k, text, color = "#7a1e16" }) =>
  k <= 0.001 ? null : <div style={{ transform: `scale(${back(clamp(k))})`, background: "#efe4c4", border: `5px solid ${color}`, color, fontFamily: SERIF, fontWeight: 900, fontSize: 40, padding: "10px 22px", borderRadius: 10, boxShadow: "0 10px 26px rgba(0,0,0,.6)", whiteSpace: "nowrap" }}>{text}</div>;

const Plane: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M30 0 L4 -5 L-8 -26 L-15 -26 L-8 -5 L-24 -4 L-30 -12 L-35 -12 L-31 0 L-35 12 L-30 12 L-24 4 L-8 5 L-15 26 L-8 26 L4 5 Z" fill="#fbf6ea" stroke="#2b2414" strokeWidth={2.5} strokeLinejoin="round" />
  </g>
);
const Ship: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M-26 4 L26 4 L18 14 L-20 14 Z" fill="#7a5a2e" stroke="#2b2414" strokeWidth={2} />
    <rect x="-16" y="-8" width="10" height="12" fill="#c0392b" stroke="#2b2414" strokeWidth={1.5} />
    <rect x="-4" y="-8" width="10" height="12" fill="#2f6a8e" stroke="#2b2414" strokeWidth={1.5} />
    <rect x="8" y="-8" width="10" height="12" fill="#d9a441" stroke="#2b2414" strokeWidth={1.5} />
  </g>
);

const ORDER: [string, number][] = [["PHILIPPINES", 18.6], ["MYANMAR", 19.0], ["THAILAND", 19.4], ["LAOS", 19.8], ["CAMBODIA", 20.2], ["MALAYSIA", 20.6], ["SINGAPORE", 21.0], ["INDONESIA", 21.4], ["BRUNEI", 21.9], ["VIETNAM", 22.3], ["TIMOR-LESTE", 24.2]];
const joinAt = (n: string) => (ORDER.find((o) => o[0] === n) as any)[1] as number;

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const c = cam(t);
  const flyK = eio(ramp(t, FLY[0], FLY[1]));
  const [px, py, ang] = routeAt(flyK);
  const flash = Math.max(0.55 * (1 - ramp(t, 1.6, 2.2)), ramp(t, 2.5, 2.9)) * (1 - ramp(t, 4.4, 5.6));
  const seaGlow = ramp(t, 4.7, 5.2) * (1 - ramp(t, 6.0, 6.6));
  const lane: number[][] = G.lane;
  const laneD = "M" + lane.map((p) => p.join(",")).join(" L");
  const laneK = Math.max(eout(ramp(t, 46.3, 48.5)) * (1 - ramp(t, 54.0, 54.6)), eout(ramp(t, 63.0, 65.0)) * (1 - ramp(t, 72.0, 72.6)));
  const laneAt = (k: number) => {
    let L = 0; const seg: number[] = [];
    for (let i = 0; i < lane.length - 1; i++) { const d = Math.hypot(lane[i + 1][0] - lane[i][0], lane[i + 1][1] - lane[i][1]); seg.push(d); L += d; }
    let r = clamp(k) * L, i = 0;
    while (i < seg.length - 1 && r > seg[i]) { r -= seg[i]; i++; }
    const q = r / seg[i];
    return [lerp(lane[i][0], lane[i + 1][0], q), lerp(lane[i][1], lane[i + 1][1], q)];
  };
  const shipsOn = laneK > 0.95;
  const bridge = ramp(t, 55.8, 58.4) * (1 - ramp(t, 61.9, 62.5));
  const indiaGlow = Math.max(ramp(t, 70.4, 71.0) * (1 - ramp(t, 73, 73.6)), ramp(t, 0, 0.01) * (1 - ramp(t, 2.4, 2.8)) * 0.6);
  const routeShown = Math.max(eio(ramp(t, FLY[0], FLY[1])) * (1 - ramp(t, 17.2, 18.0)), bridge);
  const routeLen = route.length;

  const grp = GROUPS.find((g, i) => t >= g.s - 0.05 && t < (GROUPS[i + 1] ? Math.min(GROUPS[i + 1].s - 0.05, g.e + 0.6) : g.e + 0.8));
  const showCaps = t < 72.1;

  return (
    <AbsoluteFill style={{ background: "#0b0e12" }}>
      <Img src={staticFile("table.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
      <div style={{ position: "absolute", inset: 0, perspective: 2100, perspectiveOrigin: "50% 35%" }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: "rotateX(24deg)", transformOrigin: "50% 62%" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: G.W, height: G.H, transformOrigin: "0 0", transform: `translate(${540 - c.x * c.z}px, ${1010 - c.y * c.z}px) scale(${c.z})`, boxShadow: "0 60px 120px rgba(0,0,0,.8)" }}>
            <svg width={G.W} height={G.H} viewBox={`0 0 ${G.W} ${G.H}`} style={{ position: "absolute", left: 0, top: 0 }}>
              <defs>
                <radialGradient id="sea" cx="55%" cy="55%" r="75%"><stop offset="0" stopColor="#2f6a6e" /><stop offset="1" stopColor="#1d4448" /></radialGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" /></filter>
              </defs>
              <rect width={G.W} height={G.H} fill="url(#sea)" />
              <rect width={G.W} height={G.H} fill="#7fe3ea" opacity={0.12 * seaGlow} />
              <path d={G.others} fill="none" stroke="#d6d8a8" strokeWidth={22} opacity={0.15} />
              <path d={G.others} fill="#8c8a57" stroke="#4d4a2c" strokeWidth={2} />
              <path d={G.india} fill="none" stroke="#e2e2b0" strokeWidth={22} opacity={0.2} />
              <path d={G.india} fill="#aaa566" stroke="#3e3820" strokeWidth={3} />
              <path d={G.india} fill="#f08a24" opacity={0.45 * indiaGlow} />
              {G.asean.map((a: any) => {
                const j = ramp(t, joinAt(a.name), joinAt(a.name) + 0.35);
                const glowK = ramp(t, 70.4, 71.0) * (1 - ramp(t, 73, 73.6));
                const op = Math.max(flash * 0.75, j * 0.62, glowK * 0.8);
                return (
                  <g key={a.id}>
                    <path d={a.d} fill="#aaa566" stroke="#3e3820" strokeWidth={2.5} />
                    <path d={a.d} fill="#e0a83a" opacity={op} stroke="#7a5a10" strokeWidth={3} />
                  </g>
                );
              })}
              {/* sea labels */}
              <text x={P.bay[0]} y={P.bay[1]} textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontWeight={600} fontSize={60} letterSpacing={8} fill="#a9d6d4" opacity={0.75}>Bay of Bengal</text>
              <text x={P.arab[0] + 160} y={P.arab[1]} textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontWeight={600} fontSize={60} letterSpacing={8} fill="#a9d6d4" opacity={0.75}>Arabian Sea</text>
              <text x={P.ocean[0]} y={P.ocean[1]} textAnchor="middle" fontFamily="Cormorant Garamond" fontStyle="italic" fontWeight={600} fontSize={72} letterSpacing={10} fill="#a9d6d4" opacity={0.75}>Indian Ocean</text>
              <text x={P.india[0]} y={P.india[1]} textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize={84} letterSpacing={26} fill="#3a321a" opacity={0.8}>BHARAT</text>
              {/* country labels */}
              {G.asean.map((a: any) => {
                const j = ramp(t, joinAt(a.name), joinAt(a.name) + 0.3);
                const show = Math.max(j * (1 - ramp(t, 25.3, 26)), ramp(t, 63.5, 64) * (1 - ramp(t, 72, 72.6)) * 0.85);
                if (show <= 0.01) return null;
                const small = ["SINGAPORE", "BRUNEI", "TIMOR-LESTE"].includes(a.name);
                return <text key={a.id} x={a.l[0]} y={a.l[1]} textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize={small ? 40 : 54} letterSpacing={small ? 4 : 10} fill="#2b2414" stroke="#efe6c2" strokeWidth={7} paintOrder="stroke" opacity={show}>{a.name}</text>;
              })}
              {/* sea lane + ships */}
              {laneK > 0 && (
                <g>
                  <path d={laneD} fill="none" stroke="#fff3c4" strokeWidth={16} opacity={0.3 * laneK} filter="url(#glow)" />
                  <path d={laneD} fill="none" stroke="#fff6d6" strokeWidth={6} strokeDasharray="26 16" opacity={laneK} pathLength={1000} strokeDashoffset={-t * 40} />
                  {shipsOn && [0, 0.33, 0.66].map((o, i) => { const [sx, sy] = laneAt((t * 0.035 + o) % 1); return <g key={i} transform={`translate(${sx},${sy - 18})`}><Ship s={1.6} /></g>; })}
                  {shipsOn && [0.15, 0.5, 0.85].map((o, i) => { const [sx, sy] = laneAt(1 - ((t * 0.03 + o) % 1)); return <g key={"r" + i} transform={`translate(${sx},${sy + 22})`}><Ship s={1.3} /></g>; })}
                </g>
              )}
              {/* flight / bridge route */}
              {routeShown > 0 && (
                <g>
                  <polyline points={route.slice(0, Math.max(2, Math.round(routeLen * routeShown))).map((p) => p.join(",")).join(" ")} fill="none" stroke="#c0392b" strokeWidth={7} strokeDasharray="22 14" />
                </g>
              )}
              {t > FLY[0] - 0.3 && t < 13.2 && (
                <g transform={`translate(${px},${py}) rotate(${(ang * 180) / Math.PI})`} opacity={1 - ramp(t, 12.5, 13.2)}><Plane s={2.4} /></g>
              )}
              {bridge > 0 && t < 62.6 && (() => { const [bx, by, ba] = routeAt(eio(ramp(t, 55.8, 58.4))); return <g transform={`translate(${bx},${by - 30})`} opacity={1 - ramp(t, 61.9, 62.5)}><rect x={-40} y={-26} width={80} height={52} rx={6} fill="#7a5a2e" stroke="#2b2414" strokeWidth={4} /><text x={0} y={10} textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize={22} fill="#f2e8cb">BRAHMOS</text></g>; })()}
              {/* cities */}
              {[["NEW DELHI", P.delhi], ["MANILA", P.manila]].map(([n, at]: any) => (
                <g key={n}>
                  <circle cx={at[0]} cy={at[1]} r={12} fill="#f2e8cb" stroke="#7a1e16" strokeWidth={4} />
                  <circle cx={at[0]} cy={at[1]} r={5} fill="#7a1e16" />
                  <text x={at[0]} y={at[1] - 24} textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize={n === "MANILA" && c.z > 1 ? 30 : 44} letterSpacing={5} fill="#7a1e16" stroke="#efe6c2" strokeWidth={7} paintOrder="stroke">{n}</text>
                </g>
              ))}
              {t > 12.4 && t < 17.6 && <circle cx={P.manila[0]} cy={P.manila[1]} r={30 + 14 * (0.5 + 0.5 * Math.sin(t * 7))} fill="none" stroke={GOLD} strokeWidth={5} opacity={ramp(t, 12.4, 13) * (1 - ramp(t, 17, 17.6))} />}
            </svg>
            <Img src={staticFile("parchment.png")} style={{ position: "absolute", left: 0, top: 0, width: G.W, height: G.H, mixBlendMode: "multiply", opacity: 0.5 }} />
          </div>
        </div>
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,.6) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,.7))" }} />
      {/* dim behind big cards */}
      <AbsoluteFill style={{ background: "rgba(5,8,10,.45)", opacity: Math.max(ramp(t, 25.6, 26.2) * (1 - ramp(t, 33.3, 33.9)), ramp(t, 34.0, 34.6) * (1 - ramp(t, 45.3, 45.9)), ramp(t, 72.1, 72.7)) }} />

      {/* hook */}
      {t < 6.5 && (
        <div style={{ position: "absolute", top: 180, width: "100%", textAlign: "center", opacity: 1 - ramp(t, 5.9, 6.4) }}>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 48, color: "#efe4c4", textShadow: "0 3px 10px #000" }}>PM Modi · Manila · 16 Nov 2026</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 116, color: GOLD, letterSpacing: 4, lineHeight: 1.05, textShadow: "0 6px 0 #6b4a10, 0 14px 30px rgba(0,0,0,.8)", marginTop: 8 }}>11 DESH</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 84, color: "#fff", letterSpacing: 6, textShadow: "0 5px 18px rgba(0,0,0,.9)" }}>1 SAMANDAR</div>
        </div>
      )}
      <Badge t={t} a={-1} b={6.3} title="ASEAN-INDIA SUMMIT" sub="Manila, Philippines" x={250} y={1210} />

      {/* flight */}
      <Badge t={t} a={6.4} b={13.3} title="16 NOVEMBER 2026" sub="New Delhi → Manila" />
      {t > 6.4 && t < 13.3 && (
        <Card k={ramp(t, 6.6, 7.0) * (1 - ramp(t, 12.9, 13.3))} style={{ right: 60, top: 150, padding: "10px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: INK, lineHeight: 1 }}>{Math.round(G.km * flyK).toLocaleString("en-IN")}</div>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 28, color: "#5a4a2a" }}>km (seedhi doori)</div>
        </Card>
      )}
      {t > 9.2 && t < 13.4 && (
        <div style={{ position: "absolute", top: 400, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: 1 - ramp(t, 12.9, 13.4) }}>
          <Pill k={ramp(t, 9.27, 9.6)} text="23rd ASEAN-INDIA SUMMIT" color="#d9731a" />
          <Pill k={ramp(t, 11.39, 11.7)} text="21st EAST ASIA SUMMIT" color="#2f6a6e" />
        </div>
      )}
      <Badge t={t} a={13.53} b={17.4} title="2017 → 2026" sub="Manila mein PM ka doosra daura" x={190} />

      {/* 11 members counter */}
      {t > 18.3 && t < 25.6 && (
        <Card k={ramp(t, 18.4, 18.8) * (1 - ramp(t, 25.1, 25.6))} style={{ left: 60, top: 150, padding: "12px 28px", textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 30, color: "#d9731a", letterSpacing: 5 }}>ASEAN</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 96, color: INK, lineHeight: 1 }}>{ORDER.filter((o) => t >= o[1]).length}</div>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 28, color: "#5a4a2a" }}>sadasya desh</div>
        </Card>
      )}
      {t > 24.1 && t < 25.6 && <div style={{ position: "absolute", right: 70, top: 190, opacity: 1 - ramp(t, 25.1, 25.6) }}><Pill k={ramp(t, 24.2, 24.5)} text="NAYA · 11th SADASYA" /></div>}

      {/* Ramayana card */}
      {t > 25.5 && t < 34 && (() => {
        const k = back(ramp(t, 25.6, 26.2)) * (1 - ramp(t, 33.3, 33.9));
        const draw = ramp(t, 26.0, 28.5);
        return (
          <Card k={k} style={{ left: 150, top: 330, width: 780, padding: "30px 30px 34px", textAlign: "center", transform: `scale(${0.7 + 0.3 * k}) rotate(-1.5deg)` }}>
            <svg width="420" height="300" viewBox="0 0 420 300">
              <path d="M110 30 Q30 150 110 270" fill="none" stroke="#5a3a14" strokeWidth={10} strokeLinecap="round" strokeDasharray="300" strokeDashoffset={300 * (1 - draw)} />
              <line x1="110" y1="30" x2="110" y2="270" stroke="#2b2414" strokeWidth={3} opacity={draw} />
              <line x1="70" y1="150" x2="380" y2="150" stroke="#2b2414" strokeWidth={5} strokeDasharray="310" strokeDashoffset={310 * (1 - ramp(t, 27.6, 29.0))} />
              <path d="M380 150 L350 136 L356 150 L350 164 Z" fill="#7a1e16" opacity={ramp(t, 28.8, 29.1)} />
              <path d="M72 150 L58 140 M72 150 L58 160 M84 150 L70 140 M84 150 L70 160" stroke="#7a1e16" strokeWidth={4} opacity={ramp(t, 27.6, 27.9)} />
            </svg>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 76, color: INK, letterSpacing: 6 }}>RAMAYAN</div>
            <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 38, color: "#5a4a2a" }}>Philippines mein aaj bhi manchan</div>
            <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}><Pill k={ramp(t, 31.13, 31.5)} text="MANILA · 16 NOV 2026" color="#d9731a" /></div>
          </Card>
        );
      })()}

      {/* timeline */}
      {t > 33.9 && t < 46 && (() => {
        const k = back(ramp(t, 34.0, 34.6)) * (1 - ramp(t, 45.3, 45.9));
        const rows = [["1992", "Sectoral Dialogue Partner", 34.1], ["2002", "Pehla ASEAN-India Summit", 37.7], ["2012", "Strategic Partnership", 39.9], ["2022", "Comprehensive Strategic Partnership", 42.1]];
        return (
          <Card k={k} style={{ left: 70, top: 300, width: 940, padding: "30px 36px", transform: `scale(${0.75 + 0.25 * k})` }}>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 48, color: INK, textAlign: "center", borderBottom: "3px double #8a7240", paddingBottom: 12, marginBottom: 10 }}>BHARAT – ASEAN</div>
            {rows.map(([y, d, s], i) => {
              const q = ramp(t, s as number, (s as number) + 0.35);
              return (
                <div key={y as string} style={{ display: "flex", alignItems: "center", gap: 24, margin: "18px 0", opacity: 0.22 + 0.78 * q, transform: `translateX(${(1 - eout(q)) * -40}px)` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 11, background: q > 0.5 ? "#d9731a" : "#8a7240", boxShadow: q > 0.5 ? "0 0 16px #f08a24" : "none" }} />
                  <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 62, color: i === 3 && q > 0.5 ? "#b85a10" : INK, width: 190 }}>{y as string}</div>
                  <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 40, color: "#3a301a", lineHeight: 1.05 }}>{d as string}</div>
                </div>
              );
            })}
          </Card>
        );
      })()}

      {/* trade */}
      {t > 46 && t < 54.6 && (() => {
        const k = ramp(t, 46.1, 46.5) * (1 - ramp(t, 54.1, 54.6));
        const g = eout(ramp(t, 46.5, 48.5)) * 0.11;
        const R = 70, C = 2 * Math.PI * R;
        return (
          <Card k={k} style={{ left: 60, top: 150, width: 960, padding: "18px 28px", display: "flex", alignItems: "center", gap: 30 }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r={R} fill="none" stroke="#cbb98a" strokeWidth="26" />
              <circle cx="90" cy="90" r={R} fill="none" stroke="#d9731a" strokeWidth="26" strokeDasharray={`${C * g} ${C}`} transform="rotate(-90 90 90)" />
              <text x="90" y="104" textAnchor="middle" fontFamily="Cinzel" fontWeight={900} fontSize="40" fill="#2b2414">{Math.round(g * 100)}%</text>
            </svg>
            <div>
              <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 34, color: "#5a4a2a" }}>Bharat ke kul vyapaar mein ASEAN</div>
              <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 90, color: INK, lineHeight: 1, opacity: ramp(t, 52.3, 52.5) }}>${Math.round(123 * eout(ramp(t, 52.37, 53.8)))} BN</div>
              <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 32, color: "#7a1e16", letterSpacing: 3, opacity: ramp(t, 50.48, 50.8) }}>VYAPAAR · 2024-25</div>
            </div>
          </Card>
        );
      })()}

      {/* BrahMos */}
      {t > 54.6 && t < 62.6 && (() => {
        const k = back(ramp(t, 54.7, 55.2)) * (1 - ramp(t, 62.0, 62.5));
        return (
          <Card k={k} style={{ left: 70, top: 1120, width: 940, padding: "20px 28px", transform: `scale(${0.8 + 0.2 * k})` }}>
            <svg width="880" height="70" viewBox="0 0 880 70">
              <path d="M40 35 L700 35 L760 20 L840 35 L760 50 L700 35" fill="none" stroke="none" />
              <rect x="80" y="24" width="640" height="22" rx="11" fill="#e9e4d4" stroke="#2b2414" strokeWidth="3" />
              <path d="M720 24 Q800 35 720 46 Z" fill="#c0392b" stroke="#2b2414" strokeWidth="3" />
              <path d="M110 24 L70 6 L60 6 L84 24 Z M110 46 L70 64 L60 64 L84 46 Z" fill="#7a5a2e" stroke="#2b2414" strokeWidth="2" />
            </svg>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 6 }}>
              <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: INK }}>BRAHMOS</div>
              <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 34, color: "#5a4a2a" }}>$375 mn deal · Jan 2022</div>
            </div>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 36, color: "#b85a10", letterSpacing: 2, opacity: ramp(t, 56.8, 57.2) }}>PEHLA VIDESHI KHARIDAAR: PHILIPPINES</div>
          </Card>
        );
      })()}
      <Badge t={t} a={59.62} b={62.4} title="APRIL 2024" sub="Pehli battery Philippines pahunchi" x={150} />

      {/* maritime */}
      <Badge t={t} a={62.74} b={72.2} title="2026" sub="ASEAN-India Year of Maritime Cooperation" x={110} />
      {t > 67.4 && t < 72.4 && (
        <div style={{ position: "absolute", top: 420, width: "100%", display: "flex", justifyContent: "center", gap: 18, opacity: 1 - ramp(t, 72.0, 72.4) }}>
          <Pill k={ramp(t, 67.57, 67.9)} text="SAMANDAR" color="#2f6a6e" />
          <Pill k={ramp(t, 68.3, 68.6)} text="SURAKSHA" color="#7a1e16" />
          <Pill k={ramp(t, 68.9, 69.2)} text="VYAPAAR" color="#d9731a" />
        </div>
      )}

      {/* CTA */}
      {t > 72.1 && (() => {
        const k = back(ramp(t, 72.2, 72.75));
        const heart = back(ramp(t, 73.83, 74.2));
        return (
          <Card k={k} style={{ left: 110, top: 520, width: 860, padding: "40px 40px 34px", textAlign: "center", transform: `scale(${0.6 + 0.4 * k}) rotate(-2deg)` }}>
            <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 46, color: "#3a301a" }}>Agar kuch naya seekha...</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 30, marginTop: 26 }}>
              <div style={{ transform: `scale(${heart})`, opacity: clamp(heart * 2), border: "6px solid #b3261e", borderRadius: 12, padding: "10px 30px", fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: "#b3261e" }}>♥ LIKE</div>
              <div style={{ transform: `scale(${back(ramp(t, 74.96, 75.3))})`, opacity: clamp(ramp(t, 74.96, 75.2) * 2), border: "6px solid #2b2414", borderRadius: 12, padding: "10px 30px", fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: INK }}>FOLLOW</div>
            </div>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 46, color: "#b85a10", marginTop: 26, letterSpacing: 3, opacity: ramp(t, 76.22, 76.6) }}>INDIA BY BHARAT</div>
          </Card>
        );
      })()}

      {/* captions */}
      {showCaps && grp && (
        <div style={{ position: "absolute", top: 1450, left: 50, right: 50, textAlign: "center", lineHeight: 1.15 }}>
          {grp.words.map((w, i) => {
            const k = back(ramp(t, w.s - 0.04, w.s + 0.16));
            if (k <= 0) return null;
            const key = w.w.toUpperCase().replace(/[^A-Z0-9-]/g, "");
            const hi = HILITE.has(key);
            return (
              <span key={i} style={{ display: "inline-block", margin: "0 12px", transform: `translateY(${(1 - k) * 22}px) scale(${0.85 + 0.15 * k})`, opacity: clamp(k * 1.5), fontFamily: SERIF, fontWeight: 900, fontSize: 64, letterSpacing: 2, color: hi ? GOLD : "#fbf6ea", textShadow: "0 3px 0 #2a2010, 0 6px 18px rgba(0,0,0,.95)" }}>
                {w.w.toUpperCase().replace(/[.,:?]+$/, "")}
              </span>
            );
          })}
        </div>
      )}
      <div style={{ position: "absolute", bottom: 34, width: "100%", textAlign: "center", fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 22, color: "rgba(239,228,196,.6)" }}>Sources: MEA, PIB, ASEAN Secretariat, news reports · Map: India (Survey of India), others Natural Earth</div>
    </AbsoluteFill>
  );
};
