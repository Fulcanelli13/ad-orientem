import assert from "node:assert/strict";
import {normalizeScholaLocalProgramme,readScholaLocalProgramme,updateScholaLocalProgramme,
 applyScholaLocalProgramme,SCHOLA_OPTIONAL_EVENT_IDS} from "../src/mass/reader-schola-local-programme.js";
const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
const empty=readScholaLocalProgramme(storage);
assert.equal(empty.parishLabel,"");
assert.equal(empty.observedSinging,false);
assert.equal(SCHOLA_OPTIONAL_EVENT_IDS.length,5);
let local=updateScholaLocalProgramme(empty,{kind:"parishLabel",value:"Saint Joseph's Oratory"},storage);
local=updateScholaLocalProgramme(local,{kind:"eventSelected",eventId:"OFFERTORY_LOCAL_MOTET",value:true},storage);
local=updateScholaLocalProgramme(local,{kind:"eventTitle",eventId:"OFFERTORY_LOCAL_MOTET",value:"Ave verum corpus"},storage);
local=updateScholaLocalProgramme(local,{kind:"eventSelected",eventId:"OFFERTORY_ORGAN_OPTION",value:true},storage);
assert.equal(readScholaLocalProgramme(storage).parishLabel,"Saint Joseph's Oratory");
assert.equal(readScholaLocalProgramme(storage).choices.OFFERTORY_LOCAL_MOTET.title,"Ave verum corpus");
assert.equal(readScholaLocalProgramme(storage).choices.OFFERTORY_LOCAL_MOTET.selected,true);
assert.equal(readScholaLocalProgramme(storage).observedSinging,false);
const before=data.size;
local=updateScholaLocalProgramme(local,{kind:"eventSelected",eventId:"SANCTUS",value:true},storage);
assert.equal(data.size,before);
assert.equal(local.choices.SANCTUS,undefined,"Ordinary core may never become optional by local choice");
local=updateScholaLocalProgramme(local,{kind:"eventTitle",eventId:"OFFERTORY_LOCAL_MOTET",value:"Z".repeat(200)},storage);
assert.equal(local.choices.OFFERTORY_LOCAL_MOTET.title.length,80);
assert.equal(normalizeScholaLocalProgramme({choices:{NEW_UNTRUSTED:{selected:true}}}).choices.NEW_UNTRUSTED,undefined);
const itinerary={supported:true,events:[
 {id:"OFFERTORY_LOCAL_MOTET",kind:"LOCAL_OPTION",status:"LOCAL_PROGRAMME_UNCONFIRMED"},
 {id:"OFFERTORY_ORGAN_OPTION",kind:"ORGAN_OPTION",organPermission:{status:"SOLO_FORBIDDEN"}},
 {id:"SANCTUS",kind:"CHANT",label:"Sanctus"}]};
const filtered=applyScholaLocalProgramme(itinerary,local);
assert.equal(filtered.events[0].localPlan.status,"SELECTED_NOT_OBSERVED");
assert.equal(filtered.events[0].localPlan.title,"Z".repeat(80));
assert.equal(filtered.events[1].localPlan.status,"SELECTED_BUT_NOT_PERMITTED");
assert.equal(filtered.events[2],itinerary.events[2]);
assert.equal(filtered.events[0].status,"LOCAL_PROGRAMME_UNCONFIRMED");
assert.equal(itinerary.events[0].localPlan,undefined);
assert.equal(filtered.localProgrammeStatus,"PERSONAL_PLAN_NOT_PERFORMANCE");
assert.equal(applyScholaLocalProgramme({supported:false},local).supported,false);
console.log("PASS saved local programme, five optional event IDs, no ritual overrides, organ prohibition remains visible");
