import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
import {sourceNoteGroupInventory} from "../src/mass/reader-kyriale-source-note-groups.js";
import {extractKyrieXviNoteSignAttachments} from "../src/mass/reader-kyriale-research-sign-attachments.js";
import {sourceBoundOrdinaryReferenceScores} from "../src/mass/reader-inline-ordinary-reference.js";
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const l=load("../data/research/mass-music-m43-kyrie-xvi-original-printed-noteheads.v1.json");
const m42=load("../data/research/mass-music-m42-kyrie-xvi-triwitness-print-glyph-morphology.v1.json");
const entry=offlineKyrialeResearchScore("KYRIE","MASS_16");
assert.equal(entry.scoreId,"GREGOBASE-545");
assert.equal(entry.scoreApproved,false);
const fnv=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),0x01000193);return(h>>>0).toString(16).padStart(8,"0")};
assert.equal(fnv(entry.gabc),"acef0d62");
assert.equal(l.sourceFingerprintUtf16Fnv1a32,fnv(entry.gabc));
assert.equal(m42.gabcFingerprintUtf16Fnv1a32,fnv(entry.gabc));
const pdf=l.original1961PrintedWitness;
assert.equal(pdf.originalPdf,"https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf");
assert.equal(pdf.pageNumberInPdf1Based,56);
assert.equal(pdf.printedFolio,"54*");
assert.equal(pdf.capturedDpi,420);
assert.deepEqual(pdf.physicalPagePx,[2520,3780]);
assert.match(pdf.originalPdfSha256,/^[a-f0-9]{64}$/);
assert.equal(pdf.originalPdfSha256,"119b084b5c0689fc3e87541143731f6526c404a018bc97d18e8c98a7635ce2bd");
assert.equal(pdf.cropManifestArtifact.artifactId,13668348594);
assert.equal(pdf.cropManifestArtifact.retentionDays,7);
assert.equal(pdf.cropManifestArtifact.doNotPublishOrCommitSourceImages,true);
for(const name of ["primaryTwoStavesImageSha256","firstStaffImageSha256",
 "secondStaffImageSha256","finalSonImageSha256"])assert.match(pdf.cropManifestArtifact[name],/^[0-9a-f]{64}$/);
