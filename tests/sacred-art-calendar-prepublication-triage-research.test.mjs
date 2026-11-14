import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const ledger = read('data/artwork/research/m2m-calendar-unmatched170-exact-scene-leads-20261110.v1.json');
const triage = read('data/artwork/research/m2m-calendar-prepublication-triage-198-20261110.v1.json');
const audit = read('data/artwork/research/m2m-object-source-audit-13-20261110.v1.json');
const oldTargets = read('data/artwork/research/m2m-destinations-640-20261109.v1.json').records;

assert.equal(triage.status, 'RESEARCH_ONLY_NOT_APPROVAL_NOT_RELEASE');
assert.equal(audit.status, 'RESEARCH_ONLY_EXPLICIT_SOURCE_FINDINGS_NOT_PUBLISHABLE');
assert.equal(triage.edges.length, 198);
assert.equal(triage.dates.length, 170);
assert.equal(triage.works.length, 151);
assert.equal(audit.records.length, 13);
assert.deepEqual(audit.counts, {
 auditedUniqueWorkKeys:13,
 directCatalogueAccessible:10,
 brokenOrBlocked:1,
 jsOnly:1,
 timeout:1,
 selectedImageBytesCertified:0,
 ownerDateApprovals:0,
 releaseReady:0
});
assert.equal(triage.counts.datesWithAnyResearchLead,167);
assert.equal(triage.counts.datesWithoutAnyLead,3);
assert.equal(triage.counts.datesWithDirectOrSubsetResearchLead,142);
assert.equal(triage.counts.datesOnlyContextualPartialOrSecondary,25);
assert.deepEqual(triage.counts.byFidelity, {
 EXACT_PERSON:98, DIRECT_GOSPEL:52, CONTEXT_ONLY:25,
 GOSPEL_SUBSET:18, PARTIAL_SAINTS:4, EXACT_FEAST_GROUP:1
});
assert.deepEqual(triage.counts.byMedium, {
 OIL_PAINTING:96, PRINT_OR_DRAWING:36, UNKNOWN_MEDIUM:33,
 NON_OIL_PAINTING:16, WATERCOLOR_OR_GOUACHE:12, ICON:5
});
assert.deepEqual(triage.counts.bySourceKind, {
 NEW_INSTITUTIONAL_OBJECT_LEAD:162,
 EXISTING_989_GROUP_RESEARCH_LINK:25,
 SECONDARY_OR_COMMONS_RESEARCH_ONLY:11
});
assert.equal(triage.counts.releaseReadyArtworkCount,0);
assert.equal(triage.counts.releaseReadyDateCount,0);
assert.equal(triage.counts.existingCalendarNamedMatchesOutsideThisGapLedger,195);
assert.equal(triage.counts.priorPrayerNONEProtected,27);
const origOpen=oldTargets.filter(x=>x.target_type==='CALENDAR'&&x.existing_v3_id==='NONE');
assert.equal(origOpen.length,170);
assert.deepEqual(triage.dates.map(x=>x.date).sort(),origOpen.map(x=>x.target_id).sort());
assert.deepEqual(triage.dates.filter(x=>!x.datedLeadCount).map(x=>x.date).sort(),['2026-03-02','2026-03-10','2026-03-11']);
assert.deepEqual(triage.counts.byClass,{
 II:{originalUnmatched:29,anyNewLead:29,directOrSubset:22},
 III:{originalUnmatched:101,anyNewLead:98,directOrSubset:89},
 IV:{originalUnmatched:40,anyNewLead:40,directOrSubset:31}
});
assert.equal(new Set(triage.edges.map(x=>x.edgeId)).size,198);
assert.equal(new Set(triage.works.map(x=>x.artworkKey)).size,151);
const byEdge=new Map(triage.edges.map(x=>[x.edgeId,x]));
for(const target of ledger.records){
 const triageTarget=triage.dates.find(x=>x.date===target.date);
 assert.ok(triageTarget,'missing triage date '+target.date);
 assert.equal(triageTarget.originalUnmatchedHold,true);
 assert.equal(triageTarget.datedLeadCount,target.candidateCount);
 assert.equal(triageTarget.photoReleaseReady,false);
 assert.equal(triageTarget.edgeIds.length,target.artworkRelationships.length);
 for(const edge of target.artworkRelationships){
  const x=byEdge.get(target.date+'::'+edge.key);
  assert.ok(x,'missing triage edge '+target.date+' '+edge.key);
  assert.equal(x.artworkKey,edge.key);
  assert.equal(x.sourceKind,edge.kind);
  assert.equal(x.semanticRelationship,edge.relation);
  assert.equal(x.ownerApprovalForThisDate,false);
  assert.equal(x.productionAssignment,false);
  assert.equal(x.photoRights,'NOT_CLEARED');
  assert.equal(x.imageBytes,'NOT_ACQUIRED_OR_CERTIFIED');
  assert.equal(x.photoPixelAndCropQA,'NOT_PERFORMED');
  assert.ok(x.artworkCatalogUrl);
 }
}
for(const a of audit.records){
 const work=triage.works.find(x=>x.artworkKey===a.workKey);
 assert.ok(work,'audited key missing from triage '+a.workKey);
 assert.equal(work.sourceAudited,true);
 assert.equal(a.exactSourceBytesDownloaded,false);
 assert.equal(a.imageSHA256Verified,false);
 assert.equal(a.photoPixelQualityInspected,false);
 assert.equal(a.mobile390CropCertified,false);
 assert.equal(a.ownerDatePlacementApproved,false);
 assert.equal(a.releaseAuthorised,false);
}
const broken=triage.edges.filter(x=>x.priority==='P0_BROKEN_INSTITUTIONAL_URL');
assert.equal(broken.length,8);
assert.ok(broken.every(x=>x.artworkKey==='Brooklyn:00.159.225'));
assert.equal(triage.works.find(x=>x.artworkKey==='Brooklyn:00.159.225').candidateDates.length,8);
const nm420=audit.records.find(x=>x.workKey==='Nationalmuseum:NM420');
assert.ok(nm420.notes.includes('Matthew 20:1–16')&&nm420.notes.includes('erroneous Matthew 21'),'museum's wrong Scripture label must not propagate');
const iccd=audit.records.find(x=>x.workKey==='ICCD:1201202757');
assert.ok(iccd.formatRights.includes('METADATA')&&iccd.formatRights.includes('PHOTO_RIGHTS_NOT_ESTABLISHED'));
const nga=audit.records.find(x=>x.workKey==='NGA:1969.15.672');
assert.ok(nga.notes.includes('second panel')&&nga.notes.includes('April 13'));
assert.ok(triage.edges.find(x=>x.edgeId==='2026-11-26::ICCD:1200199733-5'));
assert.ok(!triage.edges.some(x=>x.artworkKey==='ICCD:1200239580'),'26 November is Sylvester Gozzolini, not Pope Sylvester');
console.log('PASS: 198 editorial queue edges, 151 unique work keys, 142 direct/subset-dated leads, 13 audited sources; all photo/approval gates closed.');
