import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { D, PL, JaipurMap, GOLD, SERIF, ITAL, INK } from "./common";
const wc = PL.wc;
export const Thumb: React.FC = () => {
  const z = 0.62, x = wc[0] - 120, y = wc[1] + 100;
  return (
    <AbsoluteFill style={{ background: "#0b0e12" }}>
      <Img src={staticFile("table.png")} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: D.W, height: D.H, transformOrigin: "0 0", transform: `translate(${1380 - x * z}px, ${540 - y * z}px) scale(${z})` }}>
        <JaipurMap year={2026} z={z} pink={1} metro={1} pins={[{ at: wc, name: "1727", k: 1, size: 70 }] as any} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,8,10,.92) 0%, rgba(8,8,10,.75) 38%, rgba(0,0,0,0) 62%)" }} />
      <div style={{ position: "absolute", left: 90, top: 150 }}>
        <div style={{ fontFamily: ITAL, fontStyle: "italic", fontWeight: 600, fontSize: 60, color: "#efe4c4" }}>Parkote se Metro tak</div>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 220, color: GOLD, lineHeight: 0.95, textShadow: "0 10px 0 #6b4a10, 0 22px 44px #000" }}>JAIPUR</div>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 140, color: "#fff", lineHeight: 1.05, textShadow: "0 6px 20px #000" }}>300 SAAL</div>
        <div style={{ display: "inline-block", marginTop: 30, background: "linear-gradient(160deg,#f2e8cb,#dccb9b)", border: "3px solid #8a7240", borderRadius: 10, padding: "12px 34px", fontFamily: SERIF, fontWeight: 900, fontSize: 70, color: INK }}>1727 → 2027</div>
      </div>
    </AbsoluteFill>
  );
};
