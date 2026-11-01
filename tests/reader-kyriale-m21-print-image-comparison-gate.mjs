import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {KYRIALE_RESEARCH_NOTATION_EXAMPLES} from "../src/mass/reader-kyriale-catalogue.js";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const ledger=read("../data/research/mass-music-m21-seven-print-image-parity-worklist.v1.json");
const prior=read("../data/research/mass-music-m19-seven-complete-facsimiles-and-dismissals.v1.json");
assert.equal(ledger.schema,"ao-mass-music-m21-seven-complete-visual-pairings-v1");
assert.equal(ledger.scores.length,7);
assert.equal(ledger.closedGates.fullyPrintedNoteMatchedCount,0);
assert.equal(ledger.closedGates.approvedForReaderCount,0);
assert.equal(ledger.closedGates.audioApprovedCount,0);
assert.equal(ledger.closedGates.massReaderAndUiNotChanged,true);
assert.equal(ledger.closedGates.externalPrintImagesForResearchOnly,true);
assert.equal(ledger.closedGates.sourceImagesNotBundled,true);
assert.equal(ledger.closedGates.automaticMusicAssignment,false);
assert.equal(ledger.reviewOrder.length,7);

const imageIds=[
 [545,[931]],[2982,[915,916]],[1184,[905,906]],[961,[906,907]],
 [749,[941,942,943]],[1384,[907,908]],[2760,[908]]
];
const complete=new Set();
for(let i=0;i<imageIds.length;i++){
 const [id,originals]=imageIds[i];
 const row=ledger.scores[i],earlier=prior.sevenPrintedScoreSpans[i];
 const ref=KYRIALE_RESEARCH_NOTATION_EXAMPLES.find(x=>x.scoreId==="GREGOBASE-"+id);
 assert.ok(ref,"Missing exact catalogue identity for "+id);
 assert.equal(row.gregobaseId,id);
 assert.equal(row.catalogueSelection,ref.catalogueId);
 assert.equal(row.movement,ref.movement);
 assert.equal(row.sourceUrl,ref.sourceUrl);
 assert.deepEqual(row.printedPages,
  [earlier.printedStart,...(earlier.printedStart===earlier.printedEnd?[]:
    Array.from({length:parseInt(earlier.printedEnd)-parseInt(earlier.printedStart)},
     (_v,j)=>(parseInt(earlier.printedStart)+j+1)+"*"))]);
 assert.deepEqual(row.printedPageImageUrls,
  originals.map(n=>"https://gregobase.selapa.net/sources/2/"+n+".png"));
 assert.equal(row.printedPageImageUrls.length,row.printedPages.length);
 assert.equal(row.imageCoverageStatus,"ALL_PRINTED_PAGES_LINKED");
 assert.ok(row.structuralAnchorsPrinted.length>=2);
 assert.ok(row.gabcNoteGroupAnchors.length>=3);
 const score=offlineKyrialeResearchScore(row.movement,row.catalogueSelection);
 assert.ok(score && score.scoreId==="GREGOBASE-"+id);
 for(const anchor of row.gabcNoteGroupAnchors)
  assert.ok(score.gabc.includes(anchor),"Source GABC note group changed: "+id+" "+anchor);
 for(const key of ["noteByNotePitchParity","neumeShapeParity","syllableUnderlayParity","accentOrRhythmParity"])
  assert.equal(row[key],"NOT_CERTIFIED",id+" "+key+" must remain closed");
 assert.equal(row.musicalDiscrepancyStatus,"NOT_YET_FULLY_CHECKED");
 assert.deepEqual(row.musicalDiscrepancies,[]);
 assert.equal(row.editorialApproval,false);
 assert.equal(row.publicScore,false);
 assert.equal(row.recordingApproved,false);
 for(const uri of row.printedPageImageUrls)complete.add(uri);
}
assert.equal(complete.size,10);
assert.equal(ledger.scores.reduce((n,row)=>n+row.printedPageImageUrls.length,0),13);
const sanctus=ledger.scores.find(x=>x.gregobaseId===1384);
assert.ok(sanctus.structuralAnchorsPrinted.some(x=>x.includes("Benedictus")));
const credo=ledger.scores.find(x=>x.gregobaseId===749);
assert.equal(credo.printedPages.length,3);
assert.ok(credo.sourceHistoryPriorityChecks.some(x=>x.includes("Amen")));
const agnus=ledger.scores.find(x=>x.gregobaseId===2760);
assert.ok(agnus.structuralAnchorsPrinted.some(x=>x.includes("dona nobis pacem")));
const kyrieVIII=ledger.scores.find(x=>x.gregobaseId===1184);
assert.ok(kyrieVIII.sourceHistoryPriorityChecks.some(x=>x.includes("virga")));
const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
assert.doesNotMatch(dom,/data-schola-score-open|offlineKyrialeResearchScore\(/);
// M24: real printed structural collation of Kyrie XVI, p. 54*.
// Structural repetition/text checkpoints are NOT melodic/neume approvals.
const kx=ledger.scores.find(x=>x.gregobaseId===545);
const witness=kx.phraseCollation;
assert.equal(witness.auditId,"M24_KYRIE_XVI_FIRST_STRUCTURAL_COLLATION");
assert.equal(witness.notatedPhraseCount,4);
assert.equal(witness.phrases.length,4);
assert.deepEqual(witness.phrases.map(x=>x.repeatPrinted),["iij.","iij.","ij.",null]);
assert.deepEqual(witness.phrases.map(x=>x.sungOccurrences),[3,3,2,1]);
assert.equal(witness.phrases.reduce((n,x)=>n+x.sungOccurrences,0),9);
assert.equal(witness.totalExpectedInvocations,9);
assert.deepEqual(witness.phrases[0].gabcPitchGroups,witness.phrases[2].gabcPitchGroups);
assert.notDeepEqual(witness.phrases[2].gabcPitchGroups,witness.phrases[3].gabcPitchGroups);
const originalKyrie=offlineKyrialeResearchScore("KYRIE","MASS_16").gabc;
for(const [i,phrase] of witness.phrases.entries()){
 assert.equal(phrase.number,i+1);
 assert.ok(originalKyrie.includes(phrase.gabcLine),"A Kyrie XVI GABC phrase changed: "+(i+1));
 assert.equal(phrase.structuralParity,"MATCH_OBSERVED");
 assert.equal(phrase.fullPitchSequenceParity,"NOT_CERTIFIED");
}
for(const field of ["fullPrintedPitchParity","fullPrintedNeumeParity",
 "fullRhythmicParity","fullSyllableUnderlayParity"])
 assert.equal(witness[field],"NOT_CERTIFIED",field+" must remain closed");
assert.equal(witness.userEditorialApproval,false);
assert.equal(witness.publicScore,false);
assert.equal(kx.publicScore,false);
assert.equal(kx.editorialApproval,false);
assert.equal(ledger.closedGates.fullyPrintedNoteMatchedCount,0);
console.log("PASS M24 Kyrie XVI printed p.54* 4-phrase structure and 3+3+2+1 invocations; 0 pitch/neume approvals");

// M25: explicit 1961 print-versus-GABC structure of two page-spanning Kyries.
// These checks are intentionally limited to original phrase text, repeat signs,
// page breaks and recorded source-history risks. NO pitch or neume approval.
for(const [id,setting,spans] of [
 [2982,"MASS_11",["38*","38*→39*","39*","39*"]],
 [1184,"MASS_08",["28*","28*→29*","29*","29*"]]
]){
 const record=ledger.scores.find(s=>s.gregobaseId===id);
 assert.ok(record?.phraseCollation,"Missing printed collation "+id);
 const c=record.phraseCollation;
 const gabc=offlineKyrialeResearchScore("KYRIE",setting).gabc;
 assert.equal(c.notatedPhraseCount,4);
 assert.equal(c.phrases.length,4);
 assert.deepEqual(c.phrases.map(p=>p.printedPages),spans);
 assert.deepEqual(c.phrases.map(p=>p.printedRepeat),["iij.","iij.","ij.",null]);
 assert.deepEqual(c.phrases.map(p=>p.sungOccurrences),[3,3,2,1]);
 assert.equal(c.phrases.reduce((sum,p)=>sum+p.sungOccurrences,0),9);
 assert.equal(c.totalExpectedInvocations,9);
 assert.equal(c.printedPageBreakChecked,true);
 assert.ok(c.printSourceHistory.length>=2);
 assert.ok(c.scoreLevelStructuralFindings.length>=3);
 for(let i=0;i<c.phrases.length;i++){
  const p=c.phrases[i];
  assert.equal(p.number,i+1);
  assert.ok(gabc.includes(p.gabcLine),"Source phrase altered for "+id+" #"+(i+1));
  assert.equal(p.sourceGabcTokenCount,(p.gabcLine.match(/\([^()]*\)/g)||[]).length);
  assert.ok(p.sourceGabcTokenCount>=6);
  assert.equal(p.printedTextAndRepeatStructure,"MATCH_OBSERVED");
  assert.equal(p.printedPitchHeightByHeight,"NOT_CERTIFIED");
  assert.equal(p.printedNeumeSignBySign,"NOT_CERTIFIED");
 }
 for(const key of ["fullPrintedPitchParity","fullPrintedNeumeParity",
   "fullRhythmicParity","fullSyllableUnderlayParity"])
  assert.equal(c[key],"NOT_CERTIFIED");
 assert.equal(c.userEditorialApproval,false);
 assert.equal(c.publicScore,false);
 assert.equal(record.editorialApproval,false);
 assert.equal(record.publicScore,false);
 assert.equal(c.discrepancyStatus,"FULL_MUSICAL_COMPARISON_NOT_PERFORMED");
 assert.deepEqual(c.suspectedSourceDiscrepancies,[]);
}
const xiAudit=ledger.scores.find(s=>s.gregobaseId===2982).phraseCollation;
assert.ok(xiAudit.phrases[0].gabcLine.includes("KY(ixhi)ri(hg)e(hd..)"));
assert.ok(xiAudit.phrases[2].gabcLine.includes("Ký(ixhi)ri(hg)e(hd..)"));
assert.ok(xiAudit.phrases[3].gabcLine.includes("Ký(dfd)ri(cd)e(d.gv.fgFD'Cd.)"));
assert.ok(xiAudit.phrases[3].gabcLine.includes("<clear>*(,)"));
assert.ok(xiAudit.phrases[3].gabcLine.includes("lé(c')i(d)son.(d.)"));
const viiiAudit=ledger.scores.find(s=>s.gregobaseId===1184).phraseCollation;
assert.ok(viiiAudit.phrases[3].gabcLine.includes("<clear>*(,)"));
assert.ok(viiiAudit.phrases[3].gabcLine.includes("<clear>**(,)"));
assert.ok(viiiAudit.printSourceHistory.some(x=>x.kind==="PUNCTUM_TO_VIRGA_HOLD"));
assert.ok(viiiAudit.printSourceHistory.some(x=>x.kind==="LAST_KYRIE_GV_TO_HV_HOLD"));
assert.equal(ledger.closedGates.fullyPrintedNoteMatchedCount,0);
assert.equal(ledger.closedGates.approvedForReaderCount,0);
console.log("PASS M25 printed Kyrie XI and VIII four source phrases, exact page-break placement, 3+3+2+1 invocation counts, and closed notation release gates");

console.log("PASS M21 exact 10 primary 1961 printed-page images across seven scores; source GABC motif anchors and full score continuations pinned; zero false note certifications/public notation");
