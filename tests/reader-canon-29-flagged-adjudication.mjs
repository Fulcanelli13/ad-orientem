import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCanon29FlaggedAdjudication,createCanon29FlaggedAdjudicationController}
 from "../src/mass/reader-canon-29-flagged-adjudication.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const witnesses={
 risks:load("../data/research/mass-canon-29-flagged-bilingual-adjudication-20261014.json"),
 triage:load("../data/research/mass-canon-flagged-french-copy-triage-20261013.json"),
 bilingual:load("../data/research/mass-canon-62-bilingual-two-layer-review-20261014.json"),
 french:load("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json"),
 triggers:load("../data/research/mass-canon-62-source-trigger-audit-20261013.json"),
};
const audit=validateCanon29FlaggedAdjudication(witnesses);
assert.deepEqual([audit.pending,audit.approved,audit.published,audit.canPublish],
 [29,0,0,false]);
assert.ok(audit.uniqueRiskClasses>=12);
assert.equal(audit.rows.length,29);
assert.equal(audit.rows.filter(x=>x.priority==="HIGH").length,21);
assert.equal(audit.rows.filter(x=>x.priority==="STANDARD").length,8);
const by=new Map(audit.rows.map(x=>[x.actionId,x]));
for(const row of audit.rows){
 assert.equal(row.sourceSignoff,"NOT_APPROVED");
 assert.equal(row.copyApproval,"NOT_APPROVED");
 assert.equal(row.canPublish,false);
 assert.equal(row.observedNow,false);
 assert.ok(row.guideDraft.fr.length>35);
 assert.ok(row.guideDraft.en.length>35);
 assert.ok(row.shortDraft.fr.length>5);
 assert.ok(row.shortDraft.en.length>5);
 assert.ok(row.sourceUrls.length>=2);
 assert.ok(row.unresolvedIssue.fr.length>30);
 assert.ok(row.unresolvedIssue.en.length>30);
}
for(const n of ["027","035","061","062"])
 assert.equal(by.get("AO.CANON.R62."+n).actor,"SERVER");
for(const n of ["028","034","055","059"])
 assert.equal(by.get("AO.CANON.R62."+n).reviewCode,"DEACON_CONDITION");
for(const n of ["023","024"])
 assert.equal(by.get("AO.CANON.R62."+n).reviewCode,"INDEPENDENT_EVENT");
for(const n of ["022","032"])
 assert.equal(by.get("AO.CANON.R62."+n).displaySurface,"FOCUS_WORDS_NO_DUPLICATE");
for(const n of ["026","040"])
 assert.equal(by.get("AO.CANON.R62."+n).reviewCode,"PERSISTENT_STATE");
for(const [n,word] of [
 ["022","pronounces the words of consecration"],
 ["025","then makes his second genuflection"],
 ["027","server rings the bell"],
 ["032","pronounces the words of consecration"],
 ["033","first genuflection in adoration"],
 ["062","server rings a warning bell"],
]){
 const copy=witnesses.bilingual.rows.find(x=>x.actionId==="AO.CANON.R62."+n);
 assert.ok(copy.guideDraft.en.includes(word),"Substantive 1962 ceremonial English copy "+n);
 assert.doesNotMatch(copy.guideDraft.en,/\\b(?:reader|scroll|source trigger|implementation|render|dashboard|not the priest's gesture)\\b/i);
}
const controller=createCanon29FlaggedAdjudicationController(witnesses);
assert.equal(controller.project().rows.length,0);
assert.equal(controller.project({editorialPreview:true,form:"INVALID"}).rows.length,0);
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const preview=controller.project({form,editorialPreview:true});
 assert.equal(preview.rows.length,29);
 assert.equal(preview.canPublish,false);
 assert.equal(preview.sourceSignoff,"NOT_APPROVED");
 assert.ok(preview.rows.every(x=>x.observedNow===false));
 const selection=controller.project({form,editorialPreview:true,
  actionIds:["AO.CANON.R62.027","AO.CANON.R62.028"]});
 assert.deepEqual(selection.rows.map(x=>x.actor),["SERVER","PRIEST"]);
}
assert.throws(()=>controller.project({editorialPreview:true,
 actionIds:["AO.CANON.R62.099"]}),/Unknown/);
function corrupt(change){const x=structuredClone(witnesses);change(x);return x;}
assert.throws(()=>validateCanon29FlaggedAdjudication(corrupt(x=>{
 x.risks.rows[0].canPublish=true;
})),/drift/);
assert.throws(()=>validateCanon29FlaggedAdjudication(corrupt(x=>{
 x.risks.rows[0].sourceSignoff="APPROVED";
})),/drift/);
assert.throws(()=>validateCanon29FlaggedAdjudication(corrupt(x=>{
 x.risks.rows[0].copyApproval="APPROVED";
})),/drift/);
assert.throws(()=>validateCanon29FlaggedAdjudication(corrupt(x=>{
 x.risks.rows[0].observedNow=true;
})),/drift/);
assert.throws(()=>validateCanon29FlaggedAdjudication(corrupt(x=>{
 x.risks.rows[0].sourceUrls[0]="https://example.com/fake";
})),/drift/);
assert.throws(()=>validateCanon29FlaggedAdjudication(corrupt(x=>{
 x.risks.rows[0].existingRiskFlags=["NONE"];
})),/drift/);
assert.throws(()=>validateCanon29FlaggedAdjudication(corrupt(x=>{
 x.risks.rows.find(y=>y.actionId==="AO.CANON.R62.027").actor="PRIEST";
})),/drift/);
assert.throws(()=>validateCanon29FlaggedAdjudication(corrupt(x=>{
 x.risks.rows.find(y=>y.actionId==="AO.CANON.R62.028").reviewCode="INDEPENDENT_EVENT";
})),/requires witnessed clock|conditions|stage|drift/i);
assert.throws(()=>validateCanon29FlaggedAdjudication(corrupt(x=>{
 x.bilingual.rows.find(y=>y.actionId==="AO.CANON.R62.027").copyApproval="APPROVED";
})),/drift/);
assert.throws(()=>validateCanon29FlaggedAdjudication(corrupt(x=>{
 x.french.status="PUBLISHED";
})),/source ledgers/);
assert.throws(()=>validateCanon29FlaggedAdjudication(corrupt(x=>{
 x.triage.rows.pop();
})),/source ledgers/);
console.log("PASS: 29 bilingual flagged Canon risks crosslinked, 4 minister events, 4 Solemn deacon conditions, zero approvals and no LIVE exposure.");
