export const SEGS: [number, number, string][] = [
  [0.0, 1.89, "PM Modi aaj Manila mein hain..."],
  [2.5, 4.32, "wajah hai gyarah desh,"],
  [4.69, 5.7, "aur ek samandar."],
  [6.37, 8.83, "16 November ko PM Philippines pahunche,"],
  [9.27, 11.01, "23rd ASEAN-India Summit"],
  [11.39, 12.95, "aur East Asia Summit ke liye."],
  [13.53, 17.08, "2017 ke baad Manila mein ye unka doosra daura hai."],
  [17.7, 18.2, "ASEAN"],
  [18.53, 20.95, "yaani South-East Asia ke gyarah desh..."],
  [21.39, 22.98, "Indonesia se Vietnam tak,"],
  [23.51, 23.8, "aur ab"],
  [24.18, 25.02, "Timor-Leste bhi."],
  [25.53, 27.09, "Rishta sadiyon purana hai..."],
  [27.64, 30.65, "Philippines mein aaj bhi Ramayan ka manchan hota hai,"],
  [31.13, 33.42, "aur PM ne Manila mein wahi dekha."],
  [33.98, 37.15, "1992 mein Bharat bana ASEAN ka partner,"],
  [37.68, 39.39, "2002 mein pehla summit,"],
  [39.9, 41.6, "2012 mein strategic,"],
  [42.06, 45.41, "aur 2022 mein comprehensive strategic partnership."],
  [45.97, 50.04, "Aaj Bharat ka lagbhag 11 pratishat vyapaar ASEAN ke saath hai..."],
  [50.48, 51.99, "2024-25 mein"],
  [52.37, 54.09, "123 billion dollar."],
  [54.65, 55.43, "Aur Philippines?"],
  [55.82, 59.06, "Bharat ki BrahMos missile ka pehla videshi kharidaar..."],
  [59.62, 62.22, "pehli battery April 2024 mein pahunchi."],
  [62.74, 63.78, "2026,"],
  [64.21, 67.02, "ASEAN-India Maritime Cooperation ka saal hai..."],
  [67.57, 69.83, "samandar, suraksha aur vyapaar,"],
  [70.46, 71.9, "teeno ka kendra yahi hai."],
  [72.2, 73.49, "Agar kuch naya seekha,"],
  [73.83, 74.47, "to like karo..."],
  [74.96, 75.85, "aur follow karo"],
  [76.22, 77.69, "India by Bharat."],
];
const NUMW: Record<string, number> = { "16": 6, "23rd": 7, "2017": 14, "1992": 18, "2002": 12, "2012": 12, "2022": 12, "11": 6, "202425": 22, "123": 16, "2024": 14, "2026": 14 };
export const HILITE = new Set("MANILA GYARAH SAMANDAR ASEAN-INDIA ASEAN EAST SUMMIT 2017 DOOSRA TIMOR-LESTE RAMAYAN 1992 2002 2012 2022 COMPREHENSIVE 11 123 BILLION BRAHMOS PEHLA 2024 2026 MARITIME SAMANDAR SURAKSHA VYAPAAR LIKE".split(" "));
export type Word = { w: string; s: number; e: number };
export type Group = { words: Word[]; s: number; e: number };
export const GROUPS: Group[] = (() => {
  const out: Group[] = [];
  for (const [s, e, text] of SEGS) {
    const toks = text.split(/\s+/);
    const wts = toks.map((t) => NUMW[t.replace(/[^0-9a-z]/gi, "")] ?? Math.max(2, t.replace(/[^\p{L}\p{N}]/gu, "").length));
    const tot = wts.reduce((a, b) => a + b, 0);
    let c = s;
    const words = toks.map((t, i) => { const d = ((e - s) * wts[i]) / tot; const w = { w: t, s: c, e: c + d }; c += d; return w; });
    for (let i = 0; i < words.length; ) {
      let n = Math.min(3, words.length - i);
      if (words.length - i === 4) n = 2;
      const g = words.slice(i, i + n);
      out.push({ words: g, s: g[0].s, e: g[g.length - 1].e });
      i += n;
    }
  }
  return out;
})();
