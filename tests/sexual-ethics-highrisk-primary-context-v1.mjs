import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTION_MAP,CSE_PUBLIC_QUESTION_MAP,CSE_SOURCE_MAP,CSE_VALIDATION} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_IDS,CSE_DEBATE_MAP} from "../src/learn/sexual-ethics-data/debates.js";

const doc=JSON.parse(readFileSync("data/learn/sexual-ethics-highrisk-primary-context-20261009.v1.json","utf8"));
const wanted=["CSE015","CSE045","CSE054","CSE055","CSE058","CSE110","CSE112","CSE113","CSE114","CSE119","CSE123","CSE124","CSE125","CSE144"];
assert.equal(CSE_VALIDATION.ok,true);
assert.equal(CSE_VALIDATION.questions,150);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.equal(doc.cases.length,14);
assert.deepEqual(doc.cases.map(x=>x.id),wanted);
assert.equal(doc.summary.original_passage_scope_findings,14);
assert.equal(doc.summary.live_bilingual_answers_corrected,3);
assert.equal(doc.summary.archived_cases_reviewed,2);
for(const field of ["entire_cases_certified","independent_french_approvals","independent_theological_approvals","complete_eight_stage_debate_certifications"])assert.equal(doc.summary[field],0,field+" must remain uncertified");
const archived=new Set(["CSE055","CSE058"]);
const sourceSet=new Set();
for(const row of doc.cases){
 const question=CSE_QUESTION_MAP[row.id];
 assert.ok(question,row.id+" absent from canonical 150");
 assert.equal(Boolean(CSE_PUBLIC_QUESTION_MAP[row.id]),!archived.has(row.id));
 assert.ok(question.a[0].length>40&&question.a[1].length>40);
 assert.ok(row.en.length>100&&row.fr.length>100&&row.limit.length>100,"Two-language source-scope finding missing "+row.id);
 assert.equal(row.review.paragraph_scope_confirmed,true);
 assert.equal(row.review.whole_case_claim_by_claim_certified,false);
 assert.equal(row.review.independent_french_proofreading,false);
 assert.equal(row.review.independent_theological_approval,false);
 assert.ok(row.status.includes("BOUNDED")||row.status.includes("ARCHIVED"),row.id+" misrepresents evidence level");
 for(const [sourceId,locator,url] of row.primary){
   const source=CSE_SOURCE_MAP[sourceId];
   assert.ok(source,row.id+" source "+sourceId+" is not registered");
   assert.ok(question.refs.some(([id])=>id===sourceId),row.id+" must display source "+sourceId);
   assert.ok(locator&&url.startsWith("https://"),row.id+" lacks an original-text link or paragraph");
   assert.equal(source.canonical_url,url,row.id+" must link the same canonical document actually cited");
   sourceSet.add(sourceId);
 }
}
assert.equal(sourceSet.size,15);
assert.match(CSE_QUESTION_MAP.CSE045.a[0],/John Paul II explicitly teaches mutual subjection/);
assert.match(CSE_QUESTION_MAP.CSE045.a[1],/soumission mutuelle/);
assert.match(CSE_QUESTION_MAP.CSE054.a[0],/Imposing sexual activity on a spouse is itself gravely unjust/);
assert.match(CSE_QUESTION_MAP.CSE054.a[1],/Imposer une activité sexuelle/);
assert.match(CSE_QUESTION_MAP.CSE058.a[0],/No general moral permission/);
assert.match(CSE_QUESTION_MAP.CSE058.a[1],/aucune permission générale/);
assert.ok(CSE_QUESTION_MAP.CSE119.refs.some(([id,locator])=>id==="ST151"&&locator.includes("a.1")));
assert.ok(CSE_DEBATE_MAP.CSE054&&CSE_DEBATE_MAP.CSE125&&CSE_QUESTION_MAP.CSE144,"Existing substantive debates and mercy answer remain");
assert.equal(doc.cases.find(x=>x.id==="CSE125").status,"BOUNDED_CDF_PRIMARY_PLUS_SECONDARY_ETHICS_PROCEDURE_OPEN");
assert.equal(doc.cases.find(x=>x.id==="CSE125").primary[1][0],"NCBC_ECTOPIC_FAQ");
assert.equal(doc.cases.find(x=>x.id==="CSE125").review.ncbc_original_pdf_page_2_visual_checked,true);
assert.equal(doc.cases.find(x=>x.id==="CSE055").review.whole_case_claim_by_claim_certified,false);
console.log("PASS 14 high-risk CSE case/source scopes, 15 live registered original links, 3 EN/FR answers repaired, 2 archived kept, 0 fabricated theological approvals");
