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

// M26: full printed-text/section structural review for all remaining four
// pilot scores. These assertions do not compare individual printed pitches.
for(const [id,movement,selection,delimiter,n,folios] of [
 [2760,"AGNUS_DEI","MASS_08","(::)",3,["31*","31*","31*"]],
 [1384,"SANCTUS_BENEDICTUS","MASS_08","(:)",5,["30*","30*","30*","31*","31*"]],
 [961,"GLORIA","MASS_08","(::)",18,[
  ...Array(10).fill("29*"),"29*→30*",...Array(7).fill("30*")]],
 [749,"CREDO","CREDO_03","(::)",19,[
  ...Array(4).fill("64*"),...Array(7).fill("65*"),...Array(8).fill("66*")]]
]){
 const row=ledger.scores.find(x=>x.gregobaseId===id);
 assert.ok(row?.phraseCollation,"Missing original printed score collation "+id);
 const c=row.phraseCollation;
 assert.equal(c.auditId,"M26_"+id+"_COMPLETE_PRINT_AND_SOURCE_STRUCTURE");
 assert.equal(c.completeGabcSectionsCaptured,n);
 assert.equal(c.musicalSections.length,n);
 assert.equal(c.visualInspection,"ALL_ORIGINAL_PRINTED_PAGES_AND_PRINTED_TEXT_BOUNDARIES_INSPECTED");
 assert.equal(c.printedScoreTextualStructure,"ALL_NAMED_CLAUSES_LOCATED_IN_ORIGINAL_PRINT");
 assert.deepEqual(c.musicalSections.map(x=>x.printedFolio),folios);
 const original=offlineKyrialeResearchScore(movement,selection).gabc;
 const source=original.split("%%\n")[1].split(delimiter).map(x=>x.trim()).filter(Boolean);
 assert.equal(source.length,n,"Source GABC section count must match registered original "+id);
 let groups=0;
 for(let i=0;i<n;i++){
  const part=c.musicalSections[i];
  assert.equal(part.ordinal,i+1);
  assert.ok(part.clause.length>=3);
  assert.equal(part.gabcVerbatimSection,source[i]+" "+delimiter,
   "Source chant notation altered "+id+" segment "+(i+1));
  const notes=(source[i].match(/\([^()]*\)/g)||[]).length;
  assert.equal(part.gabcNoteGroupCount,notes);
  groups+=notes;
  assert.equal(part.isPageCrossing,part.printedFolio.includes("→"));
  assert.equal(part.printTextAndSectionIdentity,"PRINTED_TEXT_LOCATED");
  assert.equal(part.noteGroupByGroupPitchMatch,"NOT_CERTIFIED");
  assert.equal(part.noteShapeAndRhythmicParity,"NOT_CERTIFIED");
 }
 assert.equal(c.sourceGabcNoteGroupsCount,groups);
 for(const anchor of c.sourceAnchorFragments)
  assert.ok(original.includes(anchor),"Original GABC lost high-risk note group "+id);
 assert.ok(c.sourceHistoryAndMusicalRiskChecks.length>=3);
 for(const key of ["printedStaffPitchParity","printedNeumeShapeParity",
   "printedSyllableUnderlayParity","printedRhythmicSignsParity"])
  assert.equal(c[key],"NOT_CERTIFIED",id+" publication hold: "+key);
 assert.equal(c.scoreEditorialApproval,false);
 assert.equal(c.publicScore,false);
 assert.equal(c.audioApproved,false);
 assert.equal(row.editorialApproval,false);
 assert.equal(row.publicScore,false);
}
const ag=ledger.scores.find(x=>x.gregobaseId===2760).phraseCollation;
assert.ok(ag.musicalSections[0].gabcVerbatimSection.includes("mi(f)se(gh)ré(h)re"));
assert.ok(ag.musicalSections[1].gabcVerbatimSection.includes("mi(f)se(gh)ré(h)re"));
assert.ok(ag.musicalSections[2].gabcVerbatimSection.includes("do(f)na(gh) no(h)bis"));
assert.ok(ag.musicalSections[0].gabcVerbatimSection.includes("A(fggf)gnus(gh)"));
assert.ok(ag.musicalSections[1].gabcVerbatimSection.includes("A(f)gnus(hj)"));
assert.ok(ag.musicalSections[2].gabcVerbatimSection.includes("A(fggf)gnus(gh)"));
const sc=ledger.scores.find(x=>x.gregobaseId===1384).phraseCollation;
assert.ok(sc.musicalSections[0].gabcVerbatimSection.includes("San(fghjhhvG~F~)ctus"));
assert.ok(sc.musicalSections[3].gabcVerbatimSection.includes("<nlba>Be(f)ne(hj)dí(jvHG'j)ctus"));
assert.ok(sc.musicalSections[2].gabcVerbatimSection.includes("Ho(f)sán(fe~)na(dc)"));
assert.ok(sc.musicalSections[4].gabcVerbatimSection.includes("Ho(j)sán(ixjkkvJH'i)na(gf)"));
const gl=ledger.scores.find(x=>x.gregobaseId===961).phraseCollation;
assert.equal(gl.musicalSections.filter(x=>x.isPageCrossing).length,1);
assert.equal(gl.musicalSections[10].printedFolio,"29*→30*");
assert.ok(gl.musicalSections[10].gabcVerbatimSection.startsWith("Qui(d') tol(e)lis"));
assert.ok(gl.musicalSections[16].gabcVerbatimSection.startsWith("Cum(h') San(h)cto"));
assert.ok(gl.musicalSections[17].gabcVerbatimSection.startsWith("A(gxhvFE'DgvFE)men."));
const cr=ledger.scores.find(x=>x.gregobaseId===749).phraseCollation;
assert.ok(cr.phraseBoundaryNote.includes("Credo II"));
assert.ok(cr.musicalSections[7].gabcVerbatimSection.includes("Et(d) ho(f')mo(f) fa(gxg')ctus(g) est."));
assert.ok(cr.musicalSections[12].gabcVerbatimSection.includes("Fi(gxg')li(e)ó(f')que(g)"));
assert.ok(cr.musicalSections[18].gabcVerbatimSection.includes("A(hvFDee[ll:1]d.0gxkvJHiih"));
assert.equal(ledger.scores.filter(x=>x.phraseCollation).length,7);
assert.equal(ledger.closedGates.fullyPrintedNoteMatchedCount,0);
assert.equal(ledger.closedGates.approvedForReaderCount,0);
console.log("PASS M26 all 7 Ordinary pilot scores have source-pinned printed structural records; last four 3+5+18+19 clauses protected, zero pitch/neume certificates");

