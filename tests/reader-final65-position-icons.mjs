import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectCurated65PriestStation} from "../src/mass/reader-priest-station65.js";
import {finalCurated65IconKeys,FINAL_65_CUE_ICON_KEYS,
  ULTRA_MASTER_PRIEST_CHANT_CUE_ADDITIONS,SCHOLA_NOT_PRIEST_CHANT_CUES
} from "../src/mass/reader-final65-icon-keys.js";
import {iconKeysForReaderState} from "../src/mass/reader-icons.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const lock=read("../data/presentation/mass-icon-final-user-lock-20261020.v1.json");
const cross=read("../data/presentation/mass-icon-final-cue-crosswalk-20261020.v1.json");
const ultraVoice=read("../data/presentation/mass-ultra-master-voice-audit-20261021.v1.json");
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
// 25 Oct approved-bank reuse: the generic breast-strike pictogram is
// expressly licensed across priest/faithful actors by the semantic lexicon.
// Separate canonical meanings preserve actor ownership; Communion distribution
// remains owned by the rail position + faithful lane.
for(const [cue,label,expected] of [
 ["AO.SM.C0110","OFFERS HOST","canon:priest.action.offer_host"],
 ["AO.SM.C0114","OFFERS CHALICE","canon:priest.action.offer_chalice"],
 ["AO.SM.C0174","ELEVATES HOST","canon:priest.action.elevate_host"],
 ["AO.SM.C0222","STRIKES BREAST","canon:priest.action.strike_breast"],
 ["AO.SM.C0246","GIVES COMMUNION",null],
]){
 assert.equal(icon(cue,{priestAction:{cueId:cue,label}}).priestActionIconKey,
  expected,"Priest action mismatch "+cue);
}
for(const [cue,label,exactKey] of [
 ["AO.SM.C0181","ELEVATES CHALICE","canon:priest.action.elevate_chalice"],
 ["AO.SM.C0216","BREAKS HOST","canon:priest.action.fraction"],
 ["AO.SM.C0221","PLACES PARTICLE","canon:priest.action.commingling"],
 ["AO.SM.C0232","RECEIVES HOST","canon:priest.action.receive_host"],
 ["AO.SM.C0234","RECEIVES CHALICE","canon:priest.action.receive_chalice"],
 // Quod ore sumpsimus = first ablution (chalice); Corpus tuum = ablution of the fingers.
 ["AO.SM.C0247","WASHES / PURIFIES","canon:priest.action.purify_chalice"],
 ["AO.SM.C0248","WASHES / PURIFIES","canon:priest.action.purify_fingers"],
]){
 assert.equal(icon(cue,{priestAction:{cueId:cue,label}}).priestActionIconKey,exactKey,
  "Approved exact-source original no longer reached "+cue);
}
for(const [cueId,action,expected] of [
 ["AO.SM.C0068","SIGNS HIMSELF","canon:priest.action.sign_of_cross"],
 ["AO.SM.C0079","PROFOUND BOW","canon:priest.action.profound_bow"],
 ["AO.SM.C0104","SIGNS HIMSELF","canon:priest.action.sign_of_cross"],
 ["AO.SM.C0262","KISSES ALTAR","canon:priest.action.kiss_altar"],
]){
 assert.equal(icon(cueId,{priestAction:{cueId,label:action}}).priestActionIconKey,expected,
  "Exact 1962 rubric action must use user's approved artwork: "+cueId);
 assert.equal(icon(cueId,{priestAction:{cueId,label:"UNRELATED ACTION"}}).priestActionIconKey,null,
  "A generic source cue cannot substitute an unrelated action image: "+cueId);
}
// Old Gloria donor C0055 bow pointed at C0056 Adoramus te.
assert.equal(icon("AO.SM.C0055",{gesture:{cueId:"AO.SM.C0055",owner:"GESTURE_MATRIX_SOT",iconKey:"head_bow",label:"Bow head"}}).gestureIconKey,null,
 "A legacy bow must not illuminate Et in terra pax before Adoramus te");
