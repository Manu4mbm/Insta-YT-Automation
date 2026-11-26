import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { THEMES, ThemeCtx, clamp, eo, bk, hash, CAMS, shake, flashA, LightLeak, Vignette, Grain, Sky, Embers, fontFor, DEV, LAT, Rich } from "./engine/fx";
import { SCENES } from "./engine/scenes";

export type Spec = {
  slug: string; theme: string; series: string; badge?: string;
  voice?: string; voiceEnd: number; endCard?: number;
  impacts?: number[]; captions: [number, string][]; keywords?: string[];
  shots: any[];
  end?: { top?: string; title: string; sub?: string; follow?: string };
};

const Caption: React.FC<{ t: number; spec: Spec; T: any }> = ({ t, spec, T }) => {
  const C = spec.captions; if (t >= spec.voiceEnd + 0.2) return null;
  let i = -1; for (let k = 0; k < C.length; k++) if (t >= C[k][0]) i = k;
  if (i < 0) return null;
  const [s, txt] = C[i]; const e = i + 1 < C.length ? C[i + 1][0] : spec.voiceEnd;
  const words = txt.split(" "); const per = Math.max(0.12, (e - s - 0.15) / words.length);
  const keys = spec.keywords ?? [];
  return <div style={{ position: "absolute", top: 1470, left: 60, right: 60 }}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 26, rowGap: 4, fontFamily: fontFor(txt), fontWeight: 800, fontSize: 66, lineHeight: 1.4 }}>
      {words.map((w, j) => { const ws = s + j * per, p = clamp((t - ws) / 0.12), active = t >= ws && t < ws + per + 0.05;
        return <span key={j} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - eo(p)) * 24}px) scale(${active ? 1.05 : 1})`, color: keys.some((k) => w.includes(k)) ? T.gold : T.ink, WebkitTextStroke: "2px rgba(0,0,0,.6)", textShadow: "0 6px 0 rgba(0,0,0,.55), 0 0 24px rgba(0,0,0,.6)" }}>{w}</span>; })}
    </div></div>;
};

const End: React.FC<{ t: number; spec: Spec; T: any }> = ({ t, spec, T }) => {
  const lt = t - spec.voiceEnd, p = bk(clamp(lt / 0.35)), e = spec.end ?? { title: "" };
  return <><Sky /><Embers t={t} n={40} />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${p})`, textAlign: "center", background: "rgba(0,0,0,.75)", border: `5px solid ${T.gold}`, borderRadius: 30, padding: "44px 50px", width: 900 }}>
        {e.top && <div style={{ fontFamily: fontFor(e.top), fontWeight: 800, fontSize: 46, color: T.accent, letterSpacing: 4 }}>{e.top}</div>}
        <div style={{ fontFamily: fontFor(e.title), fontWeight: 800, fontSize: 70, color: T.ink, lineHeight: 1.35, marginTop: 14 }}><Rich s={e.title} /></div>
        {e.sub && <div style={{ fontFamily: fontFor(e.sub), fontWeight: 800, fontSize: 42, color: T.gold, marginTop: 16 }}>{e.sub}</div>}
      </div>
      <div style={{ position: "absolute", top: 1470, opacity: eo(clamp((lt - 0.6) / 0.4)), fontFamily: LAT, fontWeight: 800, fontSize: 50, color: T.ink, letterSpacing: 2 }}>{e.follow ?? "FOLLOW @INDIABYBHARAT"}</div>
    </AbsoluteFill></>;
};

export const Reel: React.FC<any> = (props) => {
  const spec: Spec = props.slug ? props : props.spec;
  const f = useCurrentFrame(), t = f / 30, T = THEMES[spec.theme] ?? THEMES.yoddha;
  const imp = spec.impacts ?? spec.shots.filter((s) => s.impact).map((s) => s.a);
  const sh = shake(t, imp);
  const idx = spec.shots.findIndex((s) => t >= s.a && t < s.b);
  const shot = spec.shots[idx];
  const dur = spec.voiceEnd + (spec.endCard ?? 3);
  let body: React.ReactNode = null;
  if (t >= spec.voiceEnd) body = <End t={t} spec={spec} T={T} />;
  else if (shot) {
    const Sc = SCENES[shot.type];
    const cam = shot.cam ?? CAMS[Math.floor(hash(spec.slug + idx) * CAMS.length)];
    body = Sc ? <Sc p={{ lt: t - shot.a, t, len: shot.b - shot.a, s: shot, cam }} /> : <div style={{ color: "red", fontSize: 60, padding: 100 }}>Unknown scene: {shot.type}</div>;
  }
  return <ThemeCtx.Provider value={T}>
    <AbsoluteFill style={{ background: T.bg, overflow: "hidden" }}>
      <svg width="0" height="0"><filter id="torn"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="3" /><feDisplacementMap in="SourceGraphic" scale="14" /></filter></svg>
      <AbsoluteFill style={{ transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(1.04)` }}>{body}<LightLeak t={t} /></AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flashA(t, imp), pointerEvents: "none" }} />
      <Vignette /><Grain f={f} />
      <div style={{ position: "absolute", top: 0, left: 0, height: 10, width: `${(t / dur) * 100}%`, background: `linear-gradient(90deg, ${T.accent}, ${T.gold})` }} />
      {!spec.clean && <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center" }}>
        <span style={{ display: "inline-block", border: `3px solid ${T.gold}`, borderRadius: 40, padding: "8px 30px", fontFamily: DEV, fontWeight: 800, fontSize: 38, color: T.gold, background: "rgba(0,0,0,.55)" }}>{spec.series}{spec.badge && <span style={{ fontFamily: LAT, fontSize: 30 }}> · {spec.badge}</span>}</span>
      </div>}
      <Caption t={t} spec={spec} T={T} />
      {spec.voice && <Audio src={staticFile(spec.voice)} />}
    </AbsoluteFill>
  </ThemeCtx.Provider>;
};
