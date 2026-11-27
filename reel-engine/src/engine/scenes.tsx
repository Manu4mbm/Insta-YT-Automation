import { DOSSIER } from "./dossier";
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { geoMercator, geoPath, geoInterpolate } from "d3-geo";
import { clamp, eo, eio, bk, Cam, Slam, Lines, Stamp, Chip, Sky, Embers, Rays, Stars, Waves, Flames, Heart, Vignette, Glow, Rich, fontFor, useTheme, LAT, DEV } from "./fx";
import { Soldier, Horse, Boat, Ship, Jet, Fort, Temple, King, Medal, SPRITES } from "./sprites";
import india from "./india.geo.json";
import world from "./world.geo.json";

/*
  Scene library. Each scene receives:
   lt  = seconds since the shot started, t = global seconds, len = shot length,
   s   = the shot object from the spec (all params below), cam = chosen camera move.
  Every scene accepts optional: head (slam headline at top), stamp {text, at}, chip {text, at}, bg.
*/
export type SceneP = { lt: number; t: number; len: number; s: any; cam: any };

const Head: React.FC<{ p: SceneP }> = ({ p }) => {
  const { s, lt, t } = p;
  return <>
    {s.head && <Slam lt={lt} text={s.head} size={s.headSize ?? 110} top={300} sub={s.headSub} style={s.headStyle} />}
    {s.stamp && <Stamp lt={lt - (s.stamp.at ?? 0.6)} text={s.stamp.text} top={s.stamp.top ?? 440} color={s.stamp.color} rot={s.stamp.rot ?? -7} size={s.stamp.size ?? 100} />}
    {s.chip && <Chip lt={lt} delay={s.chip.at ?? 0.3} text={s.chip.text} top={s.chip.top ?? 1260} />}
  </>;
};
const BG: React.FC<{ p: SceneP; def?: string }> = ({ p, def = "plain" }) => {
  const T = useTheme(); const k = p.s.bg ?? def;
  return <>
    {k === "night" ? <Sky top="#0b0a2a" bot="#02020a" /> : k === "dawn" ? <Sky top="#ff9a5a" bot={T.bg} /> : k === "black" ? <Sky top="#000" bot="#000" /> : k === "blood" ? <Sky top="#5a0a0c" bot="#120203" /> : <Sky />}
    {k === "night" && <Stars t={p.t} />}
    {k === "embers" && <Embers t={p.t} n={60} />}
    {k === "rays" && <><Rays t={p.t} /><Embers t={p.t} n={30} /></>}
    {k === "fire" && <Flames t={p.t} />}
    {k === "water" && <Waves t={p.t} y={1050} />}
  </>;
};

/* projection helpers */
const fitIndia = (box?: number[]) => {
  const p = geoMercator();
  if (box) { const [w, s, e, n] = box; p.fitExtent([[40, 360], [1040, 1400]], { type: "Feature", geometry: { type: "Polygon", coordinates: [[[w, s], [w, n], [e, n], [e, s], [w, s]]] } } as any); }
  else p.fitExtent([[90, 330], [990, 1350]], india as any);
  return p;
};
const fitWorld = (box = [-10, 0, 110, 55]) => {
  const [w, s, e, n] = box;
  return geoMercator().fitExtent([[0, 420], [1080, 1420]], { type: "Feature", geometry: { type: "Polygon", coordinates: [[[w, s], [w, n], [e, n], [e, s], [w, s]]] } } as any);
};
const pathOf = (pts: number[][]) => pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");

