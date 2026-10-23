import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {selectCatenaPericopes} from "../src/scripture/catena-inline.js";
import {validateMarkBlindFixture,retrieveMarkBlindCase,validateMarkBlindCaseDecision,
 buildMarkBlindReviewExport,reconcileMarkBlindReviews,CATENA_MARK_BLIND_EXPORT_SCHEMA}
 from "../src/scripture/catena-mark-blind-review.js";
import {CATENA_MARK_RESEARCH_COMMIT} from "../src/scripture/catena-mark-editorial.js";
const json=path=>JSON.parse(readFileSync(path,"utf8"));
const data=json("data/scripture/catena/editorial-mark-blind-cases.v1.json");
const fixture=validateMarkBlindFixture(data);
const ai=json("data/scripture/catena/editorial-mark-ai-adjudication.v1.json");
assert.equal(data.sourceResearchCommit,CATENA_MARK_RESEARCH_COMMIT);
assert.equal(fixture.cases.length,23);
assert.ok(data.cases.every(x=>!JSON.stringify(x).includes("sourcePointer")&&
 !JSON.stringify(x).includes("contextualGrade")&&
 !JSON.stringify(x).includes("negativeExpected")&&
 !JSON.stringify(x).includes("sourceOrdinal")));
const expected=[...ai.rows.map(x=>x.editorialQuestion),...ai.negatives.map(x=>x.question)];
assert.deepEqual(new Set(data.cases.map(x=>x.question)),new Set(expected),
 "Blind sample is exactly ten source questions plus 13 adversarial probes, reordered");
const chapters=new Map(),first=new Map(),second=new Map();
let sourceMatches=0,empty=0,nonempty=0;
function sectionFor(c){
 const m=/^catena\.mark\.(\d+)\.(\d+)$/.exec(c.pericopeId);
 assert.ok(m);
 const chapter=Number(m[1]),from=1+4*Math.floor((chapter-1)/4);
 const filename="data/scripture/catena/chunks/mark-"+String(from).padStart(2,"0")+
  "-"+String(from+3).padStart(2,"0")+".json";
 if(!chapters.has(filename))chapters.set(filename,json(filename));
 const packet=chapters.get(filename);
 const match=packet.pericopes.find(x=>x.id===c.pericopeId);
 assert.ok(match);
 return selectCatenaPericopes([match],{book:"Mark",chapter,
  verseStart:Number(m[2]),verseEnd:Number(m[2])})[0];
}
let firstReturned=null;
for(const c of fixture.cases){
 const section=sectionFor(c);
 const retrieved=retrieveMarkBlindCase(c,section);
 assert.ok(retrieved.length<=4);
 for(const x of retrieved){
  const pos=Number(x.id.slice(x.id.lastIndexOf(":")+1));
  assert.equal(x.originalWords,section.segments[pos].text);
  assert.equal(x.father,section.segments[pos].father);
  assert.equal(x.sourceUrl,section.source.url);
  assert.equal(x.speakerUnits.map(y=>y.originalWords).join(""),x.originalWords);
  sourceMatches++;
 }
 if(retrieved.length){nonempty++;firstReturned ||= {c,retrieved}}
 else empty++;
 const messageGrades=retrieved.map(x=>({
  sourcePointer:x.id,grade:1,justification:"Synthetic test fixture: provenance was checked but theological relevance was not graded by a human.",
  supportingOriginalWords:"",
  sourceSHA256:createHash("sha256").update(x.originalWords,"utf8").digest("hex")
 }));
 const entry={caseId:c.id,abstentionGrade:retrieved.length?null:"uncertain",
  overallRationale:"Synthetic regression fixture, not an actual independent human editorial judgment.",
  messageGrades,publicationApproval:false};
 const valid=validateMarkBlindCaseDecision(fixture,c.id,retrieved,entry);
 first.set(c.id,valid);second.set(c.id,valid);
 if(retrieved.length){
  const missing={...entry,messageGrades:entry.messageGrades.slice(1)};
  assert.throws(()=>validateMarkBlindCaseDecision(fixture,c.id,retrieved,missing),
   /MESSAGES_INCOMPLETE/);
  assert.throws(()=>validateMarkBlindCaseDecision(fixture,c.id,retrieved,{
   ...entry,messageGrades:messageGrades.map((r,i)=>i? r:{...r,grade:3,supportingOriginalWords:"Made up evidence"}
  }),/MESSAGE_GRADE_INVALID/);
 }else assert.throws(()=>validateMarkBlindCaseDecision(fixture,c.id,retrieved,{
  ...entry,abstentionGrade:"approved"
 }),/ABSTENTION_GRADE_REQUIRED/);
}
assert.equal(first.size,23);assert.equal(second.size,23);
assert.ok(sourceMatches>=1&&empty>=1&&nonempty>=1);
assert.ok(firstReturned);
const expoA=buildMarkBlindReviewExport(fixture,"Editor Alpha — synthetic test",first);
const expoB=buildMarkBlindReviewExport(fixture,"Editor Beta — synthetic test",second);
assert.equal(expoA.schema,CATENA_MARK_BLIND_EXPORT_SCHEMA);
assert.equal(expoA.completedCases,23);
assert.equal(expoA.fullCanonicalExcerptsIncluded,false);
assert.equal(expoA.publicationApproval,false);
assert.equal(expoA.independentApprovalNotAuthenticated,true);
assert.equal(expoA.mayAutoPromoteToMessenger,false);
assert.ok(!JSON.stringify(expoA).includes("contextualGradeAIAssessment"));
assert.equal(reconcileMarkBlindReviews(fixture,expoA,expoB).disagreements.length,0);
assert.throws(()=>reconcileMarkBlindReviews(fixture,expoA,expoA),/SECOND_REVIEW_REQUIRED/);
const switched=new Map(second),sample=firstReturned;
const original=switched.get(sample.c.id);
const changed={...original,messageGrades:original.messageGrades.map((r,i)=>i===0?
 {...r,grade:0,justification:"Synthetic disagreement introduced only to test the two-reviewer reconciliation workflow."}:r)};
switched.set(sample.c.id,changed);
const expoC=buildMarkBlindReviewExport(fixture,"Editor Beta — synthetic test",switched);
assert.equal(reconcileMarkBlindReviews(fixture,expoA,expoC).disagreements.length,1);
const tampered={...data,cases:[{...data.cases[0],sourcePointer:"catena.mark.1.1:1"},...data.cases.slice(1)]};
assert.throws(()=>validateMarkBlindFixture(tampered),/CASE_INVALID/);
const malformed={...data,cases:data.cases.slice(1)};
assert.throws(()=>validateMarkBlindFixture(malformed),/FIXTURE_INVALID/);
const html=readFileSync("previews/living-catena-editorial-workbench-20261021.html","utf8");
assert.match(html,/data-filter="blind"/);
assert.match(html,/retrieveMarkBlindCase/);
assert.match(html,/validateMarkBlindCaseDecision/);
assert.match(html,/buildMarkBlindReviewExport/);
assert.match(html,/The original research target, AI grade, expected outcome and ranking scores are deliberately hidden/);
console.log("PASS Mark blind retrieval: 23 mixed cases; "+nonempty+" returned source, "+empty+
 " abstained; "+sourceMatches+" verbatim results; separate two-reviewer exports and blocked publication");
