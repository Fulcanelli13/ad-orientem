import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const path="data/learn/research/";
const manifest=load(path+"pius-x-batch3-1905-production-manifest-20261019.v1.json");
const parts=manifest.files.map(load),rows=parts.flatMap(x=>x.records);
const batch1=load(path+"pius-x-batch50-production-manifest-20261019.v1.json");
const old1=new Set(batch1.files.flatMap(x=>load(x).records.map(r=>r.id)));
const batch2=load(path+"pius-x-batch2-production-index-20261019.v1.json");
const old2=new Set(batch2.entries.map(x=>x.id));
const pilot=load(path+"pius-x-ten-conversation-content-pilot-20261019.v1.json");
const oldPilot=new Set(pilot.episodes.map(x=>x.id));
const research=load(path+"pius-x-p0-p1-intent-evidence-bridge-20261019.v1.json");
const unproducedIdeas=new Set(research.provisional_mined_families.map(x=>x.id));
const url="https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/parte-seconda-dellorazione/";
assert.equal(manifest.schema,"AO_SPX_1905_LONG_CATECHISM_BATCH3_PRODUCTION_V1");
assert.equal(manifest.status,"FIFTY_DRAFT_FAMILIES_NO_INDEPENDENT_APPROVAL");
assert.equal(manifest.sourceWitness.qMin,253);
assert.equal(manifest.sourceWitness.qMax,341);
assert.match(manifest.sourceWitness.historicalAttribution,/NOT_ALL_PAPAL_AUTOGRAPH/);
assert.deepEqual(parts.map(x=>x.part),["A","B","C","D","E"]);
assert.deepEqual(parts.map(x=>x.records.length),[10,10,10,10,10]);
assert.equal(rows.length,50);
assert.equal(manifest.items.length,50);
const index=new Map(manifest.items.map(x=>[x.id,x]));
const ids=new Set(),questions=new Set(),totals={family:0,turns:0,localizedResponses:0};
for(const r of rows){
 totals.family++;
 assert.equal(ids.has(r.id),false,"Duplicate family "+r.id);
 ids.add(r.id);
 assert.equal(old1.has(r.id)||old2.has(r.id)||oldPilot.has(r.id),false,"Prior batch/pilot ID reused "+r.id);
 const q=r.source.qNumber,secondary=Number(r.source.companionQ.slice(-3));
 assert.equal(r.id,"SPX-1905-P-"+q);
 assert.equal(r.source.qId,"PX1905-Q"+q);
 assert.ok(q>=253&&q<=341,"Main source outside verified prayer range "+q);
 assert.ok(secondary>=253&&secondary<=341,"Companion source outside verified prayer range "+secondary);
 assert.equal(questions.has(q),false,"Same 1905 Q reused as main source "+q);
 questions.add(q);
 assert.equal(r.source.url,url);
 assert.equal(r.source.edition,"1905_LONGER_CATECHISM_PAPALLY_PRESCRIBED");
 assert.equal(r.source.witness,"MUSEO_SAN_PIO_X_DIGITAL_TRANSCRIPTION_NOT_PRINT_FACSIMILE");
 assert.equal(r.speaker,"EDUCATIONAL_CATECHISM_PARAPHRASE_NOT_QUOTATION");
 assert.deepEqual(r.approval,{originalText:false,theology:false,translations:false,voice:false,runtime:false});
 assert.equal(r.turns.length,2);
 assert.deepEqual(r.turns.map(x=>x.kind),["opening","followup"]);
 assert.deepEqual(r.turns.map(x=>x.supports),[[q],[secondary]]);
 const record=index.get(r.id);
 assert.ok(record,"No canonical manifest "+r.id);
 assert.equal(record.anchor,r.source.qId);
 assert.equal(record.companionAnchor,r.source.companionQ);
 assert.deepEqual(record.titles,{en:r.turns[0].question.en,fr:r.turns[0].question.fr});
 assert.equal(record.sourceUrl,url);
 assert.equal(record.editorial,"PENDING_SOURCE_SENTENCE_LANGUAGE_VOICE_REVIEW");
 assert.deepEqual(Object.values(record.approvals),[false,false,false,false,false]);
 for(const t of r.turns){
  totals.turns++;
  for(const lang of ["en","fr"]){
   totals.localizedResponses++;
   assert.ok(t.question[lang]?.length>=20,r.id+"/"+t.kind+"/"+lang+" incomplete question");
   assert.ok(t.response[lang]?.length>=70,r.id+"/"+t.kind+"/"+lang+" incomplete answer");
   assert.doesNotMatch(t.response[lang],/[“”]/,r.id+" improperly presented source quotation");
  }
 }
}
assert.deepEqual(totals,{family:50,turns:100,localizedResponses:200});
assert.equal(manifest.counts.families,50);
assert.equal(manifest.counts.turns,100);
assert.equal(manifest.counts.localisedResponses,200);
assert.equal(manifest.counts.distinctLong1905QuestionAnchors,50);
assert.equal(manifest.counts.approvals,0);
assert.equal(manifest.counts.published,0);
assert.equal(manifest.counts.certifiedDistinctIntents,0);
assert.equal(manifest.possibleOverlapsWithinBatch.length,23);
assert.equal(manifest.possibleOverlapsWithPriorBatchesOrResearch.length,10);
assert.equal(manifest.counts.priorWavePotentialOverlapRefs,8);
assert.equal(manifest.counts.existingResearchSeedOverlapRefs,2);
for(const o of manifest.possibleOverlapsWithinBatch){
 assert.ok(o.ids.length===2&&o.ids.every(id=>ids.has(id)));
 assert.equal(o.duplicateConfirmed,false);
}
for(const o of manifest.possibleOverlapsWithPriorBatchesOrResearch){
 assert.ok(ids.has(o.newId));
 const produced=old1.has(o.previousId)||old2.has(o.previousId)||oldPilot.has(o.previousId);
 const researchOnly=unproducedIdeas.has(o.previousId)&&!produced;
 assert.ok(produced||researchOnly,"Unresolved overlap referent "+o.previousId);
 assert.equal(o.previousScope,produced?"PRIOR_BATCH_OR_PILOT_DRAFT":"SOURCE_RESEARCH_SEED_NOT_DRAFTED");
 assert.equal(o.status,"POTENTIAL_OVERLAP_NOT_CONFIRMED");
}
console.log("PASS SPX_1905_BATCH3 "+JSON.stringify({...totals,newExactLongCatechismAnchorIds:questions.size,sourceWitness:"1905_MUSEUM_PRAYER_253_341",overlapCandidates:33,certified:0,publicRuntime:0}));
