import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {sourceNoteGroupInventory}
 from "../src/mass/reader-kyriale-source-note-groups.js";
import {offlineKyrialeResearchScore}
 from "../src/mass/reader-kyriale-research-gabc.js";
import {schola1961OriginalFacsimile}
 from "../src/mass/reader-schola-original-facsimile.js";
import {sourceBoundOrdinaryReferenceScores}
 from "../src/mass/reader-inline-ordinary-reference.js";
const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const m31=json("../data/research/mass-music-m31-five-short-score-print-visual-pass.v1.json");
const m36=json("../data/research/mass-music-m36-final-seven-1961-print-survey.v1.json");
const m37=json("../data/research/mass-music-m37-kyrie-xvi-partial-note-position-collation.v1.json");

function fnv1a32(v){let h=0x811c9dc5;for(let i=0;i<v.length;i++)
 h=Math.imul(h^v.charCodeAt(i),0x01000193);
 return (h>>>0).toString(16).padStart(8,"0");
}
const entry=offlineKyrialeResearchScore("KYRIE","MASS_16");
assert.equal(entry?.scoreId,"GREGOBASE-545");
assert.equal(entry.scoreApproved,false);
assert.equal(entry.status,"RESEARCH_TRANSCRIPTION_NOT_FACSIMILE_APPROVED");
assert.equal(m37.sourceGabcFingerprintUtf16Fnv1a32,fnv1a32(entry.gabc));
assert.equal(m37.sourceGabcFingerprintUtf16Fnv1a32,"acef0d62");
assert.equal(m37.sourceGabcClef,"c4");
assert.match(entry.gabc,/%%\s*\(c4\) KY\(g\)ri\(hi\)e\(ii\)/);
const print=schola1961OriginalFacsimile("KYRIE","MASS_16");
assert.ok(print);
assert.deepEqual(print.printedPages,["54*"]);
assert.deepEqual(print.originalPageImages,[m37.printedPageImage]);
assert.equal(print.gabcMusicallyCertified,false);

const inv=sourceNoteGroupInventory(entry.gabc);
const original=m31.kyrieXviGroupVisualMap;
assert.equal(original.length,27);
assert.equal(inv.noteBearingSourceTokens,27);
assert.equal(m37.sourceGroupRecords.length,27);
assert.equal(m37.coverage.thisScoreSourceGroups,27);
assert.equal(m37.coverage.publishedKyrialeResearchScores,20);
assert.equal(m36.cumulativeCoverage.totalDistinctStructurallySurveyed,20);
assert.equal(m37.coverage.groupsWithAdditionalManualPrintedStaffHeightComparison,7);
assert.equal(m37.coverage.notePositionsInThoseGroups,9);
assert.equal(m37.coverage.remainingGroupsAwaitingDetailedPrintedStaffComparison,20);
assert.equal(m37.coverage.notePositionsInRemainingGroups,31);
assert.equal(m37.coverage.printedFullPitchAndNeumeCertifiedGroups,0);
assert.equal(m37.coverage.printedCertifiedScores,0);

const LETTERS="abcdefghijklm";
const staffSlot=letter=>LETTERS.indexOf(letter.toLowerCase())-3;
const staffLabel=s=>({0:"line1",1:"space1",2:"line2",3:"space2",
 4:"line3",5:"space3",6:"line4",7:"spaceAbove4",8:"ledgerAbove4"})[s]
 ??"outsideNormalStaff";
