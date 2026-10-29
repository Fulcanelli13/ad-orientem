import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const release=read("../data/pray/prayer-corpus-current-release-overlay-b31.v1.json");
const cross=read("../data/pray/prayer-corpus-release-crosswalk-b22.v1.json");
const foundation=read("../data/pray/prayer-corpus-ownership-foundation.v1.json");
const original=read("../data/pray/prayer-corpus-editorial-acquisition-master.v1.json");
assert.equal(release.schema,"ao.pray.current-release-overlay-b31.v1");
assert.equal(release.asOf,"2026-10-29");
assert.deepEqual(release.records.map(x=>x.id),cross.records.map(x=>x.id),
 "Current status overlay cannot hide or reorder the original 97 records");
assert.equal(release.records.length,97);
assert.equal(new Set(release.records.map(x=>x.id)).size,97);
assert.equal(original.records.length,97);
const counts={};
const published=new Set(["LIVE_SOURCE_SCOPED","RELEASED_POST_B22"]);
const addressed=new Set(["LIVE_SOURCE_SCOPED","RELEASED_POST_B22","OWNED_NOT_EXACTLY_CERTIFIED","INTENT_ONLY_NOT_TEXT","ROUTED_OTHER_MODULE"]);
const holds=new Set(["HOLD_SOURCE_OR_RIGHTS","HOLD_VARIANT_CONFLICT"]);
for(let i=0;i<97;i++){
 const now=release.records[i],b22=cross.records[i],orig=original.records[i];
 assert.equal(now.title,b22.title);
 assert.equal(now.title,orig.title);
 assert.equal(now.originalDecision,orig.decision);
 assert.equal(now.originalPriority,orig.priority);
 assert.equal(now.b22Assessment,b22.currentAssessment);
 assert.equal(now.historicalWorkReference,orig.source_url);
 assert.ok(typeof now.sourceLimit==="string"&&now.sourceLimit.length>20);
 assert.ok(now.originalPhotoCollationClaimed===false,
  "A current ledger must not claim that original print photographs were reviewed for every candidate");
 assert.ok(!("currentTextImportedByThisAudit" in now),"Overlay is source audit only; no new imported words");
 counts[now.currentStatus]=(counts[now.currentStatus]||0)+1;
 if(published.has(now.currentStatus)){
  assert.ok(now.release&&Number.isInteger(now.release.mergedPr));
  assert.ok(now.currentOwner);
 }
 if(now.currentStatus==="INTENT_ONLY_NOT_TEXT")assert.equal(now.exactOriginalTextPublicationStatus,"NOT_IMPORTED");
}
assert.deepEqual(counts,release.summary.byStatus);
assert.deepEqual(counts,{
 LIVE_SOURCE_SCOPED:5,HOLD_SOURCE_OR_RIGHTS:12,INTENT_ONLY_NOT_TEXT:21,
 OWNED_NOT_EXACTLY_CERTIFIED:25,EDITORIALLY_DEFERRED:19,
 RELEASED_POST_B22:5,EXCLUDED:4,ROUTED_OTHER_MODULE:5,HOLD_VARIANT_CONFLICT:1
});
assert.equal(release.summary.total,97);
assert.equal(release.summary.addressedOrRouted,release.records.filter(r=>addressed.has(r.currentStatus)).length);
assert.equal(release.summary.addressedOrRouted,61);
assert.equal(release.summary.sourceOrVariantHolds,release.records.filter(r=>holds.has(r.currentStatus)).length);
assert.equal(release.summary.sourceOrVariantHolds,13);
assert.equal(release.summary.editorialDeferrals,19);
assert.equal(release.summary.excluded,4);
assert.equal(release.summary.newDistinctProgrammeCandidates,5);
const releases=new Map([
 ["AO-AQ-029",1915],
 ["AO-AQ-053",1886],
 ["AO-AQ-062",1888],
 ["AO-AQ-065",1895],
 ["AO-AQ-066",1906]
]);
assert.deepEqual(
 release.records.filter(r=>r.currentStatus==="RELEASED_POST_B22").map(r=>r.id).sort(),
 [...releases.keys()].sort(),
 "The exact five format-distinct B22 candidates, not five new additional candidates, were implemented"
);
for(const [id,pr] of releases){
 const entry=release.records.find(r=>r.id===id);
 assert.equal(entry.release.mergedPr,pr);
 assert.match(entry.release.mergedSha,/^[0-9a-f]{40}$/);
 assert.equal(entry.release.sourcePhotoCollationStillPending,true);
 assert.match(entry.release.scope,/not|no|only|distinct|edition/i);
}
const short=release.records.find(x=>x.id==="AO-AQ-047");
assert.equal(short.b22Assessment,"LIVE_EXACT","B22 source remains unchanged for provenance");
assert.equal(short.currentStatus,"HOLD_VARIANT_CONFLICT");
assert.equal(short.exactOriginalTextPublicationStatus,"HELD_SHORT_FORM");
assert.equal(short.release.mergedPr,null);
assert.equal(short.release.alternateFullFormPr,1873);
assert.match(short.release.scope,/§40.*NOT published/);
assert.match(short.release.scope,/33.*35/);
assert.equal(release.records.filter(x=>x.currentStatus==="LIVE_SOURCE_SCOPED").length,5);
for(const x of release.records.filter(r=>r.b22Assessment==="EXISTING_OWNER")){
 assert.equal(x.currentStatus,"OWNED_NOT_EXACTLY_CERTIFIED","Original owner cannot imply printed text/reader certification");
}
assert.equal(Object.keys(PRAY_CANONICAL_DATA_V435930.prayers).length,48);
assert.equal(NOVENA_CORPUS_V4_IDS.length,16);
assert.equal(release.summary.original48Prayers,48);
assert.equal(release.summary.original16NovenaIds,16);
assert.equal(foundation.records.length,94);
assert.equal(release.summary.ownershipFoundationLedgerRecords,94);
assert.equal(foundation.summary.unique_global_prayers,"NOT_YET_DEDUPLICATED");
assert.equal(release.summary.distinctPublishedPrayerTextCount,"NOT_ESTABLISHED_FROM_OVERLAPPING_LANES");
assert.equal(release.summary.originalPrintEditionCertifications,"NOT_ESTABLISHED_BY_THIS_RECONCILIATION");
assert.equal(cross.summary.total,97);
assert.equal(cross.summary.byAssessment.DISTINCT_CANDIDATE,5,"Historical B22 snapshot must stay frozen");
assert.equal(cross.summary.byAssessment.LIVE_EXACT,6,"Historical §40 error must remain visible in original crosswalk");
assert.ok(release.sourceWarnings.some(x=>x.includes("AO-AQ-047")));
assert.ok(release.sourceWarnings.some(x=>x.includes("94-row ownership")));
console.log("Prayer B31 PASS: 97/97 current release statuses, 61 addressed, 13 holds (including §40), 19 deferred, 4 excluded; five candidate releases evidenced and original 48/16/94/B22 frozen.");
