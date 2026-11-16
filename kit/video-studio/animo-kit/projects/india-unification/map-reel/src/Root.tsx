import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
export const Root: React.FC = () => (
  <Composition id="IndiaUnification" component={Reel} durationInFrames={Math.ceil(71.7 * 30)} fps={30} width={1080} height={1920} />
);
