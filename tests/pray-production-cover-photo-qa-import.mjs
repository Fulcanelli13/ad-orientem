import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {PRAYER_SELECTED_COVER_PHOTO_QA,renderPrayerSelectedCoverQA}
 from '../src/pray/prayer-cover-photo-qa.v1.js';
import {PRAYER_SELECTED_COVER_PHOTO_QA as qaFixture,renderPrayerSelectedCoverQA as fixtureRender}
 from './fixtures/prayer-cover-photo-qa.v1.js';

// This is an import-path fix, NOT permission to publish staged photography.
const modules=['src/pray/browser-entry.js','src/pray/presentation-coherence.js',
               'src/pray/presentation-runtime.js'];
for(const filename of modules){
 const text=readFileSync(filename,'utf8');
 const matches=[
  ...text.matchAll(/\bfrom\s*["'](\.{1,2}\/[^"']+)["']/g),
  ...text.matchAll(/\bimport\s*["'](\.{1,2}\/[^"']+)["']/g),
  ...text.matchAll(/\bimport\s*\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g)
 ];
 for(const match of matches){
  const dependency=resolve(dirname(filename),match[1]);
  assert.equal(existsSync(dependency),true,
    'Missing production import '+filename+' -> '+match[1]);
 }
}
assert.equal(PRAYER_SELECTED_COVER_PHOTO_QA,qaFixture,
 'QA fixture and production-owned module must have identical canonical records');
assert.equal(renderPrayerSelectedCoverQA,fixtureRender,
 'QA fixture must re-export the same fail-closed function');
assert.equal(Object.keys(PRAYER_SELECTED_COVER_PHOTO_QA).length,2);
for(const slot of Object.keys(PRAYER_SELECTED_COVER_PHOTO_QA)){
 const record=PRAYER_SELECTED_COVER_PHOTO_QA[slot];
 assert.equal(record.publicationAuthorized,false);
 assert.equal(record.croppingApproved,false);
 assert.equal(renderPrayerSelectedCoverQA(slot),'','Production default must be empty');
 assert.equal(renderPrayerSelectedCoverQA(slot,true),'','FR production default must be empty');
 assert.equal(renderPrayerSelectedCoverQA(slot,false,{qaOnly:false}),'');
 const qa=renderPrayerSelectedCoverQA(slot,false,{qaOnly:true});
 assert.ok(qa.includes('data-ao-production-release="false"'));
 assert.ok(qa.includes('data-ao-prayer-art-qa="'+slot+'"'));
 assert.ok(qa.includes(record.stagedAsset),'Explicit QA mode must use same original');
}
assert.equal(renderPrayerSelectedCoverQA('COV-pray.rosary',false,{qaOnly:true}),'',
 'Signature Rosary must have no QA cover substitution');
// Also validate that production import no longer throws when evaluated as ESM in Node.
await import('../src/pray/presentation-coherence.js');
console.log('PASS restored Prayer lazy import closure and source-owned QA-only covers; zero public image activation.');
