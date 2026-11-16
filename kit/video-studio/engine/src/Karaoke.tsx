import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import words from './words.json';
import lines from './lines.json';
type W = {i:number;text:string;start:number;end:number;line:number;hero:boolean};
const ws = words as W[];
const fmt = (t:number) => `${String(Math.floor(t/60)).padStart(2,'0')}:${(t%60).toFixed(3).padStart(6,'0')}`;
export const Karaoke = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  let li = lines.findIndex((l, k) => t < (lines[k + 1]?.start ?? 1e9));
  if (li < 0) li = lines.length - 1;
  const L = lines[li]; const next = lines[li + 1];
  const lw = ws.filter(w => w.line === li);
  const active = ws.find(w => t >= w.start && t < w.end);
  const span = Math.max(L.end - L.start, 0.5);
  return (
    <AbsoluteFill style={{background:'#111', color:'#eee', fontFamily:'DejaVu Sans, sans-serif'}}>
      <Audio src={staticFile('audio.mp3')} />
      <div style={{position:'absolute', top:60, right:60, fontSize:34, textAlign:'right', color:'#9f9', lineHeight:1.4, fontFamily:'DejaVu Sans Mono, monospace'}}>
        LINE {String(li+1).padStart(2,'0')} / {lines.length}<br/>{fmt(t)}<br/>{active ? `"${active.text}" ${active.start.toFixed(2)} → ${active.end.toFixed(2)}` : '—'}
      </div>
      <div style={{position:'absolute', top:760, left:80, right:80, fontSize:68, lineHeight:1.5, textAlign:'center'}}>
        {lw.map(w => {
          const on = active?.i === w.i;
          return <span key={w.i} style={{padding:'4px 10px', margin:'0 4px', borderRadius:8, background: on ? '#ffd400' : 'transparent', color: on ? '#111' : (w.hero ? '#ffd400' : '#eee'), display:'inline-block'}}>{w.text}</span>;
        })}
      </div>
      {next && <div style={{position:'absolute', top:1180, left:80, right:80, fontSize:46, textAlign:'center', color:'#555'}}>{next.text.replace(/\*/g,'')}</div>}
      <div style={{position:'absolute', bottom:140, left:60, right:60, height:90, background:'#222', borderRadius:10}}>
        {lw.map(w => (
          <div key={w.i} style={{position:'absolute', top:15, height:60, left:`${(w.start-L.start)/span*100}%`, width:`${(w.end-w.start)/span*100}%`, background: active?.i===w.i ? '#ffd400' : (w.hero ? '#7a6a00' : '#444'), borderRadius:4, fontSize:18, color:'#000', overflow:'hidden', paddingLeft:4, boxSizing:'border-box'}}>{w.text}</div>
        ))}
        <div style={{position:'absolute', top:0, bottom:0, width:4, background:'#f33', left:`${Math.min(Math.max((t-L.start)/span,0),1)*100}%`}} />
      </div>
    </AbsoluteFill>
  );
};
