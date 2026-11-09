import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {extractKyrieXviNoteSignAttachments}
 from "../src/mass/reader-kyriale-research-sign-attachments.js";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
import {sourceNoteGroupInventory} from "../src/mass/reader-kyriale-source-note-groups.js";
import {schola1961OriginalFacsimile} from "../src/mass/reader-schola-original-facsimile.js";
import {sourceBoundOrdinaryReferenceScores} from "../src/mass/reader-inline-ordinary-reference.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const m38=load("../data/research/mass-music-m38-kyrie-xvi-source-notehead-and-print-sign-gates.v1.json");
const m40=load("../data/research/mass-music-m40-kyrie-xvi-final-seven-printed-staff-survey.v1.json");
const m41=load("../data/research/mass-music-m41-kyrie-xvi-exact-source-sign-attachment-original-print-gates.v1.json");
const entry=offlineKyrialeResearchScore("KYRIE","MASS_16");
assert.equal(entry?.scoreId,"GREGOBASE-545");
assert.equal(entry.scoreApproved,false);
const checksum=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),0x01000193);return(h>>>0).toString(16).padStart(8,"0")};
assert.equal(checksum(entry.gabc),"acef0d62");
assert.equal(m41.sourceGabcFingerprintUtf16Fnv1a32,checksum(entry.gabc));
assert.equal(m40.originalGabcFingerprintUtf16Fnv1a32,checksum(entry.gabc));
const original=schola1961OriginalFacsimile("KYRIE","MASS_16");
assert.deepEqual(original.printedPages,["54*"]);
assert.deepEqual(original.originalPageImages,[m41.authority.primary.fullPageScan]);
assert.equal(original.gabcMusicallyCertified,false);
assert.equal(m41.authority.primary.pdfPage1Based,56);
assert.equal(m41.authority.secondary.length,2);
assert.equal(m41.authority.gabcOfficialDocumentation.length,3);

const parsed=extractKyrieXviNoteSignAttachments(entry.gabc);
const inv=sourceNoteGroupInventory(entry.gabc);
assert.equal(inv.groups.length,27);
assert.equal(parsed.schema,"ao-kyrie-xvi-source-note-attachments-v1");
assert.equal(parsed.sourceOnly,true);
assert.equal(parsed.musicalPrintCertification,false);
assert.equal(parsed.noteheads.length,40);
assert.equal(parsed.signOccurrences.length,11);
assert.equal(m40.sourceCoverageSummary.cumulativeGroupsWithVisualStaffHeightSurvey,27);
assert.equal(m40.sourceCoverageSummary.cumulativeSourceNotePositionsWithVisualStaffHeightSurvey,40);
assert.equal(m41.originalSourceSignAttachments.length,11);

for(let i=0;i<40;i++){
 const note=parsed.noteheads[i];
 const old=m38.sourceSyllableGroupIndex[note.groupOrdinal-1];
 assert.equal(note.globalNoteOrdinal,i+1);
 assert.equal(note.sourceNoteLetter,undefined); // exact source letter field is sourcePitchLetter
 assert.equal(note.syllable,old.sourceSyllable);
 assert.equal(note.sourceNeume,old.sourceOriginalNeume);
 assert.equal(note.sourcePitchLetter,old.sourceNoteheads[note.localNoteOrdinal-1].pitchLetter);
 assert.equal(note.printedStaffTarget,old.sourceNoteheads[note.localNoteOrdinal-1].staffLineSpace);
}
const expected=[
 ["HORIZONTAL_EPISEMA","_",5,7,"h","line3"],
 ["PUNCTUM_MORA",".",7,9,"i","space3"],
 ["HORIZONTAL_EPISEMA","_",11,14,"h","line3"],
 ["PUNCTUM_MORA",".",13,16,"i","space3"],
 ["HORIZONTAL_EPISEMA","_",18,23,"h","line3"],
 ["PUNCTUM_MORA",".",20,25,"i","space3"],
 ["VIRGA","v",27,37,"h","line3"],
 ["PUNCTUM_INCLINATUM","G",27,38,"G","space2"],
 ["PUNCTUM_INCLINATUM","F",27,39,"F","line2"],
 ["PUNCTUM_INCLINATUM","E",27,40,"E","space1"],
 ["PUNCTUM_MORA",".",27,40,"E","space1"]
];
assert.deepEqual(parsed.signOccurrences.map(s=>
 [s.type,s.token,s.sourceGroupOrdinal,s.sourceGlobalNoteOrdinal,
  s.sourceNoteLetter,s.sourceStaffPosition]),expected);
assert.deepEqual(m41.originalSourceSignAttachments.map(s=>
 [s.signKind,s.gabcToken,s.sourceGroupOrdinal,s.sourceGlobalNoteOrdinal,
  s.sourceGabcNoteLetter,s.sourceStaffLocation]),expected);
