import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_DEBATE_FIELDS,CSE_DEBATE_MAP} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_QUESTION_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";
const doc=JSON.parse(readFileSync("data/learn/sexual-ethics-highstakes-original-source-batch-20261009.v1.json","utf8"));
assert.equal(doc.summary.debates,7);
assert.equal(doc.summary.stages,56);
assert.equal(doc.summary.question_only,3);
assert.equal(doc.summary.fully_certified_debates,0);
assert.equal(doc.status,"BOUNDED_SOURCE_AUDIT_NOT_FULL_CERTIFICATION");
const expect=["CSE101","CSE104","CSE112","CSE117","CSE123","CSE124","CSE125"];
assert.deepEqual(doc.debates.map(c=>c.id),expect);
const results={};
for(const row of doc.debates){
 assert.equal(row.full_case_certified,false);
 assert.deepEqual(row.stages.map(x=>x.stage),[...CSE_DEBATE_FIELDS]);
 const question=CSE_QUESTION_MAP[row.id],debate=CSE_DEBATE_MAP[row.id];
 assert.ok(question&&debate);
 for(const stage of row.stages){
  assert.ok(stage.review_en.length>45&&stage.review_fr.length>45,row.id+"."+stage.stage+" missing real EN/FR assessment");
  assert.equal(stage.full_english_french_sentence_certified,false);
  assert.equal(stage.original_full_document_collated,false);
  assert.equal(stage.verbatim_opponent_quote_verified,false);
  assert.equal(stage.french_stage_scope_reworded,true);
  const actual=paragraphRefsFor(question,"debate",stage.stage).map(x=>x[0]);
  const historicalIds=stage.source_refs.map(s=>s.id);
  // This 9 October seven-case review remains a frozen original-passage
  // comparison. A later 2010 USCCB primary witness was attached to four
  // CSE125 stages, but is not retroactively certified by this older review.
  const laterUsccb=row.id==="CSE125"
    &&["breakpoint","catholicCase","response","bottom"].includes(stage.stage);
  assert.deepEqual(actual,laterUsccb?[...historicalIds,"USCCB_DIRECT2010"]:historicalIds,
    row.id+"."+stage.stage+" source map drift");
  for(const ref of stage.source_refs){assert.equal(ref.url,CSE_SOURCE_MAP[ref.id]?.canonical_url);assert.ok(ref.locator.length>8);}
  results[stage.status]=(results[stage.status]||0)+1;
 }
}
assert.deepEqual(results,doc.summary.status_counts);
assert.equal(Object.values(results).reduce((a,b)=>a+b,0),56);
assert.deepEqual(doc.question_only.map(x=>x.id),["CSE105","CSE109","CSE110"]);
for(const row of doc.question_only){
 assert.ok(CSE_QUESTION_MAP[row.id]);
 assert.equal(row.independent_french_approval,false);
 assert.ok(row.finding.length>70&&row.finding_fr.length>30);
 for(const src of row.original){assert.equal(src.url,CSE_SOURCE_MAP[src.id]?.canonical_url);assert.ok(src.locator.length>2);}
}
assert.match(CSE_QUESTION_MAP.CSE101.a[0],/hypothetical IVF procedure/);
assert.match(CSE_QUESTION_MAP.CSE104.a[0],/2023 ASRM Ethics Committee/);
assert.match(CSE_QUESTION_MAP.CSE110.a[0],/prenatal adoption/);
assert.match(CSE_QUESTION_MAP.CSE112.d[0],/do not yield a reliable prevalence estimate/);
assert.match(CSE_DEBATE_MAP.CSE104.catholicCase[0],/Donum Vitae II\.A\.3/);
console.log("PASS high-stakes CSE: 7 debates x 8 stages=56, 3 other original-passage question checks, EN/FR findings and source URLs intact, no false full certification.");
