import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const index=load("data/learn/research/pius-x-batch2-production-index-20261019.v1.json");
const initial=load("data/learn/research/pius-x-64-family-evidence-screen-20261019.v1.json");
const seeds=load("data/learn/research/pius-x-p0-p1-intent-evidence-bridge-20261019.v1.json");
const expansion=load("data/learn/research/pius-x-expansion-48-passage-review-20261019.v1.json");
const wave1=load("data/learn/research/pius-x-batch50-production-manifest-20261019.v1.json");
const oldParts=wave1.files.flatMap(path=>load(path).records);
const originInitial=new Map(initial.records.map(x=>[x.id,x]));
const originExpansion=new Map(expansion.records.map(x=>[x.id,x]));
const originSeed=new Map(seeds.provisional_mined_families.map(x=>[x.id,x]));
const priorIds=new Set(oldParts.map(x=>x.id));
assert.equal(index.schema,"AO_SPX_BATCH2_FIFTY_PRODUCTION_INDEX_V1");
assert.equal(index.status,"FIFTY_DRAFTS_PRODUCED_ZERO_CERTIFIED");
assert.deepEqual(index.counts.sourceTier,{
 DIRECT_PASSAGE_ANCHOR:29,BIOGRAPHY_FACTS_ONLY:9,PRIMARY_PARTIAL:8,PARTIAL_PASSAGE_ANCHOR:4
});
assert.deepEqual(index.files.length,6);
const parts=index.files.map(load);
assert.deepEqual(parts.map(x=>x.part),["A1","A2","A3","B1","B2","B3"]);
assert.deepEqual(parts.map(x=>x.records.length),[10,10,9,9,8,4]);
const content=new Map(parts.flatMap(x=>x.records.map(r=>[r.id,r])));
const seen=new Set();
let turns=0,answers=0,biography=0,scoped=0,direct=0;
for(const entry of index.entries){
 assert.equal(seen.has(entry.id),false,"Duplicate ID "+entry.id);
 seen.add(entry.id);
 assert.equal(priorIds.has(entry.id),false,"Copied Batch1 family "+entry.id);
 const record=content.get(entry.id);
 assert.ok(record,"Missing conversation "+entry.id);
 const part=parts.find(p=>p.part===entry.part);
 assert.ok(part.records.some(r=>r.id===entry.id));
 assert.equal(record.published,false);
 assert.equal(record.approved,false);
 assert.equal(entry.approval.historical,false);
 assert.equal(entry.approval.theological,false);
 assert.equal(entry.approval.translationEN,false);
 assert.equal(entry.approval.translationFR,false);
 assert.equal(entry.approval.voice,false);
 assert.equal(entry.approval.runtime,false);
 assert.equal(entry.editorial,"DRAFT_NOT_APPROVED");
 assert.equal(entry.speaker,record.speaker);
 assert.equal(entry.title.fr,record.opening.question.fr);
 assert.equal(entry.title.en,record.opening.question.en);
 assert.ok(/^https:\/\/(?:www\.vatican\.va|www\.museosanpiox\.it|www\.papapiox\.it)\//.test(entry.source.url),
  "Bad historical source host "+entry.id);
 assert.ok(entry.source.locus.trim().length>=3&&entry.source.studyProposition.length>32,entry.id+": missing exact research locus");
 if(entry.id.startsWith("SPX-EXP-")){
  const source=originExpansion.get(entry.id);
  assert.ok(source&&source.source_passage_found,entry.id);
  assert.equal(source.passage_support_screen,entry.sourceTier);
  assert.equal(source.verified_source_url,entry.source.url);
  assert.equal(source.section_or_question_locator,entry.source.locus);
 }else{
  const source=originInitial.get(entry.id),seed=originSeed.get(entry.id);
  assert.ok(source&&seed);
  assert.equal(source.evidence_tier,entry.sourceTier);
  assert.equal(seed.reported_source_anchor,entry.source.locus);
  assert.ok(entry.source.crossWitness?.classification);
 }
 if(entry.sourceTier==="DIRECT_PASSAGE_ANCHOR"){
  direct++;
  assert.equal(record.speaker,"SOURCE_BOUND_EDUCATIONAL_RECONSTRUCTION");
 }else if(entry.sourceTier==="BIOGRAPHY_FACTS_ONLY"){
  biography++;
  assert.equal(record.speaker,"THIRD_PERSON_DOCUMENTARY_NARRATOR_NOT_PIUS_X");
  assert.equal(record.firstPersonMemoryAllowed,false);
 }else{
  scoped++;
  assert.equal(record.speaker,"SOURCE_SCOPE_EDITORIAL_EXPLANATION_NOT_AUTHENTIC_PIUS_X_SPEECH");
  assert.ok(record.claimScope,"Restricted original source without scope hold "+entry.id);
 }
 assert.ok(record.opening.question.en.length>=20&&record.opening.question.fr.length>=20,entry.id+" incomplete opening question");
 assert.ok(record.opening.response.en.length>=95&&record.opening.response.fr.length>=95,entry.id+" incomplete opening response");
 assert.ok(record.followup.question.en.length>=18&&record.followup.question.fr.length>=18);
 assert.ok(record.followup.response.en.length>=90&&record.followup.response.fr.length>=90,entry.id+" incomplete followup");
 for(const lang of ["en","fr"]){
  assert.ok(!/[“”]/.test(record.opening.response[lang]+record.followup.response[lang]),"No unattributed original quoted lines");
 }
 if(record.speaker==="THIRD_PERSON_DOCUMENTARY_NARRATOR_NOT_PIUS_X"){
  assert.equal(/\b(I remember|I felt|I intended|my childhood|my mother)\b/i.test(
   record.opening.response.en+" "+record.followup.response.en),false,entry.id+": invented private memory");
 }
 turns+=2;answers+=4;
}
assert.equal(index.entries.length,50);
assert.equal(content.size,50);
assert.equal(direct,29);
assert.equal(biography,9);
assert.equal(scoped,12);
assert.equal(turns,100);
assert.equal(answers,200);
assert.equal(index.counts.families,50);
assert.equal(index.counts.turns,100);
assert.equal(index.counts.localisedDraftResponses,200);
assert.equal(index.counts.approvedHistorical,0);
assert.equal(index.counts.published,0);
assert.equal(index.counts.uniquenessCertified,0);
assert.equal(index.counts.sameIDasBatch1,0);
assert.equal(index.potentialOverlaps.length,10);
for(const overlap of index.potentialOverlaps){
 assert.ok(seen.has(overlap.id));
 assert.equal(overlap.approvedMerge,false);
 assert.equal(overlap.review,"SEMANTIC_DECISION_REQUIRED");
}
console.log("PASS Pius X batch2 "+JSON.stringify({families:content.size,turns,localizedResponses:answers,direct,biography,partial:scoped,
  sourceIdsMatched:50,priorIDReuse:0,certifiedUniqueIntents:0,published:0}));
