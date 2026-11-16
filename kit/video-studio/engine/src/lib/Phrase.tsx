import React from 'react';
import {interpolate} from 'remotion';
import {useT, WORDS} from './clock';
import {sp, fadeIn, clamp} from './motion';
import {C, F} from './theme';
import lines from '../lines.json';
// A script line arrives as one unit; hero words get their own pop on their timestamp.
export const Phrase = ({line, top, left=96, right=96, size=58, color=C.ink, hero=C.saffron, heroFont='serif', until, style}:{line:number;top:number;left?:number;right?:number;size?:number;color?:string;hero?:string;heroFont?:'serif'|'loud';until?:number;style?:React.CSSProperties}) => {
  const {f, fps, t} = useT();
  const L = lines[line]; const end = until ?? (lines[line+1]?.start ?? 99) - 0.05;
  const inA = sp(f, fps, L.start - 0.08, {damping:16, stiffness:170});
  const out = interpolate(t, [end - 0.15, end], [1, 0], clamp);
  if (t < L.start - 0.1 || t > end) return null;
  return (
    <div style={{position:'absolute', top, left, right, fontFamily:F.sans, fontWeight:600, fontSize:size, lineHeight:1.25, color, opacity:Math.min(inA, out), transform:`translateY(${(1-inA)*24}px)`, ...style}}>
      {WORDS.filter(w => w.line === line).map(w => {
        if (!w.hero) return <span key={w.i}>{w.text} </span>;
        const p = sp(f, fps, w.start - 0.03, {damping:9, stiffness:260});
        const on = t >= w.start - 0.03;
        return <span key={w.i} style={{display:'inline-block', marginRight:'0.28em', fontFamily: heroFont==='loud' ? F.loud : F.serif, fontStyle: heroFont==='loud' ? 'normal' : 'italic', fontWeight:400, fontSize: size*(heroFont==='loud'?1.15:1.3), color: on ? hero : color, opacity: on ? 1 : 0.3, transform:`scale(${on ? interpolate(p,[0,1],[1.35,1]) : 1})`, transformOrigin:'left bottom'}}>{w.text}</span>;
      })}
    </div>
  );
};
