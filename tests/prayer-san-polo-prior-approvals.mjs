import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const root="data/prayer/stations/san-polo-tiepolo-oils-1747/";
const read=n=>JSON.parse(readFileSync(root+n,"utf8"));
const archive=read("acquisition-results.v1.json");
const stage=read("research-stage-bindings.v1.json");
const prior=read("prior-approvals-reconciliation.v1.json");
const validApproval=new Set([
 "USER_APPROVED",
 "USER_APPROVED_EXISTING_SAINTS_SELECTION",
 "USER_APPROVED_20261030_NEW_ARTWORK_REUSE",
 "USER_APPROVED_CROSS_PRAYER_REUSE",
 "USER_FINAL_LOCKED",
]);
assert.equal(prior.schema,"AO_STATIONS_SAN_POLO_14_PRIOR_APPROVAL_CONFLICT_FREE_CROSSWALK_V1");
assert.equal(prior.policy.noNewArtisticApprovals,true);
assert.equal(prior.policy.missingCheckboxIsNotRejection,true);
assert.equal(prior.policy.doNotReplaceApprovedStationArtwork,true);
assert.equal(prior.policy.strictPDCC0ProductionGateStillClosed,true);
assert.equal(prior.policy.publicationEnabled,false);
assert.equal(prior.entries.length,14);
assert.equal(prior.summary.stationSlotsCoveredByApprovedPaintingOrValidSameSceneReuse,8);
assert.deepEqual(prior.summary.sixUncoveredEditorialStations,["III","VII","VIII","IX","X","XI"]);
assert.equal(prior.summary.sourceImageFilesPublished,0);
assert.equal(archive.productionImagesEnabled,0);
assert.equal(stage.distribution.productionEnabled,false);
const allIds=[];
for(let i=0;i<14;i++){
 const a=prior.entries[i],s=stage.entries[i],f=archive.files[i],n=i+1;
 assert.equal(a.station,n);
 assert.equal(a.slotId,s.slotId);
 assert.equal(a.archivedCandidate.path,f.file);
 assert.equal(a.archivedCandidate.sha256,f.derivativeSHA256);
 assert.equal(a.archivedCandidate.photoLicense,"CC BY-SA 4.0");
 assert.equal(a.archivedCandidate.licensePolicyExceptionApproved,false);
 assert.equal(a.archivedCandidate.productionApproved,false);
 assert.equal(a.automaticReplaceExistingArtwork,false);
 assert.equal(a.publicationStatus,"HOLD_NO_APPROVAL_NO_PD_CC0_OR_POLICY_EXCEPTION");
 assert.equal(a.existingApprovalCount,a.alreadyApprovedCandidateArtworks.length);
 for(const w of a.alreadyApprovedCandidateArtworks){
  assert.ok(validApproval.has(w.editorialStatus),"Never grant approval from a substring or candidate");
  assert.ok(w.id && w.title);
  assert.ok(!/Lybaert/i.test(w.artist||""));
 }
 allIds.push(a.slotId);
}
assert.equal(new Set(allIds).size,14);
for(const n of [3,7,8,9,10,11]){
 assert.equal(prior.entries[n-1].existingApprovalCount,0);
 assert.equal(prior.entries[n-1].editorialGapInPriorReconciledMaster,true);
}
for(const n of [1,2,4,6,12,13,14]){
 assert.ok(prior.entries[n-1].existingApprovalCount>=1);
 assert.equal(prior.entries[n-1].editorialGapInPriorReconciledMaster,false);
}
const mother=prior.entries[3];
assert.equal(mother.previouslyApprovedSameSanPoloPainting,true,"Preserve earlier Station IV same-painting approval");
assert.ok(mother.alreadyApprovedCandidateArtworks.some(w=>/Giandomenico Tiepolo/.test(w.artist||"")));
const simon=prior.entries[4];
assert.equal(simon.existingApprovalCount,0);
assert.equal(simon.editorialGapInPriorReconciledMaster,false);
assert.equal(simon.semanticReuseFromPreviouslyApprovedPainting?.sourceSlotId,"STG-pray.stations-02");
assert.equal(simon.semanticReuseFromPreviouslyApprovedPainting?.photoCleared,false);
const descent=prior.entries[12];
assert.ok(descent.alreadyApprovedCandidateArtworks.some(w=>/Prado Passion series/.test(w.title||"")));
assert.equal(descent.previouslyApprovedSameSanPoloPainting,false,"Do not conflate distinct Tiepolo oils");
console.log(JSON.stringify({result:"PASS",slots:14,directApprovedSlots:7,approvedSceneReuseSlots:1,unfilledExactScenes:6,published:0}));
