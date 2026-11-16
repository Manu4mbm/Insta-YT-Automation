import {interpolate, spring, Easing} from 'remotion';
export const clamp = {extrapolateLeft:'clamp' as const, extrapolateRight:'clamp' as const};
// physical spring that starts at time `at` (seconds)
export const sp = (f:number, fps:number, at:number, cfg:{damping?:number;stiffness?:number;mass?:number}={}) =>
  spring({frame: f - Math.round(at*fps), fps, config:{damping:14, stiffness:170, mass:1, ...cfg}});
// heavy stamp: big -> 1 with overshoot, plus decaying shake
export const stamp = (f:number, fps:number, at:number) => {
  const k = f - Math.round(at*fps);
  const s = sp(f, fps, at, {damping:11, stiffness:420, mass:0.9});
  const scale = interpolate(s, [0,1], [1.9,1]);
  const opacity = interpolate(k, [0,2], [0,1], clamp);
  const shake = k>=0 && k<10 ? Math.sin(k*2.4)*(10-k)*1.4 : 0;
  return {scale, opacity, shake, hit: k>=0};
};
// anticipation exit: pull back a little, then shoot out
export const exitX = (f:number, fps:number, at:number, dist:number) => {
  const k = (f - at*fps);
  return interpolate(k, [0,5,16], [0, -dist*0.04, dist], {...clamp, easing: Easing.bezier(.6,0,.9,.4)});
};
export const fadeIn = (f:number, fps:number, at:number, dur=0.25) => interpolate(f, [at*fps, (at+dur)*fps], [0,1], clamp);
