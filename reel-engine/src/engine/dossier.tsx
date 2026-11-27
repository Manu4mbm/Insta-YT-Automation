/* Investigative "dossier" scenes: evidence board, polaroids, case file, newspaper. Code-drawn only. */
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp, eo, eio, bk, hash as hs, useTheme } from "./fx";
const hash = (n: number) => hs("k" + n);

const DEV = "NotoDev, sans-serif", LAT = "Inter, sans-serif", HAND = "NotoDev, cursive";
const fnt = (s: string) => (/[ऀ-ॿ]/.test(s) ? DEV : LAT);

/* --- tiny illustrations for polaroids (drawn in a 300x240 box) --- */
export const Pic: React.FC<{ kind: string; t: number; q?: number }> = ({ kind, t, q = 1 }) => {
  const sky = <rect width={300} height={240} fill="url(#psky)" />;
  const defs = <defs><linearGradient id="psky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb36b" /><stop offset="1" stopColor="#e07a3a" /></linearGradient>
    <linearGradient id="pnight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141238" /><stop offset="1" stopColor="#3a1838" /></linearGradient></defs>;
  const sand = <path d="M0 180 Q80 160 150 175 T300 170 L300 240 L0 240Z" fill="#a8602c" />;
  const houses = (dark = false) => [[20, 180, 50, 50], [75, 182, 45, 65], [125, 180, 55, 55], [185, 182, 45, 70], [235, 180, 50, 52]].map(([x, y, w, h], i) =>
    <g key={i}><rect x={x} y={y - h} width={w} height={h} fill={dark ? "#4a2a2a" : "#c98a4b"} stroke="#0004" /><rect x={x + w * 0.38} y={y - h * 0.45} width={w * 0.24} height={h * 0.45} rx={6} fill={dark ? "#ffbe5a" : "#2a140a"} /></g>);
  switch (kind) {
    case "village": return <svg viewBox="0 0 300 240">{defs}{sky}<circle cx={240} cy={60} r={26} fill="#fff3c4" />{sand}{houses()}</svg>;
    case "night": return <svg viewBox="0 0 300 240"><rect width={300} height={240} fill="#141238" /><circle cx={60} cy={55} r={20} fill="#f5e6c4" /><path d="M0 180 Q80 160 150 175 T300 170 L300 240 L0 240Z" fill="#2a1626" />{houses(true)}</svg>;
    case "well": { const lv = 1 - 0.75 * q; return <svg viewBox="0 0 300 240"><rect width={300} height={240} fill="#7a4220" />
      <path d="M20 30 L60 30 L60 70 L100 70 L100 110 L140 110 L140 200 L160 200 L160 110 L200 110 L200 70 L240 70 L240 30 L280 30 L280 0 L20 0Z" fill="#c98a4b" />
      <path d="M20 30 L60 30 L60 70 L100 70 L100 110 L140 110 L140 200 L160 200 L160 110 L200 110 L200 70 L240 70 L240 30 L280 30" fill="none" stroke="#5a3010" strokeWidth={4} />
      <rect x={140 - 120 * lv} y={200 - 170 * lv} width={20 + 240 * lv} height={170 * lv} fill="#3fa9d6" opacity={0.85} /></svg>; }
    case "river": return <svg viewBox="0 0 300 240">{defs}{sky}{sand}<path d="M-10 230 Q100 200 150 210 T310 195" stroke="#3fa9d6" strokeWidth={30 * (1 - 0.8 * q)} fill="none" opacity={0.9} />
      {[40, 120, 210].map((x, i) => <path key={i} d={`M${x} 214 l10 -6 l8 8 l12 -4`} stroke="#5a3010" strokeWidth={3} fill="none" opacity={q} />)}</svg>;
    case "coin": return <svg viewBox="0 0 300 240"><rect width={300} height={240} fill="#3a1a1a" />
      {Array.from({ length: 6 }, (_, i) => { const y = 200 - i * 22 + (i === 5 ? -40 * (1 - eo(clamp(q * 3))) : 0); return <g key={i}><ellipse cx={150} cy={y} rx={60} ry={16} fill="#d9a43a" stroke="#7a5410" strokeWidth={3} /><text x={150} y={y + 7} textAnchor="middle" fontFamily={DEV} fontWeight={800} fontSize={20} fill="#7a5410">₹</text></g>; })}
      <text x={50} y={60} fontFamily={DEV} fontWeight={800} fontSize={34} fill="#ff6a5a">कर</text></svg>;
    case "crack": return <svg viewBox="0 0 300 240">{defs}{sky}{sand}{houses()}<path d="M90 0 L120 60 L100 110 L140 170 L125 240" stroke="#1a0a04" strokeWidth={6} fill="none" strokeDasharray={300} strokeDashoffset={300 * (1 - q)} />
      <path d="M210 30 L190 90 L215 140" stroke="#1a0a04" strokeWidth={5} fill="none" strokeDasharray={200} strokeDashoffset={200 * (1 - q)} /></svg>;
    case "people": return <svg viewBox="0 0 300 240"><rect width={300} height={240} fill="#f3e3c0" />
      {Array.from({ length: 24 }, (_, i) => { const gone = i / 24 > 1 - q * 0.95; return <g key={i} opacity={gone ? 0.12 : 1} transform={`translate(${30 + (i % 8) * 34} ${50 + Math.floor(i / 8) * 62})`}><circle r={9} fill="#5a3010" /><path d="M-10 12 L10 12 L13 40 L-13 40Z" fill="#5a3010" /></g>; })}</svg>;
    case "curse": return <svg viewBox="0 0 300 240"><rect width={300} height={240} fill="#140204" /><text x={150} y={150} textAnchor="middle" fontFamily={DEV} fontWeight={800} fontSize={90} fill="#d8312a" opacity={0.75 + 0.25 * Math.sin(t * 13)}>श्राप</text></svg>;
    case "question": return <svg viewBox="0 0 300 240"><rect width={300} height={240} fill="#1a1030" /><text x={150} y={185} textAnchor="middle" fontFamily={LAT} fontWeight={900} fontSize={190} fill="#f6c36b">?</text></svg>;
    default: return <svg viewBox="0 0 300 240"><rect width={300} height={240} fill="#555" /></svg>;
  }
};

