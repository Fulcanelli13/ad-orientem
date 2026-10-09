import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTIONS,CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_IDS,CSE_DEBATE_FIELDS,CSE_DEBATE_MAP} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_HIGH_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-high24.js";
import {CSE_REMAINING_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-remaining31.js";
const report=JSON.parse(readFileSync("data/learn/sexual-ethics-catholic-five-stage-primary17-20261009.v1.json","utf8"));
const stage={...CSE_HIGH_STAGE_SOURCE_IDS,...CSE_REMAINING_STAGE_SOURCE_IDS};
const five=["concession","breakpoint","catholicCase","response","bottom"];
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(CSE_DEBATE_FIELDS.length,8);
assert.equal(report.cases.length,17);
assert.equal(report.summary.cases,17);
assert.equal(report.summary.stages_considered,85);
assert.equal(report.summary.remaining_debates_not_in_this_batch,38);
assert.equal(report.summary.fully_original_passage_certified_eight_stage_debates,0);
assert.equal(report.summary.independent_theological_signoffs,0);
assert.equal(report.summary.independent_french_signoffs,0);
assert.equal(report.summary.bilingual_live_answer_revisions,3);
assert.equal(new Set(report.cases.map(x=>x.id)).size,17);
for(const entry of report.cases){
  assert.ok(CSE_DEBATE_IDS.includes(entry.id),entry.id+" not a canonical debate");
  assert.ok(entry.original_passage_locator.length>=3&&entry.source_scope_caveat.length>=60,entry.id+" unbounded source");
  assert.equal(CSE_SOURCE_MAP[entry.primary_original_source_id]?.canonical_url,entry.original_source_url,entry.id+" original document drift");
  assert.deepEqual(entry.stages.map(x=>x.stage),five,entry.id+" Catholic stages incomplete");
  assert.ok(five.some(k=>stage[entry.id][k].includes(entry.primary_original_source_id)),entry.id+" original source not used at any Catholic stage");
  assert.equal(entry.full_eight_stage_debate_certified,false);
  assert.equal(entry.independent_human_theological_signoff,false);
  assert.equal(entry.independent_native_french_signoff,false);
  for(const item of entry.stages){
    assert.ok(item.bounded_finding.length>39,entry.id+" "+item.stage+" insufficient claim context");
    assert.ok(["REASONED_APPLICATION","PRIMARY_NORM_SUPPORTED_WITH_QUALIFICATIONS","SYNTHESIS_NOT_QUOTATION"].includes(item.assessment),entry.id+" unexpected certification grade");
    assert.equal(item.full_original_passage_claim_certified,false);
  }
}
const get=(id,field,language)=>CSE_DEBATE_MAP[id][field][language];
assert.match(get("CSE016","response",0),/addresses theologians/);
assert.match(get("CSE016","response",1),/traite des théologiens/);
assert.match(get("CSE063","catholicCase",0),/rights themselves/);
assert.match(get("CSE063","catholicCase",1),/droits eux-mêmes/);
assert.match(get("CSE064","catholicCase",0),/could invalidate the marriage/);
assert.match(get("CSE064","catholicCase",1),/pouvait invalider le mariage/);
console.log("PASS 17 canonical Catholic-side original-passage dossiers, 85 stage limitations, 3 bilingual substantive refinements, zero fabricated theological approvals");
