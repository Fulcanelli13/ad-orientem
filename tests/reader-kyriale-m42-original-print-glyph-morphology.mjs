import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
import {extractKyrieXviNoteSignAttachments} from "../src/mass/reader-kyriale-research-sign-attachments.js";
import {sourceBoundOrdinaryReferenceScores} from "../src/mass/reader-inline-ordinary-reference.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const m41=read("../data/research/mass-music-m41-kyrie-xvi-exact-source-sign-attachment-original-print-gates.v1.json");
const m42=read("../data/research/mass-music-m42-kyrie-xvi-triwitness-print-glyph-morphology.v1.json");
const entry=offlineKyrialeResearchScore("KYRIE","MASS_16");
assert.equal(entry?.scoreId,"GREGOBASE-545");
assert.equal(entry.scoreApproved,false);
function fnv32(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),0x01000193);return(h>>>0).toString(16).padStart(8,"0")}
assert.equal(fnv32(entry.gabc),"acef0d62");
assert.equal(m42.gabcFingerprintUtf16Fnv1a32,"acef0d62");
assert.equal(m42.gabcFingerprintUtf16Fnv1a32,m41.sourceGabcFingerprintUtf16Fnv1a32);
assert.equal(entry.gabc.split("%%")[1].trim(),m42.historicSourceAudit.source2023GabcFourLines);
assert.equal(m42.historicSourceAudit.verifiedProvenanceChanges.length,2);
assert.ok(m42.historicSourceAudit.verifiedProvenanceChanges.every(x=>x.sourceScorePitchChangesClaimed===false));
assert.deepEqual(m42.historicSourceAudit.verifiedProvenanceChanges[1].texControlNames,
 ["linepunctummorashift","gresetclivisalignment"]);
assert.equal(m42.historicSourceAudit.verifiedProvenanceChanges[1].requiresRenderingParityReviewBeforeCopyingControls,true);
assert.ok(m42.historicSourceAudit.consumerRendererWarning.includes("Exsurge"));
assert.equal(m42.authority.originalPrintWitnesses.graduale.folio,"54*");
assert.equal(m42.authority.originalPrintWitnesses.liber.folio,"59");
assert.equal(m42.authority.originalPrintWitnesses.chants.folio,"40");
assert.equal(m42.authority.gregobaseOriginalPrintSourceProofread.scope,
 "EXTERNAL_GREGOBASE_PROOFREAD_STATUS_NOT_INDEPENDENT_AO_EDITIONAL_APPROVAL");

const features=m42.witnessBasedPrintedFeatures;
assert.equal(features.length,6);
assert.deepEqual(features.map(x=>x.featureId),[
 "ENDING_SEPARATE_MELODY",
 "PUNCTA_INCLINATA_DESCENDING_TAIL",
 "FINAL_CADENCE_STEM_OR_VIRGA",
 "FINAL_TERMINAL_DOT",
 "LE_TWO_NOTES_NOT_EPISEMA",
 "THIRD_KYRIE_SYSTEM_BREAK"]);
