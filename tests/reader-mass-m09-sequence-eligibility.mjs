import assert from "node:assert/strict";
import {resolveM09SequenceSourceRule,M09SequenceForLive}
 from "../src/mass/reader-m09-sequence-eligibility.js";
const owner="1962_PROPER_RESOLVER";
const score={VICTIMAE_PASCHALI:1086,VENI_SANCTE_SPIRITUS:68,
 LAUDA_SION:308,DIES_IRAE:1198,STABAT_MATER:681};
const cases=[
 ["VICTIMAE_PASCHALI","Tempora/Pasc0-0","BEFORE_LAST_ALLELUIA"],
 ["VENI_SANCTE_SPIRITUS","Tempora/Pent01-0","BEFORE_LAST_ALLELUIA"],
 ["LAUDA_SION","Tempora/Pent02-4","BEFORE_LAST_ALLELUIA"],
 ["STABAT_MATER","Sancti/09-15","AFTER_TRACT"]
];
const chosen=(key,path,opts={})=>({
 actualMass:{kind:"CALENDAR",sourceOwner:owner,sourcePath:path,
  verified:true,...opts},
 sequenceWitness:{sequenceKey:key,sourceId:score[key],sourceRole:"SEQUENTIA",
  sourcePath:path,sourceOwner:owner,verified:true},
 preGospel:{sourceVerified:true,sourcePath:path,sourceOwner:owner,
  hasTract:key==="STABAT_MATER",hasLastAlleluia:key!=="STABAT_MATER"}
});
for(const [key,path,placement] of cases){
 const out=resolveM09SequenceSourceRule(chosen(key,path));
 assert.equal(out.status,"SOURCE_ELIGIBLE_NOT_MUSIC_APPROVED",key);
 assert.equal(out.scoreId,score[key]);
 assert.equal(out.placement,placement);
 assert.equal(out.musicalFacsimileApproved,false);
 assert.equal(out.renderedScoreAllowed,false);
 assert.equal(out.predictedChoirActivity,false);
 assert.equal(out.editorialApproved,false);
}
const req=chosen("DIES_IRAE","Sancti/11-02m1");
req.actualMass={...req.actualMass,kind:"REQUIEM",requiemClass:1};
req.preGospel.hasTract=true;req.preGospel.hasLastAlleluia=false;
const mandatory=resolveM09SequenceSourceRule(req);
assert.equal(mandatory.scoreId,1198);
assert.equal(mandatory.obligation,"MANDATORY_1962_399_A");
assert.equal(mandatory.placement,"AFTER_TRACT");
for(const cls of [2,3,4]){
 const result=resolveM09SequenceSourceRule({
  ...req,actualMass:{...req.actualMass,requiemClass:cls}});
 assert.equal(result.obligation,"OPTIONAL_1962_399_B");
}
const allSoulsException=resolveM09SequenceSourceRule({
 ...req,actualMass:{...req.actualMass,allSoulsThreeConsecutive:true}});
assert.equal(allSoulsException.status,"HOLD");
assert.match(allSoulsException.reason,/THREE_MASSES/);
assert.equal(resolveM09SequenceSourceRule({...req,
 actualMass:{...req.actualMass,requiemClass:null}}).status,"HOLD");
assert.equal(resolveM09SequenceSourceRule({...req,
 actualMass:{...req.actualMass,kind:"VOTIVE"}}).status,"EXCLUDED");
assert.equal(resolveM09SequenceSourceRule({...chosen("VICTIMAE_PASCHALI",
 "Tempora/Pasc0-0"),actualMass:{
 ...chosen("VICTIMAE_PASCHALI","Tempora/Pasc0-0").actualMass,kind:"VOTIVE"}}).status,
 "EXCLUDED");
assert.equal(resolveM09SequenceSourceRule({
 ...req,actualMass:{...req.actualMass,kind:"CALENDAR"}}).status,"HOLD");
assert.equal(resolveM09SequenceSourceRule({
 ...chosen("STABAT_MATER","Sancti/09-15"),sequenceWitness:{
 ...chosen("STABAT_MATER","Sancti/09-15").sequenceWitness,sourceId:181
 }}).status,"HOLD");
const mismatched=chosen("LAUDA_SION","Tempora/Pent02-4");
mismatched.sequenceWitness.sourcePath="Sancti/06-11";
assert.equal(resolveM09SequenceSourceRule(mismatched).status,"HOLD");
const missingPre=chosen("LAUDA_SION","Tempora/Pent02-4");
missingPre.preGospel.sourceVerified=false;
assert.equal(resolveM09SequenceSourceRule(missingPre).status,"HOLD");
const ambiguous=chosen("VENI_SANCTE_SPIRITUS","Tempora/Pent01-0");
ambiguous.preGospel.hasTract=true;
assert.equal(resolveM09SequenceSourceRule(ambiguous).reason,
 "PRE_GOSPEL_ALLELUIA_TRACT_BOUNDARY_AMBIGUOUS");
assert.equal(resolveM09SequenceSourceRule({
 actualMass:{sourceOwner:owner,kind:"CALENDAR",verified:true,
 sourcePath:"Tempora/Pent01-0"},
 sequenceWitness:{sourceOwner:"USER_SELECTED",sourceRole:"SEQUENTIA",
 sequenceKey:"VENI_SANCTE_SPIRITUS",sourceId:68,
 sourcePath:"Tempora/Pent01-0",verified:true}
}).status,"HOLD");
assert.equal(M09SequenceForLive(),null);
console.log("PASS M09 1962 Sequence place before last Alleluia/after Tract, §399 Requiem and §470 votive exclusions");