assert.equal(icon("AO.SM.C0072",{priestPosition:{station:"ALTAR_EPISTLE_MISSAL"}}).priestPositionIconKey,"canon:priest.position.epistle_side");
assert.equal(icon("AO.SM.C0144",{priestPosition:{station:"ALTAR_CENTER",missalLocation:"GOSPEL_SIDE"}}).priestPositionIconKey,"canon:priest.position.centre");
assert.equal(icon("AO.SM.C0086",{priestPosition:{station:"ALTAR_GOSPEL_MISSAL"}}).priestPositionIconKey,"canon:priest.position.gospel_side");
// 21 Oct 2026: the user chose ref_112206 for the foot of the altar, replacing the 20 Oct text-only decision.
assert.equal(icon("AO.SM.C0001",{priestPosition:{station:"FOOT_CENTER"}}).priestPositionIconKey,"canon:priest.position.foot",
  "Foot of the altar uses the user's 21 Oct choice");
assert.equal(icon("AO.SM.C0001",{priestPosition:{station:"FOOT_CENTER",facing:"PEOPLE"}}).priestPositionIconKey,"canon:priest.position.foot",
  "Facing-people cannot override the Foot station");
assert.equal(icon("AO.SM.C0265",{priestAction:{cueId:"AO.SM.C0265",label:"BLESSES PEOPLE"}}).priestActionIconKey,null,
  "Final blessing must not use Indulgentiam artwork");
assert.equal(icon("AO.SM.C0144",{priestVoice:{cueId:"AO.SM.C0144",voice:"SUNG / CLEAR"}}).priestVoiceIconKey,"canon:priest.voice.chant",
  "Preface sung by priest requires user-approved Chant artwork, not audible-speech pictogram");
assert.equal(icon("AO.SM.C0053",{priestVoice:{cueId:"AO.SM.C0053",voice:"SUNG / PUBLIC"}}).priestVoiceIconKey,"canon:priest.voice.chant");
assert.equal(icon("AO.SM.C0259",{priestVoice:{cueId:"AO.SM.C0259",voice:"SUNG / PUBLIC"}}).priestVoiceIconKey,"canon:priest.voice.chant");
assert.equal(icon("AO.SM.C0130",{priestVoice:{cueId:"AO.SM.C0130",voice:"AUDIBLE / ELEVATED"}}).priestVoiceIconKey,"canon:priest.voice.aloud",
  "Orate fratres is spoken and must not show Chant icon");
assert.equal(icon("AO.SM.C0109",{priestVoice:{cueId:"AO.SM.C0109",voice:"SECRET OFFERTORY"}}).priestVoiceIconKey,"canon:priest.voice.low",
  "Priest's Offertory antiphon recitation is not Schola chant");
for(const id of ["AO.SM.C0075","AO.SM.C0082","AO.SM.C0086"]){
 assert.equal(icon(id,{form:"SOLEMN",priestVoice:{cueId:id,voice:"SUNG / CLEAR"}}).priestVoiceIconKey,null,
 "Celebrant chant icon must not be displayed for deacon/subdeacon: "+id);
}
assert.equal(icon("AO.SM.C0075",{priestVoice:{cueId:"AO.SM.C0075",voice:"SUNG / CLEAR"}}).priestVoiceIconKey,"canon:priest.voice.chant");
assert.deepEqual(ULTRA_MASTER_PRIEST_CHANT_CUE_ADDITIONS,
 ["AO.SM.C0073","AO.SM.C0142","AO.SM.C0209","AO.SM.C0254"]);
assert.deepEqual(SCHOLA_NOT_PRIEST_CHANT_CUES,
 ["AO.SM.C0054","AO.SM.C0090"]);
for(const id of ULTRA_MASTER_PRIEST_CHANT_CUE_ADDITIONS){
 assert.equal(icon(id).priestVoiceIconKey,"canon:priest.voice.chant",
  "Ultra Master sung celebrant moment missing Chant pictogram: "+id);
 assert.equal(icon(id,{form:"SOLEMN"}).priestVoiceIconKey,"canon:priest.voice.chant",
  "Properly priest-owned sung moment lost in Solemn Mass: "+id);
 assert.notEqual(icon(id,{form:"LOW"}).priestVoiceIconKey,"canon:priest.voice.chant",
  "Low Mass must not show a Chant pictogram: "+id);
}
// The canonical donor audit remains immutable, but the 1962 rubric
// adjudicates the two end-of-intonation cues as the celebrant's.
const canonVoice=read("../data/presentation/mass-icon-canonical-set-20261021.v1.json");
assert.deepEqual(canonVoice.priestIntonationEndCues,SCHOLA_NOT_PRIEST_CHANT_CUES);
for(const id of SCHOLA_NOT_PRIEST_CHANT_CUES){
 assert.equal(icon(id,{priestVoice:{cueId:id,voice:"SUNG / CLEAR"}}).priestVoiceIconKey,"canon:priest.voice.chant",
  "Priest must chant through the end of the Gloria/Credo intonation: "+id);
 assert.equal(icon(id).priestVoiceIconKey,"canon:priest.voice.chant",
  "Intonation end cannot depend on old Schola-labelled voice event: "+id);
 assert.notEqual(icon(id,{form:"LOW"}).priestVoiceIconKey,"canon:priest.voice.chant",
  "Low Mass does not use priest chant: "+id);
}
assert.equal(icon("AO.SM.C0074",{priestVoice:{cueId:"AO.SM.C0073",voice:"SUNG / CLEAR"}}).priestVoiceIconKey,null,
 "Collect chant cannot leak into the server's Amen");