const Tape: React.FC<{ x: number; y: number; r?: number; w?: number }> = ({ x, y, r = -8, w = 130 }) =>
  <div style={{ position: "absolute", left: x - w / 2, top: y - 18, width: w, height: 36, background: "rgba(240,225,180,0.78)", transform: `rotate(${r}deg)`, boxShadow: "0 2px 6px #0003", borderLeft: "2px dashed #0001", borderRight: "2px dashed #0001" }} />;

export const Polaroid: React.FC<{ x: number; y: number; w?: number; rot?: number; kind: string; label?: string; t: number; q?: number; pin?: boolean; dim?: number; cross?: number }> = ({ x, y, w = 330, rot = 0, kind, label, t, q = 1, pin = true, dim = 0, cross = 0 }) => {
  const h = w * 1.18, pad = w * 0.06;
  return <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, background: "#fbf7ee", transform: `rotate(${rot}deg)`, boxShadow: "0 18px 40px rgba(0,0,0,0.55)", filter: dim ? `brightness(${1 - dim * 0.55})` : undefined }}>
    <div style={{ position: "absolute", left: pad, top: pad, width: w - pad * 2, height: (w - pad * 2) * 0.8, overflow: "hidden" }}><Pic kind={kind} t={t} q={q} /></div>
    {label && <div style={{ position: "absolute", left: 0, right: 0, bottom: h * 0.05, textAlign: "center", fontFamily: fnt(label), fontWeight: 800, fontSize: w * 0.12, color: "#2a1a10" }}>{label}</div>}
    {pin && <div style={{ position: "absolute", left: w / 2 - 16, top: -14, width: 32, height: 32, borderRadius: 16, background: "radial-gradient(circle at 35% 35%, #ff7a6a, #b01a12)", boxShadow: "0 4px 8px #0007" }} />}
    {cross > 0 && <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}><line x1={20} y1={20} x2={20 + (w - 40) * clamp(cross * 2)} y2={20 + (h - 40) * clamp(cross * 2)} stroke="#d8312a" strokeWidth={14} strokeLinecap="round" /><line x1={w - 20} y1={20} x2={w - 20 - (w - 40) * clamp(cross * 2 - 1)} y2={20 + (h - 40) * clamp(cross * 2 - 1)} stroke="#d8312a" strokeWidth={14} strokeLinecap="round" /></svg>}
  </div>;
};

