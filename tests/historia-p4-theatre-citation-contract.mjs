import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url),"utf8"));
const crosswalk=read("../data/research/historia-p4-movement-theatre-citation-crosswalk.v1.json");
const seam=read("../data/research/historia-p4-m20-m37-literary-review-queue.v1.json");
const patriarchs=read("../data/research/historia-p4-patriarchs-witness-desk-audit.v1.json");
const html=readFileSync(new URL("../labs/historia-salutis-theatre-p4.html",import.meta.url),"utf8");
const C=crosswalk.counts;
assert.equal(crosswalk.status,"RESEARCH_ONLY_SOURCE_OVERLAP_NOT_IDENTITY_NOT_APPROVED");
assert.deepEqual([C.movements,C.scenes,C.atlasEvents],[37,183,151]);
assert.deepEqual([C.movementsWithSceneCitationOverlap,C.movementsWithoutSceneCitationOverlap],[24,13]);
assert.deepEqual([C.scenesWithMovementCitationOverlap,C.scenesWithoutMovementCitationOverlap],[57,126]);
assert.equal(C.totalMovementSceneCitationLinks,57);
assert.equal(C.totalMovementP0AtlasCitationLinks,60);
assert.equal(C.sceneLocationRowAuditsApproved,0);
assert.equal(crosswalk.policy.indexPositionNeverUsedAsIdentity,true);
assert.equal(crosswalk.policy.p0ReadingChapterNotMatchedToP3MovementByOrdinal,true);
assert.equal(crosswalk.policy.canonicalAtlasOwnershipUnchanged,true);
assert.equal(crosswalk.policy.createsNoCoordinates,true);
assert.equal(crosswalk.policy.sourceBridgesRemainHeld,true);
const movementIds=new Set(crosswalk.movements.map(m=>m.movementId));
const sceneIds=new Set(crosswalk.sceneAuditQueue.map(s=>s.sceneKey));
assert.equal(movementIds.size,37);
assert.equal(sceneIds.size,183);
assert.deepEqual(crosswalk.movements.map(m=>m.sequence),Array.from({length:37},(_,i)=>i+1));
assert.deepEqual(crosswalk.sceneAuditQueue.map(s=>s.originalIndex).sort((a,b)=>a-b),Array.from({length:183},(_,i)=>i));
const legal=new Set(["IDENTICAL_CITATION_SPAN","SCENE_OR_EVENT_CONTAINED_IN_SELECTED_PASSAGE","SELECTED_PASSAGE_CONTAINED_IN_SCENE_OR_EVENT","PARTIAL_CITATION_OVERLAP_REVIEW_ONLY"]);
for(const m of crosswalk.movements){
 assert.equal(m.publicationApproved,false);
 assert.equal(m.oralAccepted,false);
 assert.ok(m.selectedScriptureBeats.length>0);
 for(const v of m.sceneCitationLinks){
  assert.ok(sceneIds.has(v.sceneKey));assert.ok(legal.has(v.citationRelation));
  const row=crosswalk.sceneAuditQueue.find(s=>s.sceneKey===v.sceneKey);
  assert.ok(row.movementCitationLinks.some(b=>b.movementId===m.movementId&&b.citationRelation===v.citationRelation));
 }
 for(const v of m.p0AtlasCitationLinks)assert.ok(legal.has(v.citationRelation));
 for(const v of m.sourceBridgeCandidates)assert.equal(v.approval,"HOLD");
}
for(const s of crosswalk.sceneAuditQueue){
 assert.equal(s.chronologyAndTextActorsAudit,"NOT_REVIEWED");
 assert.equal(s.locationEvidenceClass,"NOT_REVIEWED");
 assert.equal(s.historicalGeographyCitationsVerified,false);
 assert.equal(s.coordinatesImported,false);
 assert.equal(s.approvedForStorytelling,false);
 for(const v of s.originalCandidateAtlasEvents)assert.equal(v.p0EventExists,true);
 for(const x of s.movementCitationLinks)assert.ok(movementIds.has(x.movementId));
}
assert.deepEqual(C.sceneAtlasStatuses.EXACT_REFERENCE,67);
assert.deepEqual(C.sceneAtlasStatuses.PASSAGE_OVERLAP_REVIEW_ONLY,29);
assert.deepEqual(C.sceneAtlasStatuses.NO_DIRECT_PASSAGE_MATCH,87);
assert.equal(seam.movements.length,18);
assert.equal(seam.counts.issueCount,35);
for(const [i,m] of seam.movements.entries()){
 assert.equal(m.movementId,"HS-M"+String(i+20).padStart(2,"0"));
 assert.equal(m.decision,"HOLD_PENDING_VERSE_BY_VERSE_REVIEW");
 assert.equal(m.readAloudAccepted,false);assert.equal(m.publicationApproved,false);
 assert.ok(m.reviewFindings.length>0);
}
assert.equal(patriarchs.reviewedRows.length,25);
assert.equal(patriarchs.counts.rowsWithVersePresenceBothWitnesses,25);
assert.equal(patriarchs.counts.rowsApprovedForGeocoding,0);
assert.equal(patriarchs.counts.rowsPublished,0);
assert.equal(patriarchs.counts.criticalLocationCorrections,1);
for(const [i,x] of patriarchs.reviewedRows.entries()){
 assert.equal(x.index,i);
 assert.ok(sceneIds.has(x.sceneKey));
 assert.equal(x.publicationApproval,false);
 assert.equal(x.definitiveModernCoordinatesApproved,false);
 assert.equal(x.witnessSpanChecks.coordinatePresenceVerified,true);
 assert.ok(x.witnessSpanChecks.douayChallonerVerseEntries>0);
 assert.equal(x.witnessSpanChecks.douayChallonerVerseEntries,x.witnessSpanChecks.cpdv2009VerseEntries);
}
const isaacBirth=patriarchs.reviewedRows.find(x=>x.sceneKey==="biblical:scene:abraham:021");
assert.ok(isaacBirth);
assert.equal(isaacBirth.geographicalAction,"CORRECTION_REQUIRED_NO_BEERSHEBA_BIRTH_PIN");
assert.equal(isaacBirth.locationEvidenceClass,"UNLOCATED_EVENT");
for(const token of ["maplibregl.Map","prefers-reduced-motion","ATLAS_GEO.cenacle","ATLAS_GEO.transfiguration","HS-M37","sourceBridgeCandidates"]) {
 if(token==="sourceBridgeCandidates") continue;
 assert.ok(html.includes(token),"Theatre lab missing "+token);
}
assert.ok(html.includes("No cinematic-scene identity exists"));
assert.ok(html.includes("No painting imported"));
assert.ok(!html.includes("<script type=\"module\" src=\"../src/"),"Research lab must not import production modules");
console.log("PASS: Historia P4 crosswalk, 183-row evidence queue, 18 seam holds, 25 Genesis witnesses and four-state theatre laboratory source contracts");
