import assert from "node:assert/strict";
import {normalizeScholaLocalProgramme,readScholaLocalProgramme,updateScholaLocalProgramme,
 applyScholaLocalProgramme,SCHOLA_OPTIONAL_EVENT_IDS} from "../src/mass/reader-schola-local-programme.js";
import {KYRIALE_MASSES,KYRIALE_CREDOS,KYRIALE_SOURCE,
 kyrialeChoicesForMovement,resolveKyrialeChoice} from "../src/mass/reader-kyriale-catalogue.js";
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

// A v1 user starts with the exact same preferences; the first edit creates
// v2 without deleting the original local-programme storage key.
const oldStore=new Map([[ "ao-schola-local-programme-v1", JSON.stringify({
 parishLabel:"Historical parish",
 choices:{COMMUNION_LOCAL_MOTET:{selected:true,title:"O salutaris"}}
}) ]]);
const oldStorage={getItem:k=>oldStore.get(k),setItem:(k,v)=>oldStore.set(k,v)};
const migrated=readScholaLocalProgramme(oldStorage,"POLYPHONIC");
assert.equal(migrated.parishLabel,"Historical parish");
assert.equal(migrated.choices.COMMUNION_LOCAL_MOTET.title,"O salutaris");
assert.equal(migrated.sanctusPerformance,"POLYPHONIC");
assert.equal(oldStore.has("ao-schola-profile-library-v2"),false);
let library=updateScholaLocalProgramme(migrated,{kind:"ordinarySetting",
 eventId:"CREDO",value:"Credo III"},oldStorage);
assert.equal(library.ordinarySettings.CREDO,"Credo III");
assert.equal(oldStore.has("ao-schola-profile-library-v2"),true);
assert.equal(library.profiles.length,1);
library=updateScholaLocalProgramme(library,{kind:"profileCreate",value:"Solemn Sunday"},oldStorage);
assert.equal(library.profiles.length,2);
assert.equal(library.parishLabel,"","New profile must not inherit first parish");
assert.equal(library.choices.COMMUNION_LOCAL_MOTET.selected,false);
assert.equal(library.ordinarySettings.CREDO,"");
assert.equal(library.sanctusPerformance,"UNSPECIFIED");
const newId=library.activeProfileId;
library=updateScholaLocalProgramme(library,{kind:"ordinarySetting",
 eventId:"KYRIE",value:"Mass VIII"},oldStorage);
library=updateScholaLocalProgramme(library,{kind:"ordinarySetting",
 eventId:"SANCTUS_BENEDICTUS",value:"Polyphonic Mass"},oldStorage);
library=updateScholaLocalProgramme(library,{kind:"sanctusPerformance",
 value:"POLYPHONIC"},oldStorage);
library=updateScholaLocalProgramme(library,{kind:"profileRename",value:"Solemn Sunday choir"},oldStorage);
assert.equal(library.profiles.find(p=>p.id===newId).name,"Solemn Sunday choir");
assert.equal(library.sanctusPerformance,"POLYPHONIC");
assert.equal(library.ordinarySettings.KYRIE,"Mass VIII");
assert.equal(library.ordinarySettings.SANCTUS_BENEDICTUS,"Polyphonic Mass");
library=updateScholaLocalProgramme(library,{kind:"profileSelect",value:"p1"},oldStorage);
assert.equal(library.parishLabel,"Historical parish");
assert.equal(library.ordinarySettings.CREDO,"Credo III");
assert.equal(library.sanctusPerformance,"POLYPHONIC");
library=updateScholaLocalProgramme(library,{kind:"profileSelect",value:newId},oldStorage);
assert.equal(library.ordinarySettings.KYRIE,"Mass VIII");
assert.equal(readScholaLocalProgramme(oldStorage).activeProfileId,newId);
assert.equal(readScholaLocalProgramme(oldStorage).ordinarySettings.KYRIE,"Mass VIII");
assert.equal(JSON.parse(oldStore.get("ao-schola-local-programme-v1")).schema,
 "ao-schola-local-programme-v1","v1 mirror must still be readable");
