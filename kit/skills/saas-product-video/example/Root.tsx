import React from 'react';
import {Composition, Still} from 'remotion';
import {Reel, Cover, DUR} from './Reel';
export const Root: React.FC = () => <>
  <Composition id="Reel" component={Reel} durationInFrames={Math.round(DUR * 30)} fps={30} width={1920} height={1080} />
  <Still id="Cover" component={Cover} width={1920} height={1080} />
</>;