assert.ok(features.every(x=>x.exactSignParity===false&&x.printedObservation.length>=85));
assert.ok(features.every(x=>x.morphology!==undefined&&x.confidence.includes("FOR_")));
assert.deepEqual(features[1].sourceGlobalNoteheads,[38,39,40]);
assert.deepEqual(features[2].sourceGlobalNoteheads,[37]);
assert.deepEqual(features[3].sourceGlobalNoteheads,[40]);
assert.deepEqual(features[4].sourceGlobalNoteheads,[32,33]);
const parsed=extractKyrieXviNoteSignAttachments(entry.gabc);
assert.equal(parsed.noteheads.length,40);
assert.equal(parsed.signOccurrences.length,11);
const signEvidence=m42.sourceSignCrossWitnessEvidence;
assert.equal(signEvidence.length,11);
for(let i=0;i<11;i++){
 const source=parsed.signOccurrences[i],row=signEvidence[i],prev=m41.originalSourceSignAttachments[i];
 assert.equal(row.signKind,source.type);
 assert.equal(row.sourceNoteOrdinal,source.sourceGlobalNoteOrdinal);
 assert.equal(row.sourceGroupOrdinal,source.sourceGroupOrdinal);
 assert.equal(row.signKind,prev.signKind);
 assert.deepEqual(row.witnessAgreement.map(x=>x.witness),["graduale","liber","chants"]);
 assert.ok(row.witnessAgreement.every(x=>x.independentExactPitchAndAttachmentCertainty===false));
 assert.equal(row.printedTargetNoteEditoriallyConfirmed,false);
 assert.equal(row.printedSignLengthAndSideVerified,false);
 assert.equal(row.printedGlyphShapeIndependentlyCertified,false);
 assert.equal(row.confidenceIsNotApproval,true);
 assert.notEqual(row.printedSignFamilyPresence,"EXACT_CERTIFIED");
}
assert.deepEqual(signEvidence.filter(x=>x.signKind==="HORIZONTAL_EPISEMA").map(x=>x.sourceNoteOrdinal),[7,14,23]);
assert.deepEqual(signEvidence.filter(x=>x.signKind==="PUNCTUM_MORA").map(x=>x.sourceNoteOrdinal),[9,16,25,40]);
assert.deepEqual(signEvidence.filter(x=>x.signKind==="VIRGA").map(x=>x.sourceNoteOrdinal),[37]);
assert.deepEqual(signEvidence.filter(x=>x.signKind==="PUNCTUM_INCLINATUM").map(x=>x.sourceNoteOrdinal),[38,39,40]);
const status=m42.independentPrintGlyphStatus;
assert.equal(status.sourceTotalNoteheads,40);
assert.equal(status.sourceTotalNoteGroups,27);
assert.equal(status.sourceSignOccurrences,11);
assert.equal(status.visuallyObservedPrintedMorphologyFeatures,6);
assert.equal(status.independentyCountedOriginalPrintedNoteheads,null);
assert.equal(status.finalInclinedGlyphGroupVisuallyPresent,true);
assert.equal(status.finalMoraDotLikeMarkVisuallyPresent,true);
assert.equal(status.exactIndividualPrintedNotePitchCountCertified,false);
assert.equal(status.sourceLastNoteEPrintedDotAttachmentCertified,false);
assert.equal(status.sourceVirgaPrintedStemExactParityCertified,false);
assert.equal(status.originalEpisemataMatchedToSourceNotes,0);
assert.equal(status.originalMoraMatchedToSourceNotes,0);
assert.equal(status.editorCertifiedScores,0);
assert.deepEqual(status.proposedSourceCorrections,[]);
assert.ok(m42.printCollationLimitations.length>=4);
assert.equal(m42.nextAction.gate,"INDEPENDENT_HIGH_RESOLUTION_FACSIMILE_COLLATION");
assert.equal(m42.nextAction.publicScoreApprovalBlocked,true);
assert.equal(m42.changes.researchOnly,true);
assert.equal(m42.changes.sourceGabcUnchanged,true);
assert.equal(m42.changes.productionReaderUnchanged,true);
assert.equal(m42.changes.canonical65Unchanged,true);
assert.equal(m42.changes.automaticScholaSettingUnchanged,true);
assert.equal(m42.changes.gregoBaseHistoricalNotesNotImportedIntoRenderer,true);
assert.equal(m42.changes.musicalCertificationGranted,false);
const input={paragraph:{kind:"TEXT",id:"AO.SM.C0044",sourceCueIds:["AO.SM.C0044"],
 sourceBlockId:"AO.SM.B015",primary:"Source-owned Latin Kyrie"},form:"SOLEMN",
 resolvedMass:{},selectedSettings:{KYRIE:"MASS_16"}};
const selected=sourceBoundOrdinaryReferenceScores(input);
assert.equal(selected.length,1);
assert.equal(selected[0].gabc,entry.gabc);
assert.equal(selected[0].publicScoreApproved,false);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,selectedSettings:{}}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,form:"LOW"}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,resolvedMass:{provenance:{isRequiem:true}}}),[]);
console.log("PASS M42: three original Solesmes printed glyph-family comparisons and exact 2023 historical GABC invariant, 11 source signs held for independent microglyph certification");
