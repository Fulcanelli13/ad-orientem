import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTION_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {CSE_DEBATE_FIELDS,CSE_DEBATE_IDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_HIGH_STAGE_SOURCE_IDS,CSE_HIGH_STAGE_IDS,CSE_HIGH_STAGE_VERSION} from "../src/learn/sexual-ethics-data/stage-evidence-high24.js";
import {CSE_DEBATE_POSITION_REFS,paragraphRefsFor,validateParagraphRefs} from "../src/learn/sexual-ethics-data/provenance.js";

const pack=JSON.parse(readFileSync("data/learn/sexual-ethics-stage-evidence-high24.v1.json","utf8"));
const audit=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-source-audit.v1.json","utf8"));
assert.equal(CSE_HIGH_STAGE_VERSION,pack.version);
assert.deepEqual(CSE_HIGH_STAGE_IDS,Object.keys(pack.cases));
assert.equal(CSE_HIGH_STAGE_IDS.length,24);
assert.equal(CSE_DEBATE_FIELDS.length,8);
assert.equal(CSE_DEBATE_IDS.length,55);
let chains=0,references=0;
for(const id of CSE_HIGH_STAGE_IDS){
 const caseData=pack.cases[id],live=CSE_HIGH_STAGE_SOURCE_IDS[id];
 const question=CSE_QUESTION_MAP[id],auditCase=audit.cases.find(c=>c.id===id);
 assert.equal(question?.depth,"DEBATE",id+" not a debate");
 assert.equal(auditCase?.priority,"HIGH",id+" not high priority");
 assert.equal(auditCase?.stage_evidence_review?.version,pack.version,id+" not linked");
 assert.deepEqual(Object.keys(live),[...CSE_DEBATE_FIELDS],id+" stage order");
 assert.deepEqual(live,caseData.stage_source_ids,id+" generated/source drift");
 assert.ok(caseData.source_scope_caveat&&caseData.editorial_review_focus);
 assert.equal(caseData.stage_verification_status,"INTENTIONALLY_MATCHED_LOCATORS_EDITORIAL_PROOF_PENDING");
 const allOriginal=[...CSE_DEBATE_POSITION_REFS[id],...question.refs];
 for(const stage of CSE_DEBATE_FIELDS){
   const selected=live[stage];
   assert.ok(selected.length>0&&selected.length<=3,id+" "+stage+" too broad/empty");
   assert.equal(new Set(selected).size,selected.length,id+" "+stage+" duplicates");
   const rendered=paragraphRefsFor(question,"debate",stage);
   assert.deepEqual(rendered.map(x=>x[0]),selected,id+" "+stage+" resolved wrong source");
   assert.equal(validateParagraphRefs(question,rendered),true,id+" "+stage+" dead source");
   for(const [sourceId,locator] of rendered){
     assert.ok(allOriginal.some(x=>x[0]===sourceId&&x[1]===locator),id+" "+stage+" invented locator");
     assert.match(CSE_SOURCE_MAP[sourceId].canonical_url,/^https:\/\//);
     references++;
   }
   chains++;
 }
}
assert.equal(chains,192);
assert.equal(references,pack.stage_reference_count||282);
assert.equal(audit.summary.stage_specific_mapping_debates,55);
assert.equal(audit.summary.stage_specific_mapping_records,440);
assert.equal(audit.summary.stage_specific_mapping_references,609);
assert.equal(audit.summary.stage_full_text_certified,0);
assert.equal(audit.summary.stage_specific_mapping_pending,0);
const pending=CSE_DEBATE_IDS.filter(id=>!CSE_HIGH_STAGE_SOURCE_IDS[id]);
assert.equal(pending.length,31);
for(const id of pending){
 const item=CSE_QUESTION_MAP[id];
 assert.ok(paragraphRefsFor(item,"debate","opposition").length>0);
}
console.log("PASS high-priority Sexual Ethics: 192 stage-resolved chains and 282 intact original source locators; 31 additional debates are verified in separate stage-mapping test.");
