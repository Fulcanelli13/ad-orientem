import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {APPROVED_PRIEST_RUBRIC_GESTURE_ART,approvedPriestRubricGestureArt}
  from "../src/mass/reader-approved-priest-gesture-art.js";
import {publishedMissalRubricsForParagraph}
  from "../src/mass/reader-missal-rubrics.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const registry=read("data/presentation/reader-rubric-events.v1.json");
const matrix=read("data/mass/gesture-matrix.v1.json").items;
const lock=read("data/presentation/mass-icon-final-user-lock-20261020.v1.json");
const canonical=read("data/presentation/mass-icon-canonical-set-20261021.v1.json");
const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const approved=new Map(lock.items.map(x=>[x.id,x]));
const expected=["AO.RUB.C0117.02","AO.RUB.C0263.02"];
assert.deepEqual(Object.keys(APPROVED_PRIEST_RUBRIC_GESTURE_ART).sort(),expected);
assert.equal(approved.get("v46_hands_joined")?.status,"approved");
assert.equal(approved.get("v46_hands_joined")?.rejected,false);
assert.equal(approved.get("v46_hands_joined")?.name,"Hands Joined");
assert.ok(existsSync(new URL("../assets/active/mass-v46/hands_joined.svg",import.meta.url)));
for(const [id,item] of Object.entries(APPROVED_PRIEST_RUBRIC_GESTURE_ART)){
 const event=registry.items.find(x=>x.id===id);
 assert.ok(event,"No exact source rubric "+id);
 assert.equal(event.cueId,item.cueId);
 assert.equal(event.kind,item.sourceKind);
 assert.equal(event.actor,"PRIEST");
 assert.equal(event.label,"JOINS HANDS");
 assert.equal(event.iconKey,"hands_joined");
 assert.ok(event.sources?.includes("MR62_RITUS"));
 assert.equal(event.authorityClass,"1962_NORMATIVE");
 const matrixRow=matrix.find(x=>x.id===item.gestureMatrixId);
 assert.ok(matrixRow,"No gesture-matrix corroboration "+item.gestureMatrixId);
 assert.equal(matrixRow.cueId,event.cueId);
 assert.equal(matrixRow.actor,"PRIEST");
 assert.equal(matrixRow.gesture,"JOIN_HANDS");
 assert.equal(matrixRow.iconKey,"hands_joined");
 assert.equal(matrixRow.iconStatus,"V46_SEMANTIC_BINDING");
 assert.equal(item.assetId,"v46_hands_joined");
 assert.equal(item.publishedKind,"ACTION");
 assert.equal(item.sourceKind,"GESTURE");
 const paragraph={sourceCueIds:[item.cueId]};
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
   for(const language of ["en","fr"]){
     const published=publishedMissalRubricsForParagraph(paragraph,registry,{form,language});
     const row=published.find(x=>x.id===id);
     assert.ok(row,"The approved gesture rubric is not published for "+form+" "+language+": "+id);
     assert.equal(approvedPriestRubricGestureArt(row),item);
     for(const negative of [
       {...row,sourceCueId:"AO.SM.C0001"}, {...row,actor:"FAITHFUL"},
       {...row,kind:"STATE"},{...row,observedNow:true},
       {...row,shortAction:"RAISES EYES AND HANDS"},
       {...row,owner:"R18_LOW_ACTOR"},{...row,sourceId:"CAMPION_1954"}
     ])assert.equal(approvedPriestRubricGestureArt(negative),null);
   }
 }
}
const later=canonical.meanings.find(x=>x.meaningId==="priest.action.hands_joined");
assert.equal(later?.status,"text-only","Do not promote inline annotations to a priest action rail icon");
assert.ok(dom.includes("approvedPriestRubricGestureArt(event)"));
assert.ok(dom.includes("icon.dataset.approvedPriestGestureEvent=event.id"));
assert.ok(dom.includes("text.prepend(icon)"));
assert.ok(dom.includes("text.textContent=short"),"1962 rubric text must remain");
assert.equal(approvedPriestRubricGestureArt({id:"AO.RUB.C0263.03",shortAction:"JOINS HANDS"}),null);
console.log("Approved priest gesture art: PASS — source-exact 2 published joins-hands rubrics in four forms x two languages, without action-rail pollution.");
