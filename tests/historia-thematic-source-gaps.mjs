import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {scriptureWitnessEmptySlots} from '../src/scripture/witness-gaps.js';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
for(const edition of ['dr-challoner','cpdv-2009','crampon-1923']){
 const mark=read('data/scripture/witness/'+edition+'/Mark.json');
 assert.equal(mark.sourceStatus,'UNCOLLATED_SOURCE_WITNESS');
 const available=mark.verses.filter(v=>v[0]===4&&v[1]>=35&&v[1]<=41).map(v=>v[1]);
 assert.deepEqual(available,[35,36,37,38,39,40]);
 const missing=scriptureWitnessEmptySlots(edition,'Mark',4);
 assert(missing.includes(41),'Source gap must be visible in '+edition);
 assert.equal(missing.filter(v=>v===41).length,1);
 assert(!scriptureWitnessEmptySlots(edition,'Mark',5).includes(41));
 assert(!scriptureWitnessEmptySlots(edition,'Luke',4).includes(41));
}
assert.deepEqual(scriptureWitnessEmptySlots('not-an-edition','Mark',4),[]);
console.log('PASS: Mark 4:41 is missing from all 3 pinned source witnesses and disclosed by the canonical Scripture reader; no verse reconstructed.');
