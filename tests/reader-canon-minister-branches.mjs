import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 validateCanonMinisterFormBranches,createCanonMinisterFormReviewController,
} from "../src/mass/reader-canon-minister-branches.js";
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const data=load("../data/research/mass-canon-minister-form-branches-20261013.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const low=load("../data/presentation/reader-text-low.v1.json");
const ids=new Set(sung.blocks.flatMap(b=>(b.units??[]).map(u=>u.cue_id)));
assert.deepEqual([validateCanonMinisterFormBranches(data).ministerCandidateCount,
 validateCanonMinisterFormBranches(data).deaconCount,
 validateCanonMinisterFormBranches(data).thuriferCount],[11,9,2]);
for(const event of data.branches){
 assert.ok(ids.has(event.cueId),event.id+" cannot invent 1962 source cues");
 assert.equal(event.publication,"RESEARCH_REVIEW_NOT_LIVE");
}
const lowAmen=low.blocks.flatMap(b=>b.units??[]).find(x=>x.cue_id==="AO.SM.C0207");
const sungAmen=sung.blocks.flatMap(b=>b.units??[]).find(x=>x.cue_id==="AO.SM.C0207");
assert.equal(lowAmen.clock,data.respondentAtC0207.low.sourceClock);
assert.equal(sungAmen.clock,data.respondentAtC0207.sung.sourceClock);

const ctl=createCanonMinisterFormReviewController({data});
assert.equal(ctl.project("AO.SM.C0174").ministerActions.length,0,
 "No source-backed editorial minister candidates must leak to default reader");
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const host=ctl.project("AO.SM.C0174",{form,editorialPreview:true});
 const chalice=ctl.project("AO.SM.C0181",{form,editorialPreview:true});
 const count=form==="SOLEMN"?2:form==="MISSA_CANTATA_INCENSE"?1:0;
 assert.equal(host.ministerActions.length,count,form+" host actor qualification");
 assert.equal(chalice.ministerActions.length,form==="SOLEMN"?3:count,
   form+" chalice actor qualification");
 assert.ok(host.ministerActions.every(x=>!x.isObservedNow&&!x.publishable));
 assert.ok(chalice.ministerActions.every(x=>x.observedBy==="INDEPENDENT_MINISTER_EVENT_ONLY"));
 assert.equal(ctl.project("AO.SM.C0201",{form,editorialPreview:true}).ministerActions.length,
   form==="SOLEMN"?1:0,"No deacon in Missa Cantata or Low Mass");
 assert.equal(ctl.project("AO.SM.C0205",{form,editorialPreview:true}).ministerActions.length,
   form==="SOLEMN"?2:0);
 const response=ctl.project("AO.SM.C0207",{form,editorialPreview:true});
 assert.equal(response.respondentRole?.speakerRole,form==="LOW"?"MINISTERS":"RESPONDERS");
 assert.equal(response.respondentRole?.personalRoleResolved,false);
 assert.equal(response.canPublish,false);
}
const solemn=ctl.project("AO.SM.C0201",{form:"SOLEMN",editorialPreview:true});
assert.equal(solemn.ministerActions[0].conditionVerified,false,
 "when required must not be presumed true from form alone");
const explicit=ctl.project("AO.SM.C0201",{form:"SOLEMN",editorialPreview:true,
 observedMinisterActionIds:["AO.CANON.MIN.007"],conditionMatches:["AO.CANON.MIN.007"]});
assert.equal(explicit.ministerActions[0].conditionVerified,true);
assert.equal(explicit.ministerActions[0].isObservedNow,true);
assert.equal(explicit.ministerActions[0].publishable,false);
const observedWithoutCondition=ctl.project("AO.SM.C0201",{form:"SOLEMN",editorialPreview:true,
 observedMinisterActionIds:["AO.CANON.MIN.007"]});
assert.equal(observedWithoutCondition.ministerActions[0].isObservedNow,false,
 "An unverified conditional chalice action must not become currently observed");
const conclusion=ctl.project("AO.SM.C0205",{form:"SOLEMN",editorialPreview:true});
assert.deepEqual(conclusion.ministerActions.map(x=>[x.id,x.condition]).sort(),[
 ["AO.CANON.MIN.008","WHEN_REQUIRED"],
 ["AO.CANON.MIN.011","SOURCE_PRESCRIBED"],
],"Final genuflection is not contingent on pall handling");
const conclusionObserved=ctl.project("AO.SM.C0205",{form:"SOLEMN",editorialPreview:true,
 observedMinisterActionIds:["AO.CANON.MIN.008","AO.CANON.MIN.011"]});
assert.equal(conclusionObserved.ministerActions.find(x=>x.id.endsWith(".008")).isObservedNow,false);
assert.equal(conclusionObserved.ministerActions.find(x=>x.id.endsWith(".011")).isObservedNow,true);
const wrong=ctl.project("AO.SM.C0201",{form:"LOW",editorialPreview:true,
 observedMinisterActionIds:["AO.CANON.MIN.007"],conditionMatches:["AO.CANON.MIN.007"]});
assert.equal(wrong.ministerActions.length,0,"An observed Solemn deacon cannot appear in Low Mass");
assert.equal(ctl.project("AO.SM.C0174",{form:"REQUIEM",editorialPreview:true}).previewEnabled,false);
assert.equal(ctl.project("AO.SM.C0174",{form:"SUNG",editorialPreview:true}).ministerActions.length,0);
assert.equal(createCanonMinisterFormReviewController().supported,false);

const bad=structuredClone(data);bad.branches.find(x=>x.id==="AO.CANON.MIN.004").forms.push("MISSA_CANTATA_SIMPLE");
assert.throws(()=>validateCanonMinisterFormBranches(bad),/Uncertified minister/);
const wrongCue=structuredClone(data);wrongCue.branches[0].cueId="AO.SM.C0174";
assert.throws(()=>validateCanonMinisterFormBranches(wrongCue),/diverged/);
const released=structuredClone(data);released.branches[0].publication="PUBLISHED";
assert.throws(()=>validateCanonMinisterFormBranches(released),/Uncertified minister/);
console.log("PASS: 11 source-backed Canon minister branches, independent clocks, Solemn/Missa Cantata distinctions and Low/Sung respondent role.");
