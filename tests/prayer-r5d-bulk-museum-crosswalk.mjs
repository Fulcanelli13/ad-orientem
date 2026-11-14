import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const queue=JSON.parse(readFileSync('data/pray/artwork-r5c-bulk-acquisition-73-source-groups-20261103.v1.json','utf8'));
const groups=queue.groups.filter(g=>{
 const s=g.sourcePage||'';
 return (s.includes('clevelandart.org/art/')||s.includes('metmuseum.org/art/collection/search/'))&&!s.endsWith('1916.786')&&!s.endsWith('437542');
});
assert.equal(groups.length,14,'R5D target list changed; review before bulk acquisition');
const slotSet=new Set();
let count=0;
for(const [i,g] of groups.entries()){
 assert.ok(g.keyType==='PINNED_SOURCE_URL'&&g.sourcePage,'Exact object page mandatory');
 assert.ok(Array.isArray(g.slots)&&g.slots.length,'Expected explicit approved assignments');
 assert.ok(i<7 || i>=7);
 for(const s of g.slots){
  if(g.rosaryDeferred.includes(s))continue;
  assert.ok(!slotSet.has(s),'Duplicate approved slot '+s);
  slotSet.add(s);count++;
 }
}
assert.equal(count,22,'Expected 22 eligible slots across 14 exact museum records');
const scripts=readFileSync('scripts/prayer-r5d-bulk-museum-acquire.py','utf8');
assert.ok(scripts.includes('publication_authorized":False'));
assert.ok(scripts.includes('human_visual_review_passed":False'));
assert.ok(scripts.includes('responsive_browser_qa_passed":False'));
console.log('R5D museum bulk plan: 14 exact-object sources; 22 eligible slots; all non-publishing');
