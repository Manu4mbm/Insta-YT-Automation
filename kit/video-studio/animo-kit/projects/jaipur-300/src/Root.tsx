import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { YT } from "./YT";
import { Thumb } from "./Thumb";
import data from "./data.json";
const D: any = data;
export const Root: React.FC = () => (<>
  <Composition id="JaipurReel" component={Reel} durationInFrames={Math.ceil((D.cue.r.end + 0.6) * 30)} fps={30} width={1080} height={1920} />
  <Composition id="JaipurYT" component={YT} durationInFrames={Math.ceil((D.cue.y.end + 1.0) * 25)} fps={25} width={1920} height={1080} />
  <Composition id="Thumb" component={Thumb} durationInFrames={1} fps={25} width={1920} height={1080} />
</>);
