import React from 'react';
import {C, F} from '../lib/theme';
// Throughline prop: a "career card" label. Band shows WHO the label belongs to.
export const NameTag = ({w=720, children, tone=1, band=C.saffron, label='', style}:{w?:number;children?:React.ReactNode;tone?:number;band?:string;label?:string;style?:React.CSSProperties}) => {
  const h = w*0.6; const bh = h*0.2;
  return (
    <div style={{width:w, height:h, borderRadius:w*0.05, background:C.white, boxShadow:`0 ${w*0.03}px ${w*0.06}px rgba(23,23,28,${0.18*tone}), 0 2px 0 rgba(23,23,28,0.08)`, overflow:'hidden', position:'relative', filter: tone<1 ? `grayscale(${1-tone}) contrast(${0.8+tone*0.2})` : undefined, ...style}}>
      <div style={{height:bh, background:band, display:'flex', alignItems:'center', padding:`0 ${w*0.05}px`, gap:w*0.02, color:C.white}}>
        <div style={{width:w*0.022, height:w*0.022, borderRadius:'50%', background:'rgba(255,255,255,0.85)'}}/>
        <div style={{fontFamily:F.sans, fontWeight:800, fontSize:w*0.045, letterSpacing:w*0.006, whiteSpace:'nowrap'}}>{label}</div>
      </div>
      <div style={{position:'absolute', top:bh, left:0, right:0, bottom:h*0.07, display:'flex', alignItems:'center', justifyContent:'center'}}>{children}</div>
      <div style={{position:'absolute', bottom:0, left:0, right:0, height:h*0.07, background:band}}/>
    </div>
  );
};
