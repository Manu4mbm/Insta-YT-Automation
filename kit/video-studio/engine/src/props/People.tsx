import React from 'react';
import {useT} from '../lib/clock';
import {C} from '../lib/theme';

// Flat vector bust illustrations (drawn, no stock images). viewBox 200x260.
export type Kind = 'boy' | 'girl' | 'papa' | 'mom' | 'friend' | 'counsellor';
export type Mood = 'neutral' | 'happy' | 'sad' | 'confused';
export type Acc = 'helmet' | 'stethoscope' | 'cap' | 'glasses' | 'blindfold' | 'books';

const SKIN: Record<Kind, string> = {boy:'#D9A07A', girl:'#E3AE86', papa:'#C68A60', mom:'#D69B72', friend:'#B97F58', counsellor:'#DDA47E'};
const SHIRT: Record<Kind, string> = {boy:C.saffron, girl:'#6A8CC7', papa:'#5E6E7C', mom:'#B5536A', friend:'#3E8E7E', counsellor:C.indigo};
const HAIR = '#2A1F19';

const mouth: Record<Mood, string> = {
  neutral: 'M88 136 Q100 141 112 136',
  happy: 'M84 130 Q100 152 116 130 Z',
  sad: 'M86 143 Q100 131 114 143',
  confused: 'M86 139 q7 -6 14 0 t14 0',
};
const brows: Record<Mood, [string, string]> = {
  neutral: ['M74 97 L90 95', 'M110 95 L126 97'],
  happy: ['M74 95 Q82 90 90 94', 'M110 94 Q118 90 126 95'],
  sad: ['M74 99 L90 93', 'M110 93 L126 99'],
  confused: ['M74 99 L90 97', 'M110 90 L126 96'],
};

export const Person = ({kind='boy', mood='neutral', acc=[], size=220, blind=0, style}:{kind?:Kind;mood?:Mood;acc?:Acc[];size?:number;blind?:number;style?:React.CSSProperties}) => {
  const {t} = useT();
  const seed = kind.length * 0.37;
  const bob = Math.sin(t * 2.1 + seed) * 2;
  const cyc = (t + seed * 3) % 3.4;
  const eyeY = cyc < 0.12 ? 0.12 : 1; // blink
  const skin = SKIN[kind];
  const longHair = kind === 'girl' || kind === 'counsellor';
  return (
    <svg viewBox="0 0 200 260" width={size} height={size * 1.3} style={{overflow:'visible', ...style}}>
      <g transform={`translate(0 ${bob})`}>
        {longHair && <path d="M46 102 C46 52 76 42 100 42 C126 42 154 52 154 102 L160 190 Q100 206 40 190 Z" fill={HAIR}/>}
        {kind === 'mom' && <circle cx="100" cy="50" r="22" fill={HAIR}/>}
        {/* body */}
        <path d="M24 262 C24 200 58 172 100 172 C142 172 176 200 176 262 Z" fill={SHIRT[kind]}/>
        <path d="M84 172 L100 196 L116 172 Z" fill="rgba(255,255,255,0.85)"/>
        <rect x="88" y="146" width="24" height="32" rx="8" fill={skin}/>
        {/* head */}
        <ellipse cx="51" cy="114" rx="8" ry="11" fill={skin}/>
        <ellipse cx="149" cy="114" rx="8" ry="11" fill={skin}/>
        <circle cx="100" cy="110" r="48" fill={skin}/>
        {/* hair front */}
        {kind === 'boy' || kind === 'friend' ? <path d="M52 104 C48 58 80 46 102 48 C132 50 154 66 148 104 C140 82 120 74 100 77 C80 76 62 86 52 104 Z" fill={HAIR}/> : null}
        {kind === 'papa' && <path d="M54 98 C56 66 84 56 104 58 C130 60 148 72 146 98 C136 82 118 76 100 78 C80 78 64 86 54 98 Z" fill="#3B3430"/>}
        {(longHair || kind === 'mom') && <path d="M53 102 C56 66 84 56 108 60 C130 62 147 78 149 100 C130 84 104 78 84 88 C72 94 62 98 53 102 Z" fill={HAIR}/>}
        {/* face */}
        <g fill={C.ink}>
          <ellipse cx="82" cy="113" rx="5" ry={5 * eyeY}/>
          <ellipse cx="118" cy="113" rx="5" ry={5 * eyeY}/>
        </g>
        <g stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" fill="none">
          <path d={brows[mood][0]}/><path d={brows[mood][1]}/>
          <path d={mouth[mood]} fill={mood === 'happy' ? '#7A2E22' : 'none'}/>
        </g>
        {mood === 'happy' && <g fill="#E86F5A" opacity="0.35"><circle cx="70" cy="128" r="8"/><circle cx="130" cy="128" r="8"/></g>}
        {kind === 'papa' && <path d="M82 127 Q100 120 118 127 Q110 134 100 130 Q90 134 82 127 Z" fill="#3B3430"/>}
        {/* accessories */}
        {acc.includes('glasses') && <g stroke={C.ink} strokeWidth="3" fill="rgba(255,255,255,0.15)"><circle cx="82" cy="113" r="13"/><circle cx="118" cy="113" r="13"/><path d="M95 113 L105 113"/></g>}
        {acc.includes('helmet') && <g><path d="M50 96 C50 50 150 50 150 96 Z" fill="#F2C230"/><rect x="40" y="92" width="120" height="10" rx="5" fill="#E0AE18"/><rect x="94" y="56" width="12" height="36" rx="4" fill="#E0AE18"/></g>}
        {acc.includes('cap') && <g><path d="M70 74 L130 74 L128 88 L72 88 Z" fill={C.ink}/><path d="M44 66 L100 44 L156 66 L100 88 Z" fill={C.ink}/><path d="M100 66 L150 70 L150 98" stroke={C.saffron} strokeWidth="3" fill="none"/><circle cx="150" cy="100" r="5" fill={C.saffron}/></g>}
        {acc.includes('stethoscope') && <g fill="none" stroke="#2E3A46" strokeWidth="5" strokeLinecap="round"><path d="M80 176 C70 210 100 226 112 214"/><path d="M120 176 C130 200 124 214 112 214"/><circle cx="112" cy="222" r="9" fill="#9AA7B2" stroke="#2E3A46"/></g>}
        {blind > 0 && <rect x="44" y={100} width={112 * blind} height="24" rx="6" fill={C.saffron} transform="rotate(-4 100 112)"/>}
        {acc.includes('books') && <g><rect x="20" y="214" width="160" height="22" rx="4" fill="#6A8CC7"/><rect x="30" y="194" width="140" height="22" rx="4" fill={C.lime}/><rect x="14" y="234" width="172" height="28" rx="4" fill={C.saffron}/></g>}
      </g>
    </svg>
  );
};

// circle-framed avatar for cards
export const Avatar = ({kind, mood, acc, d=180, bg='#EFE8DA'}:{kind:Kind;mood?:Mood;acc?:Acc[];d?:number;bg?:string}) => (
  <div style={{width:d, height:d, borderRadius:'50%', background:bg, overflow:'hidden', position:'relative', flexShrink:0}}>
    <div style={{position:'absolute', left:d*0.06, top:d*0.06}}><Person kind={kind} mood={mood} acc={acc} size={d*0.88}/></div>
  </div>
);
