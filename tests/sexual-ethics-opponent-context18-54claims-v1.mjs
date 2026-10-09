import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_SOURCE_MAP,CSE_QUESTIONS} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_MAP,CSE_DEBATE_IDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_CONTEXT_ONLY_POSITION_IDS,paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";
import {CSE_HIGH_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-high24.js";
import {CSE_REMAINING_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-remaining31.js";
import {cseSourceTargets} from "../src/learn/sexual-ethics-data/source-targets.js";

const a=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-context18-54claims-20261009.v1.json","utf8"));
const frozen=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-attribution-55-20261009.v1.json","utf8"));
const sources={...CSE_HIGH_STAGE_SOURCE_IDS,...CSE_REMAINING_STAGE_SOURCE_IDS};
const questions=new Map(CSE_QUESTIONS.map(q=>[q.id,q]));
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(a.cases.length,18);
assert.equal(a.summary.existing_debates_examined,18);
assert.equal(a.summary.opposing_side_focal_argument_records,54);
assert.equal(a.summary.bilingual_opposing_openings_refined,3);
assert.equal(a.summary.full_original_book_farley_collated,false);
assert.equal(a.summary.full_fletcher_book_collated,false);
assert.equal(a.summary.entire_eight_stage_certifications,0);
assert.equal(a.summary.independent_theologian_signoffs,0);
assert.equal(a.summary.independent_native_french_signoffs,0);
assert.equal(new Set(a.cases.map(x=>x.id)).size,18);
assert.equal(frozen.summary.opposition_class_counts.AUTHOR_FULL_FIRST_PERSON,7);
assert.equal(frozen.summary.opposition_class_counts.NAMED_CLINICAL_OR_ORGANIZATIONAL_NOT_RECERTIFIED,11);
for(const id of ["CSE021","CSE142"]){
  assert.equal(frozen.cases.find(x=>x.id===id).attribution_class,"AUTHOR_FULL_FIRST_PERSON",id+" original Freud essay wrongly classified");
  assert.equal(CSE_CONTEXT_ONLY_POSITION_IDS.includes(id),false,id+" original text falsely identified as only context");
}
for(const id of ["CSE014","CSE016","CSE018","CSE141"])
 assert.equal(CSE_CONTEXT_ONLY_POSITION_IDS.includes(id),false,id+" actual named author mislabeled contextual-only");
for(const id of ["CSE029","CSE035","CSE093","CSE095","CSE149"])
 assert.equal(CSE_CONTEXT_ONLY_POSITION_IDS.includes(id),true,id+" non-advocacy sources misleadingly presented as proponents");
const primary=["opposition","appeal","counter"];
let n=0;
for(const row of a.cases){
 assert.ok(CSE_DEBATE_IDS.includes(row.id),row.id+" unknown debate");
 assert.equal(row.source_original_url,CSE_SOURCE_MAP[row.documented_opponent_or_provider_source_id]?.canonical_url,row.id+" original text link drift");
 assert.ok(row.original_passage_locator.length>18,row.id+" imprecise original locator");
 assert.ok(row.limitations.length>=65,row.id+" insufficient limitations");
 assert.deepEqual(row.stages.map(x=>x.stage),primary);
 assert.equal(row.full_eight_stage_certification,false);
 assert.equal(row.independent_theology_signoff,false);
 assert.equal(row.independent_native_french_signoff,false);
 for(const st of row.stages){
   assert.deepEqual([st.live_en,st.live_fr],CSE_DEBATE_MAP[row.id][st.stage],row.id+"/"+st.stage+" bilingual content drift");
   assert.deepEqual(st.selected_source_ids,sources[row.id][st.stage],row.id+"/"+st.stage+" effective source map drift");
   assert.deepEqual(st.selected_source_ids,paragraphRefsFor(questions.get(row.id),"debate",st.stage).map(x=>x[0]),row.id+"/"+st.stage+" live citations substitute");
   for(const source of st.source_links)assert.equal(source.url,CSE_SOURCE_MAP[source.source_id]?.canonical_url,row.id+" link missing");
   assert.ok(st.bounded_focal_claim.length>=45,row.id+"/"+st.stage+" argument not substantive");
   assert.equal(st.all_stage_sentences_independently_certified,false);
   assert.equal(st.attribution_grade,st.stage==="opposition"?row.access_grade:st.stage==="appeal"?"CONTEXT_GROUNDED_NOT_ENTIRE_AUTHOR_CLAIM":"EDITORIAL_FOLLOWUP_NOT_VERBATIM_AUTHOR_QUOTATION");
   n++;
 }
}
assert.equal(n,54);
assert.match(CSE_DEBATE_MAP.CSE021.opposition[0],/historically situated/);
assert.match(CSE_DEBATE_MAP.CSE021.opposition[1],/contexte historique/);
assert.match(CSE_DEBATE_MAP.CSE029.opposition[0],/cannot establish how common/);
assert.match(CSE_DEBATE_MAP.CSE029.opposition[1],/ne mesure pas la fréquence/);
assert.match(CSE_DEBATE_MAP.CSE035.opposition[0],/reported motive/);
assert.match(CSE_DEBATE_MAP.CSE035.opposition[1],/motifs? déclarés?/);
const farley=cseSourceTargets("FARLEY_QUOTED2012","Just Love p.295",CSE_SOURCE_MAP.FARLEY_QUOTED2012)[0];
assert.equal(farley.scope,"author-excerpt-in-cdf");
assert.match(farley.witness,/complete book not collated/);
assert.equal(farley.url,CSE_SOURCE_MAP.FARLEY_QUOTED2012.canonical_url);
const ui=readFileSync("src/learn/sexual-ethics.js","utf8");
assert.match(ui,/quoted excerpt/);
assert.match(ui,/extrait cité/);
assert.match(ui,/not a verbatim opponent reply/);
assert.match(ui,/et non une réponse littérale de l’opposant/);
console.log("PASS 18 opposition source contexts / 54 EN-FR argument stages; correct historical Freud attribution, primary-vs-survey-vs-excerpt provenance, no invented author counterquotes, zero false eight-stage approvals");
