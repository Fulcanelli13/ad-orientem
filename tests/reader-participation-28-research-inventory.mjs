import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildParticipation28ResearchReview,PARTICIPATION_RESEARCH_28_SCORES}
 from "../src/mass/reader-participation-28-research-inventory.js";
import {PARTICIPATION_REFERENCE_SCORES}
 from "../src/mass/reader-participation-reference-scores.js";
import {PREFACE_SOLEMNIOR_RESEARCH_SCORES}
 from "../src/mass/reader-preface-solemnior-reference-scores.js";
import {buildParticipationScoreReviewCsv}
 from "../scripts/mass/export-24-participation-review-csv.mjs";
import {build28ResearchReviewCsv,build28ResearchReviewManifest,
 PARTICIPATION_REVIEW_28_EXPORT_SCHEMA}
 from "../scripts/mass/export-28-participation-research-review.mjs";
const review=buildParticipation28ResearchReview();
assert.equal(review.schema,"ao-mass-participation-28-source-review-v1");
assert.deepEqual(review.counts,{
 sourceRecords:12,sourceMappedMassEventGroups:15,baseFixedExcerpts:24,
 solemniorAppendixExcerpts:4,totalResearchExcerpts:28,
 distinctOriginalPrintedPages:14,printedFineNeumesCertified:0,
 actualSolemniorMassContextsCertified:0,newPublicApprovals:0,
 existingPublicIteVIIIFragments:2
});
assert.equal(PARTICIPATION_REFERENCE_SCORES.length,24);
assert.equal(PREFACE_SOLEMNIOR_RESEARCH_SCORES.length,4);
assert.equal(PARTICIPATION_RESEARCH_28_SCORES.length,28);
assert.equal(new Set(review.rows.map(r=>r.id)).size,28);
assert.equal(review.rows.filter(r=>r.researchCatalogue==="FIXED_24_BASELINE").length,24);
assert.equal(review.rows.filter(r=>r.researchCatalogue==="SOLEMNIOR_FOUR_SOURCE_ONLY").length,4);
for(const s of PARTICIPATION_REFERENCE_SCORES)
 assert.equal(review.rows.filter(r=>r.id===s.id).length,1,"Original fixed 24 score missing "+s.id);
for(const s of PREFACE_SOLEMNIOR_RESEARCH_SCORES){
 const r=review.rows.find(r=>r.id===s.id);
 assert.ok(r,"Missing distinct third-tone score "+s.id);
 assert.equal(r.sourceId,4451);
 assert.deepEqual(r.cueIds,s.sourceCueIds);
 assert.equal(r.researchCatalogue,"SOLEMNIOR_FOUR_SOURCE_ONLY");
 assert.equal(r.originalPrintedWitnesses.length,2);
 assert.equal(r.publicScoreApproved,false);
 assert.equal(r.contextCertified,false);
 assert.equal(r.editorialDecision,"DO_NOT_PUBLISH");
}
for(const id of ["SECRET_CONCLUSION","PREFACE_GREETING","PREFACE_SURSUM_CORDA","PREFACE_GRATIAS"]){
 const group=review.groups.find(g=>g.eventId===id);
 assert.ok(group);
 assert.equal(group.baseline24Count,2);
 assert.equal(group.appendixCount,1);
 assert.equal(group.rows.length,3);
 assert.equal(new Set(group.rows.map(r=>r.sourceId)).size,3);
}
assert.equal(review.groups.reduce((n,g)=>n+g.rows.length,0),28);
const original=buildParticipationScoreReviewCsv().trimEnd().split("\n");
assert.equal(original.length,25);
const csv=build28ResearchReviewCsv();
const lines=csv.trimEnd().split("\n");
assert.equal(lines.length,29);
assert.deepEqual(lines.slice(0,25),original,
 "Existing 24-row editorial export MUST remain byte-for-byte unchanged");
assert.ok(lines.slice(25).every(l=>l.includes('"4451"')&&l.includes('"DO_NOT_PUBLISH"')));
assert.ok(lines.slice(25).every(l=>l.includes("sources/2/1009.png")&&l.includes("sources/3/221.png")));
const manifest=build28ResearchReviewManifest();
assert.equal(manifest.schema,PARTICIPATION_REVIEW_28_EXPORT_SCHEMA);
assert.deepEqual(manifest.counts,review.counts);
assert.equal(manifest.rows.length,28);
assert.equal(manifest.rows.filter(x=>x.sourceId===4451).length,4);
assert.ok(manifest.rows.every(x=>!x.publicScoreApproved&&x.reviewerDecision==="DO_NOT_PUBLISH"));
assert.equal(new Set(manifest.rows.flatMap(x=>x.printedWitnesses.map(p=>p.url))).size,14);
const publicSelector=readFileSync(new URL("../src/mass/reader-inline-chant-approved.js",import.meta.url),"utf8");
const liveRenderer=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.ok(!publicSelector.includes("reader-participation-28-research-inventory"));
assert.ok(!publicSelector.includes("reader-preface-solemnior-reference-scores"));
assert.ok(!liveRenderer.includes("reader-participation-28-research-inventory"));
assert.ok(!liveRenderer.includes("reader-preface-solemnior-reference-scores"));
console.log("PASS 28 Gregorian research excerpts, exact retained original 24 rows, 4 third-tone additions, 12 sources, 15 events, 14 printed plates, 0 new approvals");
