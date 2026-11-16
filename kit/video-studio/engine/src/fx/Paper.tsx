import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../lib/theme';
export const Paper = ({bg=C.cream, lines=true, dark=false}:{bg?:string;lines?:boolean;dark?:boolean}) => {
  const f = useCurrentFrame(); const seed = Math.floor(f/2)%6;
  return (
    <AbsoluteFill style={{background:bg}}>
      {lines && <AbsoluteFill style={{backgroundImage:`repeating-linear-gradient(0deg, ${dark?'rgba(255,255,255,0.035)':'rgba(23,23,28,0.045)'} 0 2px, transparent 2px 64px)`}}/>}
      <svg width="1080" height="1920" style={{position:'absolute', opacity: dark?0.22:0.13, mixBlendMode:'multiply'}}>
        <filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed}/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`}/>
      </svg>
      <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.12) 100%)'}}/>
    </AbsoluteFill>
  );
};