assert.equal(icon("AO.SM.C0210",{priestVoice:{cueId:"AO.SM.C0209",voice:"SUNG / CLEAR"}}).priestVoiceIconKey,null,
 "Pater noster chant cannot leak into the minister's response");
assert.equal(icon("AO.SM.C0144",{priestVoice:{cueId:"AO.SM.C0139",voice:"SUNG / CLEAR"}}).priestVoiceIconKey,null,
 "Stale priest chanting event cannot outlive its own cue");

assert.equal(icon("AO.SM.C0053",{form:"LOW",priestVoice:{cueId:"AO.SM.C0053",voice:"SUNG / PUBLIC"}}).priestVoiceIconKey,"canon:priest.voice.aloud",
 "Low Mass never shows Chant: a sung token resolves to the priest speaking aloud");
assert.equal(iconKeysForReaderState({priestVoice:{value:"CHANTED"}}).priestVoiceIconKey,"canon:priest.voice.aloud",
 "Non-curated/Low reader audible fallback must never be the priest Chant icon");
assert.equal(icon("AO.SM.C0001",{priestVoice:{cueId:"AO.SM.C0001",voice:"LOW VOICE"}}).priestVoiceIconKey,"canon:priest.voice.low",
  "Low voice must not be incorrectly described as silent");
assert.equal(icon("AO.SM.C0174",{priestVoice:{cueId:"AO.SM.C0174",voice:"SILENT"}}).priestVoiceIconKey,"canon:priest.voice.silent");
assert.equal(icon("AO.SM.C0265",{priestPosition:{station:"ALTAR_CENTER",facing:"PEOPLE"}}).priestPositionIconKey,"canon:priest.position.facing_people",
  "Approved hands-joined priest-facing-congregation original missing");
assert.equal(icon("AO.SM.C0265",{response:{cueId:"AO.SM.C0265"}}).responseIconKey,"canon:response.people");
assert.equal(icon("AO.SM.C0144",{schola:{cueId:"AO.SM.C0144"}}).scholaIconKey,"canon:schola.sings");
assert.equal(ultraVoice.items.length,34);
assert.deepEqual(ultraVoice.counts,{
 PRIEST:27,SCHOLA:2,MINISTER_RESPONSE:4,MIXED_PUBLIC_INVITATION_THEN_PRIEST_PRIVATE:1
});
for(const witness of ultraVoice.items){
 const cueId=witness.cueId;
 const event={priestVoice:{cueId,voice:witness.ultraMasterVoice}};
 const actual=icon(cueId,event).priestVoiceIconKey;
 if(witness.owner==="PRIEST"){
  assert.equal(actual,"canon:priest.voice.chant",
   "Ultra Master sung celebrant missed priest Chant at "+cueId);
  assert.notEqual(icon(cueId,{...event,form:"LOW"}).priestVoiceIconKey,
   "canon:priest.voice.chant","Low Mass wrongly uses Chant at "+cueId);
 }else if(canonVoice.priestIntonationEndCues.includes(cueId)){
  assert.equal(actual,"canon:priest.voice.chant",
    "Priest voice ruling did not override source-audit Schola ownership: "+cueId);
 }else if(witness.owner==="SCHOLA"||witness.owner==="MINISTER_RESPONSE"){
  assert.notEqual(actual,"canon:priest.voice.chant",
   "Schola/server sung source spuriously marked as priest Chant: "+cueId);
 }else if(witness.owner==="MIXED_PUBLIC_INVITATION_THEN_PRIEST_PRIVATE"){
  assert.equal(actual,"canon:priest.voice.low",
   "Mixed Offertory invitation must not be held as chant through priest's silent prayer");
 }
}
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
