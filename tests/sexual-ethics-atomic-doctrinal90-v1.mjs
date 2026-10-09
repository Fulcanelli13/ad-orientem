import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CSE_QUESTIONS,CSE_SOURCE_MAP } from "../src/learn/sexual-ethics-data/index.js";
import { CSE_DEBATE_MAP,CSE_DEBATE_IDS } from "../src/learn/sexual-ethics-data/debates.js";
import { paragraphRefsFor } from "../src/learn/sexual-ethics-data/provenance.js";
import { CSE_HIGH_STAGE_SOURCE_IDS } from "../src/learn/sexual-ethics-data/stage-evidence-high24.js";
import { CSE_REMAINING_STAGE_SOURCE_IDS } from "../src/learn/sexual-ethics-data/stage-evidence-remaining31.js";

const dossier=JSON.parse(readFileSync("data/learn/sexual-ethics-atomic-doctrinal90-20261009.v1.json","utf8"));
const stageRegistry={...CSE_HIGH_STAGE_SOURCE_IDS,...CSE_REMAINING_STAGE_SOURCE_IDS};
const questionMap=new Map(CSE_QUESTIONS.map(x=>[x.id,x]));
const catholicStages=["concession","breakpoint","catholicCase","response","bottom"];
const prior=JSON.parse(readFileSync("data/learn/sexual-ethics-atomic-claim-review-assault2024-cse112-117-020.v1.json","utf8"));
const frozen=JSON.parse(readFileSync("data/learn/sexual-ethics-opponent-attribution-55-20261009.v1.json","utf8"));
const cert=JSON.parse(readFileSync("data/learn/sexual-ethics-certification-evidence.v2.json","utf8"));
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(dossier.cases.length,18);
assert.equal(dossier.summary.catholic_side_atomic_units,90);
assert.equal(dossier.summary.reader_bilingual_corrections,4);
assert.equal(dossier.summary.source_citation_repairs,2);
assert.equal(dossier.summary.full_eight_stage_certifications,0);
assert.equal(dossier.summary.full_five_stage_sentence_verifications,0);
assert.equal(dossier.summary.independent_theological_signoffs,0);
assert.equal(dossier.summary.independent_native_french_signoffs,0);
assert.equal(new Set(dossier.cases.map(x=>x.id)).size,18);
assert.equal(new Set([...dossier.cases.map(x=>x.id),...prior.cases.map(x=>x.id)]).size,21);
let verified=0;
for(const entry of dossier.cases){
 assert.ok(CSE_DEBATE_IDS.includes(entry.id),entry.id+" not a canonical eight-stage debate");
 assert.ok(entry.original_documents_checked_in_this_batch);
 assert.equal(entry.full_eight_stage_certified,false);
 assert.equal(entry.independent_theological_approved,false);
 assert.equal(entry.independent_french_approved,false);
 assert.deepEqual(entry.claims.map(x=>x.field),catholicStages,entry.id+" Catholic stage order changed");
 const original=CSE_DEBATE_MAP[entry.id],item=questionMap.get(entry.id);
 assert.ok(original&&item,entry.id+" missing canonical reader data");
 const certification=cert.cases.find(x=>x.id===entry.id);
 const snapshot=frozen.cases.find(x=>x.id===entry.id);
 assert.ok(certification&&snapshot);
 for(const row of entry.claims){
   const sid=row.source_id,stage=row.field;
   assert.ok(stageRegistry[entry.id][stage].includes(sid),entry.id+" "+stage+" source not wired");
   assert.ok(snapshot.stage_source_ids[stage].includes(sid),entry.id+" "+stage+" frozen source not synced");
   assert.ok(certification.stages.find(x=>x.stage===stage).selected_source_ids.includes(sid),entry.id+" "+stage+" cert source ledger not synced");
   assert.equal(CSE_SOURCE_MAP[sid]?.canonical_url,row.source_url,entry.id+" "+stage+" original source URL drift");
   assert.deepEqual([row.stage_live_en,row.stage_live_fr],original[stage],entry.id+" "+stage+" EN/FR text drift");
   const actual=paragraphRefsFor(item,"debate",stage).map(x=>x[0]);
   assert.ok(actual.includes(sid),entry.id+" "+stage+" citation lost by reader fallback");
   assert.deepEqual(actual,stageRegistry[entry.id][stage],entry.id+" "+stage+" source substitute");
   assert.ok(row.atomic_claim.length>=30,entry.id+" "+stage+" missing real focal claim");
   assert.ok(row.passage_locator.length>=3,entry.id+" "+stage+" imprecise original locator");
   assert.ok(row.source_to_claim_boundary.length>=85,entry.id+" "+stage+" source limitations must be explicit");
   assert.ok(["CONTEXT_TRUE_BUT_NOT_ENTIRE_OBJECTION","PRINCIPLE_OR_REBUTTAL","ORIGINAL_DOCTRINAL_WITH_APPLICATION","REASONED_APPLICATION","NORMATIVE_SYNTHESIS"].includes(row.proof_grade));
   assert.equal(row.complete_stage_sentence_verification,false);
   verified++;
 }
}
assert.equal(verified,90);
assert.match(CSE_DEBATE_MAP.CSE031.catholicCase[0],/cann\. 1116 and 1127 §2/);
assert.match(CSE_DEBATE_MAP.CSE031.catholicCase[1],/cann\. 1116 et 1127 §2/);
assert.match(CSE_DEBATE_MAP.CSE044.catholicCase[0],/canon 1098/);
assert.match(CSE_DEBATE_MAP.CSE044.catholicCase[1],/canon 1098/);
assert.match(CSE_DEBATE_MAP.CSE045.catholicCase[0],/historical ordering of matrimonial ends/);
assert.match(CSE_DEBATE_MAP.CSE045.catholicCase[1],/l'ordre traditionnel des fins/);
assert.match(CSE_DEBATE_MAP.CSE101.catholicCase[0],/None of this diminishes/);
assert.match(CSE_DEBATE_MAP.CSE101.catholicCase[1],/Rien de cela ne diminue/);
for(const [id,source] of [["CSE045","CIC"],["CSE064","MIDWIVES"]]){
 assert.ok(stageRegistry[id].catholicCase.includes(source),id+" missing exact principal document");
 assert.ok(paragraphRefsFor(questionMap.get(id),"debate","catholicCase").map(x=>x[0]).includes(source));
}
assert.equal(cert.summary.full_case_certifications,0);
console.log("PASS 18 existing debates / 90 bounded Catholic atomic source claims; original section locators + runtime links + EN/FR + two citation corrections + zero fabricated full certifications");
