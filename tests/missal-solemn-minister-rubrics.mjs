import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createReaderFormCueStateController} from "../src/mass/reader-form-state.js";
import {withCertifiedSolemnMissalMinisters} from "../src/mass/reader-missal-solemn-rubrics.js";
import {normalizeReaderMoment} from "../src/mass/reader-dom.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const formState=read("../data/presentation/reader-form-state.v1.json");
const sungCorpus=read("../data/presentation/reader-text-sung.v1.json");
const lowCorpus=read("../data/presentation/reader-text-low.v1.json");
const registries=Object.freeze({
 gestures:read("../data/presentation/reader-gestures.v1.json"),
 responses:read("../data/presentation/reader-responses.v1.json"),
 postures:read("../data/presentation/reader-postures.v1.json"),
 positions:read("../data/presentation/reader-priest-positions.v1.json"),
 voices:read("../data/presentation/reader-priest-voices.v1.json"),
 actions:read("../data/presentation/reader-priest-actions.v1.json"),
});
const make=(requiem=false)=>createReaderFormCueStateController({
 formStateData:formState,registries,sungCorpus,lowCorpus,
 prepared:{session:{resolvedMass:{form:"SOLEMN",overlays:requiem?["REQUIEM"]:[],
 actualCelebration:{type:requiem?"REQUIEM":"CALENDAR",id:requiem?"requiem":"ordinary"}}},
 readerPreferences:{mode:"MISSAL",language:"fr"}},
});
const plain=make(),dead=make(true);
const anchor=event=>event.cue??event.cueRange?.[0];
const mk=ids=>ids.map(id=>({id,sourceCueIds:[id],kind:"TEXT",primary:"Latine",secondary:"Translation"}));
const sources=[...new Set(formState.solemn.ministerEvents.map(anchor))];
assert.equal(formState.solemn.ministerEvents.length,19);
assert.equal(sources.length,19,"R18 owner must have nineteen distinct certified Missal anchors");
let ordinaryEn=withCertifiedSolemnMissalMinisters(mk(sources),{
 formStateData:formState,cueState:plain,form:"SOLEMN",language:"en"});
let ordinaryFr=withCertifiedSolemnMissalMinisters(mk(sources),{
 formStateData:formState,cueState:plain,form:"SOLEMN",language:"fr"});
assert.equal(ordinaryEn.length,19);
assert.equal(ordinaryEn.filter(x=>x.publishedMissalRubrics?.length).length,19,
 "All 19 R18 certified actions should be available at an ordinary Solemn Mass");
assert.equal(ordinaryFr.filter(x=>x.publishedMissalRubrics?.length).length,19);
for(let i=0;i<sources.length;i++){
 const en=ordinaryEn[i].publishedMissalRubrics[0],fr=ordinaryFr[i].publishedMissalRubrics[0];
 assert.equal(en.actor,formState.solemn.ministerEvents[i].actor);
 assert.equal(en.id,formState.solemn.ministerEvents[i].id);
 assert.match(en.sourceUrl,/ritus-servandus/);
 assert.equal(en.observedNow,false);
 assert.equal(en.sourceCueId,sources[i]);
 assert.ok(en.displayText.length>15 && fr.displayText.length>15 && en.displayText!==fr.displayText);
}
const deadEn=withCertifiedSolemnMissalMinisters(mk(sources),{
 formStateData:formState,cueState:dead,form:"SOLEMN",language:"en"});
const deadFr=withCertifiedSolemnMissalMinisters(mk(sources),{
 formStateData:formState,cueState:dead,form:"SOLEMN",language:"fr"});
const byId=(rows,id)=>rows.flatMap(x=>x.publishedMissalRubrics??[]).find(x=>x.id===id);
for(const id of ["SMIN-001","SMIN-002","SMIN-006","SMIN-012","SMIN-013"]){
 assert.equal(byId(deadEn,id),undefined,id+" was not suppressed at Requiem");
 assert.equal(byId(deadFr,id),undefined,id+" French rubric leaks into Requiem");
 assert.ok(byId(ordinaryEn,id),"Ordinary Solemn Mass suppressed "+id);
}
for(const id of ["SMIN-004","SMIN-007","SMIN-009","SMIN-010","SMIN-011"]){
 assert.ok(byId(deadEn,id));
 assert.notEqual(byId(deadEn,id).displayText,byId(ordinaryEn,id).displayText);
 assert.notEqual(byId(deadFr,id).displayText,byId(ordinaryFr,id).displayText);
}
assert.equal(deadEn.flatMap(x=>x.publishedMissalRubrics??[]).length,14);
for(const [id,object] of [["SMIN-010","Host"],["SMIN-011","Chalice"]]){
 assert.match(byId(deadEn,id)?.displayText??"",new RegExp("subdeacon.*incenses.*"+object,"i"));
 assert.match(byId(deadFr,id)?.displayText??"",/sous-diacre.*encense/i);
}
assert.ok(byId(deadEn,"SMIN-009"),"Requiem Offertory incense must remain permitted");
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]){
 const rows=mk(sources);
 const projected=withCertifiedSolemnMissalMinisters(rows,{formStateData:formState,cueState:plain,form});
 assert.ok(projected.every((x,i)=>x===rows[i]),"Non-Solemn Mass invented sacred minister instruction");
}
const noState=withCertifiedSolemnMissalMinisters(mk(sources),{formStateData:null,cueState:plain,form:"SOLEMN"});
assert.ok(noState.every(x=>!x.publishedMissalRubrics));
const synthetic=structuredClone(formState);
synthetic.solemn.ministerEvents[0].authorityStatus="RESEARCH_ONLY";
assert.ok(withCertifiedSolemnMissalMinisters(mk(sources),{
 formStateData:synthetic,cueState:plain,form:"SOLEMN"}).every(x=>!x.publishedMissalRubrics),
 "Research-only event must close entire R18 publication gate");
const wrongTime=mk(["AO.SM.C0121","AO.SM.C0124"]);
assert.equal(withCertifiedSolemnMissalMinisters(wrongTime,{
 formStateData:formState,cueState:plain,form:"SOLEMN"})
 .flatMap(x=>x.publishedMissalRubrics??[]).length,0,
 "Range event must not repeat at every cue");
const sourceOnly=mk(["AO.SM.C0076"]);
const v=withCertifiedSolemnMissalMinisters(sourceOnly,{
 formStateData:formState,cueState:dead,form:"SOLEMN",language:"fr"});
const norm=normalizeReaderMoment({paragraphs:v});
assert.equal(norm.paragraphs[0].publishedMissalRubrics[0].id,"SMIN-004");
assert.equal(norm.paragraphs[0].publishedMissalRubrics[0].observedNow,false);
assert.ok(Object.isFrozen(v) && Object.isFrozen(v[0].publishedMissalRubrics));
console.log("PASS 19 certified R18 Solemn minister Missal rubrics, bilingual EN/FR; 14 Requiem after XIII.2 initial incense exclusion, no invented Low/Sung actor, once-per-range, no reader clocks or research promotion.");
