import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildKyrieVIIIThreeWitnessNeumeLedger,KYRIE_VIII_NEUME_AUDIT_SCHEMA}
 from "../scripts/schola/kyrie-viii-three-witness-neume-ledger.mjs";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
const corpus=JSON.parse(readFileSync(
 new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const l=buildKyrieVIIIThreeWitnessNeumeLedger({corpus});
assert.equal(l.schema,KYRIE_VIII_NEUME_AUDIT_SCHEMA);
assert.equal(l.status,"45_SOURCE_MARKS_3_WITNESSES_PENDING_INDEPENDENT_MUSICAL_REVIEW");
assert.equal(l.witnessCount,3);
assert.deepEqual(l.witnesses.map(w=>w.id),[
 "GRADUALE_ROMANUM_1961","LIBER_USUALIS_1961","CHANTS_OF_THE_CHURCH_1956"
]);
assert.deepEqual(l.witnesses.map(w=>w.pages),[["28*","29*"],["37"],["19"]]);
assert.deepEqual(l.witnesses.flatMap(w=>w.images),[
 "https://gregobase.selapa.net/sources/2/905.png",
 "https://gregobase.selapa.net/sources/2/906.png",
 "https://gregobase.selapa.net/sources/3/148.png",
 "https://gregobase.selapa.net/sources/5/34.png"
]);
assert.equal(l.printedMelodyLines,4);
assert.equal(l.sourceCueCount,9);
assert.deepEqual(l.invocationPattern,[3,3,2,1]);
assert.equal(l.phrases.length,4);
assert.equal(l.reviewUnits,45);
assert.equal(l.printedComparisonTasks,135);
assert.equal(l.comparisonTasksCertified,0);
assert.equal(l.approvedScores,0);
assert.equal(l.publishedScores,0);
assert.deepEqual(l.phrases.map(x=>x.originalCueIds.length),[3,3,2,1]);
assert.deepEqual(l.phrases.map(x=>x.musicalSourceUnits),[13,9,10,13]);
assert.equal(l.phrases[0].units.filter(x=>x.kind==="SINGLE_STAR_INITIAL_INTONATION").length,1);
assert.equal(l.phrases[3].units.filter(x=>x.kind==="SINGLE_STAR_PERFORMER_HANDOFF").length,1);
assert.equal(l.phrases[3].units.filter(x=>x.kind==="DOUBLE_STAR_FULL_CHOIR_ENTRY").length,1);
assert.equal(l.phrases[3].units.filter(x=>x.kind==="PRINTED_REPEAT_DIRECTIVE").length,0);
assert.equal(l.phrases[0].units.at(-2).kind,"PRINTED_REPEAT_DIRECTIVE");
assert.equal(l.phrases[1].units.at(-2).kind,"PRINTED_REPEAT_DIRECTIVE");
assert.equal(l.phrases[2].units.at(-2).kind,"PRINTED_REPEAT_DIRECTIVE");
const allUnits=l.phrases.flatMap(p=>p.units);
assert.ok(allUnits.every(u=>
 u.reviewStatus==="NOT_NOTE_BY_NOTE_CERTIFIED"&&u.witnessChecks.length===3&&
 u.witnessChecks.every(w=>w.verified===false)));
const observed=allUnits.flatMap(u=>u.witnessChecks.filter(w=>w.visuallyReadPrintedRubric)
 .map(w=>({id:u.id,raw:u.rawGabc,...w})));
assert.equal(observed.length,12);
assert.deepEqual(l.printedStructuralMarkerTypes,[
 "K8-L01-U05","K8-L01-U12","K8-L02-U08",
 "K8-L03-U09","K8-L04-U04","K8-L04-U07"]);
assert.equal(l.printedStructuralMarksVisuallyRead,6);
assert.equal(l.printedWitnessMarkerComparisonsVisuallyRead,12);
assert.equal(l.printedComparisonTasksStillUnread,123);
assert.equal(l.noteByNoteComparisonsCertified,0);
assert.deepEqual(observed.filter(x=>x.witnessId==="GRADUALE_ROMANUM_1961")
 .map(x=>x.printedFolio),["28*","28*","28*","29*","29*","29*"]);
assert.deepEqual(observed.filter(x=>x.witnessId==="LIBER_USUALIS_1961")
 .map(x=>x.printedFolio),Array(6).fill("37"));
assert.equal(observed.filter(x=>x.witnessId==="CHANTS_OF_THE_CHURCH_1956").length,0);
assert.ok(observed.every(x=>x.printImageUrl?.startsWith("https://gregobase.selapa.net/sources/")&&
 x.issue==="PRINTED_STRUCTURAL_MARK_MATCH_NOT_MUSICAL_APPROVAL"&&
 x.verified===false));
assert.ok(allUnits.filter(u=>!l.printedStructuralMarkerTypes.includes(u.id))
 .every(u=>u.witnessChecks.every(w=>w.visuallyReadPrintedRubric===false)));

assert.ok(l.phrases.every(p=>!p.pitchByPitchVerified&&!p.neumeByNeumeVerified&&
 !p.rhythmicSignsVerified&&!p.alterationsVerified&&!p.independentEditorialApproval));
const original=offlineKyrialeResearchScore("KYRIE","MASS_08");
const corrupt={...original,gabc:original.gabc.replace("gxfgh","gxhgh")};
assert.equal(buildKyrieVIIIThreeWitnessNeumeLedger({corpus,source:corrupt}).status,
 "HOLD_SOURCE_OR_CORPUS_DRIFT");
const broken=structuredClone(corpus);
broken.blocks.find(x=>x.Macro_ID==="AO.SM.M02").units[8].cue_id="AO.SM.C9999";
assert.equal(buildKyrieVIIIThreeWitnessNeumeLedger({corpus:broken}).status,
 "HOLD_SOURCE_OR_CORPUS_DRIFT");
console.log("SCHOLA_KYRIE_VIII_THREE_WITNESS_NEUME_LEDGER_PASS 45 source units, 12 printed structural marker observations, 123 unexamined, 0 musical certifications");
