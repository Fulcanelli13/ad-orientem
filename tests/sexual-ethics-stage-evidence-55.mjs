import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_DEBATE_FIELDS,CSE_DEBATE_IDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_QUESTION_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {CSE_DEBATE_POSITION_REFS,paragraphRefsFor,validateParagraphRefs,CSE_CONTEXT_ONLY_POSITION_IDS,CSE_MISCONCEPTION_REBUTTAL_IDS} from "../src/learn/sexual-ethics-data/provenance.js";
import {CSE_HIGH_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-high24.js";
import {CSE_REMAINING_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-remaining31.js";
const high=JSON.parse(readFileSync("data/learn/sexual-ethics-stage-evidence-high24.v1.json","utf8"));
const remaining=JSON.parse(readFileSync("data/learn/sexual-ethics-stage-evidence-remaining31.v1.json","utf8"));
const audit=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-source-audit.v1.json","utf8"));
const js={...CSE_HIGH_STAGE_SOURCE_IDS,...CSE_REMAINING_STAGE_SOURCE_IDS};
const raw={...high.cases,...remaining.cases};
assert.equal(Object.keys(CSE_HIGH_STAGE_SOURCE_IDS).length,24);
assert.equal(Object.keys(CSE_REMAINING_STAGE_SOURCE_IDS).length,31);
assert.deepEqual(Object.keys(raw).sort(),[...CSE_DEBATE_IDS].sort());
assert.deepEqual(Object.keys(js).sort(),[...CSE_DEBATE_IDS].sort());
assert.equal(audit.cases.length,55);
let stageCount=0,referenceCount=0;
for(const id of CSE_DEBATE_IDS){
 const question=CSE_QUESTION_MAP[id],x=raw[id],fields=js[id],auditCase=audit.cases.find(c=>c.id===id);
 assert.ok(question&&x&&auditCase?.stage_evidence_review,id+" missing");
 assert.equal(auditCase.stage_evidence_review.stage_count,8);
 assert.equal(x.stage_verification_status,"INTENTIONALLY_MATCHED_LOCATORS_EDITORIAL_PROOF_PENDING");
 assert.ok(x.source_scope_caveat);
 assert.deepEqual(Object.keys(fields),[...CSE_DEBATE_FIELDS],id+" source fields mismatch");
 assert.deepEqual(fields,x.stage_source_ids,id+" JS and JSON drift");
 for(const stage of CSE_DEBATE_FIELDS){
   const selected=fields[stage];
   assert.ok(selected.length>0&&selected.length<=3,id+"."+stage+" source selection too broad");
   assert.equal(new Set(selected).size,selected.length,id+"."+stage+" duplicate source");
   const rendered=paragraphRefsFor(question,"debate",stage);
   assert.deepEqual(rendered.map(x=>x[0]),selected,id+"."+stage+" reader did not use selected sources");
   assert.ok(validateParagraphRefs(question,rendered),id+"."+stage+" invalid citation");
   for(const [sourceId,locator] of rendered){
      assert.match(CSE_SOURCE_MAP[sourceId].canonical_url,/^https:\/\//);
      const original=[...question.refs,...CSE_DEBATE_POSITION_REFS[id]];
      assert.ok(original.some(([sid,loc])=>sid===sourceId&&loc===locator),id+"."+stage+" fabricated source locator");
      referenceCount++;
   }
   stageCount++;
 }
}
assert.equal(stageCount,440);
assert.equal(referenceCount,609);
assert.equal(audit.summary.stage_specific_mapping_debates,55);
assert.equal(audit.summary.stage_specific_mapping_records,440);
assert.equal(audit.summary.stage_specific_mapping_references,609);
assert.equal(audit.summary.stage_specific_mapping_pending,0);
assert.equal(audit.summary.stage_full_text_certified,0);
assert.equal(audit.summary.remaining_full_passage_review,55);
for(const id of ["CSE112","CSE117"])assert.ok(CSE_MISCONCEPTION_REBUTTAL_IDS.includes(id));
for(const id of ["CSE035","CSE038","CSE045","CSE141","CSE142","CSE143"])assert.ok(CSE_CONTEXT_ONLY_POSITION_IDS.includes(id));
const close=raw.CSE125.source_scope_caveat;
assert.match(close,/NOT a source for Catholic moral classifications/);
console.log("PASS Sexual Ethics 55/55 debate stage mappings: 440 distinct stage citation chains, 609 original source references, no invented locators, 0 claimed certified.");
