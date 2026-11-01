import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
import {sourceNoteGroupInventory} from "../src/mass/reader-kyriale-source-note-groups.js";
const html=readFileSync(new URL("../tools/mass/kyriale-1961-collation.html",import.meta.url),"utf8");
const ledger=JSON.parse(readFileSync(new URL("../data/research/mass-music-m21-seven-print-image-parity-worklist.v1.json",import.meta.url),"utf8"));
assert.equal(ledger.scores.length,7);
const js=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
assert.ok(js?.length>1000,"Inline research module is missing");
const syntax=spawnSync(process.execPath,["--check","--input-type=module"],{input:js,encoding:"utf8"});
assert.equal(syntax.status,0,"Broken inline module syntax: "+syntax.stderr);
for(const path of [
 "../src/mass/reader-kyriale-research-gabc.js",
 "../src/mass/reader-chant-engraver.js",
 "../src/mass/reader-kyriale-source-note-groups.js",
 "../data/research/mass-music-m21-seven-print-image-parity-worklist.v1.json"
])assert.ok(existsSync(new URL(path,import.meta.url)),"Research workbench module/ledger missing: "+path);
assert.match(html,/<html lang="en"/);
assert.match(html,/1961 Kyriale · notation collation/);
assert.match(html,/offlineKyrialeResearchScore/);
assert.match(html,/createOfflineChantEngraver/);
assert.match(html,/reader-chant-engraver\.js/);
assert.match(html,/reader-kyriale-research-gabc\.js/);
assert.match(html,/mass-music-m21-seven-print-image-parity-worklist\.v1\.json/);
for(const id of ["printImage","engraveViewport","scoreSelect","pageSelect","pitch","neume","underlay","rhythm","reviewNotes","export"]){
 assert.match(html,new RegExp('id="'+id+'"'),"Missing required research review control: "+id);
}
for(const id of ["agnusNotePanel","agnusGroupSelect","agnusPrev","agnusNext",
 "agnusGroupTitle","agnusGroupDescription","agnusGroupSource","agnusPitch",
 "agnusNeume","agnusUnderlay","agnusRhythm","agnusGroupComment",
 "agnusGroupProgress","agnusGroupSave"])
 assert.match(html,new RegExp('id="'+id+'"'),"Missing per-note Agnus source audit control: "+id);