// M27: explicitly limited independent visual note-group comparison of original
// 1961 print and rendered GregoBase PDFs. Verbatim source invariants can be
// asserted; visual observations are evidence, NOT automated pitch recognition.
for(const [id,movement,selection,n] of [
 [2760,"AGNUS_DEI","MASS_08",5],
 [1384,"SANCTUS_BENEDICTUS","MASS_08",5],
 [545,"KYRIE","MASS_16",2]
]){
 const row=ledger.scores.find(s=>s.gregobaseId===id),audit=row?.noteSpotChecks;
 assert.ok(audit,"Source print-to-GABC spot check missing for "+id);
 assert.equal(audit.auditId,"M27_NOTE_GROUP_VISUAL_SPOT_CHECK_"+id);
 assert.equal(audit.checks.length,n);
 assert.equal(audit.comparisonType,"VISUAL_RELATIVE_NEUME_CONTOUR_AND_GROUPING_ONLY");
 assert.equal(audit.comparisonStatus,"SELECTED_PASSAGES_VISUALLY_AGREE_NOT_FULL_SCORE_PARITY");
 assert.match(audit.sourceGabcRenderedPdf,/^https:\/\/gregobase\.selapa\.net\/download\.php\?format=pdf&id=\d+$/);
 assert.ok(row.printedPageImageUrls.every(url=>audit.sourceOriginalScan.includes(url)));
 const gabc=offlineKyrialeResearchScore(movement,selection).gabc;
 for(const motif of audit.checks){
  assert.ok(motif.id);
  assert.ok(gabc.includes(motif.gabcVerbatimFragment),
   "Audited note group changed from original source "+id+" "+motif.id);
  assert.equal(motif.observation,"VISUAL_RELATIVE_CONTOUR_AGREEMENT");
  assert.equal(motif.staffPitchMappedAbsolute,false);
  assert.equal(motif.fullRhythmicSignsCertified,false);
  assert.equal(motif.sourceGabcAdjusted,false);
 }
 assert.ok(audit.limits.length>=4);
 assert.equal(audit.remainingToCheck,"ALL_REMAINING_NOTES_AND_RHYTHMIC_SIGNS");
 assert.equal(audit.completeNoteByNoteReview,false);
 assert.equal(audit.completeNeumeByNeumeReview,false);
 assert.equal(audit.editorialApproved,false);
 assert.equal(audit.publicScore,false);
 assert.equal(row.noteByNotePitchParity,"NOT_CERTIFIED");
 assert.equal(row.neumeShapeParity,"NOT_CERTIFIED");
 assert.equal(row.accentOrRhythmParity,"NOT_CERTIFIED");
 assert.equal(row.editorialApproval,false);
 assert.equal(row.publicScore,false);
}
const agMotifs=ledger.scores.find(s=>s.gregobaseId===2760).noteSpotChecks.checks;
assert.equal(agMotifs[0].gabcVerbatimFragment,agMotifs[2].gabcVerbatimFragment);
assert.notEqual(agMotifs[0].gabcVerbatimFragment,agMotifs[1].gabcVerbatimFragment);
const snMotifs=ledger.scores.find(s=>s.gregobaseId===1384).noteSpotChecks.checks;
assert.notEqual(snMotifs[3].gabcVerbatimFragment,snMotifs[4].gabcVerbatimFragment);
assert.equal(ledger.scores.filter(s=>s.noteSpotChecks).length,3);
assert.equal(ledger.scores.reduce((n,s)=>n+(s.noteSpotChecks?.checks.length??0),0),12);
assert.equal(ledger.closedGates.fullyPrintedNoteMatchedCount,0);
assert.equal(ledger.closedGates.approvedForReaderCount,0);
console.log("PASS M27 12 visually compared original-print melodic motif spot checks across Agnus, Sanctus and Kyrie XVI; full pitch/neume certificates remain 0");

console.log("PASS M21 exact 10 primary 1961 printed-page images across seven scores; source GABC motif anchors and full score continuations pinned; zero false note certifications/public notation");
