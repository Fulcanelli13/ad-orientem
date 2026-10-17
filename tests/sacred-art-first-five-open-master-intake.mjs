import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const load=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const batch=load("data/research/sacred-art-first-five-master-acquisition-20261017.v1.json");
const freeze=load("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const released=load("data/calendar/sacred-art-certified-media.v1.json");
const approvals=new Set(freeze.approved.map(x=>x.artworkId));
const rejections=new Set(freeze.rejected.map(x=>x.artworkId));
assert.equal(batch.works.length,5);
assert.equal(new Set(batch.works.map(x=>x.artworkId)).size,5);
assert(batch.policy.neverAutoPublish && batch.policy.noRightsHolderContact && batch.policy.noPaidLicences);
for(const x of batch.works) {
  assert(approvals.has(x.artworkId),"First-five contains unapproved artwork");
  assert(!rejections.has(x.artworkId),"First-five includes rejected artwork");
  assert.equal(x.researchDate.length,10);
  assert(x.subject);
}
const open=batch.works.filter(x=>x.provider==="MET_OPEN_ACCESS");
assert.equal(open.length,1,"Only verified Met object may be auto-acquired");
assert.deepEqual({id:open[0].museumObjectId,accession:open[0].accession},{id:438724,accession:"2004.31"});
assert.equal(open[0].sourceObjectUrl,"https://www.metmuseum.org/art/collection/search/438724");
assert.equal(open[0].artworkId,"ART-hilippe-de-hampaigne-he-nnunciation");
const pending=batch.works.filter(x=>x.provider!=="MET_OPEN_ACCESS");
assert.equal(pending.length,4,"Other originals must stay unacquired until evidence is secured");
assert(pending.every(x=>x.sourceKind.startsWith("PENDING")));
assert.equal(released.mediaReleaseCount,0);
assert.deepEqual(released.media,[]);
console.log("Sacred Art first five: 1 exact Met open-access acquisition, 4 holds; zero production releases: PASS");
