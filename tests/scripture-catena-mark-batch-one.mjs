import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const get=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const root="data/scripture/catena/research/full-corpus-pass-20261021/";
const ix=get(root+"mark-index.v1.json"),batch=get(root+"mark-batch-01-300-source-triage.v1.json");
const pack=get("data/scripture/catena/mark.json"),per=new Map(pack.pericopes.map(p=>[p.id,p]));
assert.equal(batch.schema,"ao.catena.mark-first300.v1");
assert.equal(batch.total,300);assert.equal(batch.rows.length,300);
assert.equal(batch.state,"research_only_no_semantic_approval");
const order=ix.reviewBatches300[0].rowIndexes;assert.equal(order.length,300);
const distinct=new Set(),flags={};
for(let n=0;n<300;n++){
const r=batch.rows[n],i=order[n],source=ix.rows[i],p=per.get(source[0]),s=p?.segments[source[1]];
assert.equal(r.batchRank,n+1);assert.equal(r.sourceIndex,i);
assert.ok(s,"missing segment");assert.equal(r.pointer,source[0]+":"+source[1]);
assert.equal(s.father,r.inheritedFatherLabel);assert.equal(s.text.length,r.sourceLength);
assert.deepEqual(r.scriptureKeys,p.verse_keys);assert.deepEqual(r.flags,source[4]);
assert.equal(r.questionWindows.length,source[6]);
for(const q of r.questionWindows){assert.equal(s.text[q.offset],"?");assert.ok(q.anchor.length>0);}
assert.equal(r.answerSource,"canonical_Catena_original_pointer_only");
assert.equal(r.contextReview,"not_individually_semantically_reviewed");assert.equal(r.publication,"blocked");
assert.ok(!distinct.has(r.pointer));distinct.add(r.pointer);
flags[r.voiceSignal]=(flags[r.voiceSignal]||0)+1;
}
assert.equal(distinct.size,300);assert.deepEqual(flags,batch.voiceCounts);
assert.deepEqual(batch.voiceCounts,{possible_exegetical_question:14,question_owner_unresolved:143,noninterrogative_context_check:143});

const spot=get(root+"mark-batch-01-contextual-spotchecks.v1.json");
assert.equal(spot.schema,"ao.catena.mark-batch-one-context-spotchecks.v1");
assert.equal(spot.recordCount,10);assert.equal(spot.records.length,10);
assert.equal(spot.full300SemanticReviewComplete,false);
const batchPointers=new Set(batch.rows.map(r=>r.pointer));
for(const r of spot.records){
 assert.ok(batchPointers.has(r.pointer));
 assert.equal(r.canonicalAnswerReference,r.pointer);
 assert.equal(r.translationOrFatherSpeechGenerated,false);
 assert.equal(r.originalHistoricalWorkIndependentCheck,false);
 assert.equal(r.humanEditorialApproval,false);
 assert.equal(r.publishStatus,"blocked");
 assert.equal(r.reviewType,"AI_assisted_original_Catena_excerpt_inspection");
 assert.ok(r.modernEditorialReaderQuestion.endsWith("?"));
}

console.log("PASS Mark first 300: source parity, complete batch, 157 interrogative excerpts, zero approved dialogue");
