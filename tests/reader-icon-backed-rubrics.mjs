import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {EXACT_ICON_BACKED_LIVE_RUBRICS,exactIconBackedRubric}
  from "../src/mass/reader-icon-backed-rubrics.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const rubric=read("../data/presentation/reader-rubric-events.v1.json").items;
const cross=read("../data/presentation/mass-icon-final-cue-crosswalk-20261020.v1.json").rows;
const lock=read("../data/presentation/mass-icon-final-user-lock-20261020.v1.json").items;
const byRubric=new Map(rubric.map(x=>[x.id,x]));
const byAsset=new Map(lock.map(x=>[x.id,x]));
const byActionCue=new Map(cross.filter(x=>x.lane==="priest_action").map(x=>[x.cueId,x]));
const entries=Object.entries(EXACT_ICON_BACKED_LIVE_RUBRICS);
assert.equal(rubric.length,57);
assert.equal(entries.length,8,"No unreviewed source rubric may be silently icon-only");
for(const [id,rec] of entries){
 const source=byRubric.get(id),chosen=byActionCue.get(rec.cueId),asset=byAsset.get(rec.assetId);
 assert.ok(source&&asset,"Icon-only rubric must link an exact source event and approved original");
 assert.equal(source.actor,"PRIEST");
 assert.equal(source.label,rec.action,"Wrong ceremonial phase for icon-only rubric "+id);
 assert.equal(source.cueId,rec.cueId);
 if(chosen?.assetId){
  assert.equal(chosen.assetId,rec.assetId);
  assert.equal(chosen.runtimeAssetKey,rec.iconKey);
 }else{
  assert.ok(["AO.SM.C0068","AO.SM.C0079","AO.SM.C0104","AO.SM.C0262"].includes(rec.cueId),
   "Unreviewed action alias not allowed: "+rec.cueId);
 }
 assert.ok(!asset.rejected&&["approved","repurposed"].includes(asset.status));
 const state={mode:"LIVE",cueId:rec.cueId,priestActionIconKey:rec.iconKey,
   iconResolved:true,priestActionLabel:rec.action};
 assert.equal(exactIconBackedRubric(id,state),rec);
 for(const bad of [
   {...state,mode:"MISSAL"},{...state,mode:"SIMPLE"},
   {...state,cueId:"AO.SM.C0001"},
   {...state,iconResolved:false},
   {...state,priestActionIconKey:"priest_audible"},
   {...state,priestActionLabel:"GENUFLECTS"},
 ]){
   assert.equal(exactIconBackedRubric(id,bad),null,
     "Exact source rubric was suppressed without matching active pictogram: "+id);
 }
}
for(const x of rubric.filter(x=>!EXACT_ICON_BACKED_LIVE_RUBRICS[x.id])){
 assert.equal(exactIconBackedRubric(x.id,{mode:"LIVE",cueId:x.cueId,
   priestActionIconKey:x.iconKey,iconResolved:true,priestActionLabel:x.label}),null,
  "Source rubric without exact user-approved icon was silently suppressed: "+x.id);
}
assert.ok(!Object.keys(EXACT_ICON_BACKED_LIVE_RUBRICS).some(id=>id.includes("C0265")),
 "Final blessing must not acquire a substitute by word matching");
console.log("Eight exact LIVE rubric/icon equivalences certified; other 49 source rubrics preserved.");