/* generic map scene: india | world | region(box) with pins, route, river, arrows, fly-in */
const MapScene: React.FC<{ p: SceneP; kind: "india" | "world" | "region" }> = ({ p, kind }) => {
  const T = useTheme(); const { s, lt, len } = p;
  const proj = kind === "world" ? fitWorld(s.box) : fitIndia(kind === "region" ? s.box : undefined);
  const gp = geoPath(proj);
  const base = kind === "world" ? (world as any).features.map((f: any) => gp(f)).join(" ") : (india as any).features.map((f: any) => gp(f)).join(" ");
  const P = (ll: number[]) => proj(ll as any) as number[];
  const drawP = eo(clamp((lt - 0.2) / Math.min(1.6, len * 0.6)));
  let routePts: number[][] = [];
  if (s.route?.length > 1) {
    for (let k = 0; k < s.route.length - 1; k++) { const g = geoInterpolate(s.route[k], s.route[k + 1]); routePts.push(...Array.from({ length: 31 }, (_, i) => P(g(i / 30)))); }
    routePts = routePts.slice(0, Math.max(2, Math.round(routePts.length * drawP)));
  }
  const river = s.river ? s.river.map(P) : null;
  const riverN = river ? Math.max(2, Math.round(river.length * eo(clamp(lt / 1.2)))) : 0;
  const focus = s.focus ? P(s.focus) : [540, 900];
  const fly = s.flyTo ? eio(clamp(lt / Math.min(len, 1.8))) : 0;
  const ft = s.flyTo ? P(s.flyTo) : [540, 900];
  const z = 1 + (s.flyZoom ?? 3) * fly;
  return <>
    <BG p={p} />
    <Cam lt={lt} len={len} kind={p.cam} ox={focus[0]} oy={focus[1]} amt={1.4}>
      <AbsoluteFill style={{ transformOrigin: `${ft[0]}px ${ft[1]}px`, transform: `translate(${(540 - ft[0]) * fly}px, ${(900 - ft[1]) * fly}px) scale(${z})` }}>
        <svg width="1080" height="1920">
          <defs><marker id="ah" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6Z" fill={T.red} /></marker></defs>
          <path d={base} fill={`${T.gold}1c`} stroke={T.gold} strokeWidth={(kind === "world" ? 1.5 : 3) / z} />
          {(s.highlight ?? []).map((ll: number[], i: number) => { const q = P(ll); return <circle key={i} cx={q[0]} cy={q[1]} r={70} fill={T.accent} opacity={0.25} />; })}
          {river && <path d={pathOf(river.slice(0, riverN))} fill="none" stroke={T.water} strokeWidth={16 / z} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 12px ${T.water})` }} />}
          {routePts.length > 1 && <path d={pathOf(routePts)} fill="none" stroke={s.routeColor === "red" ? T.red : T.accent} strokeWidth={12 / z} strokeLinecap="round" strokeDasharray={s.dashed ? "30 18" : undefined} strokeDashoffset={-lt * 120} style={{ filter: `drop-shadow(0 0 10px ${T.accent})` }} />}
          {routePts.length > 1 && <circle cx={routePts[routePts.length - 1][0]} cy={routePts[routePts.length - 1][1]} r={14 / z} fill="#fff" />}
          {(s.arrows ?? []).map((a: any, i: number) => { const A = P(a.from), B = P(a.to), q = eo(clamp((lt - 0.3 - i * 0.15) / 1.2)); return <path key={i} d={`M${A[0]} ${A[1]} L${A[0] + (B[0] - A[0]) * q} ${A[1] + (B[1] - A[1]) * q}`} stroke={T.red} strokeWidth={14 / z} strokeLinecap="round" markerEnd="url(#ah)" />; })}
          {(s.pins ?? []).map((pin: any, i: number) => {
            const q = P(pin.at ?? pin.ll ?? [pin.lon, pin.lat]); const a = bk(clamp((lt - (pin.t ?? 0.4 + i * 0.35)) / 0.35));
            return <g key={i} opacity={clamp(a * 2)}>
              <circle cx={q[0]} cy={q[1]} r={(30 + 70 * ((p.t * 1.1 + i * 0.3) % 1)) / z} fill="none" stroke={T.accent} strokeWidth={4 / z} opacity={1 - ((p.t * 1.1 + i * 0.3) % 1)} />
              <circle cx={q[0]} cy={q[1]} r={(18 / z) * a} fill={pin.color === "red" ? T.red : i === 0 ? T.accent : T.gold} stroke="#fff" strokeWidth={4 / z} />
              {pin.label && <text x={q[0] + (pin.dx ?? 0)} y={q[1] + (pin.dy ?? -40) / z} textAnchor="middle" fontFamily={fontFor(pin.label)} fontWeight={800} fontSize={(pin.size ?? 52) / z} fill={T.ink} stroke={T.bg} strokeWidth={10 / z} paintOrder="stroke">{pin.label}</text>}
            </g>;
          })}
          {(s.lines ?? []).map((l: any, i: number) => { const q = P(l.at); return <g key={i}><line x1={q[0]} y1={q[1] - 120} x2={q[0]} y2={q[1] + 120} stroke={T.gold} strokeWidth={6} strokeDasharray="14 10" /><text x={q[0]} y={q[1] + 170} textAnchor="middle" fontFamily={fontFor(l.label)} fontWeight={800} fontSize={44} fill={T.gold} stroke={T.bg} strokeWidth={10} paintOrder="stroke">{l.label}</text></g>; })}
          {s.riverLabel && river && <text x={river[Math.floor(river.length / 3)][0]} y={river[Math.floor(river.length / 3)][1] + 80} textAnchor="middle" fontFamily={fontFor(s.riverLabel)} fontWeight={800} fontSize={46} fill={T.water} stroke={T.bg} strokeWidth={10} paintOrder="stroke">{s.riverLabel}</text>}
        </svg>
      </AbsoluteFill>
    </Cam>
    {s.label && <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: LAT, fontWeight: 800, fontSize: 52, letterSpacing: 14, color: T.ink, opacity: 0.85 }}>{s.label}</div>}
    <Head p={p} />
  </>;
};

/* water scenes with boats/ships */
const fleet = (p: SceneP, mode: "attack" | "retreat" | "charge" | "advance") => {
  const T = useTheme(); const { s, lt, t, len } = p;
  const enemy = s.enemyColor === "gold" ? T.gold : T.red, hero = T.gold;
  const Sp = s.sprite === "ship" ? Ship : Boat;
  return <>
    <Sky top={s.bg === "night" ? "#0b0a2a" : "#2a1420"} bot="#0a0610" />{s.bg === "night" && <Stars t={t} />}
    <Waves t={t} y={1000} />
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
      {mode === "attack" && Array.from({ length: s.n ?? 12 }, (_, i) => { const ph = ((lt * 0.55 + i / (s.n ?? 12)) % 1), sc = 0.3 + ph * 2.4; return <Sp key={i} x={540 + ((i % 4) - 1.5) * 170 * sc} y={860 + ph * 760 + Math.sin(t * 3 + i) * 6} s={sc} c={enemy} />; })}
      {mode === "retreat" && Array.from({ length: s.n ?? 6 }, (_, i) => { const q = eo(clamp(lt / len)); return <Sp key={i} x={180 + i * 150 + lt * 40} y={1150 - q * 180 + (i % 2) * 60} s={1.6 - q * 0.9} c={s.color === "red" ? T.red : hero} />; })}
      {mode === "charge" && <>{Array.from({ length: 6 }, (_, i) => <Sp key={i} x={150 + i * 160} y={900} s={0.5} c={enemy} />)}<Sp x={540} y={1050 + eio(clamp(lt / len)) * 350} s={0.8 + eio(clamp(lt / len)) * 3.2} c={hero} flag={T.accent} /></>}
      {mode === "advance" && <>
        {Array.from({ length: s.n ?? 15 }, (_, i) => { const ph = clamp((lt - (i % 5) * 0.25) / Math.max(1, len - 0.5)); return <Sp key={i} x={-260 + eo(ph) * 480 + (i % 5) * 175 + Math.floor(i / 5) * 40} y={960 + Math.floor(i / 5) * 170 + Math.sin(t * 3 + i) * 6} s={0.8 + Math.floor(i / 5) * 0.3} c={hero} flag={i % 3 === 0 ? T.accent : undefined} />; })}
        {Array.from({ length: 5 }, (_, i) => <Sp key={`e${i}`} x={820 + i * 60 + eo(clamp(lt / len)) * 400} y={1000 + i * 70} s={0.7} c={enemy} />)}
      </>}
    </svg>
    <Embers t={t} n={mode === "charge" ? 60 : 20} />
    <Head p={p} />
  </>;
};

export const SCENES: Record<string, React.FC<{ p: SceneP }>> = {
  /* TEXT */
  title: ({ p }) => <><BG p={p} def="embers" /><Cam lt={p.lt} len={p.len} kind={p.cam}><Slam lt={p.lt} text={p.s.text} size={p.s.size} top={p.s.top ?? 740} sub={p.s.sub} color={useTheme().gold} style={p.s.style} /></Cam><Head p={{ ...p, s: { ...p.s, head: undefined } }} /></>,
  slam: ({ p }) => <><BG p={p} /><Cam lt={p.lt} len={p.len} kind={p.cam}><Lines lt={p.lt} lines={p.s.lines ?? [p.s.text]} stagger={p.s.stagger ?? 0.6} delay={p.s.delay ?? 0} size={p.s.size} style={p.s.style} top={p.s.top ?? 600} /></Cam><Head p={p} /></>,
  quote: ({ p }) => { const T = useTheme(); return <><BG p={p} def="rays" /><Cam lt={p.lt} len={p.len} kind={p.cam}><Lines lt={p.lt} lines={p.s.lines} stagger={p.s.stagger ?? 0.8} delay={p.s.delay ?? 0.3} size={p.s.size} top={p.s.top ?? 600} />{p.s.by && <div style={{ position: "absolute", top: 1240, width: "100%", textAlign: "center", fontFamily: LAT, fontWeight: 600, fontSize: 36, letterSpacing: 5, color: T.gold, opacity: clamp((p.lt - 1) / 0.4) }}>— {p.s.by}</div>}</Cam><Head p={p} /></>; },
  typewriter: ({ p }) => { const T = useTheme(); const n = Math.ceil(clamp(p.lt / (p.s.dur ?? 0.7)) * p.s.text.length); return <><Sky top="#000" bot="#000" /><div style={{ position: "absolute", top: 860, width: "100%", textAlign: "center", fontFamily: fontFor(p.s.text), fontWeight: 800, fontSize: p.s.size ?? 84, color: T.gold }}>{p.s.text.slice(0, Math.max(1, n))}</div></>; },
  year: ({ p }) => { const T = useTheme(); const { s, lt } = p; const v = s.from != null ? Math.round(s.from + (s.to - s.from) * eo(clamp(lt / (s.dur ?? 1)))) : s.to; return <><BG p={p} /><Cam lt={lt} len={p.len} kind={p.cam}><Slam lt={lt} text={String(v) + (s.suffix ?? "")} size={s.size ?? 300} top={680} color={T.gold} sub={s.sub} /></Cam><Head p={p} /></>; },
  counter: ({ p }) => { const T = useTheme(); const { s, lt } = p; const v = Math.round((s.from ?? 0) + ((s.to ?? 0) - (s.from ?? 0)) * eo(clamp((lt - (s.delayNum ?? 0)) / (s.dur ?? 1.4)))); return <><BG p={p} /><Cam lt={lt} len={p.len} kind={p.cam}><div style={{ position: "absolute", top: 700, width: "100%", textAlign: "center", fontFamily: LAT, fontWeight: 800, fontSize: s.size ?? 240, color: T.gold, textShadow: "0 10px 40px #000" }}>{s.prefix ?? ""}{v.toLocaleString("en-IN")}{s.suffix ?? ""}</div><Slam lt={lt} delay={0.3} text={s.label ?? ""} size={70} top={1000} /></Cam><Head p={p} /></>; },
  slash: ({ p }) => { const T = useTheme(); const { s, lt } = p; const at = s.at ?? 1.2; const sl = clamp((lt - at) / 0.12), sp = eo(clamp((lt - at - 0.1) / 0.5));
    const card = <div style={{ position: "absolute", top: 640, width: "100%", textAlign: "center" }}><div style={{ fontFamily: fontFor(s.text), fontWeight: 800, fontSize: s.size ?? 150, color: T.ink, textShadow: "0 10px 40px #000" }}><Rich s={s.text} /></div>{s.sub && <div style={{ fontFamily: fontFor(s.sub), fontWeight: 800, fontSize: 60, color: T.gold, marginTop: 20 }}>{s.sub}</div>}</div>;
    return <><BG p={p} def="blood" /><Cam lt={lt} len={p.len} kind={p.cam}>
      <AbsoluteFill style={{ clipPath: "polygon(0 0,100% 0,100% 38%,0 58%)", transform: `translate(${-sp * 30}px, ${-sp * 24}px)` }}>{card}</AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "polygon(0 58%,100% 38%,100% 100%,0 100%)", transform: `translate(${sp * 30}px, ${sp * 24}px)` }}>{card}</AbsoluteFill>
      {lt > at && <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><line x1={-50} y1={1114} x2={1130 * sl} y2={1114 - 384 * sl} stroke="#fff" strokeWidth={8 * (1 - clamp((lt - at - 0.15) / 0.3))} /></svg>}
    </Cam><Head p={p} /></>; },
  compare: ({ p }) => { const T = useTheme(); const { s, lt } = p; const a = eo(clamp(lt / 0.4)), b = eo(clamp((lt - 0.5) / 0.4));
    const col = (x: number, d: any, q: number, c: string) => <div style={{ position: "absolute", left: x, top: 560, width: 440, textAlign: "center", opacity: q, transform: `translateY(${(1 - q) * 60}px)` }}>
      <div style={{ fontFamily: fontFor(d.title), fontWeight: 800, fontSize: 64, color: c }}>{d.title}</div>
      {(d.rows ?? []).map((r: string, i: number) => <div key={i} style={{ marginTop: 30, fontFamily: fontFor(r), fontWeight: 800, fontSize: 48, color: T.ink, opacity: clamp((lt - 0.8 - i * 0.35) / 0.3) }}>{r}</div>)}
    </div>;
    return <><BG p={p} /><Cam lt={lt} len={p.len} kind={p.cam}>{col(60, s.left, a, T.gold)}{col(580, s.right, b, T.accent)}<div style={{ position: "absolute", left: 535, top: 560, width: 10, height: 700, background: T.gold, opacity: 0.5 }} /><div style={{ position: "absolute", top: 860, width: "100%", textAlign: "center", fontFamily: LAT, fontWeight: 800, fontSize: 80, color: T.ink }}>VS</div></Cam><Head p={p} /></>; },
  timeline: ({ p }) => { const T = useTheme(); const { s, lt } = p; const items = s.items ?? []; const n = items.length;
    return <><BG p={p} /><Cam lt={lt} len={p.len} kind={p.cam ?? "panR"}><svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><line x1={80} y1={960} x2={80 + 920 * eo(clamp(lt / 1))} y2={960} stroke={T.gold} strokeWidth={8} /></svg>
      {items.map((it: any, i: number) => { const x = 170 + (740 / Math.max(1, n - 1)) * i, q = bk(clamp((lt - 0.3 - i * 0.35) / 0.3)); return <div key={i} style={{ position: "absolute", left: x - 110, top: i % 2 ? 1000 : 700, width: 220, textAlign: "center", transform: `scale(${q})` }}><div style={{ fontFamily: LAT, fontWeight: 800, fontSize: 56, color: T.gold }}>{it.y}</div><div style={{ fontFamily: fontFor(it.t), fontWeight: 800, fontSize: 36, color: T.ink, lineHeight: 1.3 }}>{it.t}</div></div>; })}
    </Cam><Head p={p} /></>; },
  bars: ({ p }) => { const T = useTheme(); const { s, lt } = p; const items = s.items ?? []; const mx = Math.max(...items.map((i: any) => i.v));
    return <><BG p={p} /><Cam lt={lt} len={p.len} kind={p.cam}>{items.map((it: any, i: number) => { const q = eo(clamp((lt - 0.2 - i * 0.2) / 0.7)); return <div key={i} style={{ position: "absolute", left: 80, top: 600 + i * 150, width: 920 }}>
      <div style={{ fontFamily: fontFor(it.l), fontWeight: 800, fontSize: 42, color: T.ink }}>{it.l}</div>
      <div style={{ marginTop: 8, height: 56, width: `${(it.v / mx) * 80 * q}%`, background: i === (s.hi ?? 0) ? T.gold : `${T.gold}66`, borderRadius: 8 }} />
      <div style={{ position: "absolute", right: 0, top: 54, fontFamily: LAT, fontWeight: 800, fontSize: 44, color: T.gold, opacity: q }}>{it.d ?? it.v}</div></div>; })}
    </Cam><Head p={p} /></>; },

  /* MAPS */
  map_india: ({ p }) => <MapScene p={p} kind="india" />,
  map_region: ({ p }) => <MapScene p={p} kind="region" />,
  map_world: ({ p }) => <MapScene p={p} kind="world" />,

  /* WATER */
  fleet_attack: ({ p }) => fleet(p, "attack"),
  fleet_retreat: ({ p }) => fleet(p, "retreat"),
  boat_charge: ({ p }) => fleet(p, "charge"),
  fleet_advance: ({ p }) => fleet(p, "advance"),
  night_river: ({ p }) => { const { lt, t, len, s } = p; return <><Sky top="#0b0a2a" bot="#02020a" /><Stars t={t} /><svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><circle cx={820} cy={460} r={80} fill="#f5e6c4" /></svg><Cam lt={lt} len={len} kind={p.cam ?? "panL"}><svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><path d="M0 980 L180 900 L380 960 L560 880 L780 950 L1080 900 L1080 1100 L0 1100Z" fill="#120d24" /></svg><Waves t={t} y={1100} /></Cam><Head p={p} /></>; },

  /* LAND */
  army_march: ({ p }) => { const T = useTheme(); const { lt, t, len, s } = p; const horse = s.cavalry;
    return <><Sky top="#6b1a10" bot="#1a0405" /><Glow x={540} y={720} r={220} c1="#ffb067" c2={T.accent} /><Cam lt={lt} len={len} kind={p.cam}>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>{[0, 1, 2].map((row) => { const sc = 1.2 + row * 0.7, y = 1000 + row * 170, sp = (120 + row * 160) * (s.dir === "left" ? -1 : 1), c = row === 2 ? "#0b0203" : row === 1 ? "#2a0807" : "#4a1410";
        return <g key={row}>{Array.from({ length: 12 }, (_, i) => { const x = ((((i * 120 * sc * 0.7 + lt * sp) % 1500) + 1500) % 1500) - 200; return horse && row === 1 ? <Horse key={i} x={x} y={y} s={sc * 0.9} c={c} t={t + i} /> : <Soldier key={i} x={x} y={y} s={sc} c={c} />; })}</g>; })}
        <rect x={0} y={1420} width={1080} height={500} fill="#0b0203" /></svg></Cam>
      <Embers t={t} n={30} color="#ffcf9a" /><Head p={p} /></>; },
  silhouette: ({ p }) => { const T = useTheme(); const { lt, len, s } = p; const Sp = SPRITES[s.sprite ?? "soldier"]; return <><Sky top={T.bg2} bot="#050102" /><Cam lt={lt} len={len} kind={p.cam ?? "pull"}><Glow x={540} y={860} r={320} c1="#ffb067" c2={T.red} /><svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><Sp x={540} y={1150} s={s.scale ?? (s.sprite === "fort" || s.sprite === "temple" ? 1.8 : 4.2)} c="#0b0203" /></svg></Cam>{s.label && <Chip lt={lt} text={s.label} top={1230} />}<Head p={p} /></>; },
  landmark: ({ p }) => { const T = useTheme(); const { lt, t, len, s } = p; const Sp = SPRITES[s.sprite ?? "fort"]; return <><Sky top={s.bg === "night" ? "#0b0a2a" : "#ff9a5a"} bot={T.bg} />{s.bg === "night" && <Stars t={t} />}<Glow x={540} y={820} r={280} c1="#ffd7a1" c2="#ff8a4d" op={s.bg === "night" ? 0.3 : 0.8} /><Cam lt={lt} len={len} kind={p.cam ?? "push"} oy={1100}><svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><Sp x={540} y={1250} s={s.scale ?? 2} c="#140608" /><rect x={0} y={1250} width={1080} height={700} fill="#140608" /></svg></Cam>{s.label && <Chip lt={lt} text={s.label} top={1320} />}<Head p={p} /></>; },
  jets: ({ p }) => { const T = useTheme(); const { lt, t, len, s } = p; return <><Sky top="#0b1a2a" bot="#02060a" /><svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>{Array.from({ length: s.n ?? 3 }, (_, i) => { const q = eo(clamp((lt - i * 0.2) / Math.max(1, len - 0.3))); return <g key={i}><line x1={540 + (i - 1) * 260} y1={2100} x2={540 + (i - 1) * 260} y2={1900 - q * 1250 + 220} stroke="#ffffff55" strokeWidth={10} /><Jet x={540 + (i - 1) * 260} y={1900 - q * 1250} s={i === 1 ? 2.2 : 1.6} c={T.ink} /></g>; })}</svg><Head p={p} /></>; },
  wall_build: ({ p }) => { const T = useTheme(); const { lt, len, s } = p; const n = 16, frac = s.frac ?? 0.6, built = Math.floor(clamp(lt / (len - 0.2)) * n * frac + 0.0001);
    return <><Sky top="#100c2a" bot="#03020a" /><svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><circle cx={980 - lt * 200} cy={620} r={60} fill="#f5e6c4" /></svg>
      <Cam lt={lt} len={len} kind={p.cam ?? "pull"}><svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><rect x={0} y={1150} width={1080} height={300} fill={T.water} opacity={0.35} />
        {Array.from({ length: n }, (_, i) => { const bx = 40 + i * 63, ts = (i / (n * frac)) * (len - 0.2), dp = clamp((lt - ts) / 0.18); return <g key={i}><rect x={bx} y={900} width={58} height={250} fill="none" stroke={`${T.gold}55`} strokeWidth={2} strokeDasharray="10 8" />{i <= built && lt >= ts && <rect x={bx} y={900 - (1 - eo(dp)) * 500} width={58} height={250} fill="#7a5233" stroke="#3d2614" strokeWidth={4} />}</g>; })}</svg></Cam>
      {s.clock && <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: LAT, fontWeight: 800, fontSize: 110, color: T.ink, textShadow: `0 0 30px ${T.water}` }}>{String((s.clock + Math.floor(lt * 2.6)) % 24).padStart(2, "0")}:00</div>}
      <Head p={p} /></>; },
  dawn: ({ p }) => { const T = useTheme(); const { lt, len } = p; const d = eo(clamp(lt / 0.5)); return <><AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(255,150,80,${d}), #3a1410 55%, ${T.bg})` }} /><Glow x={540} y={970 - 60 * d} r={150} c1="#ffd7a1" c2="#ff8a4d" op={1} /><Cam lt={lt} len={len} kind={p.cam}><Waves t={p.t} y={1150} op={0.7} /></Cam><Head p={p} /></>; },
  scroll: ({ p }) => { const { lt, len, s } = p; const u = eo(clamp(lt / 0.6)); const T = useTheme();
    return <><Sky top="#140306" bot="#050102" /><Cam lt={lt} len={len} kind={p.cam ?? "pull"}><div style={{ position: "absolute", left: 140, right: 140, top: 520, height: 820 * u + 40, borderRadius: 8, overflow: "hidden", background: "linear-gradient(160deg,#efdcb2,#d8bd85)", boxShadow: "0 25px 60px rgba(0,0,0,.65)", filter: "url(#torn)" }}>
      <div style={{ padding: 60, textAlign: "center", fontWeight: 800, color: "#4a1d0c" }}>
        <div style={{ fontFamily: fontFor(s.title ?? ""), fontSize: 58 }}>{s.title}</div>
        {s.meta && <div style={{ fontFamily: LAT, fontSize: 34, letterSpacing: 4, marginTop: 10 }}>{s.meta}</div>}
        {(s.lines ?? []).map((l: string, i: number) => <div key={i} style={{ fontFamily: fontFor(l), fontSize: 48, marginTop: i ? 16 : 70, opacity: clamp((lt - 0.4 - i * 0.3) / 0.3) }}>{l}</div>)}
        {s.seal !== false && <div style={{ margin: "60px auto 0", width: 150, height: 150, borderRadius: 75, background: T.red, opacity: clamp((lt - (s.sealAt ?? 0.9)) / 0.15), transform: `scale(${2 - clamp((lt - (s.sealAt ?? 0.9)) / 0.15)})` }} />}
      </div></div></Cam><Head p={p} /></>; },
  stone: ({ p }) => { const T = useTheme(); const { lt, len, s } = p; const ring = eo(clamp((lt - (s.ringAt ?? 1)) / 0.8));
    return <><BG p={p} /><Cam lt={lt} len={len} kind={p.cam}><div style={{ position: "absolute", top: 480, left: 120, right: 120, height: 860, borderRadius: 30, background: "radial-gradient(ellipse at 40% 30%, #8f7a63, #5b4a3a 70%)", boxShadow: "inset 0 0 80px rgba(0,0,0,.6), 0 30px 60px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", top: 320, width: "100%", textAlign: "center", fontFamily: fontFor(s.text), fontWeight: 800, fontSize: s.size ?? 200, color: "#2b1d10", textShadow: "2px 2px 0 rgba(255,255,255,.15)" }}>{s.text}</div>
      <svg width="840" height="860" style={{ position: "absolute", inset: 0 }}><ellipse cx={420} cy={430} rx={300} ry={170} fill="none" stroke={T.gold} strokeWidth={10} strokeDasharray="1500" strokeDashoffset={1500 * (1 - ring)} /></svg>
    </div>{s.note && <div style={{ position: "absolute", top: 1360, width: "100%", textAlign: "center", fontFamily: LAT, fontWeight: 600, fontSize: 30, color: `${T.ink}99` }}>{s.note}</div>}</Cam><Head p={p} /></>; },

  /* MOOD */
  lamp: ({ p }) => { const T = useTheme(); const fl = 0.75 + 0.25 * Math.sin(p.t * 37) * Math.sin(p.t * 13); return <><Sky top="#120306" bot="#000" /><Glow x={540} y={810} r={250} c1={`rgba(255,176,103,${0.9 * fl})`} c2={`rgba(216,49,42,${0.4 * fl})`} op={1} /><svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><path d="M520 860 Q540 780 560 860 Q575 900 540 920 Q505 900 520 860Z" fill="#ffd27a" opacity={fl} /><rect x={490} y={918} width={100} height={30} rx={8} fill="#7a5233" /></svg><Head p={p} /></>; },
  pulse: ({ p }) => { const T = useTheme(); const { lt, t, len, s } = p; const hb = Math.max(0, Math.sin(t * Math.PI * 2.4)) ** 6; const Sp = SPRITES[s.sprite ?? "boat"];
    return <><Sky top="#160406" bot="#000" /><AbsoluteFill style={{ transform: `scale(${1 + hb * 0.04})`, filter: `saturate(${s.desat === false ? 1 : 1 - clamp(lt / 2)})` }}>
      {s.sprite !== "none" && <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><Sp x={540} y={1150} s={s.sprite === "boat" || !s.sprite ? 3.2 : 3.6} c={T.gold} flag={T.accent} /></svg>}
      {s.text && <div style={{ position: "absolute", top: 520, width: "100%", textAlign: "center", fontFamily: fontFor(s.text), fontWeight: 800, fontSize: s.size ?? 110, color: T.ink, opacity: eo(clamp(lt / 0.4)) }}><Rich s={s.text} /></div>}
    </AbsoluteFill><Heart t={t} top={760} /><Vignette k={0.6 + 0.35 * clamp(lt / len)} /><Head p={{ ...p, s: { ...s, head: undefined } }} /></>; },
  fire: ({ p }) => <><Sky top="#3a0a06" bot="#0a0202" /><Flames t={p.t} /><Embers t={p.t} n={70} /><Cam lt={p.lt} len={p.len} kind={p.cam}>{p.s.text && <Slam lt={p.lt} text={p.s.text} top={700} size={p.s.size} sub={p.s.sub} />}</Cam><Head p={p} /></>,
  medal: ({ p }) => { const T = useTheme(); const { lt, t, s } = p; const m = bk(clamp((lt - 0.3) / 0.5)); return <><Sky top="#0d1530" bot="#03050d" /><Rays t={t} cy={860} n={16} op={0.07} /><svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><g transform={`translate(0,0)`}><Medal x={540} y={860} s={m} label={s.label ?? "★"} gold={T.gold} /></g></svg><Embers t={t} n={40} color="#ffe3a0" />{s.text && <Slam lt={lt} delay={s.textAt ?? 1} text={s.text} size={s.size ?? 110} top={1130} color={T.gold} sub={s.sub} />}<Head p={p} /></>; },

  /* MEDIA: a licensed / CC0 / own image from public/, Ken-Burns */
  image: ({ p }) => { const { lt, len, s } = p; return <><Sky top="#000" bot="#000" /><Cam lt={lt} len={len} kind={p.cam ?? "push"} amt={1.5}><Img src={staticFile(s.src)} style={{ position: "absolute", left: 0, top: s.top ?? 0, width: 1080, height: s.h ?? 1920, objectFit: "cover", filter: s.filter ?? "saturate(1.1) contrast(1.05)" }} /></Cam><Vignette k={0.7} />{s.credit && <div style={{ position: "absolute", bottom: 380, right: 40, fontFamily: LAT, fontWeight: 600, fontSize: 24, color: "#ffffffaa" }}>{s.credit}</div>}<Head p={p} /></>; },
};

