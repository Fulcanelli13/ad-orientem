import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolveOffertoryVoiceBoundary,projectPriestQuietOffertory}
 from "../src/mass/reader-offertory-quiet.js";
import {createReaderCueStateController} from "../src/mass/reader-cue-state.js";
import {LIVE_LATIN_FIRST_INVITATION_CUES} from "../src/mass/reader-text.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const corpus=read("data/presentation/reader-text-sung.v1.json");
const registries={
 gestures:read("data/presentation/reader-gestures.v1.json"),
 responses:read("data/presentation/reader-responses.v1.json"),
 postures:read("data/presentation/reader-postures.v1.json"),
 positions:read("data/presentation/reader-priest-positions.v1.json"),
 voices:read("data/presentation/reader-priest-voices.v1.json"),
 actions:read("data/presentation/reader-priest-actions.v1.json")
};
const indexed=new Map(corpus.blocks.flatMap(b=>b.units.map(u=>[u.cue_id,{...u,block:b.Block_ID}])));
const expected=[
 ["AO.SM.C0106","PUBLIC_TEXT","℣. Dóminus vobíscum.","AO.SM.B028"],
 ["AO.SM.C0107","USER_RESPONSE","℟. Et cum spíritu tuo.","AO.SM.B028"],
 ["AO.SM.C0108","PUBLIC_TEXT","Orémus.","AO.SM.B029"],
 ["AO.SM.C0109","PRIEST_ACTION",null,"AO.SM.B030"],
 ["AO.SM.C0110","PRIEST_PRIVATE",null,"AO.SM.B031"]
];
for(const [id,clock,latin,block] of expected){
 const row=indexed.get(id);
 assert.equal(row.clock,clock,id+" source clock changed");
 if(id==="AO.SM.C0110")assert.match(row.latin??"",/^Suscipe, sancte Pater,/,
  "First quiet Offertory prayer must retain its complete canonical Latin");
 else assert.equal(row.latin,latin,id+" source text changed");
 assert.equal(row.block,block,id+" block identity changed");
}
assert.ok(LIVE_LATIN_FIRST_INVITATION_CUES.includes("AO.SM.C0108"));
assert.equal(registries.voices.items.find(x=>x.cueId==="AO.SM.C0108").voice,"SUNG / CLEAR");
assert.equal(registries.voices.items.find(x=>x.cueId==="AO.SM.C0109").voice,
 "SUNG/CLEAR OPENING → SECRET OFFERTORY");
assert.equal(registries.voices.items.find(x=>x.cueId==="AO.SM.C0110").voice,"SECRET / QUIET");
for(const form of ["SOLEMN","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]){
 const ctrl=createReaderCueStateController({registries,sungCorpus:corpus,
  prepared:{session:{resolvedMass:{form,provenance:{conditions:[]}}}}});
 const input=(id,mode="LIVE")=>{
  const unit=indexed.get(id),ordinaryVoice=ctrl.project(id).priestVoice;
  return resolveOffertoryVoiceBoundary({cueId:id,sourceClock:unit.clock,
   form,mode,ordinaryVoice});
 };
 for(const mode of ["LIVE","MISSAL"]){
  const greeting=input("AO.SM.C0106",mode);
  assert.equal(greeting.applied,false);
  const oremus=input("AO.SM.C0108",mode);
  assert.equal(oremus.applied,true);
  assert.equal(oremus.priestVoice?.label,"SUNG / CLEAR");
  assert.equal(oremus.owner,"MR1962_513_A_OFFERTORY_OREMUS_SUNG");
  assert.equal(oremus.actuallyHeard,"UNKNOWN");
  const anthem=input("AO.SM.C0109",mode);
  assert.equal(anthem.applied,true);
  assert.equal(anthem.priestVoice,null,
   "Proper antiphon has Schola clock; priest must not appear to chant that text");
  assert.equal(anthem.owner,"SOURCE_PROPER_OFFERTORY_NOT_A_PRIEST_SUNG_CUE");
  const preparation=input("AO.SM.C0110",mode);
  assert.equal(preparation.applied,true);
  assert.equal(preparation.priestVoice?.label,"SECRET / QUIET");
  assert.equal(preparation.owner,"SUNG_SOURCE_OFFERTORY_PRIEST_PRIVATE");
 }
 const quiet=projectPriestQuietOffertory({
  cueId:"AO.SM.C0110",sourceClock:"PRIEST_PRIVATE",form,language:"fr"});
 assert.equal(quiet?.iconKey,"priest_silent");
 assert.match(quiet?.description??"",/Orémus/);
 assert.equal(projectPriestQuietOffertory({
  cueId:"AO.SM.C0108",sourceClock:"PUBLIC_TEXT",form}),null);
 assert.equal(projectPriestQuietOffertory({
  cueId:"AO.SM.C0109",sourceClock:"PRIEST_ACTION",form}),null);
 const wrong=resolveOffertoryVoiceBoundary({cueId:"AO.SM.C0108",
  sourceClock:"PRIEST_PRIVATE",form,ordinaryVoice:{label:"SUNG / CLEAR"}});
 assert.equal(wrong.applied,false);
 const untrusted=resolveOffertoryVoiceBoundary({cueId:"AO.SM.C0108",
  sourceClock:"PUBLIC_TEXT",form,ordinaryVoice:{label:"SECRET / QUIET"}});
 assert.equal(untrusted.applied,false);
 assert.equal(untrusted.priestVoice.label,"SECRET / QUIET",
  "No new fabricated sung voice when canonical source does not attest it");
 assert.equal(resolveOffertoryVoiceBoundary({cueId:"AO.SM.C0108",
  sourceClock:"PUBLIC_TEXT",form,mode:"SPECIAL_RITE",
  ordinaryVoice:{label:"SUNG / CLEAR"}}).applied,false);
 const other=resolveOffertoryVoiceBoundary({cueId:"AO.SM.C0220",
  sourceClock:"USER_RESPONSE",form,ordinaryVoice:{label:"LISTENS"}});
 assert.equal(other.applied,false);
 assert.equal(other.priestVoice.label,"LISTENS");
}
for(const form of ["LOW","SUNG","VOTIVE"]){
 for(const id of ["AO.SM.C0108","AO.SM.C0109","AO.SM.C0110"]){
  const row=indexed.get(id),voice={label:"SUNG / CLEAR"};
  const x=resolveOffertoryVoiceBoundary({cueId:id,sourceClock:row.clock,
   form,ordinaryVoice:voice});
  assert.equal(x.applied,false);
  assert.equal(x.priestVoice,voice);
 }
}
console.log("PASS 1962 n.513 Offertory C0108 sung; C0109 Schola source boundary; C0110 secret, all three sung forms, LIVE/MISSAL/LOW guards");
