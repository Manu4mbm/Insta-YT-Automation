import './lib/fonts';
import {AbsoluteFill} from 'remotion';
import {Character} from './Character';
const K = {stage: '#0E3B2C', floor: '#0A2C21', ring: '#1C5A43', cream: '#F4EEE4', orange: '#FF6A2B', gold: '#FFC23D', ink: '#141210', green: '#3DD68C'};
export const Cover = () => (
  <AbsoluteFill style={{background: K.stage}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {[300, 440, 580].map(r => <circle key={r} cx={540} cy={1560} r={r} fill="none" stroke={K.ring} strokeWidth={3} />)}
      <ellipse cx={540} cy={1772} rx={330} ry={52} fill={K.floor} />
    </svg>
    <div style={{position: 'absolute', left: 60, right: 60, top: 300, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
      {['c1', 'c2', 'c3', 'c4'].map((c, i) => <div key={c} style={{height: 270, borderRadius: 18, overflow: 'hidden', border: '4px solid #F4EEE4', transform: `rotate(${[-3, 2, 2, -2][i]}deg)`}}><div style={{width: '100%', height: '100%', background: ['linear-gradient(135deg,#FF6A2B,#C2255C)', 'linear-gradient(135deg,#4C8DFF,#7048E8)', 'linear-gradient(135deg,#3DD68C,#0B7285)', 'linear-gradient(135deg,#FFC23D,#E8590C)'][i]}} />{/* swap for <Img src={staticFile('c1.jpg')} /> frames of your own clips */}</div>)}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center'}}>
      <div style={{display: 'inline-block', background: K.cream, borderRadius: 22, padding: '10px 34px', fontFamily: 'Inter', fontWeight: 900, fontSize: 84, color: K.ink, letterSpacing: -2, boxShadow: '0 10px 0 rgba(0,0,0,.35)'}}><span style={{color: K.orange}}>200+</span> Claude videos</div>
      <div style={{fontFamily: '"Instrument Serif"', fontStyle: 'italic', fontSize: 110, color: K.gold, lineHeight: 1.1, marginTop: 6}}>+ the prompts, free</div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center'}}>
      <span style={{fontFamily: '"JetBrains Mono"', fontWeight: 700, fontSize: 34, letterSpacing: 6, background: K.green, color: K.ink, padding: '8px 22px', borderRadius: 10}}>NO AFTER EFFECTS</span>
    </div>
    <div style={{position: 'absolute', left: 540 - 230, top: 1115, width: 460, height: 736}}>
      <Character t={0.5} f={0} beats={[{at: -1, pose: 'point', face: 'cool', glasses: true}]} />
    </div>
  </AbsoluteFill>
);
