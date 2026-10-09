import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_DEBATE_MAP,CSE_DEBATE_IDS,CSE_DEBATE_FIELDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {CSE_HIGH_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-high24.js";
const review=JSON.parse(readFileSync("data/learn/sexual-ethics-catholic-side-original-context-11-20261009.v1.json","utf8"));
const high=JSON.parse(readFileSync("data/learn/sexual-ethics-stage-evidence-high24.v1.json","utf8"));
const frozen=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-attribution-55-20261009.v1.json","utf8"));
const cert=JSON.parse(readFileSync("data/learn/sexual-ethics-certification-evidence.v2.json","utf8"));
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(CSE_DEBATE_FIELDS.length,8);
assert.equal(review.cases.length,11);
assert.equal(review.summary.case_original_context_checks,11);
assert.equal(review.summary.not_covered_in_this_batch,44);
assert.equal(review.summary.all_eight_stage_original_text_certifications,0);
assert.equal(review.summary.independent_theological_approvals,0);
assert.equal(review.summary.independent_french_approvals,0);
assert.equal(review.summary.bilingual_corrections,2);
assert.equal(new Set(review.cases.map(r=>r.id)).size,11);
for(const row of review.cases){
 assert.ok(CSE_DEBATE_MAP[row.id],row.id+" not a canonical debate");
 assert.ok(row.boundary.length>70,row.id+" missing evidence caveat");
 assert.equal(row.all_eight_stages_certified,false);
 assert.equal(row.independent_theological_approval,false);
 assert.equal(row.independent_french_approval,false);
 for(const p of row.passages){
  assert.equal(CSE_SOURCE_MAP[p.source_id]?.canonical_url,p.original_url,p.source_id+" original locator drift");
  assert.ok(p.locator.length>=2&&p.claim_supported.length>30,p.source_id+" unbounded source claim");
  assert.ok(["ORIGINAL_PASSAGE_CONTEXT_CHECKED","ORIGINAL_ISSUER_SUMMARY_ONLY","BIBLIOGRAPHIC_RECORD_ONLY"].includes(p.verification));
 }
}
assert.match(CSE_DEBATE_MAP.CSE045.catholicCase[0],/§§19–25/);
assert.match(CSE_DEBATE_MAP.CSE045.catholicCase[1],/§§19–25/);
assert.match(CSE_DEBATE_MAP.CSE125.catholicCase[0],/USCCB Committee on Doctrine's 2010 statement/);
assert.match(CSE_DEBATE_MAP.CSE125.catholicCase[1],/Comité doctrinal des évêques américains de 2010/);
assert.ok(!CSE_DEBATE_MAP.CSE125.catholicCase[0].includes("CDF's 2009 clarification distinguishes"));
for(const field of ["breakpoint","catholicCase","response","bottom"]){
 const ids=CSE_HIGH_STAGE_SOURCE_IDS.CSE125[field];
 assert.ok(ids.includes("USCCB_DIRECT2010"),field+" missing USCCB distinction");
 assert.deepEqual(ids,high.cases.CSE125.stage_source_ids[field]);
 assert.deepEqual(ids,frozen.cases.find(c=>c.id==="CSE125").stage_source_ids[field]);
 assert.deepEqual(ids,cert.cases.find(c=>c.id==="CSE125").stages.find(s=>s.stage===field).selected_source_ids);
}
assert.equal(CSE_SOURCE_MAP.USCCB_DIRECT2010.authority_type,"EPISCOPAL_CONFERENCE_COMMITTEE_STATEMENT");
console.log("PASS 11 Catholic-side original-context audits; 2 bilingual reply corrections; 55 owners; synced source maps; 0 fabricated approvals");