/* ───────── rich "document & craft" scenes (added 25 Nov) ───────── */
const Wood: React.FC = () => <AbsoluteFill style={{ background: "repeating-linear-gradient(92deg,#3a2414 0 18px,#4a2e1a 18px 26px,#2e1c10 26px 40px)", filter: "contrast(1.1)" }}><AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(255,190,110,.35), rgba(0,0,0,.85) 80%)" }} /></AbsoluteFill>;
const Nib: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = -35, s = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-9} y={-330} width={18} height={250} rx={8} fill="#2a1a12" /><rect x={-11} y={-100} width={22} height={40} fill="#c9a24a" />
    <path d="M-11 -60 L11 -60 L4 0 L0 8 L-4 0Z" fill="#d9c08a" stroke="#8a6a2a" strokeWidth={2} /><line x1={0} y1={-40} x2={0} y2={4} stroke="#5a4520" strokeWidth={2} />
  </g>
);
const Parchment: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", background: "radial-gradient(ellipse at 40% 35%, #f6e7c3, #e2c995 70%, #c9a86a)", boxShadow: "0 40px 80px rgba(0,0,0,.7), inset 0 0 90px rgba(120,80,30,.45)", borderRadius: 6, ...style }}>{children}</div>
);
Object.assign(SCENES, {
  /* page being hand-written: lines reveal under a moving nib */
  calligraphy: ({ p }: { p: SceneP }) => {
    const T = useTheme(); const { lt, len, s } = p; const lines: string[] = s.lines ?? ["हम, भारत के लोग,", "भारत को एक सम्पूर्ण", "प्रभुत्व-सम्पन्न", "लोकतंत्रात्मक गणराज्य", "बनाने के लिए…"];
    const per = (len - 0.4) / lines.length; const cur = Math.min(lines.length - 1, Math.floor(lt / per)); const lp = clamp((lt - cur * per) / per);
    const lineY = (i: number) => 560 + i * 120;
    return <>
      <Wood />
      <Cam lt={lt} len={len} kind={p.cam ?? "push"} oy={lineY(cur)} amt={1.6}>
        <Parchment style={{ left: 90, right: 90, top: 380, height: 1080, transform: "rotate(-2deg)" }}>
          <div style={{ position: "absolute", inset: 30, border: `3px double ${T.gold}`, borderRadius: 4, opacity: 0.8 }} />
          {lines.map((l, i) => <div key={i} style={{ position: "absolute", left: 80, right: 80, top: lineY(i) - 380 - 60, fontFamily: DEV, fontWeight: 800, fontSize: 64, color: "#1d140c", whiteSpace: "nowrap", clipPath: i < cur ? "none" : i === cur ? `inset(0 ${(1 - lp) * 100}% 0 0)` : "inset(0 100% 0 0)", textShadow: "0 0 1px rgba(20,10,0,.6)" }}>{l}</div>)}
          {s.sign && <div style={{ position: "absolute", right: 80, bottom: 70, fontFamily: DEV, fontWeight: 800, fontSize: 44, color: "#7a1d12", opacity: clamp((lt - len + 1.2) / 0.4) }}>— {s.sign}</div>}
        </Parchment>
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><Nib x={170 + (cur < lines.length ? lp : 1) * 760} y={lineY(cur) + 20 + Math.sin(lt * 30) * 4} /></svg>
      </Cam>
      <Glow x={900} y={300} r={420} c1="rgba(255,200,120,.45)" c2="rgba(255,140,60,.12)" op={0.9} />
      <Head p={p} />
    </>;
  },
  /* a name written in gold across a page */
  signature: ({ p }: { p: SceneP }) => {
    const T = useTheme(); const { lt, len, s } = p; const q = clamp((lt - 0.3) / Math.max(0.8, len - 1));
    return <><Wood /><Cam lt={lt} len={len} kind={p.cam ?? "pull"}>
      <Parchment style={{ left: 60, right: 60, top: 560, height: 700, transform: "rotate(1.5deg)" }}>
        {[0, 1, 2, 3].map((k) => <div key={k} style={{ position: "absolute", left: 70, right: 70, top: 80 + k * 70, height: 16, borderRadius: 8, background: "rgba(40,25,10,.18)" }} />)}
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: DEV, fontWeight: 800, fontSize: s.size ?? 92, color: T.gold, textShadow: "0 2px 0 #7a5a18, 0 0 24px rgba(242,193,78,.6)", clipPath: `inset(0 ${(1 - q) * 100}% 0 0)` }}>{s.text}</div>
        {s.sub && <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontFamily: DEV, fontWeight: 800, fontSize: 46, color: "#5a1d12", opacity: clamp((lt - len + 0.9) / 0.4) }}>{s.sub}</div>}
      </Parchment></Cam>
      <Embers t={p.t} n={30} color="#ffe3a0" /><Head p={p} /></>;
  },
  /* desk of many nibs + inkpot, number counter */
  nibs: ({ p }: { p: SceneP }) => {
    const T = useTheme(); const { lt, len, s } = p; const n = Math.round((s.count ?? 60) * eo(clamp(lt / (len * 0.8))));
    return <><Wood /><Cam lt={lt} len={len} kind={p.cam ?? "dutch"}>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        <ellipse cx={540} cy={1180} rx={140} ry={40} fill="#0a0604" opacity={0.6} /><path d="M420 1180 L420 1060 Q540 1000 660 1060 L660 1180Z" fill="#111a2e" /><ellipse cx={540} cy={1060} rx={120} ry={34} fill="#0b1020" /><ellipse cx={520} cy={1048} rx={50} ry={10} fill="#3a5a9a" opacity={0.5} />
        {Array.from({ length: Math.min(70, Math.round(n / (s.count ?? 60) * 70)) }, (_, i) => <Nib key={i} x={540 + Math.cos(i * 2.4) * (200 + (i % 7) * 45)} y={1180 + Math.sin(i * 2.4) * (110 + (i % 5) * 35)} rot={(i * 47) % 360} s={0.6} />)}
      </svg></Cam>
      <div style={{ position: "absolute", top: 560, width: "100%", textAlign: "center", fontFamily: LAT, fontWeight: 800, fontSize: 230, color: T.gold, textShadow: "0 10px 40px #000" }}>{s.prefix ?? ""}{n}{s.suffix ?? ""}</div>
      {s.label && <Slam lt={lt} delay={0.3} text={s.label} size={68} top={830} />}
      <Head p={p} /></>;
  },
  /* grand hall with arches and chandelier, dolly forward */
  hall: ({ p }: { p: SceneP }) => {
    const T = useTheme(); const { lt, len, s } = p; const z = 1 + 0.35 * eo(clamp(lt / len));
    return <><Sky top="#2a1408" bot="#0a0503" />
      <AbsoluteFill style={{ transformOrigin: "540px 900px", transform: `scale(${z})` }}>
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          <defs><linearGradient id="hl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffcf8a" stopOpacity=".55" /><stop offset="1" stopColor="#ffcf8a" stopOpacity="0" /></linearGradient></defs>
          {[0, 1, 2, 3, 4].map((k) => { const w = 980 - k * 170, h = 1300 - k * 230, x = 540 - w / 2, y = 1500 - h; return <path key={k} d={`M${x} 1500 L${x} ${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} L${x + w} 1500`} fill="none" stroke={`rgba(240,190,120,${0.55 - k * 0.08})`} strokeWidth={22 - k * 3} />; })}
          <path d="M0 1500 L1080 1500 L1080 1920 L0 1920Z" fill="#1a0d06" />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={540} y1={1500} x2={-400 + i * 235} y2={1920} stroke="#3a2010" strokeWidth={4} />)}
          <path d="M540 200 L540 420" stroke={T.gold} strokeWidth={4} />
          {Array.from({ length: 11 }, (_, i) => <circle key={i} cx={540 + Math.cos((i / 11) * Math.PI * 2) * 120} cy={460 + Math.sin((i / 11) * Math.PI * 2) * 30} r={10} fill="#ffe2a0" opacity={0.7 + 0.3 * Math.sin(p.t * 6 + i)} />)}
          <ellipse cx={540} cy={460} rx={140} ry={40} fill="none" stroke={T.gold} strokeWidth={4} />
          <path d="M340 480 L740 480 L960 1500 L120 1500Z" fill="url(#hl)" />
          {[220, 860].map((x) => <rect key={x} x={x - 40} y={700} width={80} height={800} fill="#2a160a" stroke="#5a3418" strokeWidth={4} />)}
        </svg>
      </AbsoluteFill>
      <Embers t={p.t} n={30} color="#ffe3a0" />
      {s.label && <Chip lt={lt} text={s.label} top={1240} delay={0.4} />}
      <Head p={p} /></>;
  },
  /* illuminated bound manuscript opening (3D page turn) */
  book: ({ p }: { p: SceneP }) => {
    const T = useTheme(); const { lt, len, s } = p; const turn = eio(clamp((lt - 0.3) / 1.2));
    return <><Sky top="#1d1a52" bot="#05040f" /><Rays t={p.t} cy={950} n={18} op={0.09} />
      <Cam lt={lt} len={len} kind={p.cam ?? "push"} oy={950}>
        <div style={{ position: "absolute", left: 140, top: 520, width: 800, height: 900, perspective: 2200 }}>
          <div style={{ position: "absolute", left: 400, width: 400, height: 900, background: "linear-gradient(90deg,#d8bd85,#f3e3bd)", boxShadow: "0 30px 60px rgba(0,0,0,.6)", borderRadius: "0 8px 8px 0" }}>
            <div style={{ position: "absolute", inset: 30, border: `6px double ${T.gold}` }} />
            {Array.from({ length: 9 }, (_, k) => <div key={k} style={{ position: "absolute", left: 60, right: 60, top: 140 + k * 70, height: 12, borderRadius: 6, background: "rgba(40,25,10,.25)" }} />)}
          </div>
          <div style={{ position: "absolute", left: 0, width: 400, height: 900, background: "linear-gradient(270deg,#d8bd85,#f3e3bd)", borderRadius: "8px 0 0 8px", boxShadow: "0 30px 60px rgba(0,0,0,.6)" }}>
            <div style={{ position: "absolute", inset: 30, border: `6px double ${T.gold}` }} />
            {Array.from({ length: 9 }, (_, k) => <div key={k} style={{ position: "absolute", left: 60, right: 60, top: 140 + k * 70, height: 12, borderRadius: 6, background: "rgba(40,25,10,.25)" }} />)}
          </div>
          <div style={{ position: "absolute", left: 400, width: 400, height: 900, transformOrigin: "0 50%", transform: `rotateY(${-178 * turn}deg)`, transformStyle: "preserve-3d", background: "linear-gradient(135deg,#5a1414,#2a0606)", border: `8px solid ${T.gold}`, borderRadius: "0 10px 10px 0", boxShadow: "0 30px 60px rgba(0,0,0,.7)", backfaceVisibility: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", fontFamily: DEV, fontWeight: 800, color: T.gold }}><div style={{ fontSize: 70, lineHeight: 1.3 }}>{s.cover ?? "भारत का\nसंविधान"}</div><div style={{ margin: "30px auto 0", width: 120, height: 120, borderRadius: 60, border: `5px solid ${T.gold}` }} /></div>
          </div>
        </div>
      </Cam>
      <Embers t={p.t} n={40} color="#ffe3a0" />{s.text && <Slam lt={lt} delay={s.textAt ?? 1.2} text={s.text} size={s.size ?? 96} top={1430} color={T.gold} sub={s.sub} />}
      <Head p={p} /></>;
  },
});

