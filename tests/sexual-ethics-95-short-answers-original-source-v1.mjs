import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTIONS,CSE_QUESTION_MAP,CSE_PUBLIC_QUESTIONS,CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_IDS} from "../src/learn/sexual-ethics-data/debates.js";
const doc=JSON.parse(readFileSync("data/learn/sexual-ethics-95-short-answer-source-pass-20261009.v1.json","utf8"));
const debates=new Set(CSE_DEBATE_IDS), actual=CSE_QUESTIONS.filter(x=>!debates.has(x.id));
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_PUBLIC_QUESTIONS.length,147);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(actual.length,95);
assert.equal(doc.summary.short_answers,95);
assert.equal(doc.summary.bounded_original_paragraph_checks,30);
assert.equal(doc.summary.original_passage_checks_outstanding,65);
assert.equal(doc.summary.fully_certified_questions,0);
assert.equal(doc.summary.independent_approvals,0);
assert.deepEqual(doc.records.map(x=>x.id),actual.map(x=>x.id));
let primary=0,pending=0,links=0,withDetail=0;
for(const r of doc.records){
 const q=CSE_QUESTION_MAP[r.id];assert.ok(q);
 assert.deepEqual([r.question_en,r.question_fr],q.q);
 assert.equal(r.english_answer_present,q.a[0].length>30);
 assert.equal(r.french_answer_present,q.a[1].length>30);
 assert.equal(r.detail_present,!!q.d);
 if(q.d)withDetail++;
 assert.deepEqual(r.all_cited_sources.map(x=>[x.source_id,x.locator]),q.refs,"sources mismatch "+r.id);
 for(const link of r.all_cited_sources){
  const entry=CSE_SOURCE_MAP[link.source_id];assert.ok(entry,r.id+" missing source "+link.source_id);
  assert.equal(link.original_full_text_url,entry.canonical_url);
  assert.equal(link.original_french_text_url,entry.canonical_url_fr??null);
  assert.match(link.original_full_text_url,/^https:\/\//);
  assert.ok(link.locator.length>1);
  links++;
 }
 assert.equal(r.question_premise_certified,false);
 assert.equal(r.entire_answer_claim_by_claim_certified,false);
 assert.equal(r.independent_theology_approved,false);
 assert.equal(r.independent_french_approved,false);
 if(r.source_status==="BOUNDED_ORIGINAL_PARAGRAPH_CHECKED"){
   primary++;assert.ok(r.bounded_source);
   assert.ok(q.refs.some(x=>x[0]===r.bounded_source.source_id));
   assert.ok(r.bounded_source.locator.length>1);
   assert.ok(r.bounded_source.claim_en.length>70&&r.bounded_source.claim_fr.length>70);
 }else{
   pending++;assert.equal(r.source_status,"EXACT_ORIGINAL_PASSAGE_VERIFICATION_PENDING");
   assert.equal(r.bounded_source,null);
 }
}
assert.equal(links,195);
assert.equal(primary,30);assert.equal(pending,65);
assert.equal(withDetail,20);
for(const id of ["CSE057","CSE144","CSE147","CSE148","CSE150"])assert.ok(!CSE_QUESTION_MAP[id].refs.some(x=>x[0]==="LBM"),"no book-catalogue primary proof "+id);
assert.ok(CSE_QUESTION_MAP.CSE119.refs.some(x=>x[0]==="CIC_PENANCE"));
assert.ok(CSE_QUESTION_MAP.CSE120.refs.some(x=>x[0]==="RAINN_CONSENT101"));
for(const id of ["CSE131","CSE133","CSE134","CSE135"])assert.ok(CSE_QUESTION_MAP[id].refs.some(x=>x[0]==="CIC_PENANCE"));
assert.ok(CSE_QUESTION_MAP.CSE139.refs.some(x=>x[0]==="CIC_EUCHARIST"));
for(const id of ["CSE131","CSE133"])assert.ok(CSE_QUESTION_MAP[id].refs.some(x=>x[0]==="CIC_PENANCE_MINISTER"));
assert.match(CSE_SOURCE_MAP.CIC_PENANCE.canonical_url_fr,/cann987-991_fr\.html$/);
assert.match(CSE_SOURCE_MAP.CIC_PENANCE_MINISTER.canonical_url_fr,/cann965-986_fr\.html$/);
assert.match(CSE_QUESTION_MAP.CSE139.a[0],/both a grave reason|a grave reason to receive and no opportunity|a grave reason AND no opportunity/i);
assert.match(CSE_QUESTION_MAP.CSE110.a[0],/prenatal adoption/);
assert.match(CSE_QUESTION_MAP.CSE097.a[0],/arising later/);
assert.match(CSE_QUESTION_MAP.CSE077.a[0],/AI-generated images/);
assert.match(CSE_QUESTION_MAP.CSE150.a[0],/celibacy/);
console.log("PASS 95 short answers: 195 live original-source URLs, 30 bounded original-paragraph checks, 65 pending full passage collation; 18 records repaired, five catalogue-only citations removed, zero false independent certifications.");
