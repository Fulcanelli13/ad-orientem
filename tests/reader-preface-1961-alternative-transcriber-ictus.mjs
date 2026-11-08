import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PARTICIPATION_REFERENCE_SCORES}
 from "../src/mass/reader-participation-reference-scores.js";
import {PREFACE_SOLEMNIOR_RESEARCH_SCORES}
 from "../src/mass/reader-preface-solemnior-reference-scores.js";
import {APPROVED_MASS_INLINE_GABC}
 from "../src/mass/reader-inline-chant-approved.js";

const review=JSON.parse(readFileSync(new URL(
 "../data/mass/preface-1961-alt-transcriber-rhythmic-differences.v1.json",
 import.meta.url),"utf8"));
const sources=[
 ...PARTICIPATION_REFERENCE_SCORES.filter(x=>x.sourceId===4449||x.sourceId===4450),
 ...PREFACE_SOLEMNIOR_RESEARCH_SCORES
];
const exactPhrase=gabc=>gabc.slice(gabc.indexOf("%%")+2)
 .trim().replace(/^\(c3\)\s*/u,"").replace(/\s+\(::\)\s*$/u,"");
assert.equal(review.schema,"ao-preface-1961-six-gregobase-gabc-entries-12-response-sign-collation-v1");
assert.equal(review.rows.length,12);
assert.deepEqual(review.counts,{
 responsePairs:12,exactGabcPairsExpected:11,openRhythmicSignDiffs:1,
 independentlyPrintedRhythmicSignCertifications:0,newlyApprovedPublicScores:0
});
assert.equal(APPROVED_MASS_INLINE_GABC.length,2,"Only original two Ite VIII excerpts may be public");
assert.deepEqual(review.sources.map(x=>[x.primaryId,x.alternateId]),
 [[4449,7674],[4450,7675],[4451,7676]]);
assert.equal(new Set(review.rows.map(x=>x.primaryGregoBaseId+"|"+x.cueId)).size,12);
let matches=0,openConflicts=0;
for(const r of review.rows){
 const primary=sources.find(x=>x.sourceId===r.primaryGregoBaseId&&
  x.sourceCueIds.length===1&&x.sourceCueIds[0]===r.cueId);
 assert.ok(primary,"Original score source missing: "+r.primaryGregoBaseId+" "+r.cueId);
 assert.equal(primary.publicScoreApproved,false);
 assert.equal(r.published,false);
 assert.equal(r.alternateGregoBaseId,
  review.sources.find(s=>s.primaryId===r.primaryGregoBaseId)?.alternateId);
 assert.ok(r.alternateTextUrl.endsWith("id="+r.alternateGregoBaseId));
 const original=exactPhrase(primary.gabc);
 const alternate=r.alternateGabcPhrase;
 if(alternate===original){
  matches++;
  assert.equal(r.comparisonStatus,"TEXT_EQUIVALENCE_TO_BE_REGRESSION_TESTED");
 }else{
  openConflicts++;
  assert.equal(r.primaryGregoBaseId,4451);
  assert.equal(r.alternateGregoBaseId,7676);
  assert.equal(r.cueId,"AO.SM.C0138");
  assert.equal(r.comparisonStatus,"ICTUS_CONFLICT_REQUIRES_PRINT_CHECK");
  assert.ok(original.includes("spí(g)")&&alternate.includes("spí(g')"));
  assert.equal(alternate.replace("spí(g')","spí(g)"),original,
   "Unexpected additional differences beyond a single ictus");
 }
 // Note pitches, lyric syllables and basic group glyphs match in every case;
 // do not let that hide a source-representation rhythmic-sign disagreement.
 assert.equal(alternate.replaceAll("'",""),original.replaceAll("'",""));
}
assert.equal(matches,11);
assert.equal(openConflicts,1);
assert.equal(review.openIssue.adjudication,"OPEN_PRINT_RHYTHMIC_SIGN_COMPARISON");
assert.equal(review.openIssue.decision,
 "DO_NOT_PATCH_GABC_OR_PUBLISH_UNTIL_ORIGINAL_PRINT_CONFIRMED");
assert.equal(review.openIssue.firstPrintedLocation.page,"132*");
assert.equal(review.openIssue.secondPrintedLocation.page,"110");
assert.equal(review.openIssue.secondHighResolutionCopy.zeroBasedPdfPage,133);
assert.equal(review.openIssue.alternateChangeHistory.date,"2023-03-30");
assert.ok(review.openIssue.alternateChangeHistory.loggedDescription.includes("adding ictus"));
assert.ok(review.openIssue.alternateChangeHistory.meaning.includes("does not establish"));
assert.ok(review.evidenceMethod.includes("NOT independent validation"));
console.log("PASS 12 independent GABC-entry response comparisons: 11 exact, 1 unresolved 1961 solemnior spí ictus difference, 0 musical certifications or public approvals");