assert.match(html,/noteGroupCollation\.noteGroups/);
assert.match(html,/sourceNoteGroupInventory/);
assert.match(html,/allSourceGroupsMarkedMatching/);
assert.match(html,/function saveNoteGroup/);
assert.match(html,/function completeScore/);
assert.match(html,/groupReviews/);
assert.match(html,/original staff system/);
assert.equal(ledger.scores.find(x=>x.gregobaseId===2760).noteGroupCollation.noteGroups.length,54);
assert.match(html,/URL\.createObjectURL/);
assert.match(html,/localStorage\.setItem/);
assert.match(html,/sourceUrl/);
assert.match(html,/printedPageImageUrls/);
assert.match(html,/editorialApproval:false/);
assert.match(html,/publicScoreCount:0/);
assert.match(html,/allowAutomaticPublication:false/);
assert.match(html,/allPageCategoriesMarkedMatching/);
assert.match(html,/Unreviewed/);
assert.match(html,/Matches printed page/);
assert.match(html,/Discrepancy found/);
assert.match(html,/Uncertain · hold/);
assert.doesNotMatch(html,/<script\s+src=["']https?:/i,"Research tool may never load a remote engraver");
assert.doesNotMatch(html,/new Audio|AudioContext|speechSynthesis|automatic.*(?:publish|promote)/i);
assert.ok(ledger.scores.every(s=>s.publicScore===false&&s.editorialApproval===false));
assert.equal(new Set(ledger.scores.flatMap(s=>s.printedPageImageUrls)).size,10);
for(const row of ledger.scores){
 const score=offlineKyrialeResearchScore(row.movement,row.catalogueSelection);
 assert.ok(score&&score.gabc,"Workbench source was disconnected: "+row.gregobaseId);
 assert.equal(score.scoreId,"GREGOBASE-"+row.gregobaseId);
 assert.equal(row.printedPages.length,row.printedPageImageUrls.length);
 const inventory=sourceNoteGroupInventory(score.gabc);
 const expected=({545:27,2982:27,1184:28,961:196,749:366,1384:55,2760:54})[row.gregobaseId];
 assert.equal(inventory.noteBearingSourceTokens,expected,"Source token count changed: "+row.gregobaseId);
 assert.ok(inventory.groups.every((g,i)=>g.ordinal===i+1&&g.printedPitchParity==="NOT_CERTIFIED"));
 assert.equal(inventory.continuationTokens,row.gregobaseId===1184?1:0);
 assert.equal(inventory.divisionAttachedTokens,row.gregobaseId===749?7:row.gregobaseId===2760?3:0,
  "A note after punctuation belongs to its preceding source syllable");
 if(row.gregobaseId===749)
  assert.ok(inventory.groups.filter(g=>g.sourceTokenType==="SYLLABLE_AFTER_DIVISION")
   .every(g=>/^(tri|ne|bis|lum|os|tem|tur)$/.test(g.syllable)));
 if(row.gregobaseId===2760)
  assert.ok(inventory.groups.filter(g=>g.sourceTokenType==="SYLLABLE_AFTER_DIVISION")
   .every(g=>g.syllable==="di"));
 if(row.gregobaseId===2760)assert.deepEqual(
  inventory.groups.map(g=>g.gabcOriginalNotes),
  row.noteGroupCollation.noteGroups.map(g=>g.gabcOriginalNotes));

}
const publicReader=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
assert.doesNotMatch(publicReader,/kyriale-1961-collation|data-schola-score-open/);
assert.doesNotMatch(sw,/kyriale-1961-collation/);
// M31 records actual visible short-score print comparisons. Do not turn an
// underlay/contour observation into staff-pitch, rhythm, or editorial approval.
const m31=JSON.parse(readFileSync(new URL(
 "../data/research/mass-music-m31-five-short-score-print-visual-pass.v1.json",
 import.meta.url),"utf8"));
assert.equal(m31.schema,"ao-mass-music-m31-five-short-score-print-visual-pass-v1");
assert.deepEqual(m31.scope.remainingLargeScores,["Gloria VIII","Credo III"]);
assert.equal(m31.scope.visuallySurveyedCompleteShortScores,5);
assert.equal(m31.scope.sourceNoteBearingGroupsInSurveyedScores,191);
assert.equal(m31.scope.sourceSyllableBearingGroupsInSurveyedScores,190);
assert.equal(m31.scope.visuallyMappedKyrieXviGroups,27);
assert.equal(m31.scope.certifiedPrintedMusicalGroups,0);
assert.equal(m31.scope.certifiedPublicDigitalScores,0);
assert.equal(m31.noAutomaticPublication,true);
assert.equal(m31.scoreReviews.length,5);
const reviewedSourceIds=m31.scoreReviews.map(x=>x.gregobaseId);
assert.deepEqual(reviewedSourceIds,[545,2982,1184,1384,2760]);
for(const row of m31.scoreReviews){
 const src=ledger.scores.find(s=>s.gregobaseId===row.gregobaseId);
 assert.ok(src,"M31 source not in original seven-score source registry");
 assert.deepEqual(row.originalScanUrls,src.printedPageImageUrls);
 assert.deepEqual(row.printedPages,src.printedPages);
 assert.equal(row.editorialApproval,false);
 assert.equal(row.publicScore,false);
 assert.equal(row.absolutePitchParity,"NOT_CERTIFIED");
 assert.equal(row.completeNeumeSignParity,"NOT_CERTIFIED");
 assert.equal(row.allRhythmMarksParity,"NOT_CERTIFIED");
 assert.equal(row.independentFullUnderlayByGroupCertification,false);
 const orig=offlineKyrialeResearchScore(src.movement,src.catalogueSelection);
 const groups=sourceNoteGroupInventory(orig.gabc).groups;
 assert.equal(groups.length,row.sourceBearingGroupCount);
}
const xvi=m31.kyrieXviGroupVisualMap;
assert.equal(xvi.length,27);
const kyrieSource=ledger.scores.find(s=>s.gregobaseId===545);
const xviGroups=sourceNoteGroupInventory(
 offlineKyrialeResearchScore(kyrieSource.movement,kyrieSource.catalogueSelection).gabc).groups;
for(let i=0;i<xvi.length;i++){
 const row=xvi[i],source=xviGroups[i];
 assert.equal(row.ordinal,i+1);
 assert.equal(row.originalLatinSyllable,source.syllable);
 assert.equal(row.sourceGabcNotes,source.gabcOriginalNotes);
 assert.equal(row.originalPrintSystem,i<14?1:2);
 assert.equal(row.originalPrintPage,"54*");
 assert.equal(row.exactAbsolutePitchAgainstOriginal,"NOT_CERTIFIED");
 assert.equal(row.exactNeumeJoiningAndShapes,"NOT_CERTIFIED");
 assert.equal(row.moraEpisemataAndRhythmicSigns,"NOT_CERTIFIED");
 assert.equal(row.reviewerEditorialApproval,false);
}
// M32 original printed witness triangulation; an exact scan reference is
// evidence of a visual comparison, NOT a full musical certificate.
const m32=m31.kyrieXviThreeWitnessMusicReview;
assert.equal(m32.primaryGregorianCandidate,"GREGOBASE-545");
assert.deepEqual(m32.originalPrintedSources.map(s=>[s.edition,s.printedPage,s.scanUrl]),[
 ["Graduale Romanum","54*","https://gregobase.selapa.net/sources/2/931.png"],
 ["The Liber Usualis","59","https://gregobase.selapa.net/sources/3/170.png"],
 ["Chants of the Church","40","https://gregobase.selapa.net/sources/5/55.png"]
]);
assert.equal(m32.observedMusicalMatches.sourceGroupsCorroboratedAtReadableScanLevel,27);
assert.equal(m32.observedMusicalMatches.phraseCount,4);
assert.equal(m32.observedMusicalMatches.thirdPhraseContinuesAcrossOriginalSystemBreak,true);
assert.deepEqual(m32.sourceGabcSignReviewQueue.horizontalEpisemaCandidateGroupOrdinals,[5,11,18]);
assert.deepEqual(m32.sourceGabcSignReviewQueue.punctumMoraCandidateGroupOrdinals,[7,13,20,27]);
assert.equal(m32.sourceGabcSignReviewQueue.finalCadenceSourceString,"ighvGFE.");
assert.equal(m32.fullNoteByNoteAbsolutePitchCertification,false);
assert.equal(m32.fullNoteByNoteNeumeCertification,false);
assert.equal(m32.fullRhythmicMarksCertification,false);
assert.equal(m32.editorialApproval,false);
assert.equal(m32.publicDigitalGabcApproval,false);
assert.equal(m32.newChantAudioApproval,false);
assert.equal(m32.changeOriginalGabc,false);
assert.equal(m31.scope.threePrintCorroboratedKyrieXviGroups,27);
assert.equal(m31.scope.certifiedPrintedMusicalGroups,0);
assert.ok(m31.kyrieXviGroupVisualMap.every(g=>
 g.m32ThreePrintedWitnesses?.fullIndependentMusicalCertification===false &&
 g.m32ThreePrintedWitnesses?.visualAlignment==="SAME_NOTATED_STAFF_CONTOUR_VISIBLE_ON_ALL_THREE_PRINTS"));
console.log("PASS M22 bulk 753 source note-bearing tokens across seven scores, including 54 Agnus groups; isolated 1961 Kyriale editorial workbench: printed 10-page witness + real offline SVG component, four independent notation decisions and JSON export; zero public score promotion");
