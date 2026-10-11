import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const batch=read("data/geography/research/place-media-candidates-r59.v1.json");
const old=read("data/geography/research/place-media-publication-review-r58.v1.json");
const published=read("data/geography/approved-place-media.v1.json");
const places=read("data/geography/seed-registry.v1.json");
assert.equal(batch.schema,"AO_EXPLORE_PLACE_MEDIA_R59_CANDIDATES_V1");
assert.equal(batch.candidates.length,10);
const oldHolds=[...old.needs_replacement,...old.held].map(p=>p.place_id);
const ids=batch.candidates.map(p=>p.place_id);
assert.deepEqual(new Set(ids),new Set(oldHolds));
assert.equal(new Set(ids).size,10);
const known=new Set(places.places.map(p=>p.place_id));
const live=new Set(published.items.map(p=>p.place_id));
let four=0,two=0,three=0;
for(const c of batch.candidates){
  assert.ok(known.has(c.place_id)&&!live.has(c.place_id),"Must not republish an approved Place");
  assert.equal(c.publication_approved,false);
  assert.equal(c.subject_crop_reviewed,false);
  assert.equal(c.status,"RESEARCH_UNREVIEWED");
  assert.match(c.source_page_url,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
  assert.ok(c.alt_en&&c.alt_fr);
  assert.equal(c.license_url,"https://creativecommons.org/licenses/by-sa/"+c.expected_license.slice(-3)+"/");
  if(c.expected_license==="CC-BY-SA-4.0")four++;
  else if(c.expected_license==="CC-BY-SA-3.0")three++;
  else if(c.expected_license==="CC-BY-SA-2.0")two++;
  else assert.fail("Unreviewed licence "+c.expected_license);
}
assert.deepEqual([four,three,two],[8,1,1]);
assert.deepEqual(batch.candidates.filter(p=>p.expected_license!=="CC-BY-SA-4.0").map(p=>p.place_id).sort(),[
"place:GB:walsingham-catholic-shrine","place:MU:pere-laval-sainte-croix"
]);
const script=readFileSync("tools/stage-place-media-r59.py","utf8");
assert.match(script,/STAGED_NOT_APPROVED/);
assert.doesNotMatch(script,/APPROVED\.write_text|PUBLISHED\.write_text/);
console.log("PASS R59 research manifest: 8 CC BY-SA 4 + 2 older-licence candidates, no auto-publication");
