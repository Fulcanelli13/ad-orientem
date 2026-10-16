import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 MASS_SOURCE_BATCH_SCHEMA,validateMassSourceLocusBatches,massSourceBatchLocus,
 massSourceBatchChoice,massSourceBatchDecisionPatch,massSourceBatchReviewHtml
} from "../src/learn/mass-source-batch-review.js";
const source=JSON.parse(readFileSync(new URL("../data/learn/research/mass-moment-author-evidence-review-20261016.v1.json",import.meta.url),"utf8"));
const batch=JSON.parse(readFileSync(new URL("../data/learn/research/mass-source-first69-locus-batches-20261016.v1.json",import.meta.url),"utf8"));
assert.equal(batch.schema,MASS_SOURCE_BATCH_SCHEMA);
assert.equal(validateMassSourceLocusBatches(batch,source),batch);
assert.equal(batch.works.length,5);
assert.equal(batch.loci.length,37);
assert.equal(batch.totalResearchClaims,69);
assert.equal(batch.originalWitnessPagesCollated,0);
assert.equal(batch.publicationApproved,0);
assert.deepEqual(Object.fromEntries(batch.works.map(w=>[w.author,[w.claimCount,w.locusCount]])),{
 "St Alphonsus de Liguori":[36,15],"Dom Prosper Guéranger":[11,10],
 "Fr Nicholas Gihr":[12,8],"St Thomas Aquinas":[6,2],
 "Roman Catechism (Council of Trent)":[4,2]
});
const ids=batch.loci.flatMap(l=>l.claimIds);
assert.equal(ids.length,69);
assert.equal(new Set(ids).size,69);
const first=batch.loci.find(x=>x.claimIds.length>1);
assert.ok(first);
assert.equal(massSourceBatchChoice(first,{}),"HOLD");
const updates=massSourceBatchDecisionPatch(batch,first.id,"PRIORITIZE_COLLATION");
assert.equal(Object.keys(updates).length,first.claimIds.length);
assert.ok(Object.values(updates).every(c=>c==="PRIORITIZE_COLLATION"));
assert.equal(massSourceBatchChoice(first,updates),"PRIORITIZE_COLLATION");
const mixed={...updates,[first.claimIds[0]]:"QUESTION_SCOPE"};
assert.equal(massSourceBatchChoice(first,mixed),"MIXED");
assert.equal(massSourceBatchDecisionPatch(batch,first.id,"APPROVED_FOR_READING"),null);
assert.equal(massSourceBatchDecisionPatch(batch,"NOT_A_REAL_SOURCE_BATCH","HOLD"),null);
assert.equal(massSourceBatchLocus(batch,first.id).id,first.id);
for(const lang of [false,true]){
 const markup=massSourceBatchReviewHtml(batch,{french:lang,claimChoices:mixed});
 assert.equal((markup.match(/data-ao-source-batch-locus=/g)||[]).length,37);
 assert.equal((markup.match(/data-ao-source-work=/g)||[]).length,5);
 assert.equal((markup.match(/data-ao-source-batch-decision=/g)||[]).length,37);
 assert.ok(markup.includes('data-ao-mf-evidence-export'));
 assert.ok(markup.includes('value="MIXED" selected disabled'));
 assert.ok(markup.includes(lang?"69 assertions":"69 strongest"));
 assert.ok(markup.includes("original"));
 assert.ok(!markup.includes("<blockquote"),"No printed text quoted before certification");
 assert.ok(!markup.includes("PUBLICATION_APPROVED"));
}
for(const work of batch.works){
 assert.equal(work.scanExamined,false);
 assert.equal(work.publicationApproved,false);
 assert.equal(work.originalEditionVerified,false);
 assert.ok(work.editionToVerify);
}
const clone=()=>JSON.parse(JSON.stringify(batch));
{
 const v=clone();v.publicationApproved=1;
 assert.throws(()=>validateMassSourceLocusBatches(v,source),/PUBLISH_GATE/);
}
{
 const v=clone();v.loci[0].claimIds[0]="VER-999";
 assert.throws(()=>validateMassSourceLocusBatches(v,source),/CROSSWALK/);
}
{
 const v=clone();v.works[0].sourceWitnessUrl="javascript:evil()";
 assert.throws(()=>validateMassSourceLocusBatches(v,source),/WORK_URL/);
}
{
 const v=clone();v.loci[0].sourceImageChecked=true;
 assert.throws(()=>validateMassSourceLocusBatches(v,source),/LOCUS_NOT_CERTIFIED/);
}
const owner=readFileSync(new URL("../src/learn/mass-formation.js",import.meta.url),"utf8");
assert.ok(owner.includes("massMomentEvidencePreviewEnabled(win)"));
assert.ok(owner.includes("saveSourceBatchDecision("));
assert.ok(owner.includes("massSourceBatchReviewHtml("));
assert.ok(owner.includes("loadMassSourceLocusBatches("));
assert.ok(owner.includes('sourceReferencePanelHtml({'),"Published Formation Sources remain owned by existing renderer");
console.log("Mass witness batch: PASS — 69 claims, 37 original locators, 5 authors, zero publication clearance.");
