import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectCurated65PriestStation} from "../src/mass/reader-priest-station65.js";
import {finalCurated65IconKeys,FINAL_65_CUE_ICON_KEYS} from "../src/mass/reader-final65-icon-keys.js";
import {iconKeysForReaderState} from "../src/mass/reader-icons.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const lock=read("../data/presentation/mass-icon-final-user-lock-20261020.v1.json");
const cross=read("../data/presentation/mass-icon-final-cue-crosswalk-20261020.v1.json");
const bank=new Map(lock.items.map(x=>[x.id,x]));
const rows=new Map(cross.rows.map(x=>[x.lane+"|"+x.cueId,x]));
const bindings=[
 ["faithful_gesture","faithfulGesture"],
 ["priest_action","priestAction"],
 ["priest_voice","priestVoice"]
];
let certified=0;
for(const [lane,name] of bindings){
 const emitted=FINAL_65_CUE_ICON_KEYS[name];
 for(const [cue,key] of Object.entries(emitted)){
  const r=rows.get(lane+"|"+cue);
  assert.ok(r,"Exact source cue registry missing "+cue+" "+lane);
  assert.equal(r.needsSourceImport,false,"Unavailable original rendered "+cue);
  assert.equal(r.runtimeAssetKey,key,"Alias drift "+cue);
  const a=bank.get(r.assetId);
  assert.ok(a&&!a.rejected&&["approved","repurposed"].includes(a.status),
    "Rejected or unapproved final art "+cue);
  assert.equal(a.name,r.assetName,"User-approved exact name changed "+cue);
  certified++;
 }
}
assert.equal(certified,211);
assert.equal(Object.values(FINAL_65_CUE_ICON_KEYS.priestVoice).filter(x=>x==="final_ao_chant").length,25,
 "Exactly 25 source-owned sung priest voices must use the approved Chant SVG");
for(const row of cross.rows.filter(x=>x.lane==="priest_voice")){
 const raw=String(row.sourceEvent.voice||"");
 if(/^SUNG\s*\/\s*(PUBLIC|CLEAR)(?:\s*\(MISSA CANTATA\))?$/i.test(raw))
  assert.equal(row.assetId,"ao_chant","Sung priest voice still uses speaking icon: "+row.cueId);
}

const icon=(cueId,state={})=>iconKeysForReaderState({
 form:"MISSA_CANTATA_SIMPLE",...state,cueId,curated65FinalArt:true,
});
for(const [cue,expected] of [
 ["AO.SM.C0110","priest_elevate_host_rich"],
 ["AO.SM.C0114","priest_elevate_chalice_rich"],
 ["AO.SM.C0174","priest_elevation"],
 ["AO.SM.C0222","breast_strike"],
 ["AO.SM.C0246","priest_rail_after_rich"],
]){
 assert.equal(icon(cue,{priestAction:{cueId:cue,label:"SOURCE_ACTION"}}).priestActionIconKey,
  expected,"Priest action mismatch "+cue);
}
for(const [cue,exactKey] of [
 ["AO.SM.C0181","final_ao_elevation_chalice"],
 ["AO.SM.C0216","final_ea_priest_fraction_host"],
 ["AO.SM.C0221","final_ea_priest_commingling"],
 ["AO.SM.C0232","final_ea_priest_communion_host_original"],
 ["AO.SM.C0234","final_ea_priest_communion_chalice_original"],
 ["AO.SM.C0247","final_ao_purify_fingers"],
 ["AO.SM.C0248","final_ao_purify_chalice"],
]){
 assert.equal(icon(cue,{priestAction:{cueId:cue,label:"SOURCE_ACTION"}}).priestActionIconKey,exactKey,
  "Approved exact-source original no longer reached "+cue);
}
assert.equal(icon("AO.SM.C0055",{gesture:{cueId:"AO.SM.C0055",action:"Bow head"}}).gestureIconKey,"bow");
assert.equal(icon("AO.SM.C0072",{priestPosition:{station:"ALTAR_EPISTLE_MISSAL"}}).priestPositionIconKey,"priest_gospel_rich");
assert.equal(icon("AO.SM.C0144",{priestPosition:{station:"ALTAR_CENTER",missalLocation:"GOSPEL_SIDE"}}).priestPositionIconKey,"priest_centre_hands_rich");
assert.equal(icon("AO.SM.C0086",{priestPosition:{station:"ALTAR_GOSPEL_MISSAL"}}).priestPositionIconKey,"priest_epistle_rich");
assert.equal(icon("AO.SM.C0001",{priestPosition:{station:"FOOT_CENTER"}}).priestPositionIconKey,null,
  "User vetoed Foot Centre pictogram: text-only, never ref_112206 or old rejected art");
