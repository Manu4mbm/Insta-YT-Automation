// Spoken segments of take 1 (from silence detection) with the Roman caption text.
export const SEGS: [number, number, string][] = [
  [0.0, 2.33, "15 August 1947..."],
  [2.97, 4.2, "Bharat azaad hua,"],
  [4.79, 5.71, "par ek nahi tha."],
  [6.35, 9.21, "Desh ke andar thi 565 riyasatein,"],
  [9.72, 10.87, "raja aur nawab,"],
  [11.41, 13.65, "jinhe Angrezon ke jaane ke baad chunna tha:"],
  [14.2, 14.58, "India,"],
  [15.01, 15.61, "Pakistan,"],
  [15.98, 16.73, "ya azaadi."],
  [17.43, 22.46, "Ye zimmedari mili Sardar Vallabhbhai Patel aur unke secretary V. P. Menon ko."],
  [23.1, 23.9, "Ek kaagaz bana,"],
  [24.44, 25.77, "Instrument of Accession."],
  [26.34, 27.35, "Sirf teen vishay:"],
  [27.9, 30.05, "raksha, videsh aur sanchar."],
  [30.77, 33.93, "15 August tak lagbhag saari riyasatein jud chuki thin..."],
  [34.5, 35.78, "bas kuch baaki thin."],
  [36.56, 37.1, "Junagadh:"],
  [37.78, 42.05, "February 1948 ke janmat sangrah ke baad Bharat ka hissa bana."],
  [42.74, 43.27, "Hyderabad:"],
  [43.87, 47.1, "13 September 1948 ko Operation Polo,"],
  [47.57, 50.19, "aur 17 September ko Nizam ne haar maan li."],
  [50.88, 51.65, "Jammu-Kashmir:"],
  [52.21, 57.73, "Maharaja ne 26 October 1947 ko Instrument of Accession par sign kiya."],
  [58.44, 59.91, "565 tukde..."],
  [60.55, 61.21, "ek naksha."],
  [61.82, 65.07, "Isliye Patel kehlaye Bharat ke Loh Purush."],
  [65.81, 68.65, "Aisi aur kahaniyon ke liye comment karo SARDAR,"],
  [69.04, 69.84, "aur follow karo"],
  [70.12, 71.4, "India by Bharat."],
];

const NUMW: Record<string, number> = { "15": 6, "1947": 18, "1948": 18, "565": 16, "13": 5, "17": 5, "26": 7 };
export const HILITE = new Set(
  "565 RIYASATEIN INDIA PAKISTAN AZAADI PATEL MENON INSTRUMENT ACCESSION RAKSHA VIDESH SANCHAR JUNAGADH JANMAT SANGRAH HYDERABAD POLO NIZAM JAMMU-KASHMIR LOH PURUSH SARDAR 1947 1948 TEEN".split(" "),
);

export type Word = { w: string; s: number; e: number };
export type Group = { words: Word[]; s: number; e: number };

// Words spread over each segment by spoken length; then grouped 1-3 words per caption card.
export const GROUPS: Group[] = (() => {
  const out: Group[] = [];
  for (const [s, e, text] of SEGS) {
    const toks = text.split(/\s+/);
    const wts = toks.map((t) => NUMW[t.replace(/[^0-9]/g, "")] ?? Math.max(2, t.replace(/[^\p{L}\p{N}]/gu, "").length));
    const tot = wts.reduce((a, b) => a + b, 0);
    let c = s;
    const words: Word[] = toks.map((t, i) => {
      const d = ((e - s) * wts[i]) / tot;
      const wd = { w: t, s: c, e: c + d };
      c += d;
      return wd;
    });
    for (let i = 0; i < words.length; ) {
      let n = Math.min(3, words.length - i);
      // keep a 1-word tail out of the last group
      if (words.length - i === 4) n = 2;
      const g = words.slice(i, i + n);
      out.push({ words: g, s: g[0].s, e: g[g.length - 1].e });
      i += n;
    }
  }
  return out;
})();