for(let i=0;i<11;i++){
 const source=parsed.signOccurrences[i],row=m41.originalSourceSignAttachments[i];
 assert.equal(row.sourceGlobalNoteOrdinal,source.sourceGlobalNoteOrdinal);
 assert.equal(row.printedSystem,row.sourceGroupOrdinal<=14?1:2);
 assert.equal(row.originalPrintedFolio,"54*");
 assert.ok(row.engravingObservationAtDisplayResolution.length>40);
 assert.notEqual(row.originalPrintWitnessStatus,"CERTIFIED");
 assert.equal(row.originalPrintSignPositionCertified,false);
 assert.equal(row.originalPrintSignShapeCertified,false);
 assert.equal(row.originalPrintedNoteIndexIndependentlyAssigned,false);
 assert.equal(row.independentEditorialApproval,false);
 assert.equal(row.proposedGabcCorrection,null);
}
const byType=type=>parsed.signOccurrences.filter(s=>s.type===type)
 .map(s=>s.sourceGlobalNoteOrdinal);
assert.deepEqual(byType("HORIZONTAL_EPISEMA"),[7,14,23]);
assert.deepEqual(byType("PUNCTUM_MORA"),[9,16,25,40]);
assert.deepEqual(byType("VIRGA"),[37]);
assert.deepEqual(byType("PUNCTUM_INCLINATUM"),[38,39,40]);
const cover=m41.verifiedSourceSignOccurrences;
assert.equal(cover.totalSignOccurrences,11);
assert.equal(new Set(parsed.signOccurrences.map(s=>s.sourceGlobalNoteOrdinal)).size,10);
assert.equal(cover.distinctSourceNoteheadsWithFlags,10);
assert.equal(cover.horizontalEpisemaCount,3);
assert.equal(cover.moraDotCount,4);
assert.equal(cover.virgaCount,1);
assert.equal(cover.inclinedNoteCount,3);
assert.deepEqual(cover.horizontalEpisemaSourceGlobalNotes,byType("HORIZONTAL_EPISEMA"));
assert.deepEqual(cover.moraDotSourceGlobalNotes,byType("PUNCTUM_MORA"));
assert.deepEqual(cover.virgaSourceGlobalNotes,byType("VIRGA"));
assert.deepEqual(cover.inclinedSourceGlobalNotes,byType("PUNCTUM_INCLINATUM"));
assert.deepEqual(parsed.signOccurrences.filter(s=>s.sourceGlobalNoteOrdinal===40).map(s=>s.type),
 ["PUNCTUM_INCLINATUM","PUNCTUM_MORA"]);
assert.equal(cover.comparisonGroupsWithTwoNotePedalVersusEpisema.twoNoteFinalAccent.source,"hj");
assert.equal(cover.comparisonGroupsWithTwoNotePedalVersusEpisema.oneNoteAccentedFirstPhrase.source,"h_");
assert.deepEqual(m41.engravingBlockers.map(x=>x.gate),[
 "PUNCTUM_MORA_ORIGINAL_PRINT","HORIZONTAL_EPISEMA_ORIGINAL_PRINT",
 "FINAL_VIRGA_AND_INCLINATA_ORIGINAL_PRINT","PRINTED_NOTEHEAD_COUNT_INDEPENDENT",
 "PRINTED_CUSTOS_AND_SYLLABIC_UNDERLAY","EDITOR_SIGN_OFF_AND_LICENSE"
]);
assert.ok(m41.engravingBlockers.every(x=>x.status==="HOLD"));
const s=m41.editorialState;
assert.equal(s.originalSourceSignAttachmentMechanicallyValidated,true);
assert.equal(s.sourceNotePositionsAccountedFor,40);
assert.equal(s.printedNoteheadsIndependentlyCounted,false);
assert.equal(s.exactPrintedSymbolParityCertified,false);
assert.equal(s.independentlyMusicallyApprovedScores,0);
assert.equal(s.publishedResearchGabcScores,20);
assert.equal(s.originalGabcChanged,false);
assert.equal(s.readerRuntimeChanged,false);
assert.equal(s.canonical65CardsChanged,false);
assert.equal(s.automaticChantSettingSelected,false);
assert.equal(s.requiemInferred,false);
assert.equal(s.sourceCodePromotionBlocked,true);
const input={paragraph:{kind:"TEXT",id:"AO.SM.C0044",sourceCueIds:["AO.SM.C0044"],
sourceBlockId:"AO.SM.B015",primary:"Canonical source-owned Kyrie"},form:"SOLEMN",
resolvedMass:{},selectedSettings:{KYRIE:"MASS_16"}};
const chosen=sourceBoundOrdinaryReferenceScores(input);
assert.equal(chosen.length,1);
assert.equal(chosen[0].gabc,entry.gabc);
assert.equal(chosen[0].publicScoreApproved,false);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,selectedSettings:{}}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,form:"LOW"}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,resolvedMass:{provenance:{isRequiem:true}}}),[]);
console.log("PASS M41: original GABC 11 signs pinned to 10 exact noteheads; printed rhythmic parity held, score unchanged, independent selection preserved");
