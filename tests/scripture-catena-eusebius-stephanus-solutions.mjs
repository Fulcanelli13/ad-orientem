/*
 * Eusebius Stephanus I–IV research structure, source and speaker safeguards.
 * Does not certify a Greek critical edition or release a translated answer.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const root="data/scripture/catena/research/";
const doc=read(root+"eusebius-stephanus-early-solution-structure.v1.json");
const indexed=read(root+"eusebius-epitome-20-questions.v1.json");
assert.equal(doc.schema,"ao.catena.eusebius-stephanus-early-solution-structure.v1");
assert.equal(doc.status,"research_only_not_live");
assert.deepEqual(doc.coverage,{from:1,to:4,questions:4,internalResearchUnits:14});
const keys=new Set();
for(const book of ["matthew","mark","luke","john"]){
 for(const p of read("data/scripture/catena/"+book+".json").pericopes)
 for(const k of p.verse_keys)keys.add(k);
}
const ids=new Set(),unitIds=new Set();
for(const q of doc.records){
 assert.ok(!ids.has(q.questionId));ids.add(q.questionId);
 assert.ok(indexed.records.some(x=>x.id===q.questionId&&x.recipient==="stephanus"));
 assert.equal(q.publicationStatus,"research_only__not_a_verified_Father_answer");
 assert.ok(q.units.length>=3);
 for(const u of q.units){
  assert.ok(!unitIds.has(u.spanId));unitIds.add(u.spanId);
  assert.ok(keys.has(u.scriptureKey),"unindexed source anchor");
  assert.ok(u.analyticalNote.length>=35,"research note missing");
  assert.equal(u.noteType,"internal_scholarly_analysis_not_user_facing_translation");
  assert.equal(u.originalGreekText,null);
  assert.equal(u.englishFatherReply,null);
  assert.equal(u.releaseStatus,"blocked_until_text_and_edition_checked");
  if(u.sourceUrl)assert.ok(u.sourceUrl.startsWith("https://"));
 }
}
assert.equal(unitIds.size,14);
for(let n=1;n<=4;n++)assert.ok(ids.has("eusebius-stephanus-"+String(n).padStart(2,"0")));
const iv=doc.records.find(x=>x.questionId==="eusebius-stephanus-04");
assert.equal(iv.sourceTextStatus,"composite_transmission_Africanus_quote_author");
assert.ok(iv.units.filter(u=>/Africanus/.test(u.analyticalNote)).length>=2);
const iii=doc.records.find(x=>x.questionId==="eusebius-stephanus-03");
assert.ok(iii.units.some(x=>x.spanId==="S3-B"));
assert.ok(iii.units.some(x=>x.spanId==="S3-C"));
console.log("PASS: 4 Stephanus questions; 14 non-published argument notes, distinct historical/spiritual paths and Africanus voice");
