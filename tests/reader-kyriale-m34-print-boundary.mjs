import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {offlineKyrialeResearchScore,OFFLINE_KYRIALE_RESEARCH_SCORE_COUNT}
  from "../src/mass/reader-kyriale-research-gabc.js";
import {sourceNoteGroupInventory}
  from "../src/mass/reader-kyriale-source-note-groups.js";
import {schola1961OriginalFacsimile}
  from "../src/mass/reader-schola-original-facsimile.js";
import {sourceBoundOrdinaryReferenceScores}
  from "../src/mass/reader-inline-ordinary-reference.js";
import {isExplicitRequiemMass,requiemAgnusVariantsForResolvedMass}
  from "../src/mass/reader-requiem-conditions.js";

const ledger=JSON.parse(readFileSync(new URL(
 "../data/research/mass-music-m34-seasonal-print-first-audit.v1.json",
 import.meta.url),"utf8"));
assert.equal(ledger.registryCoverage.currentlyStoredSourceGabcScores,20);
assert.equal(OFFLINE_KYRIALE_RESEARCH_SCORE_COUNT,20);
assert.equal(ledger.registryCoverage.previouslyM31ShortScoresVisuallySurveyed,5);
assert.equal(ledger.registryCoverage.newlyM34DistinctScoresVisuallySurveyed,4);
assert.equal(ledger.registryCoverage.totalUniqueShortScoresWithStructuralVisualSurvey,9);
assert.equal(ledger.registryCoverage.printedNoteByNoteCertifiedScores,0);
assert.equal(ledger.publication.verifiedFullPrintedPitchParityCount,0);
assert.equal(ledger.publication.publicReaderScoreApprovalCountAdded,0);
assert.equal(ledger.scoreSurveys.length,4);
assert.equal(new Set(ledger.scoreSurveys.map(x=>x.scoreId)).size,4);

// Source GABC fingerprint is deliberate: evidence of unchanged archived notes,
// not a fingerprint of any printed 1961 staff. Use the original UTF-16 code
// units of the unmodified local source text (FNV1a32) to detect changes.
function fnv1a32(value){
 let hash=0x811c9dc5;
 for(let i=0;i<value.length;i++)
  hash=Math.imul(hash^value.charCodeAt(i),0x01000193);
 return (hash>>>0).toString(16).padStart(8,"0");
}
const cases=[
 {id:"GREGOBASE-2522",movement:"KYRIE",setting:"MASS_18",
  groups:27,checksum:"db6e8276",cueId:"AO.SM.C0044",blockId:"AO.SM.B015",
  sourceImage:"934.png",printed:"57*"},
 {id:"GREGOBASE-1137",movement:"AGNUS_DEI",setting:"MASS_17",
  groups:54,checksum:"3de26a94",cueId:"AO.SM.C0222",blockId:"AO.SM.B068",
  sourceImage:"934.png",printed:"57*"},
 {id:"GREGOBASE-298",movement:"SANCTUS_BENEDICTUS",setting:"MASS_18",
  groups:55,checksum:"a4e11282",cueId:"AO.SM.C0145",blockId:"AO.SM.B046",
  sourceImage:"935.png",printed:"58*"},
 {id:"GREGOBASE-2412",movement:"AGNUS_DEI",setting:"MASS_18",
  groups:54,checksum:"17425e51",cueId:"AO.SM.C0222",blockId:"AO.SM.B068",
  sourceImage:"935.png",printed:"58*"}
];
for(const item of cases){
 const row=ledger.scoreSurveys.find(x=>x.scoreId===item.id);
 assert.ok(row,"Missing 1961 visual-survey record "+item.id);
 assert.equal(row.sourceGabcNoteBearingGroups,item.groups);
 assert.equal(row.sourceGabcCodeUnitFnv1a32,item.checksum);
 assert.deepEqual(row.printedPages,[item.printed]);
 assert.equal(row.sourceOriginalImages.length,1);
 assert.ok(row.sourceOriginalImages[0].endsWith("/"+item.sourceImage));
 assert.equal(row.status,"PRINTED_TEXT_AND_PHRASE_STRUCTURE_VISUALLY_INSPECTED_ONLY");
 for(const field of ["fullPrintedAbsolutePitchParity","fullPrintedNeumeParity",
    "fullPrintedSyllabicUnderlayParity","fullPrintedRhythmicParity"])
   assert.equal(row[field],"NOT_CERTIFIED");
 assert.equal(row.editorialScoreApproval,false);
 const score=offlineKyrialeResearchScore(item.movement,item.setting);
 assert.equal(score?.scoreId,item.id,"No unverified title-to-score fallback");
 assert.equal(score.status,"RESEARCH_TRANSCRIPTION_NOT_FACSIMILE_APPROVED");
 assert.equal(score.scoreApproved,false);
 assert.equal(fnv1a32(score.gabc),item.checksum,
  "This source transcription changed after printed structural screening; re-audit before reuse");
 assert.equal(sourceNoteGroupInventory(score.gabc).noteBearingSourceTokens,item.groups);
 const witness=schola1961OriginalFacsimile(item.movement,item.setting);
 assert.ok(witness);
 assert.deepEqual(witness.printedPages,row.printedPages);
 assert.deepEqual(witness.originalPageImages,row.sourceOriginalImages);
 assert.equal(witness.gabcMusicallyCertified,false);
 const paragraph={kind:"TEXT",sourceBlockId:item.blockId,
   id:item.cueId,sourceCueIds:[item.cueId],primary:"Exact canonical Latin is separately source-owned"};
 const input={paragraph,form:"SOLEMN",resolvedMass:{},
   selectedSettings:{[item.movement]:item.setting}};
 const selected=sourceBoundOrdinaryReferenceScores(input);
 assert.equal(selected.length,1,"Explicit sung setting should still show its provisional staff");
 assert.equal(selected[0].publicScoreApproved,false);
 assert.equal(selected[0].sourceContextCertified,false);
 assert.equal(selected[0].gabc,score.gabc);
 assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,form:"LOW"}),[]);
 assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,selectedSettings:{}}),[]);
 assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
   resolvedMass:{overlays:["REQUIEM"]}}),[]);
 assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
   resolvedMass:{provenance:{isRequiem:true}}}),[]);
 assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
   resolvedMass:{actualCelebration:{kind:"MASS_FOR_THE_DEAD"}}}),[]);
}

