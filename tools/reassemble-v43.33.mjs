import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const partsDir = new URL('../legacy/v43.33.parts/', import.meta.url);
const statusUrl = new URL('../legacy/v43.33.parts/IMPORT-STATUS.json', import.meta.url);
const outUrl = new URL('../legacy/Ad-Orientem-2.0-v43.33-ICON-OWNERSHIP-CONSOLIDATION.html', import.meta.url);

const status = JSON.parse(readFileSync(statusUrl, 'utf8'));
const names = readdirSync(partsDir)
  .filter(name => /^chunk-\d{3}-p\d{2}\.txt$/.test(name))
  .sort();

if (!names.length) throw new Error('No v43.33 baseline chunks found.');

const buffers = names.map(name => readFileSync(fileURLToPath(new URL(name, partsDir))));
const merged = Buffer.concat(buffers);
const actual = createHash('sha256').update(merged).digest('hex');

if (status.complete) {
  if (merged.length !== status.fullBytes) {
    throw new Error('Baseline marked complete but byte count is ' + merged.length + '; expected ' + status.fullBytes + '.');
  }
  if (actual !== status.fullSha256) {
    throw new Error('Full baseline hash mismatch. Got ' + actual + '; expected ' + status.fullSha256 + '.');
  }
  writeFileSync(outUrl, merged);
  console.log('FULL BASELINE VERIFIED: ' + names.length + ' parts, ' + merged.length + ' bytes, SHA-256 ' + actual);
} else {
  if (merged.length !== status.importedBytes) {
    throw new Error('Partial import byte count changed. Got ' + merged.length + '; manifest expects ' + status.importedBytes + '.');
  }
  if (actual !== status.importedPrefixSha256) {
    throw new Error('Partial baseline prefix hash mismatch. Got ' + actual + '; expected ' + status.importedPrefixSha256 + '.');
  }
  if (merged.length >= status.fullBytes) {
    throw new Error('Import contains the full baseline but IMPORT-STATUS.json still says complete=false.');
  }
  const pct = ((merged.length / status.fullBytes) * 100).toFixed(1);
  console.log('PARTIAL BASELINE VERIFIED: ' + names.length + ' parts, ' + merged.length + '/' + status.fullBytes + ' bytes (' + pct + '%). Prefix SHA-256 ' + actual + '. Full baseline import is not yet complete.');
}
