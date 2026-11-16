// usage: node stills.mjs <reelDir> <outDir> <comp> <sec,sec,...> [scale]
import path from 'node:path';
import {createRequire} from 'node:module';
const [dir, out, comp, secs, scale = '0.5'] = process.argv.slice(2);
const req = createRequire(path.join(dir, 'package.json'));
const {bundle} = await import(req.resolve('@remotion/bundler'));
const {renderStill, selectComposition} = await import(req.resolve('@remotion/renderer'));
const B = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.join(dir, 'src/index.ts'), publicDir: path.join(dir, 'public')});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable: B});
for (const s of secs.split(',')) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(parseFloat(s) * composition.fps));
  try { await renderStill({serveUrl, composition, frame, output: path.join(out, `f${String(frame).padStart(5, '0')}.jpg`), imageFormat: 'jpeg', scale: parseFloat(scale), browserExecutable: B, timeoutInMilliseconds: 60000}); } catch (e) { console.log('ERR', s, String(e.message).slice(0, 300)); }
}
console.log('ok');
