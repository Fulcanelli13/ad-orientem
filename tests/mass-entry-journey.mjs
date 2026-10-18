import assert from "node:assert/strict";
import {multipleMassNotice,groupCeremonialPhases,updateMassJourneyObserved,projectMassEntryLaunch,projectMassEntryEssentials,projectMassEntryReader,projectMassEntryDetails} from "../src/mass/mass-entry-journey.js";
import {retireLegacyMassChoiceGrids} from "../src/mass/legacy-mass-choice-visibility.js";
import {prayerJourneyMode,commitPrayerJourneyMode,renderPrayerJourneyModes} from "../src/mass/prayer-journey-modes.js";
import {projectAdjacentServices,toggleAdjacentService} from "../src/mass/adjacent-service-context.js";

const christmas={date:"2026-12-25",celebrationId:"mass_of_day",canStart:false};
const souls={date:"2026-11-02",celebrationId:"mass_of_day",canStart:false};
const regular={date:"2026-10-18",celebrationId:"mass_of_day",canStart:true};

const en=multipleMassNotice(christmas,{language:"en",kind:"CALENDAR"});
assert.equal(en.id,"CHRISTMAS");
assert.deepEqual(en.options.map(x=>x.id),["NIGHT","DAWN","DAY"]);
assert.match(en.options[1].detail,/Anastasia/);
assert.match(en.options[2].detail,/Last Gospel is omitted/);
assert.doesNotMatch(JSON.stringify(en),/"selectedProper"/);
const fr=multipleMassNotice(christmas,{language:"fr",kind:"CALENDAR"});
assert.equal(fr.id,"CHRISTMAS");
assert.deepEqual(fr.options.map(x=>x.id),["NIGHT","DAWN","DAY"]);
assert.match(fr.options[0].label,/nuit/);
assert.match(fr.options[1].detail,/Anastasie/);
const allSoulsLow=multipleMassNotice(souls,{kind:"CALENDAR",form:"LOW"});
const allSoulsSung=multipleMassNotice(souls,{kind:"REQUIEM",form:"SOLEMN"});
assert.equal(allSoulsLow.id,"ALL_SOULS");
assert.deepEqual(allSoulsLow.options.map(x=>x.id),["FIRST","SECOND","THIRD"]);
assert.match(allSoulsLow.caveat,/if two, the first and second/);
assert.match(allSoulsSung.caveat,/first formulary is prescribed/);
assert.match(multipleMassNotice(souls,{kind:"REQUIEM",form:"MISSA_CANTATA_INCENSE",language:"fr"}).caveat,/premier formulaire/);
assert.equal(multipleMassNotice(regular,{kind:"CALENDAR"}),null);
assert.equal(multipleMassNotice(christmas,{kind:"VOTIVE"}),null);
assert.deepEqual(christmas,{date:"2026-12-25",celebrationId:"mass_of_day",canStart:false},
 "Multiple-Mass informational notices must not alter the Mass selected by the resolver");
console.log("PASS chronological Mass entry contextual notices (EN/FR), no invented selected Proper");

// Source-stage ownership: these phase IDs are labels produced by the existing
// special Mass resolver. Never reinterpret them as an automatic rite choice.
const project=(kind,ids,available=[])=>groupCeremonialPhases(
 {kind,phases:ids.map(id=>({id,label:id}))},available);
const ids=groups=>Object.fromEntries(["before","during","after","unplaced","omitted"].map(
 key=>[key,groups[key].map(x=>x.id)]));
assert.deepEqual(ids(project("CALENDAR",["palm","mass","corpus"])),{
 before:["palm"],during:[],after:["corpus"],unplaced:[],omitted:["mass"]});
assert.deepEqual(ids(project("EASTER_VIGIL",["ev-light","ev-lessons","ev-mass","ev-lauds"])),{
 before:["ev-light","ev-lessons"],during:[],after:["ev-lauds"],unplaced:[],omitted:["ev-mass"]});
