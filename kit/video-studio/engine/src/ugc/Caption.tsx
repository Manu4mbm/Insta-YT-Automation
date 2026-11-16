import React from 'react';
import {interpolate, spring} from 'remotion';
import {useT, WORDS} from './clock';
import {F, C} from './theme';
// UGC auto-captions: 1–3 word chunks, active word yellow, white text with heavy outline.
type Chunk = {words: typeof WORDS; start: number; end: number};
const chunks: Chunk[] = (() => {
  const out: Chunk[] = []; let cur: typeof WORDS = [];
  const push = () => { if (cur.length) out.push({words: cur, start: cur[0].start, end: cur[cur.length-1].end}); cur = []; };
  WORDS.forEach((w, i) => {
    const prev = WORDS[i-1];
    if (cur.length && (cur.length >= 3 || w.line !== prev.line || /[,.?:!]$/.test(prev.text) || w.start - prev.end > 0.35)) push();
    cur.push(w);
  });
  push();
  out.forEach((c, i) => { const n = out[i+1]; c.end = n ? Math.min(n.start, c.end + 0.6) : c.end + 0.6; });
  return out;
})();
export const Caption = ({hide=[] as [number, number][], top=1090}:{hide?:[number, number][];top?:number}) => {
  const {f, fps, t} = useT();
  if (hide.some(([a, b]) => t >= a && t < b)) return null;
  const c = chunks.find(c => t >= c.start - 0.02 && t < c.end);
  if (!c) return null;
  const k = spring({frame: f - Math.round(c.start*fps), fps, config:{damping:12, stiffness:300}});
  return (
    <div style={{position:'absolute', left:60, right:60, top, textAlign:'center', transform:`scale(${interpolate(k,[0,1],[0.8,1])}) rotate(${(c.start*37 % 3) - 1.5}deg)`, opacity:k}}>
      {c.words.map(w => {
        const on = t >= w.start - 0.02; const act = on && t < w.end + 0.05;
        return <span key={w.i} style={{display:'inline-block', margin:'0 10px', fontFamily:F.ugc, fontWeight:800, fontSize: w.hero ? 92 : 76, lineHeight:1.15, color: act || (on && w.hero) ? C.cap : C.white, textTransform:'uppercase', WebkitTextStroke:`14px ${C.ink}`, paintOrder:'stroke fill', textShadow:'0 8px 0 rgba(0,0,0,0.35)', transform: act ? 'scale(1.08)' : 'scale(1)', opacity: on ? 1 : 0.55}}>{w.text.replace(/[,.:]$/,'')}</span>;
      })}
    </div>
  );
};
