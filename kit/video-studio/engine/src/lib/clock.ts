import {useCurrentFrame, useVideoConfig} from 'remotion';
import words from '../words.json';
export type W = {i:number;text:string;start:number;end:number;line:number;hero:boolean};
export const WORDS = words as W[];
export const ws = (i:number) => WORDS[i].start;
export const useT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return {f, fps, t: f / fps}; };
