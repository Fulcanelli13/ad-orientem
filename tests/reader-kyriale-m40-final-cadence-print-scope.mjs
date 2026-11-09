import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
import {sourceNoteGroupInventory} from "../src/mass/reader-kyriale-source-note-groups.js";
import {schola1961OriginalFacsimile} from "../src/mass/reader-schola-original-facsimile.js";
import {sourceBoundOrdinaryReferenceScores} from "../src/mass/reader-inline-ordinary-reference.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const m37=read("../data/research/mass-music-m37-kyrie-xvi-partial-note-position-collation.v1.json");
const m38=read("../data/research/mass-music-m38-kyrie-xvi-source-notehead-and-print-sign-gates.v1.json");
const m39=read("../data/research/mass-music-m39-kyrie-xvi-christe-third-kyrie-print-positions.v1.json");
const m40=read("../data/research/mass-music-m40-kyrie-xvi-final-seven-printed-staff-survey.v1.json");
const entry=offlineKyrialeResearchScore("KYRIE","MASS_16");
assert.equal(entry?.scoreId,"GREGOBASE-545");
assert.equal(entry.scoreApproved,false);
const fnv=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),0x01000193);return(h>>>0).toString(16).padStart(8,"0")};
assert.equal(fnv(entry.gabc),"acef0d62");
assert.equal(m40.originalGabcFingerprintUtf16Fnv1a32,fnv(entry.gabc));
assert.equal(m37.sourceGabcFingerprintUtf16Fnv1a32,fnv(entry.gabc));
assert.equal(m38.sourceGabcFingerprintUtf16Fnv1a32,fnv(entry.gabc));
assert.equal(m39.sourceGabcFingerprintUtf16Fnv1a32,fnv(entry.gabc));
const original=schola1961OriginalFacsimile("KYRIE","MASS_16");
assert.deepEqual(original.printedPages,["54*"]);
assert.equal(original.originalPageImages[0],m40.original1961Edition.scan);
assert.equal(original.gabcMusicallyCertified,false);
assert.equal(m40.independentCorroboration.length,2);
const inv=sourceNoteGroupInventory(entry.gabc);
assert.equal(inv.noteBearingSourceTokens,27);
assert.equal(m38.sourceSyllableGroupIndex.length,27);
assert.equal(m40.originalPrintedObservations.length,7);
assert.deepEqual(m40.originalPrintedObservations.map(x=>x.sourceGroupOrdinal),[21,22,23,24,25,26,27]);
const printedStaff=[
 [21,["space2"]],[22,["line3","space3"]],[23,["space3","space3"]],
 [24,["space2"]],[25,["line3","line4"]],[26,["line3"]],
 [27,["space3","space2","line3","space2","line2","space1"]]
];
let seen=0;
for(let i=0;i<printedStaff.length;i++){
 const [id,print]=printedStaff[i];
 const r=m40.originalPrintedObservations[i];
 const orig=m38.sourceSyllableGroupIndex[id-1];
 assert.equal(r.sourceGroupOrdinal,id);
 assert.equal(r.originalLatinSyllable,orig.sourceSyllable);
 assert.equal(r.printedSystem,2);
 assert.equal(r.printedFolio,"54*");
 assert.equal(r.sourceGabcNeume,inv.groups[id-1].gabcOriginalNotes);
 assert.equal(r.sourceGabcNeume,orig.sourceOriginalNeume);
 assert.deepEqual(r.printedStaffPlacementsAsRead,print);
 assert.deepEqual(r.sourceGabcStaffPlacementsForComparison,orig.sourcePitchPositionsFromC4);
 assert.deepEqual(r.printedStaffPlacementsAsRead,r.sourceGabcStaffPlacementsForComparison);
 assert.deepEqual(r.sourceGlobalNoteheadOrdinals,orig.sourceNoteheads.map(n=>n.sourceGlobalOrdinal));
 assert.equal(r.scanLevelStaffHeightAgreement,"VISUALLY_CONSISTENT_AT_SCAN_RESOLUTION");
 assert.equal(r.independentPrintedTotalNoteCountCertified,false);
 assert.equal(r.exactPrintedNotePitchesCertified,false);
 assert.equal(r.printedNeumeJoiningAndShapesCertified,false);
 assert.equal(r.printedRhythmicMarksCertified,false);
 assert.equal(r.printedSyllabicUnderlayCertified,false);
 assert.equal(r.editorApproved,false);
 assert.ok(r.observation.length>50);
 seen+=print.length;
}
assert.equal(seen,15);
const tally=m40.sourceCoverageSummary;
assert.equal(tally.m37Groups,7);assert.equal(tally.m37SourceNotePositions,9);
assert.equal(tally.m39Groups,13);assert.equal(tally.m39SourceNotePositions,16);
assert.equal(tally.m40Groups,7);assert.equal(tally.m40SourceNotePositions,15);
assert.equal(tally.cumulativeGroupsWithVisualStaffHeightSurvey,27);
assert.equal(tally.cumulativeSourceNotePositionsWithVisualStaffHeightSurvey,40);
assert.equal(tally.remainingGroupsForScanLevelStaffHeightSurvey,0);
assert.equal(tally.remainingSourceNotePositionsForScanLevelStaffHeightSurvey,0);
assert.equal(tally.sourceScoresStored,20);
assert.equal(tally.sourceScoresStructurallySurveyed,20);
assert.equal(tally.sourceScoresFullyMusicallyCertified,0);
assert.equal(tally.sourceScoresEditorApproved,0);
assert.equal(tally.independentlyCountedPrintedNoteheads,0);
assert.equal(tally.exactPrintedNeumeAndSignParityCertified,0);
assert.equal(inv.groups.reduce((a,r)=>a+[...r.gabcOriginalNotes].filter(n=>/[a-m]/i.test(n)).length,0),40);
assert.deepEqual(m40.distinctFinalCadence.groups,[21,22,23,24,25,26,27]);
assert.equal(m40.distinctFinalCadence.sourceLastGroupGabc,"ighvGFE.");
assert.deepEqual(m40.distinctFinalCadence.sourceLastGroupLetters,["i","g","h","G","F","E"]);
assert.deepEqual(m40.distinctFinalCadence.sourceLastGroupStaffHeights,printedStaff[6][1]);
assert.deepEqual(m40.distinctFinalCadence.sourceThreeInclinedPitches,["G","F","E"]);
assert.equal(m40.distinctFinalCadence.sourceVirgaMarkerPosition,"after h, before G");
assert.equal(m40.distinctFinalCadence.sourceTerminalMora,true);
assert.equal(m40.distinctFinalCadence.sourceNoteheadsIndependentlyMatchedToPrint,false);
assert.equal(m40.distinctFinalCadence.sourceSpecificNeumeShapesAndMarksMatchedToPrint,false);
assert.equal(m40.distinctFinalCadence.reviewerApproved,false);
assert.deepEqual(m40.blockingPrintedSignAndEditorialGates.map(x=>x.issue),[
 "MORA_DOTS","HORIZONTAL_EPISEMATA","VIRGA_AND_PUNCTA_INCLINATA",
 "PRINTED_SYSTEM_BREAK_AND_CUSTOS","PRINTED_SYLLABLE_UNDERLAY_AND_NEUME_JOINS",
 "INDEPENDENT_EDITORIAL_CERTIFICATION"
]);
assert.ok(m40.blockingPrintedSignAndEditorialGates.every(x=>x.printStatus.includes("UNRESOLVED")||x.printStatus==="NOT_AUTHORIZED"));
assert.deepEqual(m40.blockingPrintedSignAndEditorialGates[0].sourceGroups,[7,13,20,27]);
assert.deepEqual(m40.blockingPrintedSignAndEditorialGates[1].sourceGroups,[5,11,18]);
for(const [key,value] of Object.entries(m40.publicationBoundary)){
 assert.equal(value,true,"Release/approval firewall unexpectedly changed: "+key);
}
const input={paragraph:{kind:"TEXT",id:"AO.SM.C0044",sourceCueIds:["AO.SM.C0044"],
sourceBlockId:"AO.SM.B015",primary:"Canonical source-owned Kyrie"},form:"SOLEMN",
 resolvedMass:{},selectedSettings:{KYRIE:"MASS_16"}};
const selected=sourceBoundOrdinaryReferenceScores(input);
assert.equal(selected.length,1);
assert.equal(selected[0].gabc,entry.gabc);
assert.equal(selected[0].publicScoreApproved,false);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,selectedSettings:{}}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,form:"LOW"}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,resolvedMass:{provenance:{isRequiem:true}}}),[]);
console.log("PASS M40: all 27/27 Kyrie XVI print staff-position groups (40/40 source noteheads) have scan-level records; exact printed marks, pitch parity and independent editorial certification remain blocked");
