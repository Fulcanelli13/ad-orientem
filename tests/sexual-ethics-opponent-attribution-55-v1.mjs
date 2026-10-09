import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_DEBATE_FIELDS,CSE_DEBATE_IDS,CSE_DEBATE_MAP} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {CSE_DEBATE_POSITION_REFS} from "../src/learn/sexual-ethics-data/provenance.js";
import {CSE_HIGH_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-high24.js";
import {CSE_REMAINING_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-remaining31.js";
const audit=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-attribution-55-20261009.v1.json","utf8"));
const selected={...CSE_REMAINING_STAGE_SOURCE_IDS,...CSE_HIGH_STAGE_SOURCE_IDS};
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(CSE_DEBATE_FIELDS.length,8);
assert.equal(audit.cases.length,55);
assert.equal(audit.summary.canonical_main_debates,55);
assert.equal(audit.summary.stage_reference_sets,440);
assert.deepEqual(audit.cases.map(x=>x.id),[...CSE_DEBATE_IDS].sort());
assert.deepEqual(audit.summary.opposition_class_counts,{
 AUTHOR_FULL_FIRST_PERSON:5,
 NAMED_CLINICAL_OR_ORGANIZATIONAL_NOT_RECERTIFIED:13,
 AUTHOR_EXCERPTS_MEDIATED:2,
 REASONED_OR_ILLUSTRATIVE_NOT_NAMED_AUTHOR:27,
 AUTHOR_EXCERPTS_CDF:6,
 MISCONCEPTION_NOT_AN_AUTHOR:2
});
for(const field of ["whole_debates_certified","independent_theological_approvals","independent_french_approvals"])assert.equal(audit.summary[field],0);
let count=0;
for(const row of audit.cases){
 const live=CSE_DEBATE_MAP[row.id];
 assert.ok(live,row.id+" missing debate");
 assert.equal(row.opposition_is_a_direct_quotation,false);
 assert.equal(row.all_eight_stages_full_original_passage_certified,false);
 assert.equal(row.independent_human_theological_approval,false);
 assert.equal(row.independent_human_french_approval,false);
 assert.equal(row.prior_semantic_stage_review_count,8);
 assert.deepEqual(row.opposition_position_reference_ids,(CSE_DEBATE_POSITION_REFS[row.id]||[]).map(([id])=>id));
 assert.deepEqual(row.stage_source_ids,selected[row.id],"stage registry drift "+row.id);
 assert.deepEqual(row.opposition_source_ids,selected[row.id].opposition);
 assert.ok(row.original_context_note.length>60);
 for(const source of row.opposition_primary_links){
  assert.ok(CSE_SOURCE_MAP[source.source_id],row.id+" unregistered source "+source.source_id);
  assert.equal(source.link,CSE_SOURCE_MAP[source.source_id].canonical_url);
 }
 for(const field of CSE_DEBATE_FIELDS){
  assert.equal(live[field].length,2,row.id+" missing EN/FR "+field);
  assert.ok(live[field][0].length>30&&live[field][1].length>30,row.id+" empty stage "+field);
  for(const id of row.stage_source_ids[field]){
   assert.ok(CSE_SOURCE_MAP[id]?.canonical_url,row.id+" missing stage source "+field+"/"+id);
  }
  count++;
 }
}
assert.equal(count,440);
for(const id of ["CSE008","CSE010"])assert.equal(audit.cases.find(x=>x.id===id).attribution_class,"AUTHOR_EXCERPTS_MEDIATED");
for(const id of ["CSE014","CSE016","CSE018","CSE061"])assert.equal(audit.cases.find(x=>x.id===id).attribution_class,"AUTHOR_FULL_FIRST_PERSON");
for(const id of ["CSE043","CSE049","CSE050","CSE071","CSE083","CSE089"])assert.equal(audit.cases.find(x=>x.id===id).attribution_class,"AUTHOR_EXCERPTS_CDF");
for(const id of ["CSE112","CSE117"])assert.equal(audit.cases.find(x=>x.id===id).attribution_class,"MISCONCEPTION_NOT_AN_AUTHOR");
assert.ok(CSE_SOURCE_MAP.CURRAN_TALK1986?.canonical_url.includes("authority-and-dissent"));
for(const id of ["CSE016","CSE018"])assert.ok(CSE_DEBATE_POSITION_REFS[id].some(([src])=>src==="CURRAN_TALK1986"));
assert.match(CSE_DEBATE_MAP.CSE008.opposition[0],/self-giving agape/);
assert.match(CSE_DEBATE_MAP.CSE008.opposition[1],/agapè désintéressée/);
assert.match(CSE_DEBATE_MAP.CSE010.opposition[0],/distinguishes agape from sentiment/);
assert.match(CSE_DEBATE_MAP.CSE014.opposition[0],/non-infallible moral judgments carry weight/);
assert.match(CSE_DEBATE_MAP.CSE016.opposition[0],/presumption of truth in its favour/);
assert.match(CSE_DEBATE_MAP.CSE018.opposition[0],/qualified public theological dissent/);
assert.match(CSE_DEBATE_MAP.CSE061.opposition[0],/1987 essay criticizes/);
assert.equal(audit.summary.updated_bilingual_named_opponent_openings,6);
console.log("PASS 55 opposing-argument attribution classes, 440 bilingual stages/source maps, six Fletcher/Curran revisions and bounded original-vs-mediated provenance");
