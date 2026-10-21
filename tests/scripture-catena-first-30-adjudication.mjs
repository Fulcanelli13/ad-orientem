import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root="data/scripture/catena/research/full-corpus-pass-20261021/";
const read=n=>JSON.parse(readFileSync(root+n,"utf8"));
const data=read("matthew-first-30-source-context-adjudication.v1.json");
const catalogue=read("matthew-reader-catalogue.v1.json");
const reviewed=new Map(catalogue.records.map(x=>[x.sourcePointer,x]));
assert.equal(data.schema,"ao.catena.matthew-first-30-AI-context-adjudication.v1");
assert.equal(data.records.length,30);assert.equal(data.totals.independentHumanApprovals,0);
const packs=["matthew-01-04.json","matthew-09-12.json","matthew-13-16.json","matthew-25-28.json"].flatMap(f=>
 JSON.parse(readFileSync("data/scripture/catena/chunks/"+f,"utf8")).pericopes);
const source=new Map(packs.map(p=>[p.id,p]));
const seen=new Set();
for(const r of data.records){
 assert.ok(!seen.has(r.sourcePointer));seen.add(r.sourcePointer);
 const previous=reviewed.get(r.sourcePointer);
 assert.ok(previous&&previous.editorialQuestions.includes(r.originalEditorialQuestion));
 const [id,ordinal]=r.sourcePointer.split(":");
 const pericope=source.get(id),fragment=pericope?.segments?.[Number(ordinal)];
 assert.ok(fragment,"Missing source fragment "+r.sourcePointer);
 assert.equal(r.catenaCitation,pericope.citation);
 assert.equal(r.inheritedFatherLabel,fragment.father);
 assert.equal(r.unchangedSourceCharacters,fragment.text.length);
 assert.ok(fragment.text.includes(r.sourceEvidencePhrase),"Evidence must be literally present in the unchanged source text");
 assert.ok(r.sourceEvidencePhrase.length>=12&&r.sourceEvidencePhrase.length<=100);
 assert.ok(r.conservativeReviewNote.length>=45);
 assert.equal(r.questionHistoricallyByFather,false);
 assert.equal(r.humanApproved,false);assert.equal(r.publishingEligibility,"blocked_research_only");
 assert.ok(!Object.hasOwn(r,"fatherAnswer"));
 for(const p of r.relatedContextPointers){
  const [related,ix]=p.split(":");
  assert.ok(source.get(related)?.segments?.[Number(ix)],"Invalid source context dependency "+p);
 }
}
assert.equal(seen.size,30);
assert.equal(data.totals.assessments.context_dependency,3);
assert.equal(data.totals.assessments.question_revision_needed,1);
assert.equal(data.totals.assessments.source_work_or_doctrine_check,3);
assert.equal(data.totals.assessments.historical_claim_disclosure,1);
console.log("PASS 30 fully source-linked AI-context assessments, exact source evidence and no human approval or generated Father replies");