let notePositions=0;
for(let i=0;i<27;i++){
 const x=m37.sourceGroupRecords[i],old=original[i],g=inv.groups[i];
 assert.equal(x.ordinal,i+1);
 assert.equal(x.ordinal,g.ordinal);
 assert.equal(x.ordinal,old.ordinal);
 assert.equal(x.printedFolio,"54*");
 assert.equal(x.printedSystem,old.originalPrintSystem);
 assert.equal(x.phrase,old.phrase);
 assert.equal(x.syllable,old.originalLatinSyllable);
 assert.equal(x.sourceGabcNeume,old.sourceGabcNotes);
 assert.equal(x.sourceGabcNeume,g.gabcOriginalNotes,
  "Original source changed: require fresh print collation before reusing M37");
 const letters=[...g.gabcOriginalNotes].filter(c=>/[a-m]/i.test(c));
 const slots=letters.map(staffSlot);
 assert.deepEqual(x.sourcePitchLetters,letters);
 assert.deepEqual(x.sourceStaffSlotsFromBottomLine,slots);
 assert.deepEqual(x.sourceStaffPlacements,slots.map(staffLabel));
 notePositions+=letters.length;
 assert.equal(x.allPrintedPitchesCertified,false);
 assert.equal(x.editorialApproval,false);
 for(const key of ["sourceVsPrintNeumeShape","sourceVsPrintEpisemaMora",
   "sourceVsPrintAccidentals","sourceVsPrintSyllableUnderlay"])
  assert.equal(x[key],"NOT_CERTIFIED");
 if(i<7){
  assert.equal(x.printEvidenceStatus,"MANUAL_STAFF_POSITION_CONSISTENT_AT_AVAILABLE_SCAN_RESOLUTION");
  assert.equal(x.visualPitchPositionAgrees,true);
  assert.deepEqual(x.observedPrintedStaffPlacements,x.sourceStaffPlacements);
 }else{
  assert.equal(x.printEvidenceStatus,"DETAILED_PRINTED_NOTE_COMPARISON_PENDING");
  assert.equal(x.visualPitchPositionAgrees,undefined);
  assert.equal(x.observedPrintedStaffPlacements,undefined);
 }
}
assert.equal(notePositions,40);
assert.equal(m37.coverage.thisScoreGabcNotePositionLetters,40);
assert.equal(m37.coverage.notePositionsInThoseGroups+
 m37.coverage.notePositionsInRemainingGroups,40);
assert.deepEqual(m37.firstPhraseObservedSequence.groupOrdinals,[1,2,3,4,5,6,7]);
assert.deepEqual(m37.firstPhraseObservedSequence.sourcePitchLetters,
 ["g","hi","ii","g","h","i","i"]);
assert.deepEqual(m37.firstPhraseObservedSequence.sourceStaffHeights,
 m37.sourceGroupRecords.slice(0,7).map(x=>x.sourceStaffPlacements));
assert.equal(m37.firstPhraseObservedSequence.status,
 "VISUALLY_CONSISTENT_AT_SCAN_RESOLUTION_NOT_EDITORIALLY_CERTIFIED");
// The printed line/space observation is not a facsimile musical approval.
assert.equal(m37.publication.printedScoreCertified,false);
assert.equal(m37.publication.sourceGabcRewritten,false);
assert.equal(m37.publication.canonical65CardsChanged,false);
assert.equal(m37.publication.localProgrammeAssigned,false);
assert.deepEqual(m37.priorityDiscrepancyQueue.map(x=>x.status),
 ["OPEN","OPEN","OPEN","OPEN"]);
const anchor={kind:"TEXT",id:"AO.SM.C0044",sourceCueIds:["AO.SM.C0044"],
 sourceBlockId:"AO.SM.B015",primary:"Source-owned Kyrie"};
const input={paragraph:anchor,form:"SOLEMN",resolvedMass:{},
 selectedSettings:{KYRIE:"MASS_16"}};
const selected=sourceBoundOrdinaryReferenceScores(input);
assert.equal(selected.length,1);
assert.equal(selected[0].gabc,entry.gabc);
assert.equal(selected[0].publicScoreApproved,false);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,selectedSettings:{}}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,form:"LOW"}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
 resolvedMass:{provenance:{isRequiem:true}}}),[]);
console.log("PASS M37: Kyrie XVI printed first-phrase staff-height review 7 groups/9 source positions; remaining 20/31 held; 0 music certificates; 65-card source binding intact");