const Cork: React.FC = () => <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #b07a48, #6a4020 75%)" }}>
  <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>{Array.from({ length: 900 }, (_, i) => <circle key={i} cx={hash(i) * 1080} cy={hash(i + 999) * 1920} r={1 + hash(i + 7) * 2.5} fill={hash(i + 3) > 0.5 ? "#3a2010" : "#e0b080"} />)}</svg>
  <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 220px rgba(0,0,0,0.75)" }} /></AbsoluteFill>;

/* evidence board: items [{kind,label,x,y,rot}], links [[i,j]], focus index -> zoom+spotlight, cross index -> X over it */
export const board: React.FC<{ p: any }> = ({ p }) => {
  const { lt, t, len, s } = p; const items = s.items ?? []; const links = s.links ?? [];
  const appear = (i: number) => bk(clamp((lt - (s.focus != null ? 0 : 0.12 * i)) / 0.3));
  const f = s.focus != null ? items[s.focus] : null; const zq = f ? eio(clamp((lt - 0.15) / 0.7)) : 0;
  const z = 1 + zq * ((s.zoom ?? 1.9) - 1); const cx = f ? 540 + (540 - f.x) * zq * 0 : 540;
  const drift = Math.sin(lt * 0.8) * 10;
  const tx = f ? (540 - f.x) * zq : drift, ty = f ? (900 - f.y) * zq : 0;
  return <AbsoluteFill style={{ overflow: "hidden" }}>
    <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: f ? `${f.x}px ${f.y}px` : "540px 900px" }}>
      <Cork />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {links.map(([a, b]: number[], k: number) => { const A = items[a], B = items[b]; const q = clamp((lt - 0.35 - k * 0.15) / 0.4); if (!A || !B) return null;
          const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 + 60; const ex = A.x + (B.x - A.x) * q, ey = A.y + (B.y - A.y) * q;
          return <path key={k} d={`M${A.x} ${A.y - 190} Q${mx} ${my - 190} ${ex} ${ey - 190}`} stroke="#c8211a" strokeWidth={6} fill="none" style={{ filter: "drop-shadow(0 3px 2px #0006)" }} />; })}
      </svg>
      {items.map((it: any, i: number) => { const q = appear(i); const fo = s.focus != null && s.focus !== i ? zq : 0;
        return <div key={i} style={{ position: "absolute", inset: 0, opacity: clamp(q * 2), transform: `translate(0, ${(1 - q) * -120}px)` }}>
          <Polaroid x={it.x} y={it.y} w={it.w ?? 300} rot={it.rot ?? 0} kind={it.kind} label={it.label} t={t} q={s.focus === i ? clamp((lt - 0.5) / (len - 0.8)) : 1} dim={fo} cross={s.cross === i ? clamp((lt - (s.crossAt ?? 0.8)) / 0.6) : 0} /></div>; })}
      {f && <div style={{ position: "absolute", left: f.x - 230, top: f.y - 270, width: 460, height: 540, border: `8px solid rgba(255,220,120,${zq})`, borderRadius: 30, boxShadow: `0 0 60px rgba(255,200,80,${zq * 0.6})` }} />}
    </AbsoluteFill>
    {s.tag && <div style={{ position: "absolute", left: 60, top: 230, padding: "14px 34px", background: "#f6c36b", color: "#1a0d05", fontFamily: fnt(s.tag), fontWeight: 900, fontSize: 64, transform: `rotate(-3deg) scale(${bk(clamp((lt - 0.4) / 0.3))})`, boxShadow: "0 10px 30px #0008" }}>{s.tag}</div>}
  </AbsoluteFill>;
};