assert.deepEqual(ids(project("GOOD_FRIDAY",["gf-lessons","gf-orations","gf-cross","gf-communion"])),{
 before:[],during:["gf-lessons","gf-orations","gf-cross","gf-communion"],after:[],
 unplaced:[],omitted:[]});
assert.deepEqual(ids(project("REQUIEM",["req","absolution"],["REQUIEM_ABSOLUTION"])),{
 before:[],during:["req"],after:[],unplaced:[],omitted:["absolution"]});
assert.deepEqual(ids(project("CALENDAR",["new-unknown-rite"])),{
 before:[],during:[],after:[],unplaced:["new-unknown-rite"],omitted:[]});

// Only explicitly identified historical controls may be hidden; neither
// the owner nor any field/input state is modified.
const element=selector=>({
 hidden:false,style:{},dataset:{},
 querySelector:()=>selector?{}:null,
 previousElementSibling:null
});
const historical=element(true);
historical.previousElementSibling={
 classList:{contains:x=>x==="aoFlowSection"},style:{},hidden:false,dataset:{}
};
const unrelated=element(false);
const host={querySelectorAll:()=>[historical,unrelated]};
const preflight={isConnected:true,contains:()=>false};
assert.equal(retireLegacyMassChoiceGrids(host,preflight).retired,1);
assert.equal(historical.hidden,true);
assert.equal(historical.previousElementSibling.hidden,true);
assert.equal(unrelated.hidden,false);
assert.equal(retireLegacyMassChoiceGrids(host,{...preflight,isConnected:false}).retired,0);
console.log("PASS chronological phase ownership + scoped legacy-control retirement");


const observationNode={hidden:true,textContent:""};
const observationRoot={dataset:{},querySelector:()=>observationNode};
assert.equal(updateMassJourneyObserved(observationRoot,{
 sourceDiagnostics:{actualMassSelection:"OBSERVED_SOURCE_DAY"}
},{language:"fr"}),true);
assert.match(observationNode.textContent,/autorisation rubricale/);
assert.equal(observationNode.hidden,false);
assert.equal(updateMassJourneyObserved(observationRoot,{},{}),false);
assert.equal(observationNode.hidden,true);
console.log("PASS observed Mass provenance visible only when user reports a different Proper");


// Before/after Eucharistic services are explicit, session-only observations,
// never aliases for in-Mass ceremonial rites or a transferred Proper.
const choices=toggleAdjacentService(
 toggleAdjacentService({},"ADORATION_BEFORE",true),"BENEDICTION_AFTER",true);
assert.deepEqual(projectAdjacentServices(choices,"en").before.map(x=>x.id),["ADORATION_BEFORE"]);
assert.deepEqual(projectAdjacentServices(choices,"en").after.map(x=>x.id),["BENEDICTION_AFTER"]);
assert.match(projectAdjacentServices(choices,"fr").after[0].label,/Bénédiction après/);
assert.equal(projectAdjacentServices(choices,"en").before[0].service,"ADORATION");
assert.deepEqual(projectAdjacentServices({},"en"),{before:[],after:[]});
assert.equal(toggleAdjacentService(choices,"ADORATION_BEFORE",false).ADORATION_BEFORE,false);
assert.throws(()=>toggleAdjacentService({},"ASPERGES",true),/UNKNOWN_ADJACENT_SERVICE/);
assert.throws(()=>toggleAdjacentService({},"ADORATION_BEFORE","yes"),/NOT_BOOLEAN/);
assert.deepEqual(Object.keys(choices).sort(),["ADORATION_BEFORE","BENEDICTION_AFTER"],
 "A separate service selection must never introduce a Mass rite into the plan");
console.log("PASS user-confirmed independent services, before/after, EN/FR and fail-closed ID checks");


