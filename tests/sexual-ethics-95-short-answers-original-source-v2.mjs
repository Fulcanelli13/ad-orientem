import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTIONS,CSE_QUESTION_MAP,CSE_SOURCE_MAP,CSE_PUBLIC_QUESTIONS} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_IDS} from "../src/learn/sexual-ethics-data/debates.js";
const data=JSON.parse(readFileSync("data/learn/sexual-ethics-95-short-answer-source-pass-20261009.v2.json","utf8"));
const debateIds=new Set(CSE_DEBATE_IDS),short=CSE_QUESTIONS.filter(q=>!debateIds.has(q.id));
assert.equal(data.version,"CSE_95_SHORT_ANSWERS_ORIGINAL_SOURCE_PASS_20261009_V2");
assert.equal(CSE_PUBLIC_QUESTIONS.length,147);
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(data.summary.short_answers,95);
assert.equal(data.summary.bounded_original_paragraph_checks,72);
assert.equal(data.summary.original_passage_checks_outstanding,23);
assert.equal(data.summary.fully_certified_questions,0);
assert.equal(data.summary.independent_approvals,0);
assert.equal(data.summary.original_sources_total,196);
assert.deepEqual(data.records.map(x=>x.id),short.map(x=>x.id));
let verified=0,pending=0,sourceCount=0;
for(const row of data.records){
 const q=CSE_QUESTION_MAP[row.id];assert.ok(q);
 assert.deepEqual([row.question_en,row.question_fr],q.q);
 assert.deepEqual(row.all_cited_sources.map(x=>[x.source_id,x.locator]),q.refs,row.id+" source list drift");
 assert.equal(row.english_answer_present,q.a[0].length>30);
 assert.equal(row.french_answer_present,q.a[1].length>30);
 assert.equal(row.detail_present,Boolean(q.d));
 assert.equal(row.question_premise_certified,false);
 assert.equal(row.entire_answer_claim_by_claim_certified,false);
 assert.equal(row.independent_theology_approved,false);
 assert.equal(row.independent_french_approved,false);
 for(const ref of row.all_cited_sources){
  const original=CSE_SOURCE_MAP[ref.source_id];assert.ok(original,row.id+" missing source "+ref.source_id);
  assert.equal(ref.original_full_text_url,original.canonical_url);
  assert.equal(ref.original_french_text_url,original.canonical_url_fr??null);
  sourceCount++;
 }
 if(row.bounded_source){
  verified++;assert.equal(row.source_status,"BOUNDED_ORIGINAL_PARAGRAPH_CHECKED");
  assert.ok(q.refs.some(x=>x[0]===row.bounded_source.source_id));
  assert.ok(row.bounded_source.claim_en.length>75&&row.bounded_source.claim_fr.length>75);
  assert.ok(row.bounded_source.locator.length>1);
 }else{
  pending++;assert.equal(row.source_status,"EXACT_ORIGINAL_PASSAGE_VERIFICATION_PENDING");
 }
}
assert.equal(verified,72);assert.equal(pending,23);assert.equal(sourceCount,196);
assert.ok(CSE_QUESTION_MAP.CSE027.refs.some(x=>x[0]==="ST154"&&x[1].includes("a.5")));
assert.match(CSE_QUESTION_MAP.CSE027.a[0],/involuntarily/);
assert.ok(data.records.find(x=>x.id==="CSE027").bounded_source.claim_en.includes("Nocturnal emission")||data.records.find(x=>x.id==="CSE027").bounded_source.claim_en.includes("nocturnal emission"));
assert.deepEqual(data.records.filter(x=>!x.bounded_source).map(x=>x.id),["CSE001","CSE011","CSE015","CSE077","CSE078","CSE079","CSE080","CSE100","CSE108","CSE113","CSE115","CSE118","CSE120","CSE126","CSE127","CSE128","CSE129","CSE130","CSE136","CSE137","CSE138","CSE144","CSE148"]);
console.log("PASS 95 questions: 72 original doctrinal paragraph scopes checked, 23 explicitly awaiting specific clinical/pastoral/analogical validation, 196 correct original-text links, zero overstated certification.");
