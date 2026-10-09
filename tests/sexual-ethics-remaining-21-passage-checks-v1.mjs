import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTION_MAP,CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/index.js";
const prior=JSON.parse(readFileSync("data/learn/sexual-ethics-95-short-answer-source-pass-20261009.v2.json","utf8"));
const two=JSON.parse(readFileSync("data/learn/sexual-ethics-short-answer-passage-confirmations-20261009.v1.json","utf8"));
const last=JSON.parse(readFileSync("data/learn/sexual-ethics-remaining-21-passage-checks-20261009.v1.json","utf8"));
assert.equal(prior.summary.bounded_original_paragraph_checks,72);
assert.equal(two.summary.total_bounded,74);
assert.equal(last.summary.new_bounded,21);
assert.equal(last.summary.checked_total,95);
assert.equal(last.summary.pending_bounded,0);
assert.equal(last.summary.fully_certified,0);
assert.equal(last.summary.independent_french_approved,0);
assert.equal(last.summary.independent_theology_approved,0);
assert.equal(last.records.length,21);
const unverified=prior.records.filter(q=>q.bounded_source===null).map(q=>q.id).sort();
const newly=[...two.records.map(q=>q.id),...last.records.map(q=>q.id)].sort();
assert.deepEqual(newly,unverified);
const base=prior.records.filter(q=>q.bounded_source!==null).map(q=>q.id);
assert.equal(new Set([...base,...newly]).size,95);
for(const q of last.records){
 const old=prior.records.find(x=>x.id===q.id);
 assert.equal(old.source_status,"EXACT_ORIGINAL_PASSAGE_VERIFICATION_PENDING");
 assert.ok(CSE_QUESTION_MAP[q.id],"missing live question "+q.id);
 assert.ok(CSE_SOURCE_MAP[q.source_id],"missing source "+q.source_id);
 assert.equal(q.original_url,CSE_SOURCE_MAP[q.source_id].canonical_url);
 assert.ok(CSE_QUESTION_MAP[q.id].refs.some(([id])=>id===q.source_id),"live source missing "+q.id);
 assert.ok(q.locator.length>3&&q.confirmed_scope_en.length>40&&q.limits_en.length>40);
 assert.equal(q.original_english_section_examined,true);
 for(const gate of ["all_answer_claims_certified","independent_french_collation","independent_theology_approval","independent_french_approval"])assert.equal(q[gate],false);
}
for(const id of ["CSE136","CSE137"]){
 const ref=CSE_QUESTION_MAP[id].refs.find(([source])=>source==="PIUSX");
 assert.ok(ref[1].includes("Q80")&&ref[1].includes("QQ4–5"),id);
}
assert.ok(CSE_QUESTION_MAP.CSE113.refs.some(([id])=>id==="ST151"));
assert.ok(CSE_QUESTION_MAP.CSE078.refs.some(([id])=>id==="PIUSX"));
assert.ok(!CSE_QUESTION_MAP.CSE078.refs.some(([id])=>id==="ST43"));
console.log("PASS: 95/95 short questions with bounded English source passages. Final theological and French certifications remain 0.");
