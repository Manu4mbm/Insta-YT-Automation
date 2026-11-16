import React from 'react';
import {interpolate, Easing} from 'remotion';
import amp from './amp.json';

// Original chibi narrator (edit K colours / hair / beard to look like you) — flat solid colours, no gradients.
const K = {
  skin: '#C98B62', skinSh: '#AD7250', hair: '#1A1411', hairHi: '#3A2E27', beard: '#2B1F19',
  shirt: '#A24B38', shirtSh: '#853A2B', collar: '#B85A45', pants: '#262B36', pantsSh: '#1C2029',
  shoe: '#F3EEE6', sole: '#2A2A2A', mouth: '#4A1717', tongue: '#D9675E', teeth: '#FFF8EE', eye: '#1B1310',
};

export type Pose = 'rest' | 'wave' | 'point' | 'present' | 'shrug' | 'thumbs' | 'head' | 'think' | 'cheer';
export type Face = 'smile' | 'happy' | 'wow' | 'sad' | 'wink' | 'cool';
// [shoulder, elbow] outward degrees, left arm (viewer left) then right arm
const POSES: Record<Pose, [number, number, number, number]> = {
  rest: [10, -4, 10, -4],
  wave: [10, -4, 118, 52],
  point: [10, -4, 132, 30],
  present: [10, -4, 72, 22],
  shrug: [42, 78, 42, 78],
  thumbs: [10, -4, 30, 105],
  head: [140, 112, 10, -4],
  think: [10, -4, 25, 140],
  cheer: [128, 22, 128, 22],
};
type Hand = 'fist' | 'open' | 'point' | 'thumb';
const HANDS: Record<Pose, [Hand, Hand]> = {
  rest: ['fist', 'fist'], wave: ['fist', 'open'], point: ['fist', 'point'], present: ['fist', 'open'],
  shrug: ['open', 'open'], thumbs: ['fist', 'thumb'], head: ['open', 'fist'], think: ['fist', 'fist'], cheer: ['open', 'open'],
};

export type Beat = {at: number; pose: Pose; face: Face; glasses?: boolean};

