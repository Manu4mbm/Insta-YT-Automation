import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT} from '../lib/clock';
// UGC phone-camera feel: gentle handheld drift + punch-in zooms on beats
export const Handheld = ({children, punches=[], amp=1}:{children:React.ReactNode;punches?:number[];amp?:number}) => {
  const {t} = useT();
  const x = (Math.sin(t*1.3)*5 + Math.sin(t*3.1+1)*2) * amp;
  const y = (Math.sin(t*1.7+2)*4 + Math.sin(t*2.6)*1.5) * amp;
  const r = Math.sin(t*0.9+0.5)*0.35*amp;
  let z = 1;
  for (const p of punches) if (t >= p) z += 0.07*Math.exp(-(t-p)*5);
  return <AbsoluteFill style={{transform:`translate(${x}px,${y}px) rotate(${r}deg) scale(${z})`}}>{children}</AbsoluteFill>;
};
