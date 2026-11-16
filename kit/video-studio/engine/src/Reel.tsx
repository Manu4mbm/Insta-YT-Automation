import './lib/fonts';
import {AbsoluteFill, Audio, interpolate, staticFile} from 'remotion';
import {useT} from './lib/clock';
// Register scenes here: {C: Component, from: sec, to: sec, fade: sec (0 = scene handles its own entrance)}
// See src/scenes-example/ (Vision Guiders Reel 1) for a full 11-scene reel.
const SCENES: {C: React.FC; from: number; to: number; fade: number}[] = [];
export const Reel = () => {
  const {t} = useT();
  return (
    <AbsoluteFill style={{background:'#F3EEE4'}}>
      <Audio src={staticFile('audio.mp3')} volume={0.9}/>
      <Audio src={staticFile('sfx.wav')} volume={0.45}/>   {/* python sfx/gen.py */}
      <Audio src={staticFile('music.wav')} volume={0.8}/>
      {SCENES.filter(s => t >= s.from && t < s.to).map(s => (
        <AbsoluteFill key={s.from} style={{opacity: s.fade ? interpolate(t, [s.from, s.from + s.fade], [0, 1], {extrapolateRight:'clamp'}) : 1}}><s.C/></AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