/* ---------- desert village scenes (Kuldhara etc.) ---------- */
const Dunes: React.FC<{ y?: number; c1?: string; c2?: string }> = ({ y = 1280, c1 = "#7a4220", c2 = "#4a2410" }) => <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
  <path d={`M0 ${y} Q270 ${y - 90} 540 ${y - 20} T1080 ${y - 40} L1080 1920 L0 1920Z`} fill={c1} />
  <path d={`M0 ${y + 140} Q320 ${y + 40} 640 ${y + 130} T1080 ${y + 90} L1080 1920 L0 1920Z`} fill={c2} /></svg>;
/* one sandstone house: roofless = ruin, lit = window glow */
const House: React.FC<{ x: number; y: number; w: number; h: number; ruin?: number; lit?: number; c?: string }> = ({ x, y, w, h, ruin = 0, lit = 0, c = "#c98a4b" }) => {
  const cut = ruin * h * 0.35;
  return <g>
    <path d={`M${x} ${y} L${x} ${y - h + cut * 0.4} L${x + w * 0.35} ${y - h + cut} L${x + w * 0.7} ${y - h + cut * 0.2} L${x + w} ${y - h + cut * 0.7} L${x + w} ${y}Z`} fill={c} stroke="#00000055" strokeWidth={3} />
    {ruin < 0.5 && <rect x={x - 8} y={y - h - 14} width={w + 16} height={16} fill="#8a5428" />}
    <rect x={x + w * 0.38} y={y - h * 0.45} width={w * 0.24} height={h * 0.45} rx={w * 0.12} fill={lit > 0 ? `rgba(255,190,90,${lit})` : "#2a140a"} />
    <rect x={x + w * 0.12} y={y - h * 0.8} width={w * 0.16} height={h * 0.16} fill={lit > 0 ? `rgba(255,200,110,${lit * 0.9})` : "#2a140a"} />
    <rect x={x + w * 0.72} y={y - h * 0.8} width={w * 0.16} height={h * 0.16} fill={lit > 0 ? `rgba(255,200,110,${lit * 0.9})` : "#2a140a"} />
  </g>;
};
const ROW = [[30, 1290, 170, 190], [210, 1300, 150, 240], [370, 1285, 190, 200], [570, 1300, 160, 260], [740, 1290, 170, 210], [920, 1300, 150, 230], [-60, 1440, 210, 250], [160, 1450, 230, 220], [400, 1440, 200, 280], [610, 1450, 230, 240], [850, 1445, 230, 260]];
export const VILLAGE_SCENES: Record<string, React.FC<{ p: SceneP }>> = {
  /* village of sandstone houses. mode: day | night | out (lights go off one by one) | ruins */
  village: ({ p }) => {
    const T = useTheme(); const { lt, t, len, s } = p; const mode = s.mode ?? "day";
    const night = mode === "night" || mode === "out";
    const qk = mode === "quake" ? clamp((lt - 0.4) / Math.max(0.6, len - 0.8)) : 0;
    const shk = mode === "quake" && lt > 0.4 && lt < len - 0.2 ? Math.sin(t * 61) * 14 * (1 - qk * 0.5) : 0;
    const build = s.build ? clamp(lt / Math.max(0.8, len * 0.7)) : 1;
    return <>
      {night ? <><Sky top="#0b0a2a" bot="#1a0d20" /><Stars t={t} /></> : mode === "ruins" ? <Sky top="#f0a060" bot="#7a3a1a" /> : <Sky top="#ffb36b" bot="#d9733a" />}
      <Glow x={mode === "ruins" ? 300 : 820} y={night ? 560 : 620} r={night ? 90 : 160} c1={night ? "#f5e6c4" : "#fff0c0"} c2={night ? "#f5e6c4" : "#ffb060"} op={1} />
      <Cam lt={lt} len={len} kind={p.cam ?? "panR"} oy={1250} amt={1.3}><AbsoluteFill style={{ transform: `translate(${shk}px, ${shk * 0.6}px)` }}>
        <Dunes y={1250} c1={night ? "#2a1626" : "#a8602c"} c2={night ? "#180c18" : "#7a4220"} />
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          {ROW.map(([x, y, w, h], i) => {
            const shown = clamp(build * ROW.length - i); if (shown <= 0) return null;
            const off = mode === "out" ? clamp((lt - 0.3 - ((i * 7) % ROW.length) * (len - 0.8) / ROW.length) / 0.15) : 0;
            const lit = night ? (1 - off) * (0.75 + 0.25 * Math.sin(t * 9 + i)) : 0;
            return <g key={i} transform={`translate(0 ${(1 - eo(shown)) * 60})`} opacity={shown}><House x={x} y={y} w={w} h={h} ruin={mode === "ruins" ? 0.6 + (i % 3) * 0.2 : mode === "quake" ? clamp(qk * 1.6 - (i % 4) * 0.15) : 0} lit={lit} c={night ? "#4a2a2a" : "#c98a4b"} />
              {mode === "quake" && <path d={`M${x + w * 0.5} ${y - h} l${-w * 0.12} ${h * 0.25} l${w * 0.2} ${h * 0.2} l${-w * 0.15} ${h * 0.3}`} fill="none" stroke="#1a0a04" strokeWidth={5} strokeDasharray={h} strokeDashoffset={h * (1 - clamp(qk * 2 - (i % 3) * 0.2))} />}</g>;
          })}
          {mode === "quake" && Array.from({ length: 18 }, (_, k) => { const fx = (k * 137) % 1080, fy = 1000 + ((lt * 900 + k * 83) % 500); return <rect key={k} x={fx} y={fy} width={14 + (k % 3) * 8} height={10 + (k % 2) * 8} fill="#8a5428" opacity={qk > 0.05 ? 0.9 : 0} transform={`rotate(${k * 40 + lt * 200} ${fx} ${fy})`} />; })}
        </svg>
      </AbsoluteFill></Cam>
      {mode === "ruins" && <Embers t={t} n={25} color="#ffd9a0" />}
      {s.label && <Chip lt={lt} text={s.label} top={s.labelTop ?? 1620} delay={0.3} />}
      <Head p={p} />
    </>;
  },
  /* night caravan: people + camels with lanterns walking off over dunes */
  caravan: ({ p }) => {
    const T = useTheme(); const { lt, t, len, s } = p; const n = s.n ?? 14; const q = lt / len;
    return <>
      <Sky top="#0b0a2a" bot="#2a1430" /><Stars t={t} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}><circle cx={250} cy={600} r={70} fill="#f5e6c4" /></svg>
      <Cam lt={lt} len={len} kind={p.cam ?? "still"}>
        <Dunes y={1180} c1="#2a1626" c2="#140a14" />
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: n }, (_, i) => {
            const x = 1200 - ((q * 900 + i * 95) % 1500), y = 1170 + Math.sin(x / 260) * 30 - (i % 2) * 8, bob = Math.sin(t * 6 + i) * 4;
            const camel = i % 4 === 0;
            return <g key={i} transform={`translate(${x} ${y + bob}) scale(1.7)`}>
              {camel ? <path d="M-60 0 L-50 -60 Q-30 -100 0 -70 Q20 -110 40 -70 L60 -90 L75 -95 L70 -70 L55 -55 L50 0 L40 0 L35 -40 L-35 -40 L-40 0Z" fill="#06030a" />
                : <><circle cx={0} cy={-78} r={11} fill="#06030a" /><path d="M-12 -66 L12 -66 L16 -20 L8 0 L2 0 L0 -18 L-2 0 L-8 0 L-16 -20Z" fill="#06030a" /><path d="M-14 -60 L-30 -40" stroke="#06030a" strokeWidth={6} />
                  {i % 3 === 1 && <><line x1={16} y1={-58} x2={30} y2={-44} stroke="#06030a" strokeWidth={4} /><circle cx={30} cy={-38} r={7 + Math.sin(t * 20 + i)} fill="#ffc46a" /><circle cx={30} cy={-38} r={26} fill="#ffb04a" opacity={0.25} /></>}</>}
            </g>;
          })}
        </svg>
      </Cam>
      <Head p={p} />
    </>;
  },
  /* stepwell cross-section; water level falls from `from` to `to` (0..1) */
  stepwell: ({ p }) => {
    const T = useTheme(); const { lt, len, s } = p; const lv = (s.from ?? 0.8) + ((s.to ?? 0.8) - (s.from ?? 0.8)) * eio(clamp((lt - 0.3) / Math.max(0.8, len - 0.6)));
    const top = 620, bot = 1500, wy = bot - (bot - top) * lv;
    return <><Sky top="#ffb36b" bot="#a8602c" />
      <Cam lt={lt} len={len} kind={p.cam ?? "push"} oy={1100}>
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          <rect x={0} y={top - 40} width={1080} height={1400} fill="#7a4220" />
          <path d={`M90 ${top} ${Array.from({ length: 8 }, (_, k) => `L${90 + k * 50} ${top + k * 110} L${90 + (k + 1) * 50} ${top + k * 110}`).join(" ")} L490 ${bot} L590 ${bot} ${Array.from({ length: 8 }, (_, k) => `L${590 + k * 50} ${bot - k * 110} L${590 + (k + 1) * 50} ${bot - k * 110}`).join(" ")} L990 ${top}Z`} fill="#c98a4b" stroke="#5a3010" strokeWidth={4} />
          <path d={`M${90 + ((wy - top) / 110) * 50} ${wy} L${990 - ((wy - top) / 110) * 50} ${wy} L590 ${bot} L490 ${bot}Z`} fill={T.water} opacity={0.85} />
          <line x1={60} y1={wy} x2={1020} y2={wy} stroke="#fff" strokeWidth={3} strokeDasharray="12 10" opacity={0.7} />
        </svg>
      </Cam>
      {s.label && <Chip lt={lt} text={s.label} top={1620} delay={0.3} />}
      <Head p={p} /></>;
  },
  /* harvest shrinks while tax stays */
  harvest: ({ p }) => {
    const T = useTheme(); const { lt, t, len, s } = p; const q = eio(clamp((lt - 0.4) / Math.max(0.8, len - 0.9)));
    const crop = 1 - q * (1 - (s.cropTo ?? 0.3));
    const bar = (x: number, h: number, c: string, label: string, val: string) => <g>
      <rect x={x} y={1240 - 620 * h} width={260} height={620 * h} rx={14} fill={c} />
      <text x={x + 130} y={1320} textAnchor="middle" fontFamily={DEV} fontWeight={800} fontSize={64} fill={T.ink}>{label}</text>
      <text x={x + 130} y={1240 - 620 * h - 30} textAnchor="middle" fontFamily={LAT} fontWeight={800} fontSize={60} fill={c}>{val}</text></g>;
    return <><BG p={p} def="embers" />
      <Cam lt={lt} len={len} kind={p.cam ?? "push"} oy={1100}>
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          {bar(160, crop, "#8fd06a", "फ़सल", "↓")}
          {bar(660, 1, T.red, "कर", "=")}
          {Array.from({ length: 7 }, (_, k) => { const x = 180 + k * 36, bend = q * 50 * (k % 2 ? 1 : 0.6); return <path key={k} d={`M${x} 1400 Q${x + 4} ${1400 - 120 * crop} ${x + bend} ${1400 - 220 * crop}`} stroke="#d9c25a" strokeWidth={6} fill="none" opacity={0.0} />; })}
        </svg>
      </Cam>
      <Head p={p} /></>;
  },
  /* curse: red word burns in over dark ruins */
  curse: ({ p }) => {
    const T = useTheme(); const { lt, t, len, s } = p; const f = 0.6 + 0.4 * Math.sin(t * 17) * Math.sin(t * 5);
    return <><Sky top="#1a0204" bot="#000" /><Flames t={t} /><Embers t={t} n={70} />
      <Cam lt={lt} len={len} kind={p.cam ?? "push"}>
        <Slam lt={lt} text={s.text ?? "श्राप"} size={s.size ?? 260} top={640} color={T.red} style="blur" />
        {s.sub && <Slam lt={lt} delay={0.8} text={s.sub} size={66} top={1000} />}
      </Cam>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(216,49,42,${0.25 * f}), transparent 60%)` }} />
      <Head p={p} /></>;
  },
};
Object.assign(SCENES, VILLAGE_SCENES, DOSSIER);

export const SCENE_TYPES = Object.keys(SCENES);
