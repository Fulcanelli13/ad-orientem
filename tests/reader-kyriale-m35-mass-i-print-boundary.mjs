import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {KYRIALE_RESEARCH_NOTATION_EXAMPLES}
  from "../src/mass/reader-kyriale-catalogue.js";
import {offlineKyrialeResearchScore,OFFLINE_KYRIALE_RESEARCH_SCORE_COUNT}
  from "../src/mass/reader-kyriale-research-gabc.js";
import {sourceNoteGroupInventory}
  from "../src/mass/reader-kyriale-source-note-groups.js";
import {schola1961OriginalFacsimile}
  from "../src/mass/reader-schola-original-facsimile.js";
import {sourceBoundOrdinaryReferenceScores}
  from "../src/mass/reader-inline-ordinary-reference.js";

const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const ledger=json("../data/research/mass-music-m35-mass-i-print-structural-audit.v1.json");
const m31=json("../data/research/mass-music-m31-five-short-score-print-visual-pass.v1.json");
const m34=json("../data/research/mass-music-m34-seasonal-print-first-audit.v1.json");
const coverage=ledger.coverage;
assert.equal(coverage.registeredResearchScores,20);
assert.equal(coverage.alreadySurveyedDistinct,9);
assert.equal(coverage.newlySurveyedDistinct,4);
assert.equal(coverage.uniqueStructurallyVisuallySurveyed,13);
assert.equal(coverage.remainingWithoutStructuralVisualSurvey,7);
assert.equal(coverage.fullPrintedMusicalCertificates,0);
assert.equal(coverage.editoriallyApproved,0);
assert.equal(OFFLINE_KYRIALE_RESEARCH_SCORE_COUNT,20);
assert.equal(KYRIALE_RESEARCH_NOTATION_EXAMPLES.length,20);
assert.equal(ledger.scoreSurveys.length,4);
assert.equal(ledger.sourceWitnesses.length,4);
assert.deepEqual(ledger.sourceWitnesses.map(x=>x.folio),["4*","5*","6*","7*"]);
assert.deepEqual(ledger.sourceWitnesses.map(x=>x.pdfPageOneBased),[6,7,8,9]);
assert.deepEqual(ledger.sourceWitnesses.map(x=>x.image.split("/").at(-1)),
 ["881.png","882.png","883.png","884.png"]);
assert.match(ledger.printedFacsimilePdf,/kyriale-solesmes\.pdf$/);
assert.equal(ledger.publication.sourceGabcRewrites,0);
assert.equal(ledger.publication.changeToMassCards,0);
assert.equal(ledger.publication.scoreCertificatesAdded,0);
assert.equal(ledger.publication.localScholaProgrammesInferred,0);

const previousIds=[...m31.scoreReviews.map(x=>"GREGOBASE-"+x.gregobaseId),
 ...m34.scoreSurveys.map(x=>x.scoreId)];
assert.equal(previousIds.length,9);
assert.equal(new Set(previousIds).size,9);
const allIds=KYRIALE_RESEARCH_NOTATION_EXAMPLES.map(x=>x.scoreId);
const comparedIds=[...previousIds,...ledger.scoreSurveys.map(x=>x.scoreId)];
assert.equal(new Set(comparedIds).size,13,"Do not count the same score twice");
assert.deepEqual(ledger.remainingSurveyIds.slice().sort(),
 allIds.filter(id=>!comparedIds.includes(id)).sort());
