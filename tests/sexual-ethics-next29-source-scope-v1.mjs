import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_QUESTIONS,CSE_QUESTION_MAP,CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_MAP,CSE_DEBATE_IDS} from "../src/learn/sexual-ethics-data/debates.js";

const audit=JSON.parse(readFileSync("data/learn/sexual-ethics-next29-source-scope-20261009.v1.json","utf8"));
const snapshot=JSON.parse(readFileSync("data/learn/sexual-ethics-whole-corpus-risk-audit-20261009.v1.json","utf8"));
const previous=JSON.parse(readFileSync("data/learn/sexual-ethics-highrisk-primary-context-20261009.v1.json","utf8"));
const expected=["CSE008","CSE010","CSE016","CSE019","CSE020","CSE027","CSE032","CSE038","CSE040","CSE052","CSE053","CSE061","CSE062","CSE063","CSE068","CSE070","CSE088","CSE094","CSE096","CSE101","CSE104","CSE108","CSE117","CSE120","CSE131","CSE133","CSE139","CSE145","CSE149"];
assert.equal(CSE_QUESTIONS.length,150);
assert.equal(CSE_DEBATE_IDS.length,55);
assert.deepEqual(audit.cases.map(c=>c.id),expected);
assert.equal(audit.cases.length,29);
assert.equal(new Set([...audit.cases.map(c=>c.id),...previous.cases.map(c=>c.id)]).size,43,"No duplication of the earlier fourteen cases");
assert.equal(audit.summary.updated_bilingual_question_details_or_answers,5);
assert.equal(audit.summary.updated_bilingual_debate_responses,1);
assert.equal(audit.summary.updated_canonical_locators_or_refs,2);
for(const k of ["full_case_certifications","independent_theological_approvals","independent_french_approvals"])assert.equal(audit.summary[k],0);
const statusCounts={DIRECT:0,ACCESS_BLOCKED:0,NOT_RECHECKED:0};
for(const row of audit.cases){
 const live=CSE_QUESTION_MAP[row.id];
 const frozen=snapshot.cases.find(q=>q.id===row.id);
 assert.ok(live&&frozen,row.id+" does not match canonical ownership");
 assert.ok(row.findings.en.length>90&&row.findings.fr.length>75);
 assert.ok(row.limits.length>65);
 assert.equal(row.independent_human_theological_approval,false);
 assert.equal(row.independent_human_french_approval,false);
 assert.equal(row.whole_case_claim_by_claim_certified,false);
 assert.deepEqual(frozen.source_ids,live.refs.map(r=>r[0]),row.id+" changed sources without updating 150-question snapshot");
 assert.ok(row.source_passages.length>0,row.id+" no primary source");
 for(const source of row.source_passages){
   const known=CSE_SOURCE_MAP[source.source_id];
   assert.ok(known,row.id+" source not in registered catalog: "+source.source_id);
   assert.ok(live.refs.some(([id])=>id===source.source_id),row.id+" missing visible source "+source.source_id);
   assert.equal(source.url,known.canonical_url,row.id+" must retain exact original document URL");
   assert.ok(source.locator.trim().length>=2,row.id+" lacks exact short source locator");
   assert.ok(Object.hasOwn(statusCounts,source.verification),row.id+" invalid access claim");
   statusCounts[source.verification]++;
 }
}
assert.deepEqual(statusCounts,audit.summary.passage_checks);
assert.ok(statusCounts.ACCESS_BLOCKED>=4,"External clinical limitations cannot silently become verified");
assert.equal(CSE_QUESTION_MAP.CSE032.refs.find(([id])=>id==="CIC")[1].includes("1062"),true);
assert.match(CSE_QUESTION_MAP.CSE052.d[0],/not an unlimited entitlement/);
assert.match(CSE_QUESTION_MAP.CSE052.d[1],/n'est pas un droit illimité/);
assert.match(CSE_QUESTION_MAP.CSE062.d[0],/Pius XII explicitly recognized serious medical/);
assert.match(CSE_QUESTION_MAP.CSE062.d[1],/Pie XII a reconnu/);
assert.match(CSE_QUESTION_MAP.CSE094.d[0],/Catholic anthropology affirms the unity/);
assert.match(CSE_QUESTION_MAP.CSE094.d[1],/L'anthropologie catholique affirme l'unité/);
assert.match(CSE_QUESTION_MAP.CSE139.a[0],/Only when both a grave reason/);
assert.match(CSE_QUESTION_MAP.CSE139.a[1],/L'exception exige à la fois/);
assert.match(CSE_QUESTION_MAP.CSE149.d[0],/2023 conditional defence of gestational-carrier/);
assert.match(CSE_QUESTION_MAP.CSE149.d[1],/défense conditionnelle de la gestation pour autrui/);
assert.ok(CSE_QUESTION_MAP.CSE149.refs.some(([id])=>id==="ASRM_GC"));
assert.match(CSE_DEBATE_MAP.CSE145.response[0],/Human goods are not created entirely by preference/);
assert.match(CSE_DEBATE_MAP.CSE145.response[1],/Les biens humains ne résultent pas entièrement des préférences/);
assert.equal(audit.cases.find(c=>c.id==="CSE096").source_passages.find(p=>p.source_id==="WPATH8_FULL").verification,"ACCESS_BLOCKED");
assert.equal(audit.cases.find(c=>c.id==="CSE149").source_passages.find(p=>p.source_id==="APA_LGB_POLICY").verification,"ACCESS_BLOCKED");
console.log("PASS next 29 CSE bounded original-source cases, 49 checked passages, 5 bilingual answer/detail repairs, 1 debate correction, 2 citation improvements, 0 fabricated certifications");