// Canonical prayer modes are the store's quick / standard / full settings.
// Do not invent 5-minute or 30-minute durations where none is guaranteed.
assert.equal(prayerJourneyMode("quick"),"quick");
assert.equal(prayerJourneyMode("full"),"full");
assert.equal(prayerJourneyMode("invalid"),"standard");
const prayerState={prepare:{mode:"standard"},thanksgiving:{mode:"quick"}};
const actions=[];
const mockStore={getState:()=>prayerState,dispatch(action){
 actions.push(action);
 if(action.type==="prepare-mode")prayerState.prepare.mode=action.mode;
 if(action.type==="thanksgiving-mode")prayerState.thanksgiving.mode=action.mode;
}};
assert.equal(commitPrayerJourneyMode(mockStore,"prepare","full"),true);
assert.deepEqual(actions[0],{type:"prepare-mode",mode:"full"});
assert.equal(commitPrayerJourneyMode(mockStore,"thanksgiving","standard"),true);
assert.deepEqual(actions[1],{type:"thanksgiving-mode",mode:"standard"});
assert.equal(commitPrayerJourneyMode(mockStore,"prepare","full"),true);
assert.equal(actions.length,2,"An unchanged prayer mode must not dispatch redundant actions");
assert.equal(commitPrayerJourneyMode(mockStore,"other","standard"),false);
assert.equal(commitPrayerJourneyMode(mockStore,"prepare","fake"),false);
assert.equal(commitPrayerJourneyMode({getState:()=>prayerState,dispatch() {}},"prepare","quick"),false,
 "The UI must not claim a new choice if the canonical store refused it");
const radios=["quick","standard","full"].flatMap(mode=>
 ["prepare","thanksgiving"].map(phase=>({
  value:mode,dataset:{massJourneyPrayerPhase:phase},
  checked:false,span:{textContent:""},closest(){return {querySelector:()=>this.span}}
 })));
const prayerRoot={querySelectorAll:()=>radios,querySelector:()=>null};
assert.deepEqual(renderPrayerJourneyModes(prayerRoot,{
 prepare:"full",thanksgiving:"quick",language:"fr"
}),{prepare:"full",thanksgiving:"quick"});
assert.equal(radios.find(x=>x.value==="full"&&x.dataset.massJourneyPrayerPhase==="prepare").checked,true);
assert.equal(radios.find(x=>x.value==="quick"&&x.dataset.massJourneyPrayerPhase==="thanksgiving").checked,true);
assert.equal(radios.find(x=>x.value==="full"&&x.dataset.massJourneyPrayerPhase==="prepare").span.textContent,"Approfondie");
console.log("PASS canonical pre/post-Mass short/standard/extended preferences with store verification and French projection");


// A more prominent native Start button must remain a *proxy*, not a new
// source of truth. The source Proper and host action both retain veto power.
const beginControl={disabled:false,textContent:""};
const beginHelp={hidden:true,textContent:""};
const formTitle={textContent:""};
const launchRoot={dataset:{},querySelector:q=>({
 "[data-mass-journey-start]":beginControl,
 "[data-mass-journey-start-help]":beginHelp,
 "[data-mass-journey-form-summary]":formTitle
}[q]??null)};
assert.deepEqual(projectMassEntryLaunch(launchRoot,{
 ready:true,sourceReady:true,hostStartAvailable:true,
 formLabel:"Missa Cantata · incense",language:"en"
}),{ready:true,reason:null});
assert.equal(beginControl.disabled,false);
assert.match(formTitle.textContent,/Missa Cantata/);
assert.deepEqual(projectMassEntryLaunch(launchRoot,{
 ready:true,sourceReady:false,hostStartAvailable:true,language:"fr"
}),{ready:false,reason:"SOURCE_PENDING"});
assert.equal(beginControl.disabled,true);
assert.equal(beginHelp.hidden,false);
assert.match(beginHelp.textContent,/propre/);
assert.deepEqual(projectMassEntryLaunch(launchRoot,{
 ready:true,sourceReady:true,hostStartAvailable:false,language:"en"
}),{ready:false,reason:"HOST_UNAVAILABLE"});
assert.deepEqual(projectMassEntryLaunch(launchRoot,{
 ready:false,sourceReady:true,hostStartAvailable:true,language:"en"
}),{ready:false,reason:"MASS_PENDING"});
assert.equal(projectMassEntryLaunch(launchRoot,{
 ready:true,sourceReady:true,hostStartAvailable:true,distinctLiturgy:true
}).ready,true);
assert.match(beginControl.textContent,/liturgy/);
console.log("PASS primary Start proxy respects actual Proper, host readiness, and Good Friday distinct liturgy");

 
// V6 contract: keep ordinary Mass uncluttered; reveal only observed, confirmed
// special rites; preserve independent, explicit reader and source selection.
const fakeDoc={createElement(tag){return {tag,textContent:"",className:"",dataset:{}}}};
const essenceList={nodes:[],replaceChildren(){this.nodes=[]},append(x){this.nodes.push(x)}};
const essenceKicker={textContent:""};
const essence={hidden:false,ownerDocument:fakeDoc,
 querySelector:sel=>sel==="[data-mass-journey-essential-list]"?essenceList:
 sel===".aoMassJourneyEssentialKicker"?essenceKicker:null};