const cases=[
 ["GREGOBASE-1143","KYRIE","MASS_01",27,"1d935709",["4*","5*"],["881.png","882.png"],"AO.SM.C0044","AO.SM.B015"],
 ["GREGOBASE-2980","GLORIA","MASS_01",196,"46e8cc3c",["5*","6*"],["882.png","883.png"],"AO.SM.C0051","AO.SM.B018"],
 ["GREGOBASE-300","SANCTUS_BENEDICTUS","MASS_01",55,"c1849a80",["6*","7*"],["883.png","884.png"],"AO.SM.C0145","AO.SM.B046"],
 ["GREGOBASE-2977","AGNUS_DEI","MASS_01",54,"b2f6ce02",["7*"],["884.png"],"AO.SM.C0222","AO.SM.B068"]
];
// FNV1a32 fingerprints original UTF-16 GABC code units, not printed-page pitches.
function fnv1a32(value){
 let hash=0x811c9dc5;
 for(let i=0;i<value.length;i++)hash=Math.imul(hash^value.charCodeAt(i),0x01000193);
 return (hash>>>0).toString(16).padStart(8,"0");
}
for(const [id,movement,setting,groups,checksum,pages,images,cueId,blockId] of cases){
 const row=ledger.scoreSurveys.find(x=>x.scoreId===id);
 assert.ok(row,"Missing original-print Mass I record "+id);
 assert.equal(row.movement,movement);
 assert.equal(row.setting,setting);
 assert.equal(row.sourceGabcNoteBearingGroups,groups);
 assert.equal(row.sourceGabcCodeUnitFnv1a32,checksum);
 assert.deepEqual(row.printedPages,pages);
 assert.deepEqual(row.sourceOriginalImages.map(x=>x.split("/").at(-1)),images);
 assert.equal(row.status,"PRINTED_TEXT_AND_PHRASE_STRUCTURE_VISUALLY_INSPECTED_ONLY");
 for(const key of ["fullPrintedAbsolutePitchParity","fullPrintedNeumeParity",
   "fullPrintedSyllabicUnderlayParity","fullPrintedRhythmicParity"])
   assert.equal(row[key],"NOT_CERTIFIED");
 assert.equal(row.editorialScoreApproval,false);
 assert.equal(row.localPerformanceObserved,false);
 const score=offlineKyrialeResearchScore(movement,setting);
 assert.equal(score?.scoreId,id);
 assert.equal(score.status,"RESEARCH_TRANSCRIPTION_NOT_FACSIMILE_APPROVED");
 assert.equal(score.scoreApproved,false);
 assert.equal(fnv1a32(score.gabc),checksum,"Verbatim GABC changed: printed review invalidated");
 assert.equal(sourceNoteGroupInventory(score.gabc).noteBearingSourceTokens,groups);
 const original=schola1961OriginalFacsimile(movement,setting);
 assert.deepEqual(original.printedPages,pages);
 assert.deepEqual(original.originalPageImages,row.sourceOriginalImages);
 assert.equal(original.gabcMusicallyCertified,false);
 assert.equal(original.observedParishPerformance,false);
 const input={form:"SOLEMN",resolvedMass:{},
   selectedSettings:{[movement]:setting},
   paragraph:{id:cueId,kind:"TEXT",sourceBlockId:blockId,
     sourceCueIds:[cueId],primary:"Source-owned canonical Latin retained"}};
 const selected=sourceBoundOrdinaryReferenceScores(input);
 assert.equal(selected.length,1,"Explicit selection must retain research notation");
 assert.equal(selected[0].id,id);
 assert.equal(selected[0].gabc,score.gabc);
 assert.equal(selected[0].publicScoreApproved,false);
 assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,form:"LOW"}),[]);
 assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,selectedSettings:{}}),[]);
 assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
    resolvedMass:{provenance:{isRequiem:true}}}),[]);
}
const kyrie=offlineKyrialeResearchScore("KYRIE","MASS_01").gabc;
assert.equal([...kyrie.matchAll(/<i>iij\.<\/i>/g)].length,2);
assert.equal([...kyrie.matchAll(/<i>ij\.<\/i>/g)].length,1);
assert.match(kyrie,/<nlba>Ký\(g\)ri\(fe\)e<\/nlba>/,
 "The terminal Kyrie variant must not collapse into an automatic repeat");
const gloria=offlineKyrialeResearchScore("GLORIA","MASS_01").gabc;
assert.match(gloria,/\(c3\) GLó\(g\)ri\(fe\)/);
assert.match(gloria,/A\(iih!iw!jvIHivHG\)men\.\(fg\.\.\) \(::\)$/);
const sanctus=offlineKyrialeResearchScore("SANCTUS_BENEDICTUS","MASS_01").gabc;
assert.match(sanctus,/Ho\(e\)sán\(ei~\)na/);
assert.match(sanctus,/Be\(fj\)ne\(ji\)dí\(jk\)ctus/);
assert.match(sanctus,/Ho\(g!hw!ivHG\)sán\(fg\)na/);
const agnus=offlineKyrialeResearchScore("AGNUS_DEI","MASS_01").gabc;
const lines=agnus.slice(agnus.indexOf("%%")+2).trim().split(/\r?\n/);
assert.equal(lines.length,3);
assert.equal(lines.filter(x=>x.includes("mi(e)se(fh)ré")).length,2);
assert.equal(lines.filter(x=>x.includes("do(e)na(fh)")).length,1);
assert.ok(!agnus.includes("sempitérnam"));
console.log("PASS M35: Mass I 4 new printed structural surveys, cumulative 13/20, zero certified pitches; canonical text/selection and Requiem guards intact");
