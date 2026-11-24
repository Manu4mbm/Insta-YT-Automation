import React from "react";

/* Simple, original silhouettes. All drawn in code — no third-party art. */
export const Soldier: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill={c} stroke={c}>
    <circle cx={0} cy={-62} r={11} /><path d="M-12 -50 L12 -50 L16 -10 L-16 -10Z" />
    <rect x={-11} y={-10} width={8} height={30} /><rect x={3} y={-10} width={8} height={30} />
    <line x1={20} y1={-110} x2={20} y2={20} strokeWidth={4} /><path d="M20 -122 L26 -108 L14 -108Z" />
    <ellipse cx={-16} cy={-32} rx={10} ry={16} />
  </g>
);
export const Horse: React.FC<{ x: number; y: number; s: number; c: string; t: number }> = ({ x, y, s, c, t }) => {
  const g = Math.sin(t * 14) * 10;
  return <g transform={`translate(${x},${y}) scale(${s})`} fill={c} stroke={c} strokeWidth={6} strokeLinecap="round">
    <ellipse cx={0} cy={-50} rx={48} ry={20} />
    <path d="M38 -60 L62 -96 L76 -90 L56 -54Z" />
    <line x1={-30} y1={-36} x2={-36 + g} y2={0} /><line x1={-18} y1={-36} x2={-12 - g} y2={0} />
    <line x1={24} y1={-36} x2={30 - g} y2={0} /><line x1={34} y1={-36} x2={40 + g} y2={0} />
    <path d="M-46 -56 Q-70 -50 -66 -20" fill="none" />
    <circle cx={2} cy={-92} r={10} /><path d="M-8 -82 L12 -82 L10 -62 L-6 -62Z" />
  </g>;
};
export const Boat: React.FC<{ x: number; y: number; s: number; c: string; flag?: string }> = ({ x, y, s, c, flag }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-70 0 Q0 34 70 0 L52 -10 L-52 -10Z" fill={c} />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-45 + i * 18} y1={2} x2={-55 + i * 18} y2={26} stroke={c} strokeWidth={3} />)}
    <line x1={0} y1={-10} x2={0} y2={-84} stroke={c} strokeWidth={5} /><path d="M0 -82 L48 -40 L0 -32Z" fill={c} opacity={0.85} />
    {flag && <path d="M0 -84 L26 -78 L0 -70Z" fill={flag} />}
  </g>
);
export const Ship: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill={c}>
    <path d="M-90 0 L90 0 L70 30 L-70 30Z" /><rect x={-60} y={-12} width={120} height={12} />
    {[-40, 0, 40].map((m) => <g key={m}><line x1={m} y1={-12} x2={m} y2={-120} stroke={c} strokeWidth={5} /><path d={`M${m - 30} -110 Q${m} -95 ${m + 30} -110 L${m + 26} -40 Q${m} -30 ${m - 26} -40Z`} opacity={0.85} /></g>)}
  </g>
);
export const Jet: React.FC<{ x: number; y: number; s: number; c: string; rot?: number }> = ({ x, y, s, c, rot = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} fill={c}>
    <path d="M0 -90 L12 -40 L70 10 L70 24 L12 4 L8 50 L26 66 L26 76 L0 68 L-26 76 L-26 66 L-8 50 L-12 4 L-70 24 L-70 10 L-12 -40Z" />
  </g>
);
export const Fort: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill={c}>
    <path d="M-200 0 L-200 -120 L-180 -120 L-180 -140 L-160 -140 L-160 -120 L-120 -120 L-120 -200 Q-90 -250 -60 -200 L-60 -120 L60 -120 L60 -200 Q90 -250 120 -200 L120 -120 L160 -120 L160 -140 L180 -140 L180 -120 L200 -120 L200 0Z" />
    <path d="M-30 0 L-30 -60 Q0 -95 30 -60 L30 0Z" fill="#000" opacity={0.6} />
  </g>
);
export const Temple: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill={c}>
    <rect x={-160} y={-60} width={320} height={60} /><rect x={-120} y={-120} width={240} height={60} />
    <path d="M-80 -120 Q-80 -260 0 -330 Q80 -260 80 -120Z" /><rect x={-6} y={-370} width={12} height={44} />
    {[-130, -70, 70, 130].map((m) => <rect key={m} x={m - 8} y={-58} width={16} height={58} fill="#000" opacity={0.35} />)}
  </g>
);
export const King: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill={c}>
    <path d="M-16 -96 L-12 -112 L-4 -100 L0 -116 L4 -100 L12 -112 L16 -96Z" />
    <circle cx={0} cy={-78} r={16} /><path d="M-30 -58 L30 -58 L42 40 L-42 40Z" /><path d="M-30 -58 L-56 -10 L-46 -4 L-24 -40Z" />
  </g>
);
export const Medal: React.FC<{ x: number; y: number; s: number; label: string; gold: string }> = ({ x, y, s, label, gold }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <defs><radialGradient id="gm" cx="40%" cy="35%"><stop offset="0%" stopColor="#fff1b8" /><stop offset="55%" stopColor={gold} /><stop offset="100%" stopColor="#9a6418" /></radialGradient></defs>
    <path d="M-70 -330 L-20 -150 L20 -150 L70 -330Z" fill="#c0392b" /><path d="M-30 -330 L-5 -150 L5 -150 L30 -330Z" fill="#1f3a8a" />
    <circle r={160} fill="url(#gm)" stroke="#8a5a14" strokeWidth={10} /><circle r={118} fill="none" stroke="#fff3c4" strokeWidth={4} opacity={0.6} />
    <text y={30} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={label.length > 4 ? 60 : 90} fill="#5a3a08">{label}</text>
  </g>
);
export const SPRITES: Record<string, any> = { soldier: Soldier, boat: Boat, ship: Ship, jet: Jet, fort: Fort, temple: Temple, king: King };
