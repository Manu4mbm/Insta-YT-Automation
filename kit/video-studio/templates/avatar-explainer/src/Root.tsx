import {Composition, Still} from 'remotion';
import {Reel, END} from './Reel';
import {Cover} from './Cover';
export const FPS = 30;
export const Root = () => (<>
  <Composition id="Reel" component={Reel} durationInFrames={Math.ceil(END * FPS)} fps={FPS} width={1080} height={1920} />
  <Still id="Cover" component={Cover} width={1080} height={1920} />
</>);
