import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTIONS,CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_MAP,CSE_DEBATE_IDS,CSE_DEBATE_FIELDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_DEBATE_POSITION_REFS} from "../src/learn/sexual-ethics-data/provenance.js";
import {CSE_HIGH_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-high24.js";
import {CSE_REMAINING_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-remaining31.js";

const audit=JSON.parse(readFileSync("data/learn/sexual-ethics-institutional-book-context-21-20261009.v1.json","utf8"));
const frozen=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-attribution-55-20261009.v1.json","utf8"));
const certification=JSON.parse(readFileSync("data/learn/sexual-ethics-certification-evidence.v2.json","utf8"));
const stage={...CSE_HIGH_STAGE_SOURCE_IDS,...CSE_REMAINING_STAGE_SOURCE_IDS};
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(CSE_DEBATE_FIELDS.length,8);
assert.equal(audit.cases.length,21);
assert.equal(audit.summary.cases,21);
assert.equal(audit.summary.institutional_empirical_cases,13);
assert.equal(audit.summary.fletcher_cases,2);
assert.equal(audit.summary.farley_cases,6);
assert.equal(audit.summary.bilingual_opposition_text_revisions,5);
assert.equal(audit.summary.whole_eight_stage_debates_certified,0);
assert.equal(audit.summary.independent_theological_approvals,0);
assert.equal(audit.summary.independent_french_approvals,0);
assert.equal(new Set(audit.cases.map(x=>x.id)).size,21);
assert.equal(frozen.cases.length,55);
for(const row of audit.cases){
 assert.ok(CSE_DEBATE_MAP[row.id],row.id+" missing canonical debate");
 assert.ok(CSE_SOURCE_MAP[row.original_source_id]?.canonical_url,row.id+" missing registered original "+row.original_source_id);
 assert.ok(row.argument_summary_en.length>95&&row.argument_summary_fr.length>90,row.id+" missing full bilingual source finding");
 assert.ok(row.limit.length>50,row.id+" incomplete attribution caveat");
 assert.equal(row.full_named_position_original_context_certified,false);
 assert.equal(row.independent_theological_signoff,false);
 assert.equal(row.independent_french_signoff,false);
 const snapshot=frozen.cases.find(x=>x.id===row.id);
 assert.ok(snapshot,row.id+" absent from complete attribution inventory");
 assert.deepEqual(snapshot.stage_source_ids,stage[row.id],row.id+" stage citations diverged");
 assert.deepEqual(snapshot.opposition_position_reference_ids,(CSE_DEBATE_POSITION_REFS[row.id]||[]).map(x=>x[0]),row.id+" source provenance not reconciled");
 assert.deepEqual(snapshot.opposition_source_ids,stage[row.id].opposition);
 const prior=certification.cases.find(x=>x.id===row.id);
 for(const st of CSE_DEBATE_FIELDS){
  assert.deepEqual(prior.stages.find(x=>x.stage===st).selected_source_ids,stage[row.id][st],row.id+" original source ledger stale at "+st);
 }
}
for(const [id,original,old] of [["CSE021","FREUD1924_FULL","FREUD1908"],["CSE142","FREUD1924_FULL","FREUD1908"],["CSE094","APA_TRANSCARE_FULL2024","APA_TRANSCARE"],["CSE095","APA_TRANSCARE_FULL2024","APA_TRANSCARE"]]){
 for(const stageName of ["opposition","appeal","counter"])assert.deepEqual(stage[id][stageName],[original,old]);
 assert.ok(CSE_DEBATE_POSITION_REFS[id].some(([src])=>src===original));
}
assert.match(CSE_SOURCE_MAP.FREUD1924_FULL.canonical_url,/freudedition\.net\/werke\/sexual-morality/);
assert.match(CSE_SOURCE_MAP.APA_TRANSCARE_FULL2024.canonical_url,/transgender-nonbinary-inclusive-care\.pdf$/);
for(const id of ["CSE043","CSE049","CSE050","CSE071","CSE083","CSE089"]){
 assert.ok(CSE_DEBATE_POSITION_REFS[id].some(([src])=>src==="FARLEY_RESPONSE2012"),id+" lacks author's own qualifying response");
 assert.equal(audit.cases.find(x=>x.id===id).verification_scope,"FARLEY_CDF_DIRECT_EXCERPT_PLUS_FIRST_PERSON_RESPONSE");
}
for(const id of ["CSE008","CSE010"]){
 const row=audit.cases.find(x=>x.id===id);
 assert.equal(row.verification_scope,"FLETCHER_DIGITIZED_ORIGINAL_1966_CHAPTERS_UNCOLLATED");
 assert.equal(row.original_source_id,"FLETCHER1966");
 for(const stageName of ["opposition","appeal","counter"]){
  assert.deepEqual(stage[id][stageName],["FLETCHER1966"]);
  assert.equal(certification.cases.find(x=>x.id===id).stages.find(x=>x.stage===stageName).exact_full_passage_collated,false);
 }
 assert.match(row.limit,/No complete printed-edition collation/);
}
assert.match(CSE_SOURCE_MAP.FLETCHER1966.title,/Westminster Press, 1966/);
assert.match(CSE_SOURCE_MAP.FLETCHER1966.canonical_url,/E2JqAAAAMAAJ/);
assert.match(CSE_SOURCE_MAP.FLETCHER1966.original_digitized_text_url,/scribd\.com\/document\/390198205/);
// Farley's 2008 book chapter is titled 'Just Sex'; it is not the book title.
// The official 2012 CDF excerpt and Farley's first-person response have
// separate original-document identities, preventing false full-book claims.
assert.match(CSE_SOURCE_MAP.FARLEY2008.title,/Just Love/);
assert.match(CSE_DEBATE_POSITION_REFS.CSE007.find(([id])=>id==="FARLEY2008")[1],/chapter “Just Sex”/);
for(const id of ["CSE043","CSE049","CSE050","CSE071","CSE083","CSE089"]){
 assert.ok(stage[id].opposition.includes("FARLEY_QUOTED2012"),id+" lost quoted original book segment");
 assert.equal(audit.cases.find(x=>x.id===id).full_named_position_original_context_certified,false);
}
// Curran's published 1987 essay is available as an author-written full text;
// chapter-context locators are not literal quotations of modern objections.
assert.match(CSE_SOURCE_MAP.CURRAN1987.canonical_url,/religion-online\.org\/article\/roman-catholic-sexual-ethics-a-dissenting-view/);
for(const id of ["CSE014","CSE016","CSE018","CSE050","CSE061","CSE063","CSE064"]){
 const ref=CSE_DEBATE_POSITION_REFS[id]?.find(([sid])=>sid==="CURRAN1987");
 assert.ok(ref,id+" lost Curran primary argument source");
 assert.match(ref[1],/1987 essay/,id+" lost author-text locator");
}
assert.match(CSE_DEBATE_MAP.CSE007.opposition[0],/treats sexual consent as voluntary/);
assert.match(CSE_DEBATE_MAP.CSE021.opposition[0],/Freud's 1908 essay/);
assert.match(CSE_DEBATE_MAP.CSE095.opposition[0],/2024 policy links gender-related rejection/);
assert.match(CSE_DEBATE_MAP.CSE096.opposition[0],/recommends individualized assessment/);
assert.match(CSE_DEBATE_MAP.CSE149.opposition[0],/Psychological and medical research can overturn factual assumptions/);
assert.match(CSE_DEBATE_MAP.CSE149.opposition[1],/Les recherches psychologiques et médicales/);
console.log("PASS 21 institutional/Fletcher/Farley original-context reviews, 13 institutional cases, 5 bilingual argument edits, 4 added full-document stage citations, 6 Farley firsthand responses, 0 fabricated approvals");
