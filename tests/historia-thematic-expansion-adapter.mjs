import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildThematicPilots} from '../src/scripture/historia-thematic-collections.js';
import {stagedThematicBatch2} from '../src/scripture/historia-thematic-expansion.js';
const get=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const master=get('data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json');
const phase2=get('data/research/historia-salutis-thematic-collections-expansion-preflight-20261021.v1.json');
const pilot=buildThematicPilots(master);
const proposed=stagedThematicBatch2(phase2,pilot);
assert.deepEqual(proposed.map(g=>g.episodes.length),[21,17,3]);
assert.equal(pilot.flatMap(g=>g.episodes).length,19);
const all=[...pilot.flatMap(g=>g.episodes),...proposed.flatMap(g=>g.episodes)];
assert.equal(all.length,60);
assert.equal(new Set(all.map(e=>e.id)).size,60);
assert(proposed.every(g=>g.stage==='NOT_LIVE'));
assert(proposed.flatMap(g=>g.episodes).every(e=>
 e.publicationStatus==='RESEARCH_STAGED_NOT_LIVE' &&
 e.scriptureTextOwner==='EXISTING_CATHOLIC_WITNESS_LOADER_ONLY' &&
 e.atlasEventId===null && e.covenantalAnchor===null &&
 !Object.hasOwn(e,'text')));
assert.equal(phase2.manualSegmentationHolds.length,7);
assert.equal(phase2.totals.allAccountedFor,217);
const invalid=structuredClone(phase2);
invalid.stagedEntries.find(e=>e.nextBatch==='BATCH_2_MIRACLES_PARABLES_CANTICLES').publicationStatus='PUBLISHED';
assert.throws(()=>stagedThematicBatch2(invalid,pilot));
assert.throws(()=>stagedThematicBatch2(phase2,[]));
console.log('PASS Historia source-only 41-entry expansion adapter; original 19 pilots unchanged, seven composites withheld.');
