import React from "react";
import { Composition } from "remotion";
import { Reel, Spec } from "./Reel";
import demo from "../specs/_demo.json";
export const Root: React.FC = () => (
  <Composition id="Reel" component={Reel as any} fps={30} width={1080} height={1920} durationInFrames={300}
    defaultProps={{ spec: demo as unknown as Spec }}
    calculateMetadata={({ props }: any) => ({ durationInFrames: Math.ceil((((props.slug ? props : props.spec).voiceEnd ?? 10) + ((props.slug ? props : props.spec).endCard ?? 3)) * 30) })} />
);