assert.equal(icon("AO.SM.C0001",{priestPosition:{station:"FOOT_CENTER",facing:"PEOPLE"}}).priestPositionIconKey,null,
  "Facing-people cannot override Foot Centre artwork veto");
assert.equal(icon("AO.SM.C0265",{priestAction:{cueId:"AO.SM.C0265",label:"BLESSES PEOPLE"}}).priestActionIconKey,null,
  "Final blessing must not use Indulgentiam artwork");
assert.equal(icon("AO.SM.C0144",{priestVoice:{cueId:"AO.SM.C0144",voice:"SUNG / CLEAR"}}).priestVoiceIconKey,"final_ao_chant",
  "Preface sung by priest requires user-approved Chant artwork, not audible-speech pictogram");
assert.equal(icon("AO.SM.C0053",{priestVoice:{cueId:"AO.SM.C0053",voice:"SUNG / PUBLIC"}}).priestVoiceIconKey,"final_ao_chant");
assert.equal(icon("AO.SM.C0259",{priestVoice:{cueId:"AO.SM.C0259",voice:"SUNG / PUBLIC"}}).priestVoiceIconKey,"final_ao_chant");
assert.equal(icon("AO.SM.C0130",{priestVoice:{cueId:"AO.SM.C0130",voice:"AUDIBLE / ELEVATED"}}).priestVoiceIconKey,"priest_audible",
  "Orate fratres is spoken and must not show Chant icon");
assert.equal(icon("AO.SM.C0109",{priestVoice:{cueId:"AO.SM.C0109",voice:"SECRET OFFERTORY"}}).priestVoiceIconKey,"final_ao_pray_audible",
  "Priest's Offertory antiphon recitation is not Schola chant");
for(const id of ["AO.SM.C0075","AO.SM.C0082","AO.SM.C0086"]){
 assert.equal(icon(id,{form:"SOLEMN",priestVoice:{cueId:id,voice:"SUNG / CLEAR"}}).priestVoiceIconKey,null,
 "Celebrant chant icon must not be displayed for deacon/subdeacon: "+id);
}
assert.equal(icon("AO.SM.C0075",{priestVoice:{cueId:"AO.SM.C0075",voice:"SUNG / CLEAR"}}).priestVoiceIconKey,"final_ao_chant");
assert.equal(icon("AO.SM.C0053",{form:"LOW",priestVoice:{cueId:"AO.SM.C0053",voice:"SUNG / PUBLIC"}}).priestVoiceIconKey,null,
 "Final 65 Sung resolver cannot leak priest Chant into Low Mass");
assert.equal(iconKeysForReaderState({priestVoice:{value:"CHANTED"}}).priestVoiceIconKey,"priest_audible",
 "Non-curated/Low reader audible fallback must never be the priest Chant icon");
assert.equal(icon("AO.SM.C0001",{priestVoice:{cueId:"AO.SM.C0001",voice:"LOW VOICE"}}).priestVoiceIconKey,"final_ao_pray_audible",
  "Low voice must not be incorrectly described as silent");
assert.equal(icon("AO.SM.C0174",{priestVoice:{cueId:"AO.SM.C0174",voice:"SILENT"}}).priestVoiceIconKey,"final_ao_pray_silent");
assert.equal(icon("AO.SM.C0265",{priestPosition:{station:"ALTAR_CENTER",facing:"PEOPLE"}}).priestPositionIconKey,"final_new_priest_facing",
  "Approved hands-joined priest-facing-congregation original missing");
