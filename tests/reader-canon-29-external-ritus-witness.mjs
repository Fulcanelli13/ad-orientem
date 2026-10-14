import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const external=read("../data/research/mass-canon-29-external-ritus-witness-20261014.json");
const flagged=read("../data/research/mass-canon-29-flagged-bilingual-adjudication-20261014.json");
const canonical=read("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json");
const bilingual=read("../data/research/mass-canon-62-bilingual-two-layer-review-20261014.json");
assert.equal(external.schema,"ao-canon-29-public-1962-latin-parallel-witness-v1");
assert.equal(external.status,"29_PUBLIC_PARALLEL_LATIN_PASSAGES_LOCATED_NOT_EDITORIALLY_CERTIFIED");
assert.deepEqual(external.counts,{
 riskEntries:29,externalLatinSectionLocators:29,
 facsimileRechecked:0,editorialCopyApproved:0,sourceTextLivePublished:0});
assert.equal(external.rows.length,29);
assert.equal(flagged.rows.length,29);
const byCanon=new Map(canonical.rows.map(x=>[x.id,x]));
const byEnglish=new Map(bilingual.rows.map(x=>[x.actionId,x]));
const seen=new Set();
for(let i=0;i<29;i++){
 const x=external.rows[i],r=flagged.rows[i],f=byCanon.get(x.actionId),b=byEnglish.get(x.actionId);
 assert.equal(x.actionId,r.actionId);
 assert.equal(x.cueId,r.cueId);
 assert.equal(x.reviewCode,r.reviewCode);
 assert.ok(!seen.has(x.actionId),"No duplicate outside-Latin review owner");
 seen.add(x.actionId);
 assert.match(x.latinSection,/^(?:VIII|IX|X)[.][0-9]+(?:[-][0-9]+)?$/);
 assert.ok(x.shortLatinLocator.length>5&&x.shortLatinLocator.length<100);
 assert.ok(x.externalLatinWitnessUrl.startsWith("https://"));
 assert.equal(x.sourceType,"PARALLEL_LATIN_FRENCH_TRANSCRIPTION_OF_1962_RITUS_SERVANDUS");
 assert.equal(x.textualCrosscheck,"PUBLIC_LATIN_CEREMONIAL_WITNESS_READ");
 assert.equal(x.originalEditionFacsimileComparison,"NOT_COMPLETED");
 assert.equal(x.independentLiturgicalApproval,"NOT_GRANTED");
 assert.equal(x.copyApproval,"NOT_GRANTED");
 assert.equal(x.publication,"FORBIDDEN");
 assert.ok(x.unreviewedElements.includes("INDEPENDENT_LINGUISTIC_SIGNOFF"));
 assert.ok(x.unreviewedElements.includes("LIVE_MINISTER_ACTION_CLOCK"));
 assert.equal(f.reviewState,"ORIGINAL_FRENCH_SOURCE_RECHECK_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY");
 assert.equal(f.shortRubricReviewState,"ORIGINAL_FRENCH_SHORT_DRAFT_NOT_APPROVED_FOR_USER_DISPLAY");
 assert.ok(!Object.hasOwn(b.shortDraft,"fr"),"No second French short copy in evidence path");
 assert.equal(b.shortDraft.frCanonicalActionId,x.actionId);
 assert.equal(b.copyApproval,"NOT_APPROVED");
}
assert.equal(seen.size,29);
const byId=new Map(external.rows.map(x=>[x.actionId.slice(-3),x]));
for(const [n,kind] of [["001","DIRECT_CEREMONIAL_SEQUENCE"],
 ["004","CONDITIONAL_FORMULA_CONTEXT"],["006","OPTIONAL_SILENT_INTENTION"],
 ["021","REPORTED_WORD_NOT_PHYSICAL_FRACTION"],
 ["027","SERVER_BELL_SEPARATE_CLOCK"],["035","SERVER_BELL_SEPARATE_CLOCK"],
 ["055","CONDITIONAL_DEACON_AND_PRIEST_STAGE"],
 ["058","MINOR_NOT_MAJOR_ELEVATION"],
 ["061","AMEN_RESPONDER_REQUIRES_ORDO"],
 ["062","ANTICIPATORY_SERVER_WARNING"]]){
 assert.equal(byId.get(n).scope,kind);
}
assert.equal(byId.get("011").shortLatinLocator,"palmæ sint apertæ");
assert.equal(byId.get("044").scope,"SOURCE_ORTHOGRAPHY_NOT_FINAL");
assert.equal(byId.get("061").scope,"AMEN_RESPONDER_REQUIRES_ORDO");
assert.equal(byId.get("008").scope,"PROPER_TEXT_REQUIRES_MISSAL_SELECTION");
console.log("PASS: 29/29 separately inspected 1962 Latin witness locators; no facsimile or copy approvals and no LIVE publication.");