assert.ok(pdf.pdfRenderNativePixelDetailLimit.includes("not independently measured"));
const printed=l.originalPrintedGroupCountsReadFromFacsimile;
const parsed=sourceNoteGroupInventory(entry.gabc);
assert.equal(printed.length,27);
assert.equal(parsed.noteBearingSourceTokens,27);
const expectedPhysicalCounts=[1,2,2,1,1,1,1,1,2,1,1,1,1,1,2,2,1,1,1,1,1,2,2,1,2,1,6];
assert.deepEqual(printed.map(x=>x.printedNoteheadCountManuallyCounted),expectedPhysicalCounts);
assert.equal(printed.reduce((sum,row)=>sum+row.printedNoteheadCountManuallyCounted,0),40);
assert.equal(printed.slice(0,14).reduce((s,x)=>s+x.printedNoteheadCountManuallyCounted,0),17);
assert.equal(printed.slice(14).reduce((s,x)=>s+x.printedNoteheadCountManuallyCounted,0),23);
for(let i=0;i<27;i++){
 const row=printed[i],source=parsed.groups[i];
 assert.equal(row.sourceGroupComparisonId,i+1);
 assert.equal(row.originalPrintedSyllable,source.syllable);
 assert.equal(row.original1961PrintedSystem,i<14?1:2);
 assert.equal(row.correspondingCrop,i<14?"kyrie-first-staff.png":"kyrie-second-staff.png");
 assert.equal(row.originalPageObservationStatus,"VISUALLY_COUNTED_ON_1961_P54_AT_420DPI");
 assert.equal(row.preciseBoundingBoxesNotPublished,true);
 assert.equal(row.printedNoteheadCountManuallyCounted,
   [...source.gabcOriginalNotes].filter(c=>/[a-m]/i.test(c)).length);
}
const counts=l.sourceVersusOriginalPrintCountCheck;
assert.equal(counts.printedGroupsIndependentlyIdentified,27);
assert.equal(counts.printedGroupsFirstSystem,14);
assert.equal(counts.printedGroupsSecondSystem,13);
assert.equal(counts.printedNoteheadsIndependentlyCounted,40);
assert.equal(counts.printedNoteheadsFirstSystem,17);
assert.equal(counts.printedNoteheadsSecondSystem,23);
assert.equal(counts.finalKyrieLast7PrintedNoteheads,15);
assert.equal(counts.closingSonPrintedNoteheads,6);
assert.equal(counts.sourceGabcNoteheadCount,40);
assert.equal(counts.exactCountAgreement,true);
assert.equal(counts.printedGroupHeadCountsAgreeWithGabc,true);
assert.equal(counts.independentFromGabcRendering,true);
assert.equal(counts.originalPhysicalPrintedGlyphCountCertifiedByQualifiedChantEditor,false);
assert.ok(counts.method.startsWith("Manual count of visible original"));
const ending=l.sixGlyphTerminalSonPhysicalSequence;
assert.equal(ending.length,6);
assert.deepEqual(ending.map(x=>x.staff),["space3","space2","line3","space2","line2","space1"]);
assert.deepEqual(ending.map(x=>x.gabcEquivalent),["i","g","hv","G","F","E."]);
assert.equal(ending[0].printedShape.includes("clivis"),true);
assert.equal(ending[1].printedShape.includes("clivis"),true);
assert.equal(ending[2].printedShape.includes("stemmed"),true);
assert.ok(ending.slice(3).every(x=>x.printedShape.includes("diamond")));
const origSigns=l.observedRhythmicAndNeumeSignFamilies;
assert.equal(origSigns.length,11);
assert.deepEqual(origSigns.map(x=>[x.kind,x.group,x.sourceGlobalNoteIndex]),[
 ["HORIZONTAL_EPISEMA",5,7],["PUNCTUM_MORA",7,9],
 ["HORIZONTAL_EPISEMA",11,14],["PUNCTUM_MORA",13,16],
 ["HORIZONTAL_EPISEMA",18,23],["PUNCTUM_MORA",20,25],
 ["VIRGA",27,37],["PUNCTUM_INCLINATUM",27,38],
 ["PUNCTUM_INCLINATUM",27,39],["PUNCTUM_INCLINATUM",27,40],
 ["PUNCTUM_MORA",27,40]
]);
const signs=extractKyrieXviNoteSignAttachments(entry.gabc);
assert.equal(signs.signOccurrences.length,11);
assert.deepEqual(origSigns.map(x=>x.kind),signs.signOccurrences.map(x=>x.type));
assert.deepEqual(origSigns.map(x=>x.sourceGlobalNoteIndex),signs.signOccurrences.map(x=>x.sourceGlobalNoteOrdinal));
assert.ok(origSigns.every(x=>x.primaryOriginalSourceVisuallyPresent===true));
assert.ok(origSigns.every(x=>x.independentlyHumanEditorApproved===false&&x.glyphMetricExactTraceCertified===false));
assert.equal(l.printedMarkObservation.horizontalEpisemataObserved,3);
assert.equal(l.printedMarkObservation.phraseMoraDotsObserved,4);
assert.equal(l.printedMarkObservation.finalVirgaObserved,1);
assert.equal(l.printedMarkObservation.finalInclinedDiamondsObserved,3);
assert.equal(l.printedMarkObservation.totalSourceSignFamilyOccurrencesVisuallyCorroborated,11);
assert.equal(l.printedMarkObservation.countOfDistinctPrintedSourceNoteheadsWithSigns,10);
assert.equal(l.printedMarkObservation.qualifiedHumanChantEditorSignoff,false);
assert.equal(l.printedMarkObservation.glyphExactLengthSideAndInkTraceCertified,false);
assert.equal(l.printedMarkObservation.other1961_1956WitnessesMicroglyphCertainty,false);
assert.equal(l.sourceOnlyPreviousGatesPreserved.fullyMusicallyCertifiedScoreCount,0);
assert.equal(l.sourceOnlyPreviousGatesPreserved.gabcUnchanged,true);
assert.equal(l.sourceOnlyPreviousGatesPreserved.canonical65CardReaderUnchanged,true);
assert.equal(l.sourceOnlyPreviousGatesPreserved.automaticSettingAssignment,false);
assert.ok(l.outstandingForMusicalApproval.length>=4);
const input={paragraph:{kind:"TEXT",id:"AO.SM.C0044",sourceCueIds:["AO.SM.C0044"],
sourceBlockId:"AO.SM.B015",primary:"Canonical source Kyrie"},form:"SOLEMN",
resolvedMass:{},selectedSettings:{KYRIE:"MASS_16"}};
const selected=sourceBoundOrdinaryReferenceScores(input);
assert.equal(selected.length,1);
assert.equal(selected[0].gabc,entry.gabc);
assert.equal(selected[0].publicScoreApproved,false);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,selectedSettings:{}}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,form:"LOW"}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,resolvedMass:{provenance:{isRequiem:true}}}),[]);
console.log("PASS M43: independent original 1961 print counts 40 physical noteheads in 27 groups; 11 visible sign families; original PDF/crop SHA-256 pinned; 0 editorial approvals");
