import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { D, PL, ramp, eout, back, lerp, clamp, keys, camAt, JaipurMap, Card, Badge, Stamp, Icon, groups, Captions, GOLD, INK, SERIF, ITAL } from "./common";

const C = D.cue.y;
const wc = PL.wc;
const CITY: [number, number] = [wc[0] - 90, wc[1] + 110];
const CH: [number, string, string][] = [
  [0, "1", "AMER SE MAIDAN TAK"], [C.c2, "2", "EK SHEHER, EK NAKSHA"], [C.c3, "3", "MAHAL AUR MANDIR"], [C.c4, "4", "GULABI SHEHER"],
  [C.c5, "5", "PARKOTE KE BAHAR"], [C.c6, "6", "NAYA JAIPUR"], [C.c7, "7", "300 SAAL"],
];
const MARKS = [1727, 1799, 1876, 1949, 1982, 2019, 2027];

const Timeline: React.FC<{ year: number }> = ({ year }) => {
  const x0 = 60, x1 = 1860, pos = (y: number) => x0 + ((y - 1727) / 300) * (x1 - x0);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, height: 60 }}>
      <div style={{ position: "absolute", left: x0, width: x1 - x0, top: 0, height: 4, background: "#6b5630" }} />
      <div style={{ position: "absolute", left: x0, width: pos(year) - x0, top: -1, height: 6, background: GOLD, boxShadow: "0 0 12px #f2c94c" }} />
      {MARKS.map((m) => (
        <React.Fragment key={m}>
          <div style={{ position: "absolute", left: pos(m) - 8, top: -7, width: 16, height: 16, borderRadius: 8, background: m <= year ? GOLD : "#6b5630", border: "2px solid #2b2414" }} />
          <div style={{ position: "absolute", left: pos(m) - 50, top: 16, width: 100, textAlign: "center", fontFamily: SERIF, fontWeight: 900, fontSize: 22, color: m <= year ? GOLD : "#a99a72" }}>{m}</div>
        </React.Fragment>
      ))}
      <div style={{ position: "absolute", left: pos(year) - 9, top: -9, width: 18, height: 18, borderRadius: 9, background: "#fff", boxShadow: "0 0 14px #fff" }} />
    </div>
  );
};

const Side: React.FC<{ k: number; title: string; sub?: string; icon?: string; big?: string; y?: number }> = ({ k, title, sub, icon, big, y = 170 }) => (
  <Card k={back(clamp(k))} style={{ left: 60, top: y, width: 560, padding: "22px 28px", transform: `translateX(${(1 - eout(clamp(k))) * -60}px)` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      {icon && <Icon kind={icon} w={120} />}
      <div>
        {big && <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 76, color: INK, lineHeight: 1 }}>{big}</div>}
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 40, color: INK, lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 30, color: "#5a4a2a" }}>{sub}</div>}
      </div>
    </div>
  </Card>
);

