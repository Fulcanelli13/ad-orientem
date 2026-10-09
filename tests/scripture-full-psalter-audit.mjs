import assert from "node:assert/strict";
import {overlapRatio,inspectPsalmChapter,auditFullPsalter} from "../tools/scripture/audit-full-catholic-psalter.mjs";
assert.equal(overlapRatio("The mighty Lord dwells among the heavens","The mighty Lord dwells among the heavens"),1);
assert.ok(overlapRatio("Great merciful king of Judah","Angelic lamps shine upon the valley")<.16);
const sample=new Map([[1,"The mighty Lord dwells among the heavens"],[2,"The Lord guides the faithful through the wilderness"]]);
const aligned=inspectPsalmChapter(22,sample,sample);
assert.equal(aligned.candidateForIdentityCrosswalk,true);
assert.equal(aligned.sameNumbers,true);
assert.equal(inspectPsalmChapter(13,sample,sample).candidateForIdentityCrosswalk,false,"Previously mapped exceptions have their own source crosswalk");
assert.equal(inspectPsalmChapter(22,sample,new Map([[1,sample.get(1)]])).candidateForIdentityCrosswalk,false);
const shifted=inspectPsalmChapter(22,sample,new Map([[1,sample.get(2)],[2,sample.get(1)]]));
assert.equal(shifted.candidateForIdentityCrosswalk,false);
assert.ok(shifted.anomalies.some(x=>x.startsWith("neighbor-parallel")||x.startsWith("weak-parallel")));
const raw={editionId:"cpdv-2009",book:"Psalms",sourceUrl:"https://sacredbible.org/catholic/OT-21_Psalms.htm",
 sourceSha256:"f".repeat(64),verses:Array.from({length:150},(_,i)=>({
 chapter:i+1,verse:1,text:"The mighty Lord dwells among the heavens"}))};
const dr={books:[{id:"Psalms",chapters:Array.from({length:150},(_,i)=>({
 number:i+1,verses:[{number:1,text:"The mighty Lord dwells among the heavens"}]}))}]};
const audit=auditFullPsalter(raw,dr);
assert.equal(audit.psalmsExamined,150);
assert.equal(audit.mechanicallyAlignedPsalms,146);
assert.equal(audit.approvedForAutomaticSwitch,false);
assert.equal(audit.doctrinallyCertified,false);
for(const n of [13,42,92,150])assert.equal(audit.candidateChapterNumbers.includes(n),false);
dr.books[0].chapters[30].verses[0].text="A different fragment with no matching vocabulary";
const bad=auditFullPsalter(raw,dr);
assert.equal(bad.candidateChapterNumbers.includes(31),false);
console.log("150-Psalm source audit contracts passed, no false automatic-release status");
