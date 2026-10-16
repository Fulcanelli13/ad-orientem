import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const p=read("data/explore/biblical-story-first-editorial-policy.v1.json");
const triage=read("data/explore/biblical-story-first-editorial-triage.v1.json");
const c=read("data/explore/biblical-reading-continuity-review.v1.json");
const pool=read("data/explore/biblical-scripture-reading-granularity-audit.v1.json");
const source=read("data/explore/biblical-pericope-comparative-full-master.v7.json");
const spreadsheet=readFileSync(new URL("../data/explore/biblical-story-first-curation-review.v1.csv",import.meta.url),"utf8");
const classes=new Set(Object.keys(p.candidateClasses));
assert.equal(triage.schema,"AO_BIBLICAL_STORY_FIRST_EDITORIAL_TRIAGE_V1");
assert.equal(triage.governs,"data/explore/biblical-story-first-editorial-policy.v1.json");
assert.equal(c.events.length,151);
assert.equal(c.readingChapters.length,37);
assert.equal(source.sourceSelectionRecords.length,460);
assert.equal(triage.atlasEventDecisions.length,151);
assert.equal(triage.additionalReadingDecisions.length,53);
assert.equal(triage.originalSplitPlanDecisions.length,41);
assert.equal(triage.storyArcProposals.length,13);
assert.equal(triage.groups.length,37);
assert.equal(triage.narrativeContinuityReview.length,6);
assert.equal(triage.approvedReadingIDs.length,0);
assert.equal(triage.preservation.finalSelectedScriptureVerses,0);
assert.equal(triage.preservation.productionChanges,0);
assert.equal(triage.numberTargetsAreNotProductRequirements,true);
let totalCore=0;
for(const [i,x] of triage.atlasEventDecisions.entries()){
 assert.equal(x.eventIndex,i);
 assert.equal(x.eventKey,c.events[i].eventKey);
 assert.equal(x.originalReference,c.events[i].reference);
 assert.equal(x.readingSectionId,c.events[i].readingChapterId);
 assert.equal(x.sourceAudit.qualifiedIndependentFamilies,source.eventRegistry[i].qualifiedIndependentFamilies);
 assert.ok(classes.has(x.proposedClass),x.proposedClass);
 assert.equal(x.finalVerseRange,null);
 assert.equal(x.editorialApproval,false);
 if(x.proposedClass==="CORE_STORY")totalCore++;
}
assert.equal(totalCore,94);
const ids=new Set();
let additionalCore=0;
for(const x of triage.additionalReadingDecisions){
 assert.ok(pool.supplementalReadingCandidates.some(r=>r.proposalId===x.proposalId));
 assert.ok(!ids.has(x.proposalId));ids.add(x.proposalId);
 assert.ok(classes.has(x.proposedClass));
 assert.equal(x.editoriallyApproved,false);
 if(x.proposedClass==="CORE_STORY")additionalCore++;
}
assert.equal(additionalCore,19);
for (const x of triage.originalSplitPlanDecisions) {
 const original=pool.splitPlans.find(y=>y.atlasEventIndex===x.parentEventIndex);
 assert.ok(original);
 assert.equal(x.originalReference,original.originalAnchor);
 assert.equal(x.units.length,original.units.length);
 for(const [i,y] of x.units.entries()){
  assert.equal(y.id,original.units[i].proposalId);
  assert.equal(y.approved,false);
 }
}
assert.equal(triage.counts.existingEventTriage.CORE_STORY,94);
assert.equal(triage.counts.supplementalTriage.CORE_STORY,19);
assert.equal(triage.counts.potentialMainPathCoreMaterial,113);
assert.equal(triage.counts.storyArcCountIsNotReleaseTarget,true);
assert.ok(triage.additionalReadingDecisions.some(x=>x.proposalId==="reading-candidate:supplement-035"&&x.duplication?.existingEventIndex===104&&x.proposedClass==="SKIP_GUIDED_PATH"));
assert.ok(triage.additionalReadingDecisions.some(x=>x.proposalId==="reading-candidate:supplement-043"&&x.duplication?.existingEventIndex===129&&x.proposedClass==="SKIP_GUIDED_PATH"));
const zero=new Set(triage.atlasEventDecisions.filter(x=>x.proposedClass==="CORE_STORY").map(x=>x.eventIndex));
const allArcIndices=triage.storyArcProposals.flatMap(x=>x.coreCanonicalEventIndices);
assert.equal(new Set(allArcIndices).size,94);
assert.ok(allArcIndices.every(x=>zero.has(x)));
assert.equal(spreadsheet.split("\n").length-2,245);
assert.ok(spreadsheet.split("\n")[0].includes("reviewerDecision"));
console.log("Story-first review: 151 preserved Atlas events, 53 supplements, 41 split plans, 13 arcs, 245 editable queue entries; 94+19 core candidates; duplicate holdings and 0 approved excerpts.");
