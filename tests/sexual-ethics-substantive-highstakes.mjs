import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTION_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_MAP} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {paragraphRefsFor} from "../src/learn/sexual-ethics-data/provenance.js";

const audit=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-source-audit.v1.json","utf8"));
assert.equal(audit.substantive_editorial_pass_1.case_ids.length,4);
assert.equal(audit.substantive_editorial_pass_1.selected_cases_original_passage_review_total,12);
assert.equal(audit.substantive_editorial_pass_1.additional_original_passages_checked.length,8);
for(const id of ["CSE040","CSE058","CSE083","CSE101","CSE104","CSE112","CSE123","CSE124"]){
 const record=audit.cases.find(c=>c.id===id)?.substantive_editorial_pass_1;
 assert.ok(record&&record.finding&&record.url.startsWith("https://"),id+" lacks specific original-text finding");
 assert.match(record.scope,/FULL_CERTIFICATION_PENDING/);
}
assert.equal(audit.summary.stage_full_text_certified,0);
assert.equal(audit.summary.stage_specific_mapping_records,440);
assert.equal(audit.summary.stage_specific_mapping_references,612);

const ids=["CSE055","CSE070","CSE071","CSE125"];
for(const id of ids){
 const q=CSE_QUESTION_MAP[id],d=CSE_DEBATE_MAP[id],review=audit.cases.find(c=>c.id===id)?.substantive_editorial_pass_1;
 assert.ok(q&&d&&review,id+" missing");
 assert.equal(review.scope,"SELECTED_ORIGINAL_PASSAGES_CHECKED_BOTH_LANGUAGES_REVISED_NOT_EIGHT_STAGE_APPROVED");
 for(const field of review.verified_stage){
    assert.ok(d[field][0].length>100&&d[field][1].length>100,id+"."+field+" incomplete bilingual review");
    assert.ok(paragraphRefsFor(q,"debate",field).length,id+"."+field+" no linked source");
 }
}
assert.match(CSE_QUESTION_MAP.CSE055.a[0],/fostering or preserving conjugal love/);
assert.match(CSE_QUESTION_MAP.CSE055.a[1],/favoriser ou préserver leur amour/);
assert.match(CSE_DEBATE_MAP.CSE055.concession[0],/§1624/);
assert.match(CSE_DEBATE_MAP.CSE055.bottom[1],/affection conjugale/);
assert.match(CSE_DEBATE_MAP.CSE070.bottom[0],/grave reason/);
assert.match(CSE_DEBATE_MAP.CSE071.concession[0],/Neither automatic mortal guilt/);
assert.match(CSE_QUESTION_MAP.CSE071.d[1],/ni la culpabilité mortelle automatique/);
assert.match(CSE_QUESTION_MAP.CSE125.a[0],/prompt medical care/);
assert.match(CSE_QUESTION_MAP.CSE125.d[1],/évaluation urgente/);
assert.match(CSE_DEBATE_MAP.CSE125.catholicCase[0],/Methotrexate and salpingostomy have been disputed/);
assert.match(CSE_DEBATE_MAP.CSE125.response[1],/ne doivent pas être différés/);
assert.equal(CSE_SOURCE_MAP.NCBC_ECTOPIC.role,"catholic_commentary");
assert.equal(CSE_SOURCE_MAP.NCBC_ECTOPIC.authority_type,"NON_MAGISTERIAL_CATHOLIC_BIOETHICS");
assert.ok(CSE_QUESTION_MAP.CSE125.refs.some(([id])=>id==="NCBC_ECTOPIC"));
for(const stage of ["catholicCase","bottom"])assert.ok(paragraphRefsFor(CSE_QUESTION_MAP.CSE125,"debate",stage).some(([id])=>id==="NCBC_ECTOPIC"));
assert.ok(CSE_QUESTION_MAP.CSE040.refs.some(([id,loc])=>id==="PH"&&loc.includes("§7")&&loc.includes("§9")));
assert.ok(CSE_QUESTION_MAP.CSE040.refs.some(([id,loc])=>id==="CASTI"&&loc==="§18"));
console.log("PASS Sexual Ethics substantive editorial regression: 4 original-text rechecks, EN/FR revised answers and debates, NCBC marked non-magisterial, urgency and culpability qualifications retained.");
