import { OfflineCompiler } from 'mind-ar/src/image-target/offline-compiler.js';
import { writeFile } from 'node:fs/promises';
import { loadImage } from 'canvas';

const image = await loadImage(new URL('../target.svg', import.meta.url));
const compiler = new OfflineCompiler();
await compiler.compileImageTargets([image], (progress) => {
  console.log(`DICE AR target: ${Math.round(progress)}%`);
});
const buffer = compiler.exportData();
await writeFile(new URL('../target.mind', import.meta.url), buffer);
console.log('Created target.mind');
