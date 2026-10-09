import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTIONS,CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_MAP,CSE_DEBATE_IDS,CSE_DEBATE_FIELDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_HIGH_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-high24.js";
import {CSE_REMAINING_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-remaining31.js";
import {paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";
const evidence=JSON.parse(readFileSync("data/learn/sexual-ethics-opposition-primary-provenance34-102-20261009.v1.json","utf8"));
const frozen=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-attribution-55-20261009.v1.json","utf8"));
const certification=JSON.parse(readFileSync("data/learn/sexual-ethics-certification-evidence.v2.json","utf8"));
const canonical={...CSE_HIGH_STAGE_SOURCE_IDS,...CSE_REMAINING_STAGE_SOURCE_IDS};
const questions=new Map(CSE_QUESTIONS.map(x=>[x.id,x]));
const previous=JSON.parse(readFileSync("data/learn/sexual-ethics-atomic-doctrinal90-20261009.v1.json","utf8"));
const special=JSON.parse(readFileSync("data/learn/sexual-ethics-atomic-claim-review-assault2024-cse112-117-020.v1.json","utf8"));
const prior=new Set([...previous.cases,...special.cases].map(x=>x.id));
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(CSE_DEBATE_FIELDS.length,8);
assert.equal(prior.size,21);
assert.equal(evidence.cases.length,34);
assert.equal(evidence.summary.canonical_debates_remaining,34);
assert.equal(evidence.summary.opposition_stages_recorded,102);
assert.equal(evidence.summary.cases_with_directly_read_specific_original_context,15);
assert.equal(evidence.summary.cases_without_directly_read_specific_original_context,19);
assert.equal(evidence.summary.farley_mediated_excerpt_with_own_statement,4);
assert.equal(evidence.summary.pew_false_23_percent_attribution_corrected,false);
assert.equal(evidence.summary.pew_23_percent_testing_motive_verified_in_original_main_report,true);
assert.equal(evidence.summary.entire_eight_stage_original_certifications,0);
assert.equal(evidence.summary.independent_theological_signoffs,0);
assert.equal(evidence.summary.independent_native_french_signoffs,0);
const combined=new Set([...prior,...evidence.cases.map(x=>x.id)]);
assert.equal(combined.size,55,"The 34 opposing-source cases must not duplicate previously audited Catholic atom owners");
assert.deepEqual([...combined].sort(),[...CSE_DEBATE_IDS].sort());
assert.equal(new Set(evidence.cases.map(x=>x.id)).size,34);
for(const row of evidence.cases){
 assert.ok(!prior.has(row.id));
 assert.equal(row.full_eight_stage_debate_certified,false);
 assert.equal(row.full_original_book_context_collated,false);
 assert.equal(row.independent_theological_signoff,false);
 assert.equal(row.independent_native_french_signoff,false);
 assert.ok(row.scope_limitation.length>=75,row.id+" source caveat too short");
 assert.ok(row.original_section_locator.length>=15,row.id+" original locator needed");
 assert.equal(Boolean(row.read_original_context_url),row.reviewed_opponent_fields.every(x=>x.original_claim_context_verified));
 assert.ok(frozen.cases.find(x=>x.id===row.id));
 assert.deepEqual(row.reviewed_opponent_fields.map(x=>x.stage),["opposition","appeal","counter"]);
 const item=questions.get(row.id);
 assert.ok(item,"Unregistered original owner "+row.id);
 for(const a of row.reviewed_opponent_fields){
  const stage=a.stage;
  assert.deepEqual([a.live_english_text,a.live_french_text],CSE_DEBATE_MAP[row.id][stage],row.id+" "+stage+" bilingual text drift");
  assert.equal(a.exact_stage_sentence_quote_collated,false,"Do not claim complete original quote without full verification");
  assert.deepEqual(a.selected_opponent_source_links.map(x=>x.id),canonical[row.id][stage],row.id+" "+stage+" source registry drift");
  assert.deepEqual(a.selected_opponent_source_links.map(x=>x.id),frozen.cases.find(x=>x.id===row.id).stage_source_ids[stage],row.id+" "+stage+" frozen register drift");
  assert.deepEqual(a.selected_opponent_source_links.map(x=>x.id),certification.cases.find(x=>x.id===row.id).stages.find(x=>x.stage===stage).selected_source_ids,row.id+" "+stage+" cert ledger drift");
  assert.deepEqual(a.selected_opponent_source_links.map(x=>x.id),paragraphRefsFor(item,"debate",stage).map(x=>x[0]),row.id+" "+stage+" reader silently substitutes citations");
  for(const source of a.selected_opponent_source_links){
    assert.equal(source.canonical_url,CSE_SOURCE_MAP[source.id]?.canonical_url,row.id+" "+stage+" nonoriginal URL");
    assert.match(source.canonical_url,/^https:\/\//);
  }
 }
}
const pew=CSE_DEBATE_MAP.CSE035.opposition;
assert.match(pew[0],/23% of adults currently cohabiting cited wanting to test their relationship/);
assert.match(pew[0],/38% cited finances and 37% convenience/);
assert.match(pew[1],/23 % des adultes en cohabitation/);
assert.match(pew[1],/38 % invoquaient les finances et 37 % la commodité/);
assert.match(pew[0],/reported motives, not evidence/);
assert.match(pew[1],/motifs déclarés/);
const pev=evidence.cases.find(x=>x.id==="CSE035");
assert.match(pev.scope_limitation,/Another unrelated 23% refers/);
for(const id of ["CSE043","CSE071","CSE083","CSE089"]){
 const row=evidence.cases.find(x=>x.id===id);
 assert.equal(row.original_provenance_class,"MEDIATED_AUTHOR_BOOK_EXCERPT_PLUS_FIRST_PERSON_REPLY_READ");
 const ids=canonical[id].opposition;
 assert.ok(ids.includes("FARLEY_QUOTED2012")&&ids.includes("FARLEY_RESPONSE2012"),id+" lacks both author's voice and mediated verbatim passage");
 assert.equal(CSE_SOURCE_MAP.FARLEY_RESPONSE2012.canonical_url,"https://www.ncronline.org/news/vatican/statement-mercy-sister-margaret-farley");
}
for(const id of ["CSE021","CSE142"]){
 let row=evidence.cases.find(x=>x.id===id);
 assert.equal(row.original_provenance_class,"HISTORICAL_AUTHOR_TEXT_NOT_RETRIEVED");
 assert.equal(row.read_original_context_url,null);
}
for(const id of ["CSE094","CSE095"]){
 let row=evidence.cases.find(x=>x.id===id);
 assert.equal(row.original_provenance_class,"ORIGINAL_POLICY_SUMMARY_READ_PDF_NOT_REVIEWED");
}
assert.equal(certification.summary.full_case_certifications,0);
console.log("PASS 34 remaining opponent-source dossiers / 102 bilingual stage references; Pew 23% original main-report attribution repaired; four Farley CDF plus firsthand response links; all original-access limits honest; 55 canonical owners and zero fabricated human approvals");