/* single hero polaroid that swings in, with tape and handwritten note */
export const polaroid: React.FC<{ p: any }> = ({ p }) => {
  const { lt, t, len, s } = p; const q = bk(clamp(lt / 0.45)); const sw = Math.sin(lt * 2.2) * 2 * (1 - clamp(lt / len));
  return <AbsoluteFill><Cork />
    <div style={{ position: "absolute", inset: 0, transform: `scale(${0.6 + 0.4 * q}) rotate(${(1 - q) * -25 + sw}deg)`, transformOrigin: "540px 800px", opacity: clamp(q * 2) }}>
      <Polaroid x={540} y={800} w={680} rot={s.rot ?? -3} kind={s.kind} label={s.label} t={t} q={clamp((lt - 0.4) / Math.max(0.6, len - 0.8))} pin={false} />
      <Tape x={320} y={420} r={-24} /><Tape x={760} y={420} r={20} />
    </div>
    {s.note && <div style={{ position: "absolute", left: 0, right: 0, top: 1250, textAlign: "center", fontFamily: fnt(s.note), fontWeight: 800, fontSize: 70, color: "#fff4d6", textShadow: "0 6px 20px #000", transform: `rotate(-2deg)`, opacity: clamp((lt - 0.5) / 0.3) }}>{s.note}</div>}
  </AbsoluteFill>;
};

