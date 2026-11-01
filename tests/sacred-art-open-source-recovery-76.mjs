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
assert.equal(open.length,54);
assert.equal(queue.remainingUnroutedRecords,54);
const stillQueued=queue.records.filter(x=>x.lane!=="SOURCE_IDENTIFIED_QA"&&x.lane!=="PRADO_SOURCE_EMBARGO");
assert.deepEqual(new Set(stillQueued.map(x=>x.artworkId)),new Set(open.map(x=>x.id)),
 "All 54 non-Prado unsourced original artworks remain in queue, excluding 21 exact-source routes and one Prado-held approval");
assert.equal(queue.records.length,76);
assert.equal(queue.worksPerBatch,50);
assert.deepEqual(queue.batches.map(x=>x.count),[50,26]);
assert.equal(queue.counts.LICENSE_BLOCKED,16);
assert.equal(queue.counts.SOURCE_IDENTIFIED_QA,21);
assert.equal(queue.counts.PRADO_SOURCE_EMBARGO,1);
assert.equal(queue.counts.DISCOVER_EXACT_ORIGINAL,18);
assert.equal(queue.counts.PER_IMAGE_RIGHTS,4);
assert.equal(queue.records.reduce((n,x)=>n+Number(x.lane==="LICENSE_BLOCKED"),0),16);
const stations=queue.records.filter(x=>x.lane==="SOURCE_IDENTIFIED_QA"&&/an-olo-ia-rucis-tation-/.test(x.artworkId));
assert.equal(stations.length,12);
assert.equal(queue.stationObjectProgress.exactCommonsPhotoCandidates,12);
assert.equal(queue.stationObjectProgress.wrongStationLinksRemaining,0);
assert.equal(new Set(stations.map(x=>x.sourceEvidence?.exactStation)).size,12);
assert(stations.every(x=>x.status==="MOVED_TO_EXACT_COMMONS_SOURCE_QA"
  &&x.sourceUrl.includes("commons.wikimedia.org/wiki/File:Chiesa_di_San_Polo_")
  &&x.sourceEvidence.publicationCertified===false));
assert.equal(stations.filter(x=>x.sourceObjectUrl).length,9);
for(const row of queue.records) {
 assert(!rejected.has(row.artworkId),"Rejected original entered queue");
 assert(approved.has(row.artworkId)||legacy.has(row.artworkId),
  "Unapproved original entered queue");
 assert(!/prado|museodelprado/i.test(row.artworkId+" "+row.sourceUrl));
 assert(row.lane&&row.status&&row.next&&Number.isInteger(row.priority));
}
assert(queue.policy.noPradoImagesOrMirrors&&queue.policy.noPaidLicences&&queue.policy.noMuseumContact);
assert(queue.policy.doNotUseNC_NDForCommercialApp);
assert.deepEqual(load("data/calendar/sacred-art-certified-media.v1.json").media,[]);
console.log("PASS: 76 non-Prado source tasks in 50 + 26 batches; 16 rights blocks; 21 new exact-source routes; one Prado-held original; 54 still unsourced; no publication");
