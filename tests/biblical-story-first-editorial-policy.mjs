import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const p=read("data/explore/biblical-story-first-editorial-policy.v1.json");
const audit=read("data/explore/biblical-scripture-reading-granularity-audit.v1.json");
const harvest=read("data/explore/biblical-scripture-73-book-minimum-source-harvest.v1.json");
const chronology=read("data/explore/biblical-reading-continuity-review.v1.json");
const sources=read("data/explore/biblical-pericope-comparative-full-master.v7.json");
assert.equal(p.schema,"AO_BIBLICAL_STORY_FIRST_EDITORIAL_POLICY_V1");
assert.equal(p.nonGoals.some(s=>s.includes("73/73")),true);
assert.equal(p.sourceCuration.minimum73BookTarget,"RETIRED");
assert.equal(p.sourceCuration.minimum299UnitArithmetic,"RETIRED");
assert.equal(p.sourceCuration.old460ReferenceMaster,"PRESERVED_UNALTERED");
assert.equal(p.publication.approvedNewPassages,0);
assert.equal(p.publication.changesToApp,0);
assert.equal(chronology.events.length,151);
assert.equal(chronology.readingChapters.length,37);
assert.equal(sources.sourceSelectionRecords.length,460);
for (const x of [audit,harvest]){
 assert.equal(x.editorialSupersession.policyOwner,"data/explore/biblical-story-first-editorial-policy.v1.json");
 assert.equal(x.editorialSupersession.mandatory73BookCoverage,false);
 assert.equal(x.editorialSupersession.mandatoryCandidateUnitCount,false);
 assert.equal(x.editorialSupersession.archiveResearchNumbers,true);
}
assert.equal(audit.productionChanges.length,0);
assert.equal(harvest.totals.approvedNewUnits,0);
console.log("Story-first Scripture editorial policy locks: historical book/unit targets archival, 151 Atlas milestones/37 sections/460 references preserved, no approved new passages or production changes.");
