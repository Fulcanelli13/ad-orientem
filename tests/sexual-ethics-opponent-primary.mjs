import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_SOURCE_MAP,CSE_SOURCES} from "../src/learn/sexual-ethics-data/sources.js";
import {CSE_DEBATE_POSITION_REFS,CSE_POSITION_SOURCE_IDS,paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";
import {CSE_HIGH_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-high24.js";
import {CSE_REMAINING_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-remaining31.js";
import {CSE_QUESTION_MAP} from "../src/learn/sexual-ethics-data/index.js";

const audit=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-source-audit.v1.json","utf8"));
const preview=readFileSync("src/learn/sexual-ethics.js","utf8");
const directIds=["CURRAN1987","FARLEY_QUOTED2012","FARLEY_RESPONSE2012","CURRAN_CDF1986","ACOG_ECTOPIC","ACOG_ECTOPIC_GUIDELINE","MILL_IV_FULL"];
assert.equal(new Set(CSE_SOURCES.map(s=>s.id)).size,CSE_SOURCES.length);
// The canonical source registry now includes eight later source-recovery records.
assert.equal(CSE_SOURCES.length,97);
for(const id of directIds){assert.match(CSE_SOURCE_MAP[id].canonical_url,/^https:\/\//);assert.ok(CSE_SOURCE_MAP[id].title);}
assert.equal(audit.summary.records,55);
assert.equal(audit.cases.length,55);
assert.deepEqual(audit.cases.map(c=>c.id),[...CSE_POSITION_SOURCE_IDS]);
assert.equal(audit.summary.selected_primary_position_checks,51);
assert.equal(audit.summary.book_catalog_preview_cases,31);
assert.equal(audit.summary.book_cases_with_new_original_support,13);
assert.equal(audit.summary.precisely_excerped_opponent_positions,6);
assert.equal(audit.summary.remaining_full_passage_review,55);
assert.equal(audit.summary.new_batch_scoped_checks,12);
assert.equal(audit.summary.misconception_evidence_misattribution_corrections,2);
const enhanced=audit.cases.filter(c=>c.new_primary_evidence);
assert.equal(enhanced.length,16);
for(const record of audit.cases){
 const live=CSE_DEBATE_POSITION_REFS[record.id];
 assert.equal(live.length,record.opponent_provenance.length);
 assert.deepEqual(record.opponent_provenance.map(x=>[x.source_id,x.locator]),live.map(x=>[...x]));
 for(const item of record.opponent_provenance){
   assert.equal(item.url,CSE_SOURCE_MAP[item.source_id].canonical_url,"source registry drift "+record.id);
   assert.ok(item.locator);
 }
 for(const stage of ["opposition","appeal","counter"]){
   const chosen=CSE_HIGH_STAGE_SOURCE_IDS[record.id]?.[stage]||CSE_REMAINING_STAGE_SOURCE_IDS[record.id]?.[stage];
   const expected=chosen
     ?chosen.map(id=>new Map([...CSE_QUESTION_MAP[record.id].refs,...live].map(ref=>[ref[0],ref])).get(id))
     :[...live];
   assert.deepEqual(paragraphRefsFor(CSE_QUESTION_MAP[record.id],"debate",stage),expected);
 }
 if(record.new_primary_evidence){
   assert.ok(record.new_primary_evidence.scope);
   for(const id of record.new_primary_evidence.source_ids){
     assert.ok(directIds.includes(id),"new evidence not from a verified primary document "+id);
     assert.ok(live.some(([sourceId])=>sourceId===id));
   }
 }
}
const item=audit.cases.find(c=>c.id==="CSE125");
assert.equal(item.new_primary_evidence.grade,"CLINICAL_DIRECT_NOT_MORAL");
assert.match(item.new_primary_evidence.scope,/NOT adjudicate Catholic moral/);
for(const id of ["CSE043","CSE049","CSE050","CSE071","CSE083","CSE089"]){
 assert.equal(audit.cases.find(c=>c.id===id).new_primary_evidence.grade,"DOCUMENTED_AUTHOR_EXCERPT");
}
assert.match(preview,/The opposing position is a sourced reconstruction, not a verbatim quotation/);
assert.match(preview,/La position adverse est une reformulation sourcée/);
assert.match(preview,/Opposing-position references:/);
assert.match(preview,/Références de la position adverse/);
for(const id of ["CSE112","CSE117"]){
 const c=audit.cases.find(x=>x.id===id);
 assert.equal(c.verification_batch_3.grade,"EXPLICIT_REBUTTAL_NOT_OPPOSING_AUTHOR");
 assert.ok(c.opponent_provenance.some(x=>x.source_type==="REBUTTAL_EVIDENCE_NOT_OPPONENT"));
}
assert.match(preview,/Evidence rebutting this misconception \(not proponents\)/);
assert.match(preview,/Preuves réfutant cette idée fausse/);
for(const id of ["CSE008","CSE010","CSE038","CSE145"])assert.equal(audit.cases.find(x=>x.id===id).verified_primary_source_ids.length,0,"non-primary case cannot be marked first-hand: "+id);
assert.equal(audit.summary.batch_4_scope_reviewed,11);
assert.equal(audit.summary.source_scope_coverage,55);
assert.equal(audit.summary.batch_4_new_primary_evidence,7);
assert.equal(audit.summary.unverified_literally_attributed_debate_stages,55);
assert.deepEqual(audit.summary.remaining_without_any_checked_primary,["CSE008","CSE010","CSE038","CSE145"]);
assert.match(preview,/Contextual evidence \(not an attributed proponent\)/);
assert.match(preview,/Sources de contexte \(sans attribution à un défenseur précis\)/);
assert.match(preview,/Illustrative objection: the linked sources document context or criticism/);
console.log("PASS Sexual Ethics scope: 55/55 cases reviewed, 51 with some primary evidence, 4 without firsthand proof, all 55 stage-level editorial gates open.");
