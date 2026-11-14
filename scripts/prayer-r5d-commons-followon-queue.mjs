#!/usr/bin/env node
/**
 * Offline, source-only triage for the remaining Commons paintings.
 * No network, downloads, publication approval, or Rosary changes.
 */
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const groups=JSON.parse(readFileSync('data/pray/artwork-r5c-bulk-acquisition-73-source-groups-20261103.v1.json','utf8')).groups;
const c=groups.filter(g=>(g.sourcePage||'').startsWith('https://commons.wikimedia.org/wiki/File:') && !g.sourcePage.includes('Prado'));
assert.equal(c.length,40,'Commons/Prado scope changed; manual review required');
const todo=c.slice(20);
assert.equal(todo.length,20,'Remaining Commons scope changed');
const rows=todo.map((g,index)=>({
 priority:index+21,work:g.title,artist:g.artist,sourcePage:g.sourcePage,
 approvedNonRosarySlots:g.slots.filter(x=>!g.rosaryDeferred.includes(x)),
 deferredRosarySlots:g.rosaryDeferred,
 action:'VERIFY_SOURCE_RIGHTS_AND_FETCH_LATER',sourcePhotoVerified:false,
 originalImageAcquired:false,publicationAuthorized:false
}));
const slots=rows.flatMap(x=>x.approvedNonRosarySlots);
assert.equal(new Set(slots).size,slots.length,'Duplicate approved slot in Commons queue');
const data={schema:'AO_PRAYER_R5D_COMMONS_FOLLOWON_SOURCE_QUEUE_V1',groups:rows.length,eligibleSlots:slots.length,
 deferredRosarySlots:rows.reduce((s,x)=>s+x.deferredRosarySlots.length,0),
 releaseAuthorized:false,groupsToReview:rows};
mkdirSync('data/pray/research',{recursive:true});
writeFileSync('data/pray/research/r5d-commons-followon-review-queue.v1.json',JSON.stringify(data,null,2)+'\n');
console.log('Remaining Commons groups:',rows.length,'eligible placements:',slots.length,'Rosary deferred:',data.deferredRosarySlots);