assert.equal(icon("AO.SM.C0265",{response:{cueId:"AO.SM.C0265"}}).responseIconKey,"final_response");
assert.equal(icon("AO.SM.C0144",{schola:{cueId:"AO.SM.C0144"}}).scholaIconKey,"final_schola");
const station=(cueId,sourcePosition,form="MISSA_CANTATA_SIMPLE",observedPriestEventId=null)=>projectCurated65PriestStation({
 enabled:true,cueId,sourcePosition,form,observedPriestEventId,
});
const epic={station:"ALTAR_EPISTLE_MISSAL",facing:"MISSAL",label:"AT EPISTLE SIDE"};
const gospel={station:"ALTAR_GOSPEL_MISSAL",facing:"MISSAL",label:"AT GOSPEL SIDE"};
const center={station:"ALTAR_CENTER",facing:"LITURGICAL_EAST",label:"AT CENTRE"};
assert.equal(station("AO.SM.C0072",epic).priestPosition.station,"ALTAR_EPISTLE_MISSAL");
assert.equal(station("AO.SM.C0072",epic).missalLocation,"EPISTLE_SIDE");
assert.equal(station("AO.SM.C0112",center).priestPosition.station,"ALTAR_EPISTLE_MISSAL",
 "Source Ultra Master: chalice water prepared Epistle-side even when Requiem cross omitted");
assert.equal(station("AO.SM.C0113",epic).missalLocation,"GOSPEL_SIDE",
 "Chalice prepared Epistle-side though Missal remains Gospel-side");
assert.equal(station("AO.SM.C0144",center).priestPosition.station,"ALTAR_CENTER");
assert.equal(station("AO.SM.C0144",center).missalLocation,"GOSPEL_SIDE",
 "Preface must distinguish priest at centre from Gospel-side book");
assert.equal(station("AO.SM.C0086",gospel).priestPosition.station,"ALTAR_GOSPEL_MISSAL");
assert.equal(station("AO.SM.C0086",gospel,"SOLEMN").priestPosition.station,"ALTAR_EPISTLE_SIDE",
 "Solemn Gospel is deacon's proclamation, celebrant stays Epistle-side");
assert.equal(station("AO.SM.C0075",epic,"SOLEMN").priestPosition.station,"UNCONFIRMED",
 "Solemn Epistle must not turn subdeacon into priest at Missal");
assert.equal(station("AO.SM.C0077",{station:"PRIEST_TRACK_ASYNC"}).priestPosition.station,"UNCONFIRMED");
assert.equal(station("AO.SM.C0122",{station:"ROUTE_CONTROLLED"}).priestPosition.station,"IN_TRANSIT");
assert.equal(station("AO.SM.C0249",{station:"PRIEST_TRACK_ASYNC"}).missalLocation,null);
assert.equal(station("AO.SM.C0249",{station:"PRIEST_TRACK_ASYNC"}).priestPosition.station,"UNCONFIRMED");
const observed=station("AO.SM.C0249",{station:"PRIEST_TRACK_ASYNC"},
  "MISSA_CANTATA_SIMPLE","MC-END-010");
assert.equal(observed.priestPosition.station,"ALTAR_EPISTLE_MISSAL");
assert.equal(observed.missalLocation,"EPISTLE_SIDE");
const afterAntiphon=station("AO.SM.C0250",{station:"PRIEST_TRACK_ASYNC"},
  "MISSA_CANTATA_SIMPLE","MC-OBS-PC-TURN");
assert.equal(afterAntiphon.priestPosition.station,"ALTAR_CENTER",
 "Ultra Master return-to-centre cue must follow observed priest turn, not Schola or swipe");
assert.equal(afterAntiphon.missalLocation,"EPISTLE_SIDE",
 "Missal stays Epistle-side while priest turns back to centre");
assert.equal(station("AO.SM.C0250",{station:"PRIEST_TRACK_ASYNC"}).missalLocation,null,
 "Schola cue cannot force priest book transition");
assert.equal(station("AO.SM.C0269",gospel).missalLocation,null,
 "Proper Last Gospel must not inherit ordinary book location");
assert.equal(projectCurated65PriestStation({enabled:false,cueId:"AO.SM.C0144",sourcePosition:center}),null,
 "Do not affect 48-card fallback");
assert.equal(projectCurated65PriestStation({enabled:true,cueId:"AO.SM.C0144",sourcePosition:center,form:"LOW"}),null,
 "Do not leak Sung priest position to Low Mass");
console.log("Final 65 LIVE icon/position contract PASS: "+certified+" physically packaged cue bindings; exact names and actors protected.");
