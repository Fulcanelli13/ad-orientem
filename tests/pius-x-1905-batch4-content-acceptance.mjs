import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const base="data/learn/research/";
const m=load(base+"pius-x-batch4-1905-production-manifest-20261019.v1.json");
const parts=m.files.map(load);
const records=parts.flatMap(x=>x.records);
const prev1=load(base+"pius-x-batch50-production-manifest-20261019.v1.json");
const prev2=load(base+"pius-x-batch2-production-index-20261019.v1.json");
const prev3=load(base+"pius-x-batch3-1905-production-manifest-20261019.v1.json");
const pilot=load(base+"pius-x-ten-conversation-content-pilot-20261019.v1.json");
const previous=new Set([
 ...prev1.files.flatMap(x=>load(x).records.map(r=>r.id)),
 ...prev2.entries.map(x=>x.id),
 ...prev3.items.map(x=>x.id),
 ...pilot.episodes.map(x=>x.id)
]);
const canonicalUrl="https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/parte-terza-dei-comandamenti-di-dio-e-della-chiesa/";
assert.equal(m.schema,"AO_SPX_1905_LONG_CATECHISM_BATCH4_PRODUCTION_V1");
assert.equal(m.status,"FIFTY_BILINGUAL_DOCUMENTARY_DRAFTS_NOT_CERTIFIED");
assert.deepEqual(parts.map(x=>x.part),["A","B","C","D","E"]);
assert.deepEqual(parts.map(x=>x.records.length),[10,10,10,10,10]);
assert.equal(m.items.length,50);
const indexed=new Map(m.items.map(x=>[x.id,x]));
const ids=new Set(),qnos=new Set();
let turns=0,responses=0;
for(const row of records){
 assert.ok(!ids.has(row.id),"Duplicate Batch4 ID "+row.id);
 ids.add(row.id);
 assert.equal(previous.has(row.id),false,"Reused earlier family "+row.id);
 const q=Number(row.id.split("-").at(-1));
 assert.ok(q>=342&&q<=516,row.id+" outside 1905 Commandments");
 assert.equal(row.source.questionId,"PX1905-Q"+q);
 assert.ok(!qnos.has(q),"Repeated original question as opening source "+q);
 qnos.add(q);
 const follow=Number(row.source.companionQuestionId.split("-").at(-1).replace("Q",""));
 assert.ok(follow>=342&&follow<=516,row.id+" companion out of section");
 assert.equal(row.source.url,canonicalUrl);
 assert.equal(row.source.edition,"1905_LONG_CATECHISM");
 assert.equal(row.source.sourceClass,"PAPALLY_PRESCRIBED_CATECHISM_NOT_AUTHENTIC_PERSONAL_PAPAL_SPEECH");
 assert.equal(row.source.textWitness,"MUSEO_SAN_PIO_X_DIGITAL_ITALIAN_NOT_PRINT_FACSIMILE");
 assert.equal(row.speaker,"EDUCATIONAL_DOCUMENTARY_PARAPHRASE");
 assert.deepEqual(row.release,{sourceSentenceVerified:false,theologyApproved:false,translationApproved:false,voiceApproved:false,production:false});
 const item=indexed.get(row.id);
 assert.ok(item,"Missing manifest for "+row.id);
 assert.equal(item.sourceUrl,canonicalUrl);
 assert.equal(item.questionId,row.source.questionId);
 assert.equal(item.companionQuestionId,row.source.companionQuestionId);
 assert.deepEqual(item.release,row.release);
 assert.equal(row.turns.length,2);
 assert.deepEqual(row.turns.map(x=>x.kind),["opening","followup"]);
 assert.deepEqual(row.turns.map(x=>x.supports),[[row.source.questionId],[row.source.companionQuestionId]]);
 assert.deepEqual(item.topic,row.turns[0].question);
 for(const t of row.turns){
  turns++;
  for(const lang of ["en","fr"]){
   responses++;
   assert.ok(t.question[lang]?.length>=20,row.id+" "+lang+" question missing");
   assert.ok(t.response[lang]?.length>=80,row.id+" "+lang+" substantive answer missing");
   assert.doesNotMatch(t.response[lang],/[“”]/,row.id+" potential fictitious quote");
  }
 }
}
assert.equal(ids.size,50);
assert.equal(qnos.size,50);
assert.equal(turns,100);
assert.equal(responses,200);
assert.equal(m.counts.families,50);
assert.equal(m.counts.turns,100);
assert.equal(m.counts.localizedDraftAnswers,200);
assert.equal(m.counts.distinct1905OpeningQuestionAnchors,50);
assert.equal(m.counts.independentlyApproved,0);
assert.equal(m.counts.certifiedDistinctIntents,0);
assert.equal(m.counts.publicRuntimeAnswers,0);
assert.equal(m.withinBatchRelatedPairs.length,27);
assert.equal(m.earlierWaveRelations.length,16);
for(const p of m.withinBatchRelatedPairs){
 assert.ok(p.ids.length===2&&p.ids.every(id=>ids.has(id)));
 assert.equal(p.approvedMerge,false);
}
for(const p of m.earlierWaveRelations){
 assert.ok(ids.has(p.batchId),p.batchId+" unknown batch record");
 assert.ok(previous.has(p.previousId),p.previousId+" falsely cited as earlier produced");
 assert.equal(p.merged,false);
 assert.equal(p.notConfirmedUnique,true);
}
console.log("PASS SPX_1905_BATCH4 "+JSON.stringify({families:ids.size,turns,localizedDraftAnswers:responses,distinctQuestionAnchors:qnos.size,priorIDReuse:0,potentialWithinBatchRelations:27,earlierDraftRelations:16,independentlyApproved:0,publicRuntime:0}));