const beforeInvalid=oldStore.get("ao-schola-profile-library-v2");
for(const invalid of [{kind:"ordinarySetting",eventId:"CANON",value:"No"},
 {kind:"profileSelect",value:"missing"},
 {kind:"sanctusPerformance",value:"IMPROVISED"},
 {kind:"profileCreate",value:"    "}]) {
 library=updateScholaLocalProgramme(library,invalid,oldStorage);
 assert.equal(oldStore.get("ao-schola-profile-library-v2"),beforeInvalid);
}
const sourceOnly={supported:true,events:[
 {id:"KYRIE",kind:"CHANT",trackId:"KYRIE",label:"Kyrie"},
 {id:"SANCTUS",kind:"CHANT",trackId:"SANCTUS_BENEDICTUS",label:"Sanctus"},
 {id:"OFFERTORY_ORGAN_OPTION",kind:"ORGAN_OPTION",
  organPermission:{status:"SOLO_FORBIDDEN"}}]};
const labelled=applyScholaLocalProgramme(sourceOnly,library);
assert.equal(labelled.events[0].localOrdinary.title,"Mass VIII");
assert.equal(labelled.events[0].localOrdinary.observed,false);
assert.equal(labelled.events[1].localOrdinary.title,"Polyphonic Mass");
assert.equal(labelled.events[1].trackId,"SANCTUS_BENEDICTUS",
 "Local title must never rewrite Gregorian source track");
assert.equal(labelled.events[2].organPermission.status,"SOLO_FORBIDDEN");
assert.equal(sourceOnly.events[0].localOrdinary,undefined);
library=updateScholaLocalProgramme(library,{kind:"profileDelete"},oldStorage);
assert.equal(library.profiles.length,1);
assert.equal(library.ordinarySettings.CREDO,"Credo III");
const unchanged=oldStore.get("ao-schola-profile-library-v2");
library=updateScholaLocalProgramme(library,{kind:"profileDelete"},oldStorage);
assert.equal(oldStore.get("ao-schola-profile-library-v2"),unchanged);
assert.equal(library.profiles.length,1);
// Malformed profile payloads cannot inject unrecognised setting IDs or
// corrupt profile selectors.
assert.equal(normalizeScholaLocalProgramme({profiles:[
 {id:"x",name:"Invalid",ordinarySettings:{CANON:"bad"}},
 {id:"p4",name:"Safe",ordinarySettings:{CREDO:"Credo I",CANON:"bad"}},
 {id:"p4",name:"Duplicated"}]}).profiles.length,1);
assert.equal(normalizeScholaLocalProgramme({profiles:[
 {id:"p4",name:"Safe",ordinarySettings:{CREDO:"Credo I",CANON:"bad"}}
]}).ordinarySettings.CANON,undefined);


// Source-indexed selections identify historical melodies, not performance.
// Each movement is independently chosen; Gloria is absent from Masses XVI–XVIII.
assert.equal(KYRIALE_MASSES.length,18);
assert.equal(KYRIALE_CREDOS.length,6);
assert.equal(new Set([...KYRIALE_MASSES,...KYRIALE_CREDOS].map(c=>c.id)).size,24);
assert.equal(kyrialeChoicesForMovement("KYRIE").length,18);
assert.equal(kyrialeChoicesForMovement("GLORIA").length,15);
assert.equal(kyrialeChoicesForMovement("SANCTUS_BENEDICTUS").length,18);
assert.equal(kyrialeChoicesForMovement("AGNUS_DEI").length,18);
assert.equal(kyrialeChoicesForMovement("CREDO").length,6);
assert.equal(resolveKyrialeChoice("GLORIA","MASS_17"),null);
assert.equal(resolveKyrialeChoice("CREDO","MASS_08"),null);
assert.equal(resolveKyrialeChoice("KYRIE","CREDO_03"),null);
assert.equal(resolveKyrialeChoice("KYRIE","MASS_08")?.title,"Mass VIII · De Angelis");
assert.equal(resolveKyrialeChoice("CREDO","CREDO_06")?.title,"Credo VI");
assert.ok(KYRIALE_SOURCE.url.endsWith("/pdf/kyriale.pdf"));
assert.equal(KYRIALE_MASSES[7].scoreEncoded,false);

