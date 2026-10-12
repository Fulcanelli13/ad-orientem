import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../data/"+p,import.meta.url),"utf8"));
const data=read("mass/ritus-1962-faithful-posture-classification-batch04.v1.json");
const src=read("presentation/reader-postures.v1.json");
assert.equal(data.items.length,23);
assert.equal(src.items.length,23);
assert.equal(data.defaultPolicy,"FOLLOW_CONGREGATION_OBSERVATIONAL");
const byId=new Map(src.items.map(x=>[x.id,x]));
for(const x of data.items){
 const original=byId.get(x.eventId);
 assert(original,"lost original posture "+x.eventId);
 assert.equal(x.cueId,original.cueId);
 assert.equal(x.anchorRef,original.anchorRef);
 assert.equal(x.posture,original.posture);
 assert.equal(x.condition,original.condition);
 assert.equal(x.isUniversal1962Obligation,false);
 assert.equal(x.originalOwner,"data/presentation/reader-postures.v1.json");
 if(["VISIBLE_STATE","PRIEST_STATE"].includes(x.anchorType)){
  assert.equal(x.requiresObservedState,true,"non-text state invented as a cue");
 }
 if(x.authority==="C1")assert.equal(x.profileClass,"LOCAL_CUSTOM");
}
assert.equal(data.items.filter(x=>x.profileClass==="LOCAL_CUSTOM").length,5);
assert.equal(data.items.filter(x=>x.requiresObservedState).length,5);
const check=(id,anchorRef)=>assert.equal(data.items.find(x=>x.eventId===id).anchorRef,anchorRef);
check("AO.SM.POST.013","PEOPLE_INCENSATION_START");
check("AO.SM.POST.014","PEOPLE_INCENSATION_END");
assert.equal(data.items.find(x=>x.eventId==="AO.SM.POST.017").reviewStatus,"LOCAL_PROFILE_ONLY");
console.log("PASS 1962 faithful posture classification: 23 current cues, 5 local custom, 5 visible-state guards, no invented obligation.");
