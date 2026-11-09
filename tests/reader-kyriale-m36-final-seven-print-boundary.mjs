import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {offlineKyrialeResearchScore,OFFLINE_KYRIALE_RESEARCH_SCORE_COUNT}
  from "../src/mass/reader-kyriale-research-gabc.js";
import {sourceNoteGroupInventory}
  from "../src/mass/reader-kyriale-source-note-groups.js";
import {KYRIALE_RESEARCH_NOTATION_EXAMPLES}
  from "../src/mass/reader-kyriale-catalogue.js";
import {schola1961OriginalFacsimile}
  from "../src/mass/reader-schola-original-facsimile.js";
import {INLINE_ORDINARY_SOURCE_ANCHORS,sourceBoundOrdinaryReferenceScores}
  from "../src/mass/reader-inline-ordinary-reference.js";

const data=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const m31=data("../data/research/mass-music-m31-five-short-score-print-visual-pass.v1.json");
const m34=data("../data/research/mass-music-m34-seasonal-print-first-audit.v1.json");
const m35=data("../data/research/mass-music-m35-mass-i-print-structural-audit.v1.json");
const ledger=data("../data/research/mass-music-m36-final-seven-1961-print-survey.v1.json");
const cov=ledger.cumulativeCoverage;
assert.equal(OFFLINE_KYRIALE_RESEARCH_SCORE_COUNT,20);
assert.equal(KYRIALE_RESEARCH_NOTATION_EXAMPLES.length,20);
assert.equal(m31.scoreReviews.length,5);
assert.equal(m34.scoreSurveys.length,4);
assert.equal(m35.scoreSurveys.length,4);
assert.equal(ledger.scoreSurveys.length,7);
assert.equal(cov.storedResearchTranscriptions,20);
assert.equal(cov.totalDistinctStructurallySurveyed,20);
assert.equal(cov.remainingWithoutStructuralSurvey,0);
assert.equal(cov.printedNoteByNoteCertifiedScores,0);
assert.equal(cov.editoriallyApprovedScores,0);
assert.equal(cov.provenLocalChoirPerformances,0);
assert.equal(ledger.publication.newlyCertifiedScores,0);
assert.equal(ledger.publication.sourceTranscriptionsRewritten,0);
assert.equal(ledger.publication.readerCardsModified,0);
assert.equal(ledger.publication.localProgrammeAutoAssignments,0);

const all=KYRIALE_RESEARCH_NOTATION_EXAMPLES.map(x=>x.scoreId);
const surveyIds=[...m31.scoreReviews.map(x=>"GREGOBASE-"+x.gregobaseId),
 ...m34.scoreSurveys.map(x=>x.scoreId),...m35.scoreSurveys.map(x=>x.scoreId),
 ...ledger.scoreSurveys.map(x=>x.scoreId)];
assert.equal(surveyIds.length,20);
assert.equal(new Set(surveyIds).size,20,"A 20/20 audit must represent 20 DIFFERENT scores");
assert.deepEqual(surveyIds.slice().sort(),all.slice().sort(),
 "Every published source ID must have exactly one structural printed-survey record");

