import assert from "node:assert/strict";
import {resolve1962AllSoulsSuccession,ritusXIVRubricsForCue,
 with1962RitusXIVParagraphRubrics} from "../src/mass/1962-all-souls-consecutive-rites.js";
const at=(n,previous,next)=>resolve1962AllSoulsSuccession({
  date:"2026-11-02",sourcePath:"Sancti/11-02m"+n,
  massNumber:n,previous,next
});
const first=at(1,"NONE","IMMEDIATE");
assert.equal(first.contextualStatus,"EXPLICIT_CIRCUMSTANCES");
assert.equal(first.precedingMassImmediate,false);
assert.equal(first.followingMassImmediate,true);
assert.equal(ritusXIVRubricsForCue(first,"AO.SM.C0247").length,1);
assert.equal(ritusXIVRubricsForCue(first,"AO.SM.C0248","fr").length,1);
assert.equal(ritusXIVRubricsForCue(first,"AO.SM.C0112").length,0);
const second=at(2,"IMMEDIATE","IMMEDIATE");
assert.equal(ritusXIVRubricsForCue(second,"AO.SM.C0112").length,1);
assert.equal(ritusXIVRubricsForCue(second,"AO.SM.C0247").length,1);
const third=at(3,"IMMEDIATE","NONE");
assert.equal(ritusXIVRubricsForCue(third,"AO.SM.C0112").length,1);
assert.equal(ritusXIVRubricsForCue(third,"AO.SM.C0247").length,0);
const interrupted=at(2,"INTERRUPTED","INTERRUPTED_LT3");
assert.equal(ritusXIVRubricsForCue(interrupted,"AO.SM.C0112").length,0);
assert.match(ritusXIVRubricsForCue(interrupted,"AO.SM.C0247")[0].displayText,/water only/);
assert.equal(ritusXIVRubricsForCue(interrupted,"AO.SM.C0248").length,0);
assert.equal(ritusXIVRubricsForCue(at(2,"INTERRUPTED","INTERRUPTED_GTE3"),"AO.SM.C0247").length,0);
assert.equal(ritusXIVRubricsForCue(at(2,"UNKNOWN","UNKNOWN"),"AO.SM.C0112").length,0);
const before=Object.freeze([{id:"p1",sourceCueIds:["AO.SM.C0112"],primary:"Deus, qui"},
 {id:"p2",sourceCueIds:["AO.SM.C0247"],primary:"Quod ore sumpsimus"}]);
const wrapped=with1962RitusXIVParagraphRubrics(before,second,{language:"fr"});
assert.equal(wrapped.length,2);
assert.equal(wrapped[0].primary,"Deus, qui");
assert.match(wrapped[0].publishedMissalRubrics[0].displayText,/épître/);
assert.equal(wrapped[0].publishedMissalRubrics[0].observedNow,false);
assert.deepEqual(with1962RitusXIVParagraphRubrics(before,null),before);
for(const bad of [
 {massNumber:2,previous:"IMMEDIATE",next:"NONE",sourcePath:"Sancti/11-02m1"},
 {massNumber:1,previous:"IMMEDIATE",next:"NONE",sourcePath:"Sancti/11-02m1"},
 {massNumber:3,previous:"UNKNOWN",next:"IMMEDIATE",sourcePath:"Sancti/11-02m3"},
 {massNumber:2,previous:"MAYBE",next:"NONE",sourcePath:"Sancti/11-02m2"},
 {massNumber:2,previous:"NONE",next:"NONE",sourcePath:"Sancti/11-02m2",date:"2026-11-01"},
 ])assert.throws(()=>resolve1962AllSoulsSuccession({date:"2026-11-02",...bad}));
console.log("1962 Ritus XIV source-owned All Souls conditional rubric tests PASS");