/* manila case file opening, typed lines, stamp */
export const casefile: React.FC<{ p: any }> = ({ p }) => {
  const T = useTheme(); const { lt, len, s } = p; const open = eio(clamp((lt - 0.15) / 0.55)); const lines: string[] = s.lines ?? [];
  const typed = Math.max(0, (lt - 0.7) * 34);
  let used = 0;
  return <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #3a2a20, #120a06 80%)" }}>
    <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + lt * 0.03}) rotate(${-2 + lt * 0.4}deg)`, transformOrigin: "540px 960px" }}>
      {/* back folder */}
      <div style={{ position: "absolute", left: 90, top: 470, width: 900, height: 1050, background: "#d9b56e", borderRadius: 14, boxShadow: "0 30px 60px #000a" }} />
      <div style={{ position: "absolute", left: 120, top: 420, width: 300, height: 80, background: "#d9b56e", borderRadius: "14px 14px 0 0", fontFamily: fnt(s.tab ?? ""), fontWeight: 900, fontSize: 36, color: "#5a3a10", textAlign: "center", lineHeight: "80px" }}>{s.tab ?? "CASE FILE"}</div>
      {/* paper */}
      <div style={{ position: "absolute", left: 140, top: 520, width: 800, height: 950, background: "#fbf6e8", boxShadow: "0 6px 20px #0005", padding: "70px 60px", boxSizing: "border-box", backgroundImage: "repeating-linear-gradient(0deg, transparent 0 77px, #d8cfb8 77px 79px)" }}>
        <div style={{ fontFamily: fnt(s.title ?? ""), fontWeight: 900, fontSize: 70, color: "#2a1a10", borderBottom: "6px solid #2a1a10", paddingBottom: 16, marginBottom: 30 }}>{s.title}</div>
        {lines.map((l, i) => { const start = used; used += l.length + 6; const n = Math.max(0, Math.min(l.length, Math.floor(typed - start)));
          return <div key={i} style={{ fontFamily: fnt(l), fontWeight: 800, fontSize: s.size ?? 58, color: i === (s.hi ?? -1) ? "#b01a12" : "#2a1a10", minHeight: 80, lineHeight: "80px" }}>{l.slice(0, n)}{n > 0 && n < l.length && Math.floor(lt * 4) % 2 === 0 ? "▍" : ""}</div>; })}
      </div>
      {/* front flap */}
      <div style={{ position: "absolute", left: 90, top: 470, width: 900, height: 1050, background: "linear-gradient(135deg,#e6c27a,#c99a50)", borderRadius: 14, transformOrigin: "90px 995px", transform: `perspective(2200px) rotateY(${-open * 165}deg)`, backfaceVisibility: "hidden", boxShadow: "0 20px 40px #0008", display: open > 0.5 ? "none" : "block" }}>
        <div style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", fontFamily: fnt(s.cover ?? ""), fontWeight: 900, fontSize: 90, color: "#5a3a10" }}>{s.cover ?? "TOP SECRET"}</div>
        <div style={{ position: "absolute", top: 520, width: "100%", textAlign: "center", fontFamily: LAT, fontWeight: 800, fontSize: 40, color: "#7a5420", letterSpacing: 8 }}>{s.coverSub ?? ""}</div>
      </div>
      {s.stamp && lt > (s.stampAt ?? 1.2) && (() => { const sq = clamp((lt - (s.stampAt ?? 1.2)) / 0.14); return <div style={{ position: "absolute", left: 560, top: 1220, padding: "10px 30px", border: `10px solid ${T.red}`, color: T.red, fontFamily: fnt(s.stamp), fontWeight: 900, fontSize: 84, transform: `rotate(-12deg) scale(${2.2 - 1.2 * sq})`, opacity: sq * 0.9, borderRadius: 10 }}>{s.stamp}</div>; })()}
    </div>
  </AbsoluteFill>;
};

/* vintage newspaper spinning in, headline + fake columns + photo */
export const newspaper: React.FC<{ p: any }> = ({ p }) => {
  const { lt, t, s } = p; const q = eo(clamp(lt / 0.7)); const rot = (1 - q) * 720 - 4, sc = 0.15 + 0.85 * q;
  return <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #2a2420, #0a0806 80%)" }}>
    <div style={{ position: "absolute", left: 90, top: 380, width: 900, height: 1150, background: "#ece3cc", transform: `rotate(${rot}deg) scale(${sc * (1 + lt * 0.02)})`, boxShadow: "0 30px 70px #000c", padding: 40, boxSizing: "border-box", filter: "sepia(0.25)" }}>
      <div style={{ fontFamily: LAT, fontWeight: 900, fontSize: 64, textAlign: "center", borderBottom: "4px double #222", paddingBottom: 10, letterSpacing: 2, color: "#1a1410" }}>{s.mast ?? "THE DAILY ARCHIVE"}</div>
      <div style={{ fontFamily: LAT, fontSize: 24, textAlign: "center", color: "#444", margin: "8px 0 18px" }}>{s.date ?? ""}</div>
      <div style={{ fontFamily: fnt(s.head ?? ""), fontWeight: 900, fontSize: s.size ?? 92, lineHeight: 1.12, color: "#110c08", textAlign: "center" }}>{s.head}</div>
      <div style={{ display: "flex", gap: 24, marginTop: 30 }}>
        <div style={{ width: 380, height: 300, border: "3px solid #222", overflow: "hidden", filter: "grayscale(0.7) contrast(1.1)" }}><Pic kind={s.pic ?? "crack"} t={t} q={clamp((lt - 0.6) / 1.2)} /></div>
        <div style={{ flex: 1 }}>{Array.from({ length: 11 }, (_, i) => <div key={i} style={{ height: 12, background: "#8a8070", margin: "0 0 15px", width: `${70 + hash(i) * 30}%` }} />)}</div>
      </div>
      {Array.from({ length: 6 }, (_, i) => <div key={i} style={{ height: 12, background: "#8a8070", margin: "16px 0 0", width: `${80 + hash(i + 9) * 20}%` }} />)}
    </div>
  </AbsoluteFill>;
};

export const DOSSIER = { board, polaroid, casefile, newspaper };
