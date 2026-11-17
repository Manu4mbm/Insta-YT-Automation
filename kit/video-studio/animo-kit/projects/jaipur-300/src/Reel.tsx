import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { D, PL, ramp, eout, back, lerp, clamp, keys, camAt, JaipurMap, Card, Badge, Stamp, Icon, groups, Captions, YearCard, GOLD, INK, SERIF, ITAL } from "./common";

const C = D.cue.r;
const wc = PL.wc;
const CITY: [number, number] = [wc[0] - 120, wc[1] + 120];

export const Reel: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const gs = useMemo(() => groups(D.reelWords, 3), []);
  // year shown on map + card
  const year = keys(t, [
    [0, 1727], [C.aaj + 0.2, 1727], [C.aaj + 1.6, 2026], [C.n1727 - 1.0, 2026], [C.n1727 - 0.2, 1727],
    [C.y1734 - 0.3, 1727], [C.y1734 + 0.4, 1734], [C.y1799 - 0.3, 1734], [C.y1799 + 0.5, 1799], [C.y1876 - 0.3, 1799], [C.y1876 + 0.6, 1876],
    [C.y1942 - 0.3, 1876], [C.y1942 + 0.6, 1942], [C.y1949 - 0.3, 1942], [C.y1949 + 0.6, 1949], [C.y1982 - 0.3, 1949], [C.y1982 + 0.8, 1982],
    [C.faila, 1985], [C.y2015 - 0.3, 2012], [C.y2015 + 0.4, 2015], [C.y2019 - 0.2, 2015], [C.y2019 + 0.4, 2019], [C.cta - 0.3, 2019], [C.cta + 0.8, 2027],
  ]);
  const cam = camAt(t, [
    [0, PL.amer[0] - 40, PL.amer[1] + 150, 1.05], [1.0, PL.amer[0] - 40, PL.amer[1] + 150, 1.05],
    [5.2, wc[0], wc[1] - 40, 1.55], [C.aaj + 0.4, wc[0], wc[1] - 20, 1.5], [C.aaj + 2.2, CITY[0], CITY[1], 0.55], [C.n1727 - 0.8, CITY[0], CITY[1], 0.53],
    [C.n1727 + 0.6, wc[0], wc[1], 2.5], [C.y1734 - 0.2, wc[0], wc[1], 2.7],
    [C.y1734 + 0.6, PL.jantar[0], PL.jantar[1] + 30, 3.6], [C.y1876 - 0.2, PL.hawa[0], PL.hawa[1] + 30, 3.7],
    [C.y1876 + 0.8, wc[0], wc[1] + 50, 2.4], [C.y1942 - 0.2, wc[0], wc[1] + 60, 2.5],
    [C.y1942 + 0.8, wc[0] - 60, wc[1] + 120, 1.6], [C.y1982 - 0.2, wc[0] - 60, wc[1] + 140, 1.45],
    [C.faila + 1.0, CITY[0], CITY[1], 0.58], [C.y2015 - 0.2, CITY[0], CITY[1], 0.56],
    [C.y2015 + 0.8, PL.mansarovar[0] + 230, PL.mansarovar[1] - 230, 1.0], [C.y2019 - 0.2, PL.mansarovar[0] + 240, PL.mansarovar[1] - 240, 1.05],
    [C.y2019 + 0.8, wc[0], wc[1], 2.1], [C.y1901 - 0.2, wc[0], wc[1], 2.2],
    [C.y1901 + 1.0, CITY[0], CITY[1], 0.56], [C.end + 0.5, CITY[0], CITY[1] - 20, 0.52],
  ]);
  const pins = [
    { at: PL.amer, name: "AMER", k: ramp(t, 0.3, 0.8) * (1 - ramp(t, C.aaj, C.aaj + 0.5)) },
    { at: PL.chandpole, name: "CHANDPOLE", k: ramp(t, C.parkota + 0.3, C.parkota + 0.7) * (1 - ramp(t, C.y1734 - 0.4, C.y1734)), size: 28 },
    { at: PL.surajpole, name: "SURAJPOLE", k: ramp(t, C.parkota + 0.6, C.parkota + 1.0) * (1 - ramp(t, C.y1734 - 0.4, C.y1734)), size: 28 },
    { at: PL.sanganeri, name: "SANGANERI GATE", k: ramp(t, C.parkota + 0.9, C.parkota + 1.3) * (1 - ramp(t, C.y1734 - 0.4, C.y1734)), size: 28 },
    { at: PL.jantar, name: "JANTAR MANTAR", k: ramp(t, C.jm, C.jm + 0.3) * (1 - ramp(t, C.y1942, C.y1942 + 0.5)), size: 40 },
    { at: [PL.hawa[0] + 6, PL.hawa[1] + 4] as any, name: "", k: ramp(t, C.hm, C.hm + 0.3) * (1 - ramp(t, C.y1942, C.y1942 + 0.5)), size: 40 },
    { at: PL.albert, name: "ALBERT HALL", k: ramp(t, C.pink, C.pink + 0.4) * (1 - ramp(t, C.y1942 + 2, C.y1942 + 2.5)), size: 26, color: INK },
    { at: PL.mi, name: "MI ROAD", k: ramp(t, C.mi, C.mi + 0.4) * (1 - ramp(t, C.y1982, C.y1982 + 0.5)), size: 30, color: INK },
    { at: PL.malviya, name: "MALVIYA NAGAR", k: ramp(t, C.malviya, C.malviya + 0.3) * (1 - ramp(t, C.y2015, C.y2015 + 0.5)), size: 60 },
    { at: PL.mansarovar, name: "MANSAROVAR", k: ramp(t, C.mansarovar, C.mansarovar + 0.3) * (1 - ramp(t, C.y2019 + 0.4, C.y2019 + 0.9)), size: 60 },
    { at: PL.vaishali, name: "VAISHALI NAGAR", k: ramp(t, C.vaishali, C.vaishali + 0.3) * (1 - ramp(t, C.y2015, C.y2015 + 0.5)), size: 60 },
    { at: PL.wc, name: "PARKOTA", k: ramp(t, C.faila + 0.5, C.faila + 1.0) * (1 - ramp(t, C.y2015, C.y2015 + 0.5)), size: 60 },
  ];
  const big = ramp(t, C.aaj + 0.3, C.aaj + 0.8) * (1 - ramp(t, C.n1727 - 0.6, C.n1727 - 0.1));
  const pop = keys(t, [[C.y1901, 1.6], [C.y2011 - 0.3, 1.6], [C.y2011 + 1.4, 30.7]]);
  return (
    <AbsoluteFill style={{ background: "#0b0e12" }}>
      <Img src={staticFile("table.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
      <div style={{ position: "absolute", inset: 0, perspective: 2200, perspectiveOrigin: "50% 35%" }}>
        <div style={{ position: "absolute", inset: 0, transform: "rotateX(20deg)", transformOrigin: "50% 60%" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: D.W, height: D.H, transformOrigin: "0 0", transform: `translate(${540 - cam.x * cam.z}px, ${1000 - cam.y * cam.z}px) scale(${cam.z})`, boxShadow: "0 60px 120px rgba(0,0,0,.8)" }}>
            <JaipurMap year={year} z={cam.z} pins={pins as any}
              walledDraw={t < C.n1727 ? ramp(t, 3.4, 5.4) : ramp(t, C.n1727 + 0.3, C.vidya)}
              grid={ramp(t, C.nau, C.nau + 0.5) * (1 - 0.6 * ramp(t, C.y1734, C.y1734 + 0.6))}
              gates={ramp(t, C.parkota, C.parkota + 0.5) * (1 - ramp(t, C.y1734, C.y1734 + 0.6))}
              pink={ramp(t, C.gulabi, C.gulabi + 0.8)}
              mi={ramp(t, C.mi, C.mi + 1.2)}
              metro={ramp(t, C.metro - 0.4, C.metro + 1.2)}
              unesco={ramp(t, C.unesco - 0.4, C.unesco + 0.3) * (0.75 + 0.25 * Math.sin(t * 5)) * (1 - ramp(t, C.y1901 + 0.8, C.y1901 + 1.4))}
              route={ramp(t, 1.0, 1.6) * (1 - ramp(t, 5.0, 5.8))}
              capital={ramp(t, C.capital - 0.2, C.capital + 0.3) * (1 - ramp(t, C.y1982 + 0.5, C.y1982 + 1))}
            />
          </div>
        </div>
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,.6) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 68%, rgba(0,0,0,.75))" }} />

      {/* hook */}
      {t < C.aaj + 0.4 && (
        <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", opacity: 1 - ramp(t, C.aaj - 0.2, C.aaj + 0.3) }}>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 48, color: "#efe4c4", textShadow: "0 3px 10px #000" }}>18 November 1727 → 2027</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 140, color: GOLD, lineHeight: 1, letterSpacing: 4, textShadow: "0 7px 0 #6b4a10, 0 16px 36px #000" }}>300 SAAL</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 92, color: "#fff", letterSpacing: 10, textShadow: "0 5px 18px #000" }}>JAIPUR</div>
        </div>
      )}
      {big > 0 && (
        <div style={{ position: "absolute", top: 190, width: "100%", textAlign: "center", opacity: big, transform: `scale(${0.8 + 0.2 * back(big)})` }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 210, color: GOLD, lineHeight: 1, textShadow: "0 9px 0 #6b4a10, 0 20px 40px #000" }}>300<span style={{ fontSize: 80 }}>VA</span></div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 70, color: "#fff", letterSpacing: 8, textShadow: "0 5px 18px #000" }}>SAAL SHURU</div>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 40, color: "#efe4c4", textShadow: "0 3px 10px #000" }}>Aaj ka Jaipur · approx. map</div>
        </div>
      )}
      {t > C.n1727 - 0.4 && t < C.y1901 - 0.1 && <YearCard year={year} style={{ right: 50, top: 140 }} size={84} />}

      <Badge t={t} a={C.n1727} b={C.vidya - 0.1} title="18 NOVEMBER 1727" sub="Sawai Jai Singh II ne basaya" x={50} y={150} size={44} />
      <Badge t={t} a={C.vidya} b={C.y1734 - 0.2} title="VIDYADHAR BHATTACHARYA" sub="Nagar niyojak · 9 khand ka naksha" x={50} y={150} size={40} />
      {/* monuments */}
      <Card k={back(ramp(t, C.jm, C.jm + 0.4)) * (1 - ramp(t, C.y1799 - 0.3, C.y1799))} style={{ left: 60, top: 150, padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Icon kind="jantar" w={130} /><div><div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 46, color: INK }}>JANTAR MANTAR</div><div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 32, color: "#5a4a2a" }}>1734 · khagol vedhshala</div></div>
      </Card>
      <Card k={back(ramp(t, C.hm, C.hm + 0.4)) * (1 - ramp(t, C.y1876 - 0.3, C.y1876))} style={{ left: 60, top: 150, padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Icon kind="hawa" w={130} /><div><div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 46, color: INK }}>HAWA MAHAL</div><div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 32, color: "#5a4a2a" }}>1799 · Lal Chand Ustad</div></div>
      </Card>
      <Badge t={t} a={C.y1876} b={C.y1942 - 0.2} title="1876" sub="Prince of Wales ka swagat" x={50} y={150} size={52} />
      <Stamp k={ramp(t, C.pink, C.pink + 0.35) * (1 - ramp(t, C.y1942 - 0.4, C.y1942))} text="PINK CITY" color="#c0566a" size={76} style={{ left: 300, top: 420 }} />
      <Badge t={t} a={C.y1942} b={C.y1949 - 0.2} title="1942" sub="Parkote ke bahar pehla vistaar" x={50} y={150} size={52} />
      <Badge t={t} a={C.y1949} b={C.y1982 - 0.2} title="1949" sub="Rajasthan ki rajdhani" x={50} y={150} size={52} />
      <Badge t={t} a={C.y1982} b={C.y2015 - 0.2} title="1982" sub="JDA · sheher har disha mein" x={50} y={150} size={52} />
      <Card k={back(ramp(t, C.y2015, C.y2015 + 0.4)) * (1 - ramp(t, C.y2019 - 0.3, C.y2019))} style={{ left: 50, top: 150, padding: "14px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Icon kind="metro" w={90} /><div><div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 48, color: INK }}>2015 · METRO</div><div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 30, color: "#5a4a2a" }}>Mansarovar → Chandpole</div></div></div>
      </Card>
      <Badge t={t} a={C.y2019} b={C.y1901 - 0.2} title="6 JULY 2019" sub="Walled city · UNESCO World Heritage" x={50} y={150} size={44} />
      {/* population */}
      <Card k={back(ramp(t, C.y1901 - 0.2, C.y1901 + 0.3)) * (1 - ramp(t, C.cta - 0.3, C.cta))} style={{ left: 90, top: 200, width: 900, padding: "22px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Icon kind="people" w={160} />
          <div>
            <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 34, color: "#5a4a2a" }}>Jaipur ki aabadi · {t < C.y2011 ? "1901" : "2011"}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 110, color: INK, lineHeight: 1 }}>{pop.toFixed(1)} <span style={{ fontSize: 56 }}>LAKH</span></div>
          </div>
        </div>
        <div style={{ height: 26, marginTop: 14, background: "#cbb98a", border: "2px solid #5a3a10", borderRadius: 13 }}><div style={{ height: "100%", width: `${(pop / 30.7) * 100}%`, background: "linear-gradient(90deg,#d9731a,#f2c94c)", borderRadius: 13 }} /></div>
        <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 22, color: "#5a4a2a", marginTop: 8 }}>Source: Census of India</div>
      </Card>
      {/* CTA */}
      {t > C.cta - 0.1 && (() => {
        const k = back(ramp(t, C.cta, C.cta + 0.55));
        return (
          <Card k={k} style={{ left: 100, top: 470, width: 880, padding: "40px 40px 34px", textAlign: "center", transform: `scale(${0.6 + 0.4 * k}) rotate(-2deg)` }}>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 120, color: GOLD, lineHeight: 1, textShadow: "0 5px 0 #6b4a10" }}>300</div>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 46, color: INK, letterSpacing: 4 }}>SAAL JAIPUR</div>
            <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 44, color: "#3a301a", marginTop: 18 }}>Aapka favourite ilaaka kaunsa hai?</div>
            <div style={{ display: "inline-block", marginTop: 22, border: "6px solid #b3261e", color: "#b3261e", borderRadius: 10, padding: "8px 30px", fontFamily: SERIF, fontWeight: 900, fontSize: 56, transform: "rotate(-3deg)" }}>COMMENT KARO</div>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 38, color: "#b85a10", marginTop: 22, opacity: ramp(t, C.follow, C.follow + 0.4) }}>FOLLOW · INDIA BY BHARAT</div>
          </Card>
        );
      })()}
      <Captions t={t} gs={gs} top={1450} size={62} until={C.cta - 0.1} />
      <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center", fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 22, color: "rgba(239,228,196,.6)" }}>Map: Jaipur wards (DataMeet) · growth eras & walled-city outline approximate</div>
    </AbsoluteFill>
  );
};
