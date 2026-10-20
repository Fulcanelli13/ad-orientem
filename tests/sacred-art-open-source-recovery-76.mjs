import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const intake=load("data/research/sacred-art-bulk-source-intake-451-20261020.v1.json");
const queue=load("data/research/sacred-art-open-source-recovery-76-20261020.v1.json");
const frozen=load("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const approved=new Set(frozen.approved.map(x=>x.artworkId));
const legacy=new Set(frozen.historicallyFiveIDsPreservedSeparately);
const rejected=new Set(frozen.rejected.map(x=>x.artworkId));
assert.equal(intake.works.length,451);
const open=intake.works.filter(x=>["APPROVED","LEGACY_FIVE_PRESERVED"].includes(x.reviewGate)
  &&!x.sourcePolicy?.noFetch&&x.provider==="NO_EXACT_OPEN_SOURCE");
assert.equal(open.length,76);
assert.deepEqual(new Set(queue.records.map(x=>x.artworkId)),new Set(open.map(x=>x.id)),
 "Every remaining approved original must appear exactly once in recovery tasks");
assert.equal(queue.records.length,76);
assert.equal(queue.worksPerBatch,50);
assert.deepEqual(queue.batches.map(x=>x.count),[50,26]);
assert.equal(queue.counts.LICENSE_BLOCKED,16);
assert.equal(queue.counts.STATION_EXACTNESS,12);
assert.equal(queue.counts.DISCOVER_EXACT_ORIGINAL,23);
assert.equal(queue.counts.PER_IMAGE_RIGHTS,4);
assert.equal(queue.records.reduce((n,x)=>n+Number(x.lane==="LICENSE_BLOCKED"),0),16);
assert.equal(queue.records.filter(x=>x.status==="HOLD_WRONG_STATION_OBJECT_URL").length,12);
assert(queue.records.filter(x=>x.status==="HOLD_WRONG_STATION_OBJECT_URL")
 .every(x=>x.sourceUrl.endsWith("via-crucis-jesus-is-taken-down-from-the-cross/")),
 "Wrong Station XIII link must never be presented as matching another Station");
for(const row of queue.records) {
 assert(!rejected.has(row.artworkId),"Rejected original entered queue");
 assert(approved.has(row.artworkId)||legacy.has(row.artworkId),
  "Unapproved original entered queue");
 assert(!/prado|museodelprado/i.test(row.artworkId+" "+row.sourceUrl));
 assert(row.lane&&row.status&&row.next&&row.priority);
}
assert(queue.policy.noPradoImagesOrMirrors&&queue.policy.noPaidLicences&&queue.policy.noMuseumContact);
assert(queue.policy.doNotUseNC_NDForCommercialApp);
assert.deepEqual(load("data/calendar/sacred-art-certified-media.v1.json").media,[]);
console.log("PASS: 76 non-Prado source tasks in 50 + 26 batches; 16 rights blocks; 12 mismatched Station links; no publication");
