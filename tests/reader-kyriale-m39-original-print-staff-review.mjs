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
const source=offlineKyrialeResearchScore("KYRIE","MASS_16");
assert.equal(source?.scoreId,"GREGOBASE-545");
assert.equal(source.scoreApproved,false);
const f=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),0x01000193);return(h>>>0).toString(16).padStart(8,"0")};
assert.equal(m39.sourceGabcFingerprintUtf16Fnv1a32,"acef0d62");
assert.equal(f(source.gabc),m39.sourceGabcFingerprintUtf16Fnv1a32);
assert.equal(m39.sourceGabcFingerprintUtf16Fnv1a32,m38.sourceGabcFingerprintUtf16Fnv1a32);
assert.equal(m39.sourceGabcFingerprintUtf16Fnv1a32,m37.sourceGabcFingerprintUtf16Fnv1a32);
const inv=sourceNoteGroupInventory(source.gabc);
assert.equal(inv.groups.length,27);
assert.equal(m38.scope.sourceNoteheadsIndexed,40);
assert.equal(m37.coverage.groupsWithAdditionalManualPrintedStaffHeightComparison,7);
assert.equal(m37.coverage.notePositionsInThoseGroups,9);
assert.equal(m39.newlyComparedGroups.first,8);
assert.equal(m39.newlyComparedGroups.last,20);
assert.equal(m39.newlyComparedGroups.count,13);
assert.deepEqual(m39.newlyComparedGroups.sourceGroupIds,[8,9,10,11,12,13,14,15,16,17,18,19,20]);
assert.equal(m39.newlyComparedGroups.sourcePitchPositions,16);
assert.equal(m39.cumulativeDetailedPrintedStaffPositionReview.groupCount,20);
assert.equal(m39.cumulativeDetailedPrintedStaffPositionReview.sourceNotePositions,25);
assert.deepEqual(m39.cumulativeDetailedPrintedStaffPositionReview.groups,
 Array.from({length:20},(_,i)=>i+1));
assert.deepEqual(m39.cumulativeDetailedPrintedStaffPositionReview.remainingGroups,
 [21,22,23,24,25,26,27]);
assert.equal(m39.cumulativeDetailedPrintedStaffPositionReview.remainingSourceNotePositions,15);
assert.equal(m39.cumulativeDetailedPrintedStaffPositionReview.fullyPrintedPitchAndNeumeCertifiedGroups,0);
assert.equal(m39.cumulativeDetailedPrintedStaffPositionReview.approvedScores,0);
const fasc=schola1961OriginalFacsimile("KYRIE","MASS_16");
assert.deepEqual(fasc.printedPages,["54*"]);
assert.deepEqual(fasc.originalPageImages,[m39.primaryOriginalWitness.scan]);
assert.equal(m39.primaryOriginalWitness.printedPdfZeroBasedPage,55);
assert.equal(fasc.gabcMusicallyCertified,false);
assert.equal(m39.corroboratingOriginalWitnesses.length,2);
assert.equal(m39.newPrintedPositionObservations.length,13);

// These independently typed expected printed staff positions must remain distinct
// from the M38 source-derived slot field. A drift fails rather than granting
// a sham "matched" musical certification.
const manuallyObservedStaff=[
 [8,["spaceAbove4"],1],[9,["space3","line4"],1],
 [10,["line3"],1],[11,["line3"],1],
 [12,["space3"],1],[13,["space3"],1],
 [14,["space2"],1],[15,["line3","space3"],2],
 [16,["space3","space3"],2],[17,["space2"],2],
 [18,["line3"],2],[19,["space3"],2],[20,["space3"],2]
];
let manuallyObservedNotes=0;
for(let i=0;i<manuallyObservedStaff.length;i++){
 const [id,staff,system]=manuallyObservedStaff[i];
 const row=m39.newPrintedPositionObservations[i],sourceGroup=m38.sourceSyllableGroupIndex[id-1];
 assert.equal(row.n,id);
 assert.equal(row.system,system);
 assert.equal(row.syllable,sourceGroup.sourceSyllable);
 assert.equal(row.sourceNeume,sourceGroup.sourceOriginalNeume);
 assert.equal(row.sourceNeume,inv.groups[id-1].gabcOriginalNotes);
 assert.deepEqual(row.printPositions,staff);
 assert.deepEqual(row.sourcePositions,sourceGroup.sourcePitchPositionsFromC4);
 assert.deepEqual(row.printPositions,row.sourcePositions);
 assert.equal(row.reviewType,"MANUAL_ORIGINAL_PRINT_LINE_SPACE_AT_AVAILABLE_SCAN_RESOLUTION");
 assert.equal(row.visualPositionAgreement,"CONSISTENT_AT_AVAILABLE_SCAN_RESOLUTION");
 assert.equal(row.originalPrintedAbsolutePitchAndOctaveCertification,"NOT_CERTIFIED");
 assert.equal(row.originalPrintedNeumeJoins,"NOT_CERTIFIED");
 assert.equal(row.originalPrintedRhythmMarks,"NOT_CERTIFIED");
 assert.equal(row.independentEditorialSignoff,false);
 assert.ok(row.evidence.length>30);
 manuallyObservedNotes+=staff.length;
}
assert.equal(manuallyObservedNotes,16);
const b=m39.importantPrintedPhraseBoundary;
assert.equal(b.groupBeforeBreak,14);
assert.equal(b.groupAfterBreak,15);
assert.equal(b.fromPrintedSystem,1);
assert.equal(b.toPrintedSystem,2);
assert.equal(b.printedCustosExactParity,"UNRESOLVED");
assert.equal(b.mustNotCreateNewMusicalScore,true);
assert.equal(b.mustNotRepeatFirstPhraseByAssumption,true);
assert.deepEqual(m39.openPrintedEngravingHolds.map(x=>x.groups),
 [[11,18],[13,20],[14,15],[21,22,23,24,25,26,27]]);
assert.ok(m39.openPrintedEngravingHolds.every(x=>x.status==="OPEN"));
const boundary=m39.editorialBoundary;
for(const key of ["sourceGabcRewritten","canonical65ReaderChanged",
 "sourceOwnedTextChanged","localChoirSettingInferred","recordingApproved",
 "originalPrintedNoteheadsIndependentlyCounted","printNoteByNoteCertificationGranted"])
 assert.equal(boundary[key],false);
assert.equal(boundary.all20ScoresStillProvisional,true);
assert.equal(boundary.sourceNotePositionsIndexed,40);

const input={paragraph:{kind:"TEXT",id:"AO.SM.C0044",sourceCueIds:["AO.SM.C0044"],
 sourceBlockId:"AO.SM.B015",primary:"Original canonical Kyrie"},form:"SOLEMN",
 resolvedMass:{},selectedSettings:{KYRIE:"MASS_16"}};
const chosen=sourceBoundOrdinaryReferenceScores(input);
assert.equal(chosen.length,1);
assert.equal(chosen[0].gabc,source.gabc);
assert.equal(chosen[0].publicScoreApproved,false);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,selectedSettings:{}}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,form:"LOW"}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
 resolvedMass:{provenance:{isRequiem:true}}}),[]);
console.log("PASS M39: 13 Christe/third Kyrie print-height groups (16 source positions), cumulative 20/27 groups and 25/40 source positions, final Kyrie and fine sign holds untouched");
