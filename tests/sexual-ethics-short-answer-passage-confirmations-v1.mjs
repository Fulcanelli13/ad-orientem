import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTION_MAP,CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/index.js";
const old=JSON.parse(readFileSync("data/learn/sexual-ethics-95-short-answer-source-pass-20261009.v2.json","utf8"));
const doc=JSON.parse(readFileSync("data/learn/sexual-ethics-short-answer-passage-confirmations-20261009.v1.json","utf8"));
assert.equal(doc.summary.total_short_questions,95);
assert.equal(doc.summary.baseline_bounded,72);
assert.equal(doc.summary.new_bounded,2);
assert.equal(doc.summary.total_bounded,74);
assert.equal(doc.summary.still_pending,21);
assert.equal(doc.summary.fully_certified_questions,0);
assert.deepEqual(doc.records.map(x=>x.id),["CSE015","CSE144"]);
for(const x of doc.records){
 const original=old.records.find(r=>r.id===x.id);
 const question=CSE_QUESTION_MAP[x.id];
 assert.equal(original.bounded_source,null);
 assert.equal(original.source_status,"EXACT_ORIGINAL_PASSAGE_VERIFICATION_PENDING");
 assert.ok(question.refs.some(([id])=>id===x.primary_source_id));
 assert.equal(x.source_en,CSE_SOURCE_MAP[x.primary_source_id].canonical_url);
 assert.equal(x.original_english_section_examined,true);
 assert.equal(x.original_french_section_independently_collated,false);
 assert.equal(x.all_answer_claims_certified,false);
 assert.equal(x.human_theology_approved,false);
 assert.ok(x.finding_en.length>160&&x.finding_fr.length>160);
}
assert.ok(CSE_QUESTION_MAP.CSE144.refs.find(x=>x[0]==="VS")[1].includes("78–82"));
console.log("PASS 2 further bounded original text scopes; 74/95 short answers with one checked paragraph; 21 source checks pending; zero full certifications.");