// GABC checksum is a source-text integrity witness, NOT a printed-pitch or
// note-by-note certification. UTF-16 code units match the earlier M34/M35 audits.
function fnv1a32(value){
 let hash=0x811c9dc5;
 for(let i=0;i<value.length;i++)hash=Math.imul(hash^value.charCodeAt(i),0x01000193);
 return (hash>>>0).toString(16).padStart(8,"0");
}
const cases=[
 // source ID, movement, setting, source note-bearing groups, unmodified GABC fingerprint,
 // physical 1961 printed folios, original printed-page scan IDs
 [272,"KYRIE","MASS_17",27,"eebb7a65",["55*"],["932.png"]],
 [961,"GLORIA","MASS_08",196,"a5986d2a",["29*","30*"],["906.png","907.png"]],
 [303,"GLORIA","MASS_11",196,"918bfef2",["39*","40*"],["916.png","917.png"]],
 [749,"CREDO","CREDO_03",366,"78ccb2e5",["64*","65*","66*"],["941.png","942.png","943.png"]],
 [1106,"SANCTUS_BENEDICTUS","MASS_11",55,"fcb745c8",["40*","41*"],["917.png","918.png"]],
 [871,"SANCTUS_BENEDICTUS","MASS_17",55,"e73e09be",["56*"],["933.png"]],
 [1243,"AGNUS_DEI","MASS_11",54,"af979bfa",["41*"],["918.png"]]
];
for(const [id,movement,setting,groups,checksum,pages,images] of cases){
 const scoreId="GREGOBASE-"+id;
 const row=ledger.scoreSurveys.find(x=>x.scoreId===scoreId);
 assert.ok(row,"Missing visually checked printed witness "+scoreId);
 assert.equal(row.movement,movement);
 assert.equal(row.selection,setting);
 assert.equal(row.sourceGabcNoteBearingGroups,groups);
 assert.equal(row.sourceGabcCodeUnitFnv1a32,checksum);
 assert.deepEqual(row.printedPages,pages);
 assert.deepEqual(row.pdfPagesOneBased,pages.map(p=>Number(p.replace("*",""))+2));
 assert.deepEqual(row.originalPageImages.map(x=>x.split("/").at(-1)),images);
 assert.equal(row.gregobaseSourceUrl,"https://gregobase.selapa.net/chant.php?id="+id);
 assert.equal(row.status,"PRINTED_TEXT_AND_PHRASE_STRUCTURE_VISUALLY_INSPECTED_ONLY");
 for(const key of ["fullPrintedAbsolutePitchParity","fullPrintedNeumeParity",
   "fullPrintedSyllabicUnderlayParity","fullPrintedRhythmicParity"])
  assert.equal(row[key],"NOT_CERTIFIED","Premature printed musical approval "+scoreId);
 assert.equal(row.editorialScoreApproval,false);
 assert.equal(row.observedCommunityPerformance,false);
 assert.ok(row.visuallyObserved.length>=3);
 const score=offlineKyrialeResearchScore(movement,setting);
 assert.equal(score?.scoreId,scoreId);
 assert.equal(score.scoreApproved,false);
 assert.equal(score.status,"RESEARCH_TRANSCRIPTION_NOT_FACSIMILE_APPROVED");
 assert.equal(fnv1a32(score.gabc),checksum,"Original GABC changed; print review invalidated");
 assert.equal(sourceNoteGroupInventory(score.gabc).noteBearingSourceTokens,groups);
 const printed=schola1961OriginalFacsimile(movement,setting);
 assert.ok(printed);
 assert.deepEqual(printed.printedPages,pages);
 assert.deepEqual(printed.originalPageImages,row.originalPageImages);
 assert.equal(printed.gabcMusicallyCertified,false);
 assert.equal(printed.observedParishPerformance,false);
 const anchor=INLINE_ORDINARY_SOURCE_ANCHORS.find(x=>x.movement===movement);
 assert.ok(anchor,"No canonical 65-card movement anchor "+movement);
 const input={paragraph:{kind:"TEXT",id:anchor.firstCueId,
   sourceCueIds:[anchor.firstCueId],sourceBlockId:anchor.blockId,
   primary:"Source-owned Latin, not replaced by the music study score"},
   form:"SOLEMN",resolvedMass:{},selectedSettings:{[movement]:setting}};
 const selected=sourceBoundOrdinaryReferenceScores(input);
 assert.equal(selected.length,1,"Only explicit movement and setting may reveal a score");
 assert.equal(selected[0].id,scoreId);
 assert.equal(selected[0].gabc,score.gabc);
 assert.equal(selected[0].publicScoreApproved,false);
 assert.equal(selected[0].sourceContextCertified,false);
 assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,selectedSettings:{}}),[]);
 assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,form:"LOW"}),[]);
 assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
   resolvedMass:{provenance:{isRequiem:true}}}),[]);
 assert.deepEqual(sourceBoundOrdinaryReferenceScores({...input,
   paragraph:{...input.paragraph,sourceBlockId:"AO.SM.B001"}}),[]);
}
// The printed 'Vel, ubi moris est' p.56* Kyrie is a different OPTIONAL
// alternative, never silently substituted for the ordinary XVII p.55*.
const alternate=ledger.otherPrintedAlternativeHeld;
assert.equal(alternate.kind,"KYRIE_XVII_ALTERNATIVE");
assert.equal(alternate.printedFolio,"56*");
assert.equal(alternate.mustNotAutoSubstitute,true);
assert.equal(alternate.newScoreAdded,false);
assert.deepEqual(schola1961OriginalFacsimile("KYRIE","MASS_17").printedPages,["55*"]);
const xvii=offlineKyrialeResearchScore("KYRIE","MASS_17").gabc;
assert.ok(xvii.includes("<clear>**"),"Distinctive terminal Kyrie division lost");
assert.equal([...xvii.matchAll(/<i>iij\.<\/i>/g)].length,2);
assert.equal([...xvii.matchAll(/<i>ij\.<\/i>/g)].length,1);

const credo=offlineKyrialeResearchScore("CREDO","CREDO_03");
assert.ok(credo?.gabc.includes("CRe(h)do(f)"),"Independent Credo III corrupted");
assert.equal(offlineKyrialeResearchScore("CREDO","MASS_11"),null);
assert.equal(offlineKyrialeResearchScore("GLORIA","MASS_17"),null);
assert.equal(offlineKyrialeResearchScore("GLORIA","MASS_18"),null);

const sanctus11=offlineKyrialeResearchScore("SANCTUS_BENEDICTUS","MASS_11").gabc;
assert.equal([...sanctus11.matchAll(/Ho\(fj\)sán\(ij~\)na/g)].length,2,
 "Benedictus and second Hosanna must remain in unified score");
assert.ok(sanctus11.includes("Be(e)ne(ef)dí(fg)ctus"));
const sanctus17=offlineKyrialeResearchScore("SANCTUS_BENEDICTUS","MASS_17").gabc;
assert.ok(sanctus17.includes("Be(d)ne(fe)dí(eh)ctus"));
assert.equal([...sanctus17.matchAll(/Ho\(h!iw!jkI'H\)sán/g)].length,2);
const agnus11=offlineKyrialeResearchScore("AGNUS_DEI","MASS_11").gabc;
const invocations=agnus11.slice(agnus11.indexOf("%%")+2).trim().split(/\r?\n/);
assert.equal(invocations.length,3);
assert.equal(invocations.filter(x=>x.includes("mi(e)se(gh)ré")).length,2);
assert.ok(invocations[2].includes("do(e)na(gh) no(fg)bis(fvED) pa(cd)cem."));
assert.ok(!agnus11.includes("sempitérnam"));
console.log("PASS M36: all 20 distinct source scores structurally surveyed against 1961 original; 0 pitches certified; explicit selection and canonical 65-card safety intact");
