import {continueRender, delayRender, staticFile} from 'remotion';
const h = delayRender('fonts');
const list: [string, string, FontFaceDescriptors?][] = [
  ['Heavy', 'fonts/ArchivoBlack-Regular.ttf'],
  ['Serif', 'fonts/InstrumentSerif-Italic.ttf', {style: 'italic'}],
  ['Mono', 'fonts/SpaceMono-Bold.ttf'],
  ['Body', 'fonts/Inter.ttf'],
];
Promise.all(list.map(([n, f, d]) => new FontFace(n, `url(${staticFile(f)})`, d).load().then(ff => document.fonts.add(ff))))
  .then(() => continueRender(h)).catch(() => continueRender(h));
