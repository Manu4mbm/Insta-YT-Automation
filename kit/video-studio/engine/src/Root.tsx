import {Composition} from 'remotion';
import {Karaoke} from './Karaoke';
import {Reel} from './Reel';
export const FPS = 30;
import lines from './lines.json';
// duration = last word end + 0.15s
export const DURATION = Math.ceil(((lines as any[]).at(-1)!.end + 0.15) * FPS);
export const Root = () => (<>
  <Composition id="Karaoke" component={Karaoke} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
  <Composition id="Reel" component={Reel} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
  <Composition id="Pilot" component={Reel} durationInFrames={Math.round(8*FPS)} fps={FPS} width={1080} height={1920} />
</>);
