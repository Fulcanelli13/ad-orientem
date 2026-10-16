import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const audit=read("data/explore/biblical-story-context-fidelity-audit.v1.json");
const canonical=read("data/explore/biblical-reading-continuity-review.v1.json");
const publisher=read("data/explore/biblical-pericope-comparative-full-master.v7.json");
const triage=read("data/explore/biblical-story-first-editorial-triage.v1.json");
assert.equal(audit.schema,"AO_BIBLICAL_STORY_CONTEXT_FIDELITY_AUDIT_V1");
assert.equal(canonical.events.length,151);
assert.equal(canonical.readingChapters.length,37);
assert.equal(publisher.sourceSelectionRecords.length,460);
assert.equal(audit.policy.originalPublisherRowsPreserved,460);
assert.equal(audit.reviewedStories.length,14);
assert.equal(audit.counts.cohortStories,14);
assert.equal(audit.counts.existingAtlasEvents,12);
assert.equal(audit.counts.supplementalReadings,2);
assert.equal(audit.policy.appBibleVersionsChanged,false);
assert.equal(audit.policy.appReaderChanged,false);
assert.equal(audit.policy.noFinalApprovals,true);
assert.deepEqual(audit.approvalRegister,[]);
assert.deepEqual(audit.publicationChanges,[]);
const ids=new Set();
const covered=new Set();
for(const row of audit.reviewedStories){
 assert.ok(!ids.has(row.reviewId));ids.add(row.reviewId);
 assert.ok(row.originalResearchAnchor);
 assert.ok(row.primaryExternalCatholicChapterForContext.startsWith("https://bible.usccb.org/bible/"));
 assert.ok(row.publicDomainDouayComparisonChapter.startsWith("https://www.drbo.org/chapter/"));
 assert.ok(row.essentialContextSegments.length >= 3);
 assert.ok(row.omissionAndFidelityRisks.length >= 1);
 assert.ok(row.suggestedFullNarrativeScope.length >= 1);
 assert.equal(row.editorialApprovalStatus,"RESEARCH_ONLY_NOT_AUTHORIZED_FOR_PUBLICATION");
 assert.equal(row.originalOfficialAppWitnessVerified,false);
 assert.equal(row.finalEssentialRange,null);
 assert.equal(row.finalExtendedRange,null);
 assert.equal(row.scriptureTextImported,false);
 assert.equal(row.aiAuthoredBibleHistory,false);
 assert.equal(row.independentPublisherEvidenceInflated,false);
 if(row.canonicalAtlasEventKey){
  assert.ok(Number.isInteger(row.canonicalAtlasEventIndex));
  const i=row.canonicalAtlasEventIndex;
  assert.equal(canonical.events[i].eventKey,row.canonicalAtlasEventKey);
  assert.equal(publisher.eventRegistry[i].eventKey,row.canonicalAtlasEventKey);
  assert.ok(triage.atlasEventDecisions.some(e=>e.eventIndex===i && e.proposedClass==="CORE_STORY"));
  for(const entry of row.originalV7PublisherEvidenceByFamily){
   assert.ok(publisher.sourceSelectionRecords.some(s=>s.eventIndex===i&&s.sourceId===entry.sourceId));
  }
 } else{
  assert.equal(row.canonicalAtlasEventIndex,null);
  assert.ok(triage.additionalReadingDecisions.some(e=>e.proposalId===row.supplementalResearchId));
 }
 covered.add(row.storySlug);
}
for(const key of ["fall","isaac","joseph-reconciliation","passover","annunciation","visitation","bread-of-life","lazarus","last-supper","calvary","resurrection-magdalene","pentecost","lamb-heaven","new-jerusalem"]){
 assert.ok(covered.has(key),key);
}
const isaac=audit.reviewedStories.find(r=>r.storySlug==="isaac");
assert.ok(isaac.omissionAndFidelityRisks.some(x=>x.includes("22:6")));
assert.ok(isaac.essentialContextSegments.some(x=>x.includes("22:6")));
const bread=audit.reviewedStories.find(r=>r.storySlug==="bread-of-life");
assert.ok(bread.essentialContextSegments.some(x=>x.includes("6:60")));
assert.ok(bread.essentialContextSegments.some(x=>x.includes("6:51")));
const joseph=audit.reviewedStories.find(r=>r.storySlug==="joseph-reconciliation");
assert.equal(joseph.originalV7PublisherEvidenceByFamily.length,0);
assert.equal(joseph.supplementalResearchId,"reading-candidate:supplement-005");
console.log("Scripture contextual-audit cohort: 14 source-linked research records (12 Atlas + 2 supplements), all key omissions and witnesses held; 151/37/460 base invariants, 0 app approvals.");