const HandShape: React.FC<{h: Hand; flip: boolean}> = ({h, flip}) => (
  <g transform={flip ? 'scale(-1,1)' : undefined}>
    {h === 'point' && <rect x={-6} y={8} width={12} height={34} rx={6} fill={K.skin} />}
    {h === 'thumb' && <rect x={-2} y={6} width={15} height={34} rx={7.5} fill={K.skin} />}
    {h === 'open' && <>
      {[-14, -5, 4, 13].map((x, i) => <rect key={i} x={x - 4} y={6} width={8} height={22 - Math.abs(i - 1.5) * 3} rx={4} fill={K.skin} />)}
      <rect x={14} y={-6} width={8} height={18} rx={4} fill={K.skin} transform="rotate(-35 18 0)" />
    </>}
    <circle r={19} fill={K.skin} />
    <path d="M -12 6 Q 0 14 12 6" stroke={K.skinSh} strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

const Arm: React.FC<{side: 'L' | 'R'; a1: number; a2: number; hand: Hand; wiggle: number}> = ({side, a1, a2, hand, wiggle}) => {
  const s = side === 'L' ? 1 : -1;
  const x = side === 'L' ? 128 : 272;
  return (
    <g transform={`translate(${x} 322) rotate(${s * a1})`}>
      <rect x={-19} y={-6} width={38} height={76} rx={19} fill={K.shirt} />
      <rect x={side === 'L' ? -19 : 5} y={-6} width={14} height={76} rx={7} fill={K.shirtSh} opacity={0.6} />
      <g transform={`translate(0 62) rotate(${s * (a2 + wiggle)})`}>
        <rect x={-14} y={0} width={28} height={58} rx={14} fill={K.skin} />
        <rect x={-21} y={-4} width={42} height={16} rx={8} fill={K.collar} />
        <g transform="translate(0 62)"><HandShape h={hand} flip={side === 'R'} /></g>
      </g>
    </g>
  );
};

export const Character: React.FC<{t: number; f: number; beats: Beat[]; scale?: number}> = ({t, f, beats}) => {
  // current & previous beat → blend arm angles
  let i = 0;
  for (let k = 0; k < beats.length; k++) if (beats[k].at <= t) i = k;
  const cur = beats[i], prev = beats[Math.max(0, i - 1)];
  const p = i === 0 ? 1 : interpolate(t - cur.at, [0, 0.32], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(.3, 1.4, .5, 1)});
  const A = POSES[cur.pose], B = POSES[prev.pose];
  const ang = A.map((v, k) => B[k] + (v - B[k]) * p);
  const hands = HANDS[cur.pose];
  const wiggle = cur.pose === 'wave' ? Math.sin(t * 14) * 18 : 0;

  // lip sync from voice amplitude (frame-indexed), smoothed
  const a = (n: number) => (amp as number[])[Math.max(0, Math.min((amp as number[]).length - 1, n))] || 0;
  const open = Math.max(0, (a(f) * 0.5 + a(f - 1) * 0.3 + a(f + 1) * 0.2) - 0.06);
  const mo = Math.min(1, open * 1.3);

  // blink every ~3.1 s (skip when glasses)
  const bp = (t + 0.7) % 3.1;
  const blink = bp < 0.12 ? Math.abs(Math.cos((bp / 0.12) * Math.PI)) : 1;
  const face = cur.face;
  const glasses = !!cur.glasses;
  const gIn = glasses ? interpolate(t - cur.at, [0, 0.25], [-70, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))}) : 0;

  // idle motion
  const bob = Math.sin(t * 3.2) * 5 + (cur.pose === 'cheer' ? -Math.abs(Math.sin(t * 9)) * 14 : 0);
  const sway = Math.sin(t * 1.6) * 1.6 + mo * 1.2;
  const hop = interpolate(t - cur.at, [0, 0.12, 0.3], [0, -16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const headTilt = face === 'sad' ? -6 : face === 'wow' ? 3 : face === 'wink' ? 6 : Math.sin(t * 2.1) * 2.5;

  const eyeY = 200;
  const brow = face === 'wow' ? -14 : face === 'sad' ? -2 : face === 'happy' ? -8 : -5;
  const browRot = face === 'sad' ? 14 : face === 'wow' ? -4 : 0;

  const Eye = ({x, wink}: {x: number; wink?: boolean}) =>
    face === 'happy' || wink ? <path d={`M ${x - 15} ${eyeY + 4} Q ${x} ${eyeY - 12} ${x + 15} ${eyeY + 4}`} stroke={K.eye} strokeWidth={7} fill="none" strokeLinecap="round" />
      : <g transform={`translate(${x} ${eyeY}) scale(1 ${blink * (face === 'wow' ? 1.18 : 1)})`}>
          <ellipse rx={face === 'wow' ? 15 : 13} ry={face === 'wow' ? 19 : 17} fill={K.eye} />
          <circle cx={4} cy={-6} r={5} fill="#fff" /><circle cx={-4} cy={6} r={2.2} fill="#fff" opacity={0.8} />
        </g>;

  const mouthY = 262;
  const Mouth = () => {
    if (mo > 0.04) {
      const w = 22 + mo * 12, h = 6 + mo * 26;
      return <g transform={`translate(200 ${mouthY + 2})`}>
        <ellipse rx={w} ry={h} fill={K.mouth} />
        <clipPath id="mclip"><ellipse rx={w} ry={h} /></clipPath>
        <g clipPath="url(#mclip)"><rect x={-w} y={-h} width={w * 2} height={Math.min(9, h * 0.5)} fill={K.teeth} /><ellipse cy={h * 0.75} rx={w * 0.6} ry={h * 0.45} fill={K.tongue} /></g>
      </g>;
    }
    if (face === 'sad') return <path d={`M 182 ${mouthY + 8} Q 200 ${mouthY - 4} 218 ${mouthY + 8}`} stroke={K.mouth} strokeWidth={6} fill="none" strokeLinecap="round" />;
    if (face === 'wow') return <ellipse cx={200} cy={mouthY + 2} rx={10} ry={13} fill={K.mouth} />;
    return <path d={`M 176 ${mouthY - 4} Q 200 ${mouthY + 18} 224 ${mouthY - 4} Z`} fill={K.mouth} />;
  };

  return (
    <svg viewBox="0 0 400 640" width="100%" height="100%" style={{overflow: 'visible'}}>
      <g transform={`translate(0 ${bob + hop})`}>
        <g transform={`rotate(${sway} 200 600)`}>
          {/* legs */}
          <rect x={150} y={455} width={44} height={120} rx={18} fill={K.pants} />
          <rect x={206} y={455} width={44} height={120} rx={18} fill={K.pants} />
          <rect x={226} y={455} width={24} height={120} rx={12} fill={K.pantsSh} />
          {/* shoes */}
          <g><rect x={136} y={566} width={64} height={30} rx={15} fill={K.shoe} /><rect x={136} y={588} width={64} height={10} rx={5} fill={K.sole} /></g>
          <g><rect x={200} y={566} width={64} height={30} rx={15} fill={K.shoe} /><rect x={200} y={588} width={64} height={10} rx={5} fill={K.sole} /></g>
          {/* torso */}
          <path d="M 128 330 Q 128 304 160 300 L 240 300 Q 272 304 272 330 L 266 470 Q 200 482 134 470 Z" fill={K.shirt} />
          <path d="M 236 300 Q 272 304 272 330 L 266 470 Q 252 474 236 475 Z" fill={K.shirtSh} />
          <line x1={200} y1={322} x2={200} y2={470} stroke={K.shirtSh} strokeWidth={4} />
          {[350, 390, 430].map(y => <circle key={y} cx={209} cy={y} r={4.5} fill={K.shoe} opacity={0.85} />)}
          <rect x={196} y={432} width={0} height={0} />
          {/* neck + collar */}
          <rect x={180} y={286} width={40} height={30} rx={10} fill={K.skinSh} />
          <path d="M 168 298 L 200 336 L 186 344 L 158 306 Z" fill={K.collar} />
          <path d="M 232 298 L 200 336 L 214 344 L 242 306 Z" fill={K.collar} />
          {/* head */}
          <g transform={`rotate(${headTilt} 200 290)`}>
            <ellipse cx={86} cy={208} rx={18} ry={24} fill={K.skinSh} />
            <ellipse cx={314} cy={208} rx={18} ry={24} fill={K.skinSh} />
            <path d="M 88 190 Q 86 92 200 86 Q 314 92 312 190 Q 312 262 270 290 Q 236 310 200 310 Q 164 310 130 290 Q 88 262 88 190 Z" fill={K.skin} />
            {/* beard (stubble jaw + chin) */}
            <path d="M 98 222 Q 104 272 140 294 Q 170 312 200 312 Q 230 312 260 294 Q 296 272 302 222 Q 296 262 262 280 Q 236 292 200 294 Q 164 292 138 280 Q 104 262 98 222 Z" fill={K.beard} opacity={0.88} />
            <path d="M 172 284 Q 200 300 228 284 L 224 300 Q 200 312 176 300 Z" fill={K.beard} />
            <path d="M 176 248 Q 200 240 224 248" stroke={K.beard} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} />
            {/* blush */}
            {(face === 'happy' || face === 'wink' || face === 'cool') && <><ellipse cx={135} cy={238} rx={16} ry={8} fill="#E07A6A" opacity={0.45} /><ellipse cx={265} cy={238} rx={16} ry={8} fill="#E07A6A" opacity={0.45} /></>}
            {/* nose */}
            <path d="M 196 214 Q 192 232 200 236 Q 206 236 208 232" stroke={K.skinSh} strokeWidth={5} fill="none" strokeLinecap="round" />
            {/* eyes */}
            {!glasses && <><Eye x={152} /><Eye x={248} wink={face === 'wink'} /></>}
            {/* brows */}
            <g transform={`translate(0 ${brow})`}>
              <rect x={128} y={164} width={50} height={11} rx={5.5} fill={K.hair} transform={`rotate(${-browRot - 4} 153 169)`} />
              <rect x={222} y={164} width={50} height={11} rx={5.5} fill={K.hair} transform={`rotate(${browRot + 4} 247 169)`} />
            </g>
            <Mouth />
            {/* hair: swept-up quiff with side part */}
            <path d="M 84 204 Q 66 128 104 78 Q 138 30 206 24 Q 236 8 262 22 Q 316 40 326 106 Q 334 150 318 204 Q 312 160 292 140 Q 266 124 236 126 Q 200 112 162 126 Q 124 136 104 166 Q 92 184 84 204 Z" fill={K.hair} />
            <path d="M 118 84 Q 160 30 236 28 Q 208 44 196 66 Q 158 60 118 84 Z" fill={K.hairHi} />
            <path d="M 146 112 Q 196 72 262 84" stroke={K.hairHi} strokeWidth={7} fill="none" strokeLinecap="round" />
            <path d="M 222 30 Q 270 34 300 74" stroke={K.hairHi} strokeWidth={6} fill="none" strokeLinecap="round" />
            {/* sunglasses */}
            {glasses && <g transform={`translate(0 ${gIn})`}>
              <rect x={112} y={178} width={78} height={46} rx={16} fill="#0E0E10" />
              <rect x={210} y={178} width={78} height={46} rx={16} fill="#0E0E10" />
              <rect x={186} y={188} width={28} height={8} rx={4} fill="#0E0E10" />
              <rect x={88} y={186} width={28} height={7} rx={3.5} fill="#0E0E10" /><rect x={284} y={186} width={28} height={7} rx={3.5} fill="#0E0E10" />
              <path d="M 126 190 L 146 190" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
              <path d="M 224 190 L 244 190" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
            </g>}
          </g>
          {/* arms on top */}
          <Arm side="L" a1={ang[0]} a2={ang[1]} hand={hands[0]} wiggle={0} />
          <Arm side="R" a1={ang[2]} a2={ang[3]} hand={hands[1]} wiggle={wiggle} />
        </g>
      </g>
    </svg>
  );
};
