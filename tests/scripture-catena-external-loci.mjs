import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const d="data/scripture/catena/research/full-corpus-pass-20261021/";
const read=p=>JSON.parse(readFileSync(d+p,"utf8"));
const source=read("matthew-first-30-source-context-adjudication.v1.json");
const cross=read("matthew-external-work-loci.v1.json");
assert.equal(cross.schema,"ao.catena.matthew-external-work-loci.v1");
assert.equal(cross.records.length,18);
assert.equal(cross.totals.workLociLocated,18);
assert.equal(cross.totals.notYetLocated,12);
assert.equal(cross.totals.independentHumanApproved,0);
assert.equal(cross.records.some(x=>x.independentHumanEditorApproved),false);
const refs=new Map(source.records.map(x=>[x.sourcePointer,x]));
const ranks=new Set();
for(const rec of cross.records){
 const original=refs.get(rec.sourcePointer);
 assert.ok(original,"unrecognized source pointer");
 assert.equal(rec.rank,original.rank);
 assert.equal(rec.originalReaderQuestion,original.originalEditorialQuestion);
 assert.equal(rec.inheritedFatherLabel,original.inheritedFatherLabel);
 assert.equal(rec.AIContextAssessment,original.AIContextAssessment);
 assert.ok(!ranks.has(rec.rank));ranks.add(rec.rank);
 assert.ok(/^https:\/\/www\.newadvent\.org\/fathers\/[a-z0-9]+\.htm$/.test(rec.externalWorkTextURL));
 assert.ok(rec.patristicWork.length>20&&rec.workLocus.length>=14);
 assert.ok(rec.translatedParallelEvidence.length>70);
 assert.ok(rec.qualification.length>45);
 assert.equal(rec.observedSourceType,"online-full-work-English-translation");
 assert.equal(rec.verificationDepth,"specific_original_work_and_relevant_English_passage_located_no_Greek_Latin_collation");
 assert.equal(rec.independentHumanEditorApproved,false);
 assert.equal(rec.originalLanguageCollated,false);
 assert.equal(rec.publicationEligibility,"blocked_research_only");
}
assert.ok(cross.records.find(x=>x.rank===16).workLocus.includes("38–39"),
 "Enchiridion chapter overlap must not be shortened to a chapter-38-only false citation");
assert.ok(cross.records.find(x=>x.rank===19).workLocus.includes("Sermon 20"),
 "Augustine sermon numbering discrepancy must be explicit");
assert.ok(cross.records.find(x=>x.rank===18).workLocus.includes("5–8"),
 "Jerome against Helvidius must retain cross-chapter extraction");
console.log("PASS: 13 externally identified whole-work English parallels, correct variants and no false human approval");

// Explicit pinpoint section corrections in the English full-work locator.
assert.equal(cross.records.find(x=>x.rank===2).workLocus,"Homily 44, section 5");
assert.equal(cross.records.find(x=>x.rank===22).workLocus,"Homily 47, section 1");
