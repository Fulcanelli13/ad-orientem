import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const partsDir = new URL('../legacy/v43.33.parts/', import.meta.url);
const outUrl = new URL('../legacy/Ad-Orientem-2.0-v43.33-ICON-OWNERSHIP-CONSOLIDATION.html', import.meta.url);
const expected = '7032ed01a76c747805a81d4290cf85fb8692153568767ad9d1bd66f1dc88ada3';

const names = readdirSync(partsDir)
  .filter(name => /^chunk-\d{3}-p\d{2}\.txt$/.test(name))
  .sort();

if (!names.length) throw new Error('No v43.33 baseline chunks found.');

const buffers = names.map(name => readFileSync(join(partsDir.pathname, name)));
const merged = Buffer.concat(buffers);
const actual = createHash('sha256').update(merged).digest('hex');

if (actual !== expected) {
  throw new Error(
    `Baseline hash mismatch. Got ${actual} from ${names.length} chunk files / ${merged.length} bytes; expected ${expected}. The chunk import is incomplete or altered.`
  );
}

writeFileSync(outUrl, merged);
console.log(`Reassembled v43.33: ${names.length} parts, ${merged.length} bytes, SHA-256 ${actual}`);
