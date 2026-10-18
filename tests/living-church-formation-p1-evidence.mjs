import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {loadFormationP1Evidence} from "../previews/visible-mass-3d/living-church-formation-p1-evidence.mjs";
const original=async u=>({ok:true,json:async()=>JSON.parse(await readFile(u,"utf8"))});
const evidence=await loadFormationP1Evidence({fetchImpl:original,lang:"en"});
const audit=evidence.audit();
assert.equal(audit.stageCount,8);
assert.equal(audit.claimCount,24);
assert.equal(audit.sourceCount,4);
assert.equal(audit.newlyApprovedStudyCount,0);
assert.equal(audit.newlyApprovedPassageCount,0);
assert.equal(audit.hasGenerationBackend,false);
assert.equal(new Set(audit.evidenceIds).size,24);
const cases=[
 ["Why is the Roman Canon silent?","MF04-C01",/low voice/i],
 ["What are the Mementos for?","MF04-C03",/living and the dead/i],
 ["What does Orate fratres mean by my sacrifice and yours?","MF03-C01",/my sacrifice and yours/i],
 ["Why must the priest receive Communion?","MF07-C01",/obligatory for the priest/i],
 ["Must the faithful receive Communion at every Mass?","MF07-C02",/without receiving/i],
 ["Why does the Roman Canon name Abel?","MF06-C02",/Abel, Abraham and Melchisedech/i],
 ["What is the difference between Mass of the Catechumens and Faithful?","MF01-C01",/historical and catechetical labels/i],
 ["How should I understand the elevations? Why the elevation?","MF05-C03",/adoration/i]
];
for(const [q,id,match] of cases){
 const a=evidence.answer(q);
 assert.equal(a.ok,true,q+" was not available");
 assert.equal(a.id,id,q+" mapped to wrong published claim");
 assert.equal(a.owner,"Formation");
 assert.equal(a.mode,"EXACT_PUBLISHED_FORMATION_P1_CLAIM");
 assert.match(a.text,match);
 assert.ok(a.citations.length>0);
 assert.ok(a.citations.every(c=>c.url.startsWith("https://")&&
  c.locator==="Document-level reference · exact passage not independently certified"));
}
for(const q of [
 "How long should I ring the altar bells?",
 "What is the 1962 Asperges rubric on a votive Sunday?",
 "Why is the Roman Canon silent and must the faithful receive Communion?",
 "Explain the profound bow on Jesu Christe",
 "What are the approved new Canon deep studies?"
]){
 assert.equal(evidence.answer(q).ok,false,"unsupported/new/multi-topic claim must fail closed: "+q);
}
const french=await loadFormationP1Evidence({fetchImpl:original,lang:"fr"});
const fr=french.answer("Pourquoi le canon à voix basse ?");
assert.equal(fr.ok,true);
assert.equal(fr.id,"MF04-C01");
assert.match(fr.text,/voix basse/i);
const formationUrl=new URL("../data/learn/mass-formation-campion.v1.json",import.meta.url);
const malicious=async u=>({ok:true,json:async()=>{
 const data=JSON.parse(await readFile(u,"utf8"));
 if(String(u)===String(formationUrl))data.stages[0].claims[0].sources=["FAKE-SOURCE"];
 return data;
}});
await assert.rejects(loadFormationP1Evidence({fetchImpl:malicious}),/manual review required/);
const futureRelease=async u=>({ok:true,json:async()=>{
 const data=JSON.parse(await readFile(u,"utf8"));
 if(data.schema==="ao-formation-approved-passages-v1")data.status="RELEASED";
 return data;
}});
await assert.rejects(loadFormationP1Evidence({fetchImpl:futureRelease}),/manual review required/);
console.log("PASS 8 original Formation P1 stages, 24 source-linked claims, narrow bilingual answer routing and release-gated negative coverage");
