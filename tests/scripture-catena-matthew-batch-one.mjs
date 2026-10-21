/*
 * Living Catena: batch one question-speaker and answer-evidence parity.
 * All 300 remain research-only triage; 26 are AI-assisted source spot reviews,
 * NOT independently human-approved Messenger responses.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const base="data/scripture/catena/research/full-corpus-pass-20261021/";
const index=read(base+"matthew-index.v1.json");
const batch=read(base+"matthew-batch-01-300-question-triage.v1.json");
const examples=read(base+"matthew-batch-01-curated-spot-review.v1.json");
const pack=read("data/scripture/catena/matthew.json");
const pericopes=new Map(pack.pericopes.map(p=>[p.id,p]));
assert.equal(batch.schema,"ao.catena.batch300-question-voice-triage.v1");
assert.equal(batch.status,"research_only_machine_triage__not_300_semantically_verified");
assert.equal(batch.rows.length,300);
assert.equal(batch.count,300);
const first=index.reviewBatches300[0].rowIndexes;
assert.equal(first.length,300);
let totals={};
for(let rank=0;rank<300;rank++){
  const r=batch.rows[rank],idx=first[rank],indexRow=index.rows[idx];
  assert.equal(r.reviewRank,rank+1);
  assert.equal(r.sourceIndex,idx);
  const [id,ordinal,label,topics,flags,size,questions]=indexRow;
  const s=pericopes.get(id)?.segments[ordinal];
  assert.ok(s,"missing canonical segment");
  assert.equal(r.sourcePointer,id+":"+ordinal);
  assert.equal(r.inheritedFatherLabel,label);
  assert.equal(r.sourceCitation,pericopes.get(id).citation);
  assert.deepEqual(r.scriptureKeys,pericopes.get(id).verse_keys);
  assert.deepEqual(r.lexicalTopics,topics);
  assert.equal(r.originalQuestionMarkCount,questions);
  assert.equal(s.father,label);
  assert.equal(s.text.length,size);
  assert.equal(flags.includes("Q"),true);
  assert.equal(r.questionWindows.length,questions);
  for(const q of r.questionWindows){
    assert.equal(s.text[q.offset],"?");
    assert.ok(q.contextAnchor.length>0&&q.contextAnchor.length<=215);
  }
  assert.equal(r.semanticReview,"pending_except_where_separately_curated");
  assert.equal(r.answerMapping,"not_asserted_by_machine");
  assert.equal(r.publishEligibility,"blocked_until_individual_context_and_attribution_review");
  const v=r.initialVoiceTriage.voice;
  totals[v]=(totals[v]||0)+1;
}
assert.deepEqual(totals,batch.triageCounts);
assert.equal(examples.schema,"ao.catena.matthew-first-300-curated-spot-review.v1");
assert.equal(examples.status,"research_only__AI_assisted_contextual_spot_review__human_approval_pending");
assert.match(examples.reviewProvenance,/no independent human second-reader/i);
assert.equal(examples.reviewedCount,26);
assert.equal(examples.records.length,26);
assert.equal(examples.coveredByFullBatch,300);
const all=new Map(batch.rows.map(r=>[r.sourcePointer,r]));
let supported=0,partial=0;
for(const r of examples.records){
  const candidate=all.get(r.pointer);
  assert.ok(candidate,"curated source not in the 300-excerpt queue");
  assert.equal(r.batchRank,candidate.reviewRank);
  assert.equal(r.inheritedFatherLabel,candidate.inheritedFatherLabel);
  assert.equal(r.readerQuestionVoice,"modern_editorial_navigation_not_historical_quotation");
  assert.equal(r.answerEvidencePointer,r.pointer);
  assert.equal(r.authoredAnswerTextCopied,false);
  assert.ok(r.readerQuestion.endsWith("?"));
  assert.ok(r.editorialRisks.length>12);
  assert.equal(r.status,"AI_assisted_source_and_meaning_spot_review__HUMAN_APPROVAL_PENDING");
  if(r.answerCoverageInThisExcerpt==="supported_in_same_excerpt")supported++;
  else if(r.answerCoverageInThisExcerpt==="incomplete_fragment_context")partial++;
  else assert.fail("unrecognized context status");
  if(/^Pseudo-/.test(r.inheritedFatherLabel))assert.match(r.editorialRisks,/pseudo|Pseud/i);
}
assert.equal(supported,24);
assert.equal(partial,2);
assert.equal(examples.contrastOrComplementGroups.length,4);
for(const grp of examples.contrastOrComplementGroups){
  assert.ok(grp.readerQuestion.endsWith("?"));
  assert.ok(grp.relationship.length>40);
  for(const ptr of grp.links)assert.ok(all.has(ptr),"cross-reference not in first 300");
}
const counter=examples.records.find(r=>r.pointer==="catena.matthew.25.46:8");
assert.equal(counter.historicalQuestionVoice,"reported_objection_not_gregory_speech");
const magi=examples.records.find(r=>r.pointer==="catena.matthew.2.1:39");
assert.match(magi.editorialRisks,/conditional/);
const one=examples.records.find(r=>r.pointer==="catena.matthew.1.18:3");
assert.match(one.editorialRisks,/Ignatius/);
console.log("PASS: 300/300 source-pointer question triages + 26 AI-assisted context spot-reviews (24 same-excerpt supports, 2 incomplete), 4 comparison leads; no invented Father replies");