// A legacy free-text label is NEVER automatically promoted to source-edition
// verified status, even when the words happen to match a catalogue entry.
let provenance=normalizeScholaLocalProgramme({
 ordinarySettings:{KYRIE:"Mass VIII",CREDO:"Credo III"}
});
assert.equal(provenance.ordinarySelections.KYRIE,"");
assert.equal(provenance.ordinarySelections.CREDO,"");
const prior=applyScholaLocalProgramme({supported:true,events:[
 {id:"KYRIE",trackId:"KYRIE",kind:"CHANT"}]},provenance);
assert.equal(prior.events[0].localOrdinary.status,"PERSONAL_UNVERIFIED_SETTING");
provenance=updateScholaLocalProgramme(provenance,
 {kind:"ordinarySelection",eventId:"KYRIE",value:"MASS_08"},storage);
assert.equal(provenance.ordinarySelections.KYRIE,"MASS_08");
assert.equal(provenance.ordinarySettings.KYRIE,"Mass VIII · De Angelis");
provenance=updateScholaLocalProgramme(provenance,
 {kind:"ordinarySelection",eventId:"CREDO",value:"CREDO_03"},storage);
assert.equal(readScholaLocalProgramme(storage).ordinarySelections.CREDO,"CREDO_03");
const verified=applyScholaLocalProgramme({supported:true,events:[
 {id:"KYRIE",trackId:"KYRIE",kind:"CHANT"},
 {id:"CREDO",trackId:"CREDO",kind:"CHANT"}]},provenance);
assert.equal(verified.events[0].localOrdinary.status,"SOURCE_EDITION_INDEXED_NOT_OBSERVED");
assert.equal(verified.events[0].localOrdinary.catalogueId,"MASS_08");
assert.equal(verified.events[0].localOrdinary.sourceUrl,KYRIALE_SOURCE.url);
assert.equal(verified.events[0].localOrdinary.observed,false);
assert.equal(verified.events[1].localOrdinary.catalogueId,"CREDO_03");
const beforeWrong=data.get("ao-schola-profile-library-v2");
provenance=updateScholaLocalProgramme(provenance,
 {kind:"ordinarySelection",eventId:"GLORIA",value:"MASS_17"},storage);
assert.equal(data.get("ao-schola-profile-library-v2"),beforeWrong,
 "Denied musical item must not be saved to profile");
provenance=updateScholaLocalProgramme(provenance,
 {kind:"ordinarySetting",eventId:"KYRIE",value:"Custom polyphonic Kyrie"},storage);
assert.equal(provenance.ordinarySelections.KYRIE,"");
assert.equal(provenance.ordinarySettings.KYRIE,"Custom polyphonic Kyrie");
assert.equal(applyScholaLocalProgramme({supported:true,events:[
 {id:"KYRIE",trackId:"KYRIE",kind:"CHANT"}]},provenance)
 .events[0].localOrdinary.status,"PERSONAL_UNVERIFIED_SETTING");
provenance=updateScholaLocalProgramme(provenance,
 {kind:"ordinarySelection",eventId:"CREDO",value:"CUSTOM"},storage);
assert.equal(provenance.ordinarySettings.CREDO,"Credo III",
 "Switching to custom must retain the existing printed label");
assert.equal(provenance.ordinarySelections.CREDO,"");
assert.equal(normalizeScholaLocalProgramme({profiles:[
 {id:"p1",ordinarySettings:{KYRIE:"Mass VIII"},ordinarySelections:{KYRIE:"MASS_08",GLORIA:"MASS_17"}}
]}).ordinarySelections.GLORIA,"","Invalid persisted movement ID must be discarded");
assert.equal(readScholaLocalProgramme(storage).observedSinging,false);

console.log("PASS saved local programme, five optional event IDs, no ritual overrides, organ prohibition remains visible");