// The 1961 p.58 score contains two melodically distinct Hosanna passages.
// The second one is not a score repeat inferred from its identical words.
const sanctus=offlineKyrialeResearchScore("SANCTUS_BENEDICTUS","MASS_18").gabc;
const hosannas=[...sanctus.matchAll(/Ho\(([^()]*)\)sán\(([^()]*)\)na\(([^()]*)\)/g)]
  .map(m=>m.slice(1).join("|"));
assert.equal(hosannas.length,2);
assert.notEqual(hosannas[0],hosannas[1]);
assert.match(sanctus,/Be\(e'\)ne\(f\)dí\(g\)ctus/);
assert.ok(sanctus.includes("Graduale Romanum, 1961, p. 101*"));
assert.ok(sanctus.includes("Graduale Romanum, 1961, p. 58*"));

// Ordinary 1961 p.58 Agnus is exactly three invocations: two miserere
// plus dona nobis pacem. The printed Requiem p.101 has a different final
// formula; matching the word "Agnus" is never sufficient score authority.
const ordinary=offlineKyrialeResearchScore("AGNUS_DEI","MASS_18").gabc;
const verseLines=ordinary.slice(ordinary.indexOf("%%")+2).trim().split(/\r?\n/);
assert.equal(verseLines.length,3);
assert.equal(verseLines.filter(x=>x.includes("mi(g')se(h)ré(i')re(g)")).length,2);
assert.equal(verseLines.filter(x=>x.includes("do(g')na(h) no(i')bis(g) pa(hg)cem.(g.)")).length,1);
assert.ok(!ordinary.includes("réquiem"),"Non-Requiem GABC must not be asserted to contain the extra Requiem text");
const compared=ledger.scoreSurveys.find(x=>x.gregobaseId===2412);
assert.equal(compared.requiemTextCrossWitness.originalScan,
 "https://gregobase.selapa.net/sources/2/978.png");
assert.equal(compared.requiemTextCrossWitness.ordinaryScoreIsRequiemSafe,false);
assert.equal(compared.requiemTextCrossWitness.allowAutoAssignmentToRequiem,false);
const requiem={provenance:{isRequiem:true}};
assert.equal(isExplicitRequiemMass({session:{resolvedMass:requiem}}),true);
const requiemText=requiemAgnusVariantsForResolvedMass(requiem);
assert.equal(Object.keys(requiemText).length,3);
assert.match(requiemText["AO.SM.C0222"].lat,/dona eis réquiem/);
assert.match(requiemText["AO.SM.C0223"].lat,/dona eis réquiem/);
assert.match(requiemText["AO.SM.C0224"].lat,/dona eis réquiem sempitérnam/);
assert.ok(!verseLines.some(line=>line.includes("sempitérnam")),
 "Ordinary Agnus XVIII cannot be reused as the Requiem third invocation");

// Check the source XVII and XVIII settings are distinct and do not inherit a
// Gloria merely from seasonal labels.
const agnus17=offlineKyrialeResearchScore("AGNUS_DEI","MASS_17");
assert.notEqual(agnus17.gabc,ordinary);
assert.equal(agnus17.gabc.slice(agnus17.gabc.indexOf("%%")+2).trim()
 .split(/\r?\n/).length,3);
assert.equal(offlineKyrialeResearchScore("GLORIA","MASS_17"),null);
assert.equal(offlineKyrialeResearchScore("GLORIA","MASS_18"),null);

console.log("PASS M34: 4 source-anchored 1961 visual surveys; 9/20 structural coverage, 0 printed pitch certificates; Requiem Agnus variants cannot inherit ordinary XVIII");