export const YT: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const gs = useMemo(() => groups(D.ytWords, 4), []);
  const win = (a: number, b: number, fi = 0.4, fo = 0.4) => ramp(t, a, a + fi) * (1 - ramp(t, b - fo, b));
  const year = keys(t, [
    [0, 1727], [C.aaj, 1727], [C.aaj + 1.8, 2026], [C.kahani + 1.0, 2026], [C.c2 - 0.2, 1727],
    [C.y1734 - 0.3, 1727], [C.y1734 + 0.4, 1734], [C.y1735 - 0.2, 1734], [C.y1735 + 0.3, 1735], [C.y1749 - 0.2, 1735], [C.y1749 + 0.3, 1749],
    [C.y1799 - 0.2, 1749], [C.y1799 + 0.4, 1799], [C.c4 - 0.2, 1799], [C.c4 + 0.6, 1876], [C.y1887 - 0.2, 1876], [C.y1887 + 0.3, 1887],
    [C.y1901 - 0.2, 1887], [C.y1901 + 0.4, 1901], [C.y1942 - 0.3, 1901], [C.y1942 + 0.8, 1942], [C.y1947 - 0.3, 1942], [C.y1947 + 0.4, 1947],
    [C.y1949 - 0.2, 1947], [C.y1949 + 0.3, 1949], [C.y1951 - 0.2, 1949], [C.y1951 + 0.4, 1951], [C.y1981 - 0.3, 1951], [C.y1981 + 1.5, 1981],
    [C.c6 - 0.2, 1981], [C.c6 + 0.5, 1982], [C.faila, 1985], [C.vaishali + 1.5, 2012], [C.y2013 + 0.3, 2013], [C.y2015 - 0.2, 2013], [C.y2015 + 0.3, 2015],
    [C.y2018 - 0.2, 2015], [C.y2018 + 0.3, 2018], [C.y2019 - 0.2, 2018], [C.y2019 + 0.3, 2019], [C.y2026 - 0.2, 2019], [C.y2026 + 0.4, 2026], [C.y2027 - 0.2, 2026], [C.y2027 + 0.6, 2027],
  ]);
  const cam = camAt(t, [
    [0, PL.amer[0], PL.amer[1] + 60, 1.25], [C.pani - 0.5, PL.amer[0], PL.amer[1] + 80, 1.3],
    [C.gyarah + 0.6, (PL.amer[0] + wc[0]) / 2, (PL.amer[1] + wc[1]) / 2 + 40, 0.95], [C.aaj - 0.2, (PL.amer[0] + wc[0]) / 2, (PL.amer[1] + wc[1]) / 2 + 60, 0.95],
    [C.aaj + 2.0, CITY[0], CITY[1], 0.5], [C.c2 - 0.6, CITY[0], CITY[1], 0.48],
    [C.c2 + 1.2, wc[0], wc[1], 2.4], [C.vyapar - 0.2, wc[0], wc[1], 2.6], [C.vyapar + 1.2, wc[0] + 20, wc[1], 3.0], [C.c3 - 0.2, wc[0] + 20, wc[1], 3.1],
    [C.y1734 + 0.6, PL.jantar[0], PL.jantar[1], 4.2], [C.y1749 - 0.3, PL.govind[0], PL.govind[1], 4.0], [C.y1749 + 0.8, PL.isarlat[0], PL.isarlat[1], 4.0],
    [C.y1799 + 0.8, PL.hawa[0], PL.hawa[1], 4.5], [C.c4 - 0.2, PL.hawa[0], PL.hawa[1], 4.6],
    [C.c4 + 1.0, wc[0], wc[1] + 40, 2.5], [C.albert - 0.2, wc[0], wc[1] + 50, 2.5], [C.albert + 0.8, PL.albert[0], PL.albert[1] - 40, 3.2], [C.y1901 - 0.2, PL.albert[0], PL.albert[1] - 40, 3.2],
    [C.y1901 + 1.0, wc[0], wc[1] + 30, 2.2], [C.c5 - 0.2, wc[0], wc[1] + 40, 2.2],
    [C.y1942 + 1.0, wc[0] - 40, wc[1] + 90, 1.45], [C.mi - 0.2, wc[0] - 40, wc[1] + 90, 1.5], [C.mi + 0.8, PL.mi[0], PL.mi[1], 2.4], [C.y1947 - 0.2, PL.mi[0], PL.mi[1], 2.4],
    [C.y1949 + 0.6, wc[0] + 40, wc[1], 1.5], [C.y1981 - 0.2, wc[0], wc[1] + 60, 1.2], [C.y1981 + 1.6, CITY[0], CITY[1], 0.75], [C.c6 - 0.2, CITY[0], CITY[1], 0.72],
    [C.faila + 1.0, CITY[0], CITY[1], 0.52], [C.vaishali + 1.2, CITY[0], CITY[1], 0.5],
    [C.y2013 + 0.8, PL.amer[0], PL.amer[1] + 40, 1.6], [C.y2015 - 0.2, PL.amer[0], PL.amer[1] + 40, 1.65],
    [C.y2015 + 0.9, (PL.mansarovar[0] + PL.wc[0]) / 2, (PL.mansarovar[1] + PL.wc[1]) / 2, 1.15], [C.y2018 - 0.2, (PL.mansarovar[0] + PL.wc[0]) / 2, (PL.mansarovar[1] + PL.wc[1]) / 2, 1.2],
    [C.y2018 + 0.9, CITY[0] - 120, CITY[1] + 80, 0.6], [C.y2019 - 0.2, CITY[0] - 120, CITY[1] + 80, 0.6],
    [C.y2019 + 0.9, wc[0], wc[1], 2.3], [C.y2011 - 0.2, wc[0], wc[1], 2.4], [C.y2011 + 1.0, CITY[0], CITY[1], 0.52], [C.c7 - 0.2, CITY[0], CITY[1], 0.5],
    [C.c7 + 1.5, wc[0], wc[1], 1.2], [C.natgeo - 0.2, wc[0], wc[1], 1.3], [C.outro, CITY[0], CITY[1], 0.5], [C.end + 1, CITY[0], CITY[1] - 20, 0.47],
  ]);
  const pins = [
    { at: PL.amer, name: "AMER", k: win(C.amer - 0.3, C.aaj + 0.4) + win(C.y2013 - 0.2, C.y2015 + 0.3), size: 44 },
    { at: [wc[0], wc[1]], name: "NAYA SHEHER", k: win(C.gyarah, C.aaj + 0.3), size: 44 },
    { at: PL.chandpole, name: "CHANDPOLE", k: win(C.chandpole - 0.2, C.c3), size: 34 },
    { at: PL.surajpole, name: "SURAJPOLE", k: win(C.chandpole + 0.5, C.c3), size: 34 },
    { at: PL.sanganeri, name: "SANGANERI GATE", k: win(C.chandpole + 1.1, C.c3), size: 34 },
    { at: PL.jantar, name: "JANTAR MANTAR", k: win(C.y1734, C.c4), size: 44 },
    { at: PL.govind, name: "GOVIND DEV JI", k: win(C.y1735, C.c4), size: 44 },
    { at: PL.isarlat, name: "ISARLAT", k: win(C.y1749, C.c4), size: 44 },
    { at: [PL.hawa[0] + 6, PL.hawa[1] + 4], name: "", k: win(C.y1799, C.c4), size: 44 },
    { at: PL.albert, name: "ALBERT HALL", k: win(C.albert, C.c5 + 4), size: 40, color: INK },
    { at: PL.mi, name: "MI ROAD", k: win(C.mi, C.c6), size: 40, color: INK },
    { at: PL.malviya, name: "MALVIYA NAGAR", k: win(C.malviya, C.y2013), size: 62 },
    { at: PL.jagatpura, name: "JAGATPURA", k: win(C.malviya + 0.8, C.y2013), size: 62 },
    { at: PL.mansarovar, name: "MANSAROVAR", k: win(C.mansarovar, C.y2018), size: 62 },
    { at: PL.vaishali, name: "VAISHALI NAGAR", k: win(C.vaishali, C.y2013), size: 62 },
  ];
  const chapter = [...CH].reverse().find((c) => t >= c[0])!;
  const chK = ramp(t, chapter[0], chapter[0] + 0.5) * (1 - ramp(t, chapter[0] + 3.2, chapter[0] + 3.8));
  const pop = keys(t, [[C.y1901, 1.6], [C.y1951 - 0.3, 1.6], [C.y1951 + 0.8, 2.91], [C.y1981 - 0.3, 2.91], [C.y1981 + 1.2, 10.0], [C.y2011 - 0.3, 10.0], [C.y2011 + 1.2, 30.7]]);
  const popK = Math.max(win(C.y1901, C.c5), win(C.y1951 - 0.2, C.c6), win(C.y2011 - 0.2, C.y2026 - 0.2));
  return (
    <AbsoluteFill style={{ background: "#0b0e12" }}>
      <Img src={staticFile("table.png")} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: D.W, height: D.H, transformOrigin: "0 0", transform: `translate(${1060 - cam.x * cam.z}px, ${520 - cam.y * cam.z}px) scale(${cam.z})`, boxShadow: "0 40px 100px rgba(0,0,0,.8)" }}>
        <JaipurMap year={year} z={cam.z} pins={pins as any}
          walledDraw={t < C.c2 ? ramp(t, C.gyarah, C.gyarah + 2) : ramp(t, C.c2 + 0.4, C.vidya + 1.5)}
          grid={ramp(t, C.nau, C.nau + 0.6) * (1 - 0.6 * ramp(t, C.c3, C.c3 + 1))}
          gates={win(C.parkota, C.c3)}
          pink={ramp(t, C.gulabi, C.gulabi + 1.0) * (t < C.c2 ? 0 : 1)}
          mi={ramp(t, C.mi, C.mi + 1.5)}
          metro={ramp(t, C.y2015, C.y2015 + 2)}
          river={win(C.y2018, C.y2019) * (0.7 + 0.3 * Math.sin(t * 4))}
          unesco={Math.max(win(C.y2019, C.y2011), 0) * (0.75 + 0.25 * Math.sin(t * 5))}
          route={win(C.gyarah - 0.3, C.aaj + 0.4)}
          capital={win(C.y1949, C.c6 + 1)}
        />
      </div>
      {/* Amer UNESCO ring + river highlight drawn in screen space via map transform */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 48%, rgba(0,0,0,0) 50%, rgba(0,0,0,.6) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,0) 18%, rgba(0,0,0,0) 72%, rgba(0,0,0,.75))" }} />

      {/* chapter title */}
      {chK > 0 && t > 3 && (
        <div style={{ position: "absolute", top: 420, width: "100%", textAlign: "center", opacity: chK, transform: `scale(${0.9 + 0.1 * back(chK)})` }}>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 44, color: "#efe4c4", textShadow: "0 3px 10px #000" }}>Adhyay {chapter[1]}</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 96, color: GOLD, letterSpacing: 4, textShadow: "0 6px 0 #6b4a10, 0 14px 30px #000" }}>{chapter[2]}</div>
        </div>
      )}
      {/* intro title */}
      {t < 6.2 && (
        <div style={{ position: "absolute", left: 90, top: 260, opacity: 1 - ramp(t, 5.4, 6.2) }}>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 50, color: "#efe4c4", textShadow: "0 3px 10px #000" }}>Parkote se Metro tak</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 180, color: GOLD, lineHeight: 1, textShadow: "0 9px 0 #6b4a10, 0 20px 40px #000" }}>JAIPUR</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 110, color: "#fff", lineHeight: 1.05, textShadow: "0 5px 18px #000" }}>300 SAAL</div>
        </div>
      )}
      {/* small chapter tag */}
      {t > 6 && <div style={{ position: "absolute", left: 60, top: 50, fontFamily: SERIF, fontWeight: 900, fontSize: 26, color: "#efe4c4", letterSpacing: 3, opacity: 0.85, textShadow: "0 2px 8px #000" }}>{chapter[1]} · {chapter[2]}</div>}
      {t > C.amer - 0.5 && t < C.outro && (
        <div style={{ position: "absolute", right: 60, top: 40, background: "linear-gradient(160deg,#f2e8cb,#dccb9b)", border: "3px solid #8a7240", borderRadius: 10, padding: "4px 26px 8px", textAlign: "center", boxShadow: "0 14px 40px rgba(0,0,0,.6)" }}>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 24, color: "#5a4a2a" }}>saal</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 76, color: INK, lineHeight: 1 }}>{Math.round(year)}</div>
        </div>
      )}

      {/* chapter 1 */}
      <Side k={win(C.pani - 0.2, C.jaisingh)} title="AMER CHHOTA PADA" sub="Badhti aabadi · paani ki kami" />
      <Side k={win(C.jaisingh, C.aaj)} title="SAWAI JAI SINGH II" sub="Naya sheher, maidan mein · ~11 km" />
      {t > C.aaj + 0.3 && t < C.c2 - 0.3 && (
        <div style={{ position: "absolute", left: 90, top: 200, opacity: win(C.aaj + 0.3, C.c2 - 0.3) }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 190, color: GOLD, lineHeight: 1, textShadow: "0 9px 0 #6b4a10, 0 20px 40px #000" }}>300<span style={{ fontSize: 70 }}>VA SAAL</span></div>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 40, color: "#efe4c4", textShadow: "0 3px 10px #000" }}>Aaj ka Jaipur (approx. map)</div>
        </div>
      )}
      {/* chapter 2 */}
      <Side k={win(C.c2 + 0.5, C.vidya)} big="1727" title="18 NOVEMBER" sub="Jaipur ki neenv" />
      <Side k={win(C.vidya, C.nau)} title="VIDYADHAR BHATTACHARYA" sub="Vastu & Shilpa Shastra par naksha" />
      <Side k={win(C.nau, C.parkota)} big="9" title="KHAND" sub="Seedhi chaudi sadkein · chaupad" />
      <Side k={win(C.parkota, C.vyapar)} title="PARKOTA AUR DARWAZE" sub="Chandpole · Surajpole · Sanganeri Gate" />
      <Side k={win(C.vyapar, C.c3)} title="VYAPAAR KA SHEHER" sub="Bazaar, kaarigar, ek jaisi imaratein" />
      {/* chapter 3 */}
      <Side k={win(C.y1734, C.y1735)} icon="jantar" big="1734" title="JANTAR MANTAR" sub="Khagol vigyan" />
      <Side k={win(C.y1735, C.y1749)} big="1735" title="GOVIND DEV JI" sub="Mandir" />
      <Side k={win(C.y1749, C.y1799)} big="1749" title="ISARLAT" sub="Ishwari Singh ki jeet ki yaad" />
      <Side k={win(C.y1799, C.jharokhe)} icon="hawa" big="1799" title="HAWA MAHAL" sub="Lal Chand Ustad · Sawai Pratap Singh" />
      <Side k={win(C.jharokhe, C.c4)} icon="hawa" big="953" title="JHAROKHE" sub="Bina dikhe utsav dekhne ke liye" />
      {/* chapter 4 */}
      <Side k={win(C.c4 + 0.3, C.gulabi)} big="1876" title="PRINCE OF WALES" sub="Albert Edward ka Jaipur aana" />
      <Stamp k={win(C.pink, C.albert, 0.35, 0.4)} text="PINK CITY" color="#c0566a" size={90} style={{ left: 120, top: 220 }} />
      <Side k={win(C.gulabi, C.pink)} title="GULABI = MEHMAAN-NAWAZI" sub="Sawai Ram Singh II ka faisla" />
      <Side k={win(C.albert, C.y1901)} icon="albert" big="1887" title="ALBERT HALL" sub="Neenv 1876 · bana 1887" />
      {/* chapter 5 */}
      <Side k={win(C.y1942, C.paanch)} big="1942" title="PEHLA VISTAAR" sub="Parkote ke bahar yojana" />
      <Side k={win(C.paanch, C.mi)} big="5" title="NAYI YOJANAYEIN" sub="Walled city ke bahar" />
      <Side k={win(C.mi, C.y1947)} title="MIRZA ISMAIL ROAD" sub="1940s · MI Road" />
      <Side k={win(C.y1947, C.y1949)} big="1947" title="AAZADI" />
      <Side k={win(C.y1949, C.y1951 - 0.3)} big="1949" title="RAJASTHAN KI RAJDHANI" sub="Daftar, bazaar, colonies" />
      {/* chapter 6 */}
      <Side k={win(C.c6 + 0.3, C.faila)} big="1982" title="JDA BANA" sub="Jaipur Development Authority" />
      <Side k={win(C.faila, C.y2013)} title="HAR DISHA MEIN" sub="Malviya Nagar · Jagatpura · Mansarovar · Vaishali Nagar" />
      <Side k={win(C.y2013, C.y2015)} big="2013" title="AMER FORT" sub="UNESCO World Heritage" />
      <Side k={win(C.y2015, C.y2018)} icon="metro" big="2015" title="METRO" sub="3 June · Mansarovar → Chandpole" />
      <Side k={win(C.y2018, C.y2019)} big="2018" title="DRAVYAVATI RIVERFRONT" sub="13 km hissa khula" />
      <Side k={win(C.y2019, C.y2011)} big="2019" title="WALLED CITY · UNESCO" sub="6 July 2019" />
      <Side k={win(C.y2026, C.c7)} big="2026" title="METRO PHASE 2" sub="April 2026 mein manzoori" />
      {/* population card (right side) */}
      <Card k={back(clamp(popK))} style={{ right: 60, top: 190, width: 480, padding: "18px 26px" }}>
        <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 28, color: "#5a4a2a" }}>Jaipur ki aabadi · {t < C.y1951 ? "1901" : t < C.y1981 ? "1951" : t < C.y2011 ? "1981" : "2011"}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 86, color: INK, lineHeight: 1 }}>{pop.toFixed(pop < 10 ? 2 : 1)} <span style={{ fontSize: 44 }}>LAKH</span></div>
        <div style={{ height: 22, marginTop: 10, background: "#cbb98a", border: "2px solid #5a3a10", borderRadius: 11 }}><div style={{ height: "100%", width: `${(pop / 30.7) * 100}%`, background: "linear-gradient(90deg,#d9731a,#f2c94c)", borderRadius: 11 }} /></div>
        <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 20, color: "#5a4a2a", marginTop: 6 }}>Source: Census of India (city)</div>
      </Card>
      {/* chapter 7 */}
      {t > C.y2027 - 0.2 && t < C.outro && (
        <div style={{ position: "absolute", left: 90, top: 190, opacity: win(C.y2027 - 0.1, C.outro) }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: "#fff", textShadow: "0 4px 16px #000" }}>18 NOVEMBER 2027</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 200, color: GOLD, lineHeight: 1, textShadow: "0 9px 0 #6b4a10, 0 20px 40px #000" }}>300</div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 60, color: "#fff", letterSpacing: 6, textShadow: "0 4px 16px #000" }}>SAAL JAIPUR</div>
        </div>
      )}
      <Card k={back(win(C.natgeo, C.outro))} style={{ right: 60, top: 190, width: 520, padding: "20px 28px" }}>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 40, color: INK }}>BEST OF THE WORLD 2027</div>
        <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 30, color: "#5a4a2a" }}>National Geographic ki suchi mein Jaipur</div>
        <div style={{ height: 2, background: "#8a7240", margin: "14px 0", opacity: ramp(t, C.jlf, C.jlf + 0.3) }} />
        <div style={{ opacity: ramp(t, C.jlf, C.jlf + 0.4) }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 40, color: INK }}>JLF · 20th EDITION</div>
          <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 30, color: "#5a4a2a" }}>January 2027</div>
        </div>
      </Card>
      {/* outro */}
      {t > C.outro - 0.1 && (() => {
        const k = back(ramp(t, C.outro, C.outro + 0.6));
        return (
          <Card k={k} style={{ left: 560, top: 230, width: 800, padding: "40px", textAlign: "center", transform: `scale(${0.6 + 0.4 * k}) rotate(-1.5deg)` }}>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: INK }}>♥ LIKE · SUBSCRIBE</div>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 48, color: "#b85a10", marginTop: 14 }}>INDIA BY BHARAT</div>
            <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 40, color: "#3a301a", marginTop: 20 }}>Comment karo: aapka ilaaka kab basa?</div>
          </Card>
        );
      })()}
      <Captions t={t} gs={gs} top={850} size={50} until={C.end + 1} />
      {t > 6 && t < C.outro && <Timeline year={year} />}
      <div style={{ position: "absolute", bottom: 6, right: 20, fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 18, color: "rgba(239,228,196,.55)" }}>Map: Jaipur wards (DataMeet) · growth eras & walled-city outline approximate · Sources: Census of India, UNESCO, JDA Act 1982, PTI</div>
    </AbsoluteFill>
  );
};