const modeSummary={textContent:""},detailsSummary={textContent:""};
const uxRoot={querySelector:sel=>({
 "[data-mass-journey-essential]":essence,
 "[data-mass-journey-reader-summary]":modeSummary,
 "[data-mass-journey-order]>.aoMassJourneyHeading":detailsSummary
}[sel]??null)};
assert.equal(projectMassEntryEssentials(uxRoot,{kind:"CALENDAR",phases:[{id:"mass",label:"The Mass"}]},
 {kind:"CALENDAR"}).count,0);
assert.equal(essence.hidden,true,
 "An ordinary Mass must not introduce an invented ceremony card");
const gfView=projectMassEntryEssentials(uxRoot,{
 kind:"GOOD_FRIDAY",phases:[
  {id:"gf-lessons",label:"Lessons"},
  {id:"gf-cross",label:"Veneration of the Cross"},
  {id:"gf-communion",label:"Holy Communion"}
 ]},{kind:"GOOD_FRIDAY",language:"fr"});
assert.equal(essence.hidden,false);
assert.equal(gfView.count,3);
assert.equal(gfView.shown,3);
assert.match(essenceKicker.textContent,/OFFICE SOLENNEL/);
assert.deepEqual(essenceList.nodes.map(x=>x.textContent),[
 "Lessons","Veneration of the Cross","Holy Communion"
]);
assert.equal(projectMassEntryEssentials(uxRoot,{
 kind:"CALENDAR",phases:[{id:"asperges",label:"Aspersion"}]
},{availableRiteIds:["ASPERGES"],kind:"CALENDAR"}).count,0,
 "An unconfirmed optional rite must not be presented as observed");
assert.deepEqual(projectMassEntryEssentials(uxRoot,{
 kind:"CALENDAR",phases:[{id:"asperges",label:"Aspersion"}]
},{availableRiteIds:["ASPERGES"],confirmedRites:[{label:"Asperges"}]}).labels,["Asperges"]);
assert.deepEqual(projectMassEntryReader(uxRoot,{mode:"MISSAL",language:"fr"}),{
 mode:"MISSAL",label:"Missel"
});
assert.match(modeSummary.textContent,/Suivre la messe · Missel/);
assert.deepEqual(projectMassEntryReader(uxRoot,{mode:"LIVE",language:"en",distinct:true}),{
 mode:"LIVE",label:"LIVE"
});
assert.match(modeSummary.textContent,/Follow the liturgy/);
assert.equal(projectMassEntryDetails(uxRoot,{
 kind:"CALENDAR",optionCount:0,language:"en"
}).label,"Celebration details");
assert.match(projectMassEntryDetails(uxRoot,{
 kind:"CALENDAR",optionCount:2,language:"en"
}).label,/2 optional rites/);
assert.match(projectMassEntryDetails(uxRoot,{
 kind:"GOOD_FRIDAY",optionCount:0,language:"fr"
}).label,/Vendredi saint/);
console.log("PASS V6 simple-entry hierarchy, source-present rites only, reader preference and optional rite disclosures");
