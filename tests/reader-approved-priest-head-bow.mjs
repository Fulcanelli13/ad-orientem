// No generated drawings, no actor transfer to the priest-action rail:
// show the user's existing V4.6 head-bow only for published 1962 rubrics.
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {PRIEST_HEAD_BOW_RUBRIC_ART,approvedPriestHeadBowRubricArt}
  from "../src/mass/reader-approved-priest-head-bow.js";
import {publishedMissalRubricsForParagraph}
  from "../src/mass/reader-missal-rubrics.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const registry=read("data/presentation/reader-rubric-events.v1.json");
const matrix=read("data/mass/gesture-matrix.v1.json").items;
const picked=read("data/presentation/mass-icon-user-selections-20261010.v1.json");
const canonical=read("data/presentation/mass-icon-canonical-set-20261021.v1.json");
const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const entries=Object.entries(PRIEST_HEAD_BOW_RUBRIC_ART);
assert.equal(entries.length,11,"Unexpected priest head-bow whitelist coverage");
assert.equal(picked.selected["you:head_bow"],"assets/active/mass-v46/head_bow.svg");
assert.ok(existsSync(new URL("../assets/active/mass-v46/head_bow.svg",import.meta.url)));
for(const [id,art] of entries){
 const src=registry.items.find(x=>x.id===id);
 assert.ok(src,"Published rubric missing: "+id);
 assert.equal(src.cueId,art.cueId);
 assert.equal(src.kind,art.sourceKind);
 assert.equal(src.actor,art.actor);
 assert.equal(src.label,art.label);
 assert.equal(src.iconKey,"head_bow");
 assert.equal(src.authorityClass,"1962_NORMATIVE");
 assert.ok(src.sources?.includes("MR62_RITUS"));
 const gesture=matrix.find(x=>x.id===art.matrixId);
 assert.ok(gesture,"Missing priest gesture evidence: "+art.matrixId);
 assert.equal(gesture.sourceRubricEventId,id);
 assert.equal(gesture.cueId,art.cueId);
 assert.equal(gesture.actor,"PRIEST");
 assert.equal(gesture.iconKey,"head_bow");
 assert.equal(gesture.iconStatus,"V46_SEMANTIC_BINDING");
 assert.equal(art.assetUserKey,"you:head_bow");
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  for(const language of ["en","fr"]){
   const rows=publishedMissalRubricsForParagraph({sourceCueIds:[art.cueId]},registry,{form,language});
   const pub=rows.find(x=>x.id===id);
   assert.ok(pub,"Unpublished head-bow rubric: "+id+" "+form+" "+language);
   assert.equal(pub.kind,"ACTION","Published non-Canon GESTURE wrapper drifted");
   assert.equal(approvedPriestHeadBowRubricArt(pub),art);
   for(const mutated of [
    {...pub,sourceCueId:"AO.SM.C0001"}, {...pub,actor:"FAITHFUL"},
    {...pub,kind:"STATE"}, {...pub,observedNow:true},
    {...pub,shortAction:"BOWS PROFOUNDLY"},
    {...pub,owner:"R18_LOW_ACTOR"}, {...pub,sourceId:"CAMPION_1954"},
   ])assert.equal(approvedPriestHeadBowRubricArt(mutated),null);
  }
 }
}
assert.deepEqual(canonical.gaps.filter(x=>x.meaningId==="priest.action.bow_head").map(x=>x.meaningId),
 ["priest.action.bow_head"],"Priest action rail remains text-only until separately approved");
assert.ok(dom.includes("approvedPriestHeadBowRubricArt(event)"));
assert.ok(dom.includes("icon.dataset.approvedPriestHeadBowEvent=event.id"));
assert.ok(dom.includes("text.textContent=short"));
for(const id of ["AO.RUB.C0117.02","AO.RUB.C0263.02","AO.RUB.C0174.06"]){
 assert.equal(approvedPriestHeadBowRubricArt({id}),null,"Other approved gestures must stay independent");
}
console.log("Approved head bow art: PASS — eleven published exact priest rubrics x four forms x two languages, source text and action rails preserved.");
