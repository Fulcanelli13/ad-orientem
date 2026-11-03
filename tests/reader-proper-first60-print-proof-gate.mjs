import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildFirst60PrintedMusicEvidence,PROPER_PRINT_GATE_SCHEMA}
 from "../src/mass/reader-proper-first60-print-proof-gate.js";
const dir=new URL("../.tmp/schola-1962-selected-annual/",import.meta.url);
const load=file=>JSON.parse(readFileSync(new URL(file,dir),"utf8"));
const packet=load("2026-selected-proper-first60-print-review.json");
const latinAudit=load("2026-first60-complete-antiphon-text-audit.json");
const written=load("2026-first60-1961-printed-music-proof-gate.json");
const x=buildFirst60PrintedMusicEvidence({packet,latinAudit});
assert.deepEqual(x,written,"Printed-music review drifted from exact source and Latin audit");
assert.equal(x.schema,PROPER_PRINT_GATE_SCHEMA);
assert.equal(x.counts.scores,60);
assert.equal(x.counts.fullLatinTextMatches,51);
assert.equal(x.counts.textVariantHolds,9);
assert.equal(x.counts.noteGroups,3453);
assert.equal(x.counts.textMatchedScoreNoteGroups,2976);
assert.equal(x.counts.pendingFolioImageComparisons,51);
assert.equal(x.counts.sourceImagesIndependentlyCompared,0);
assert.equal(x.counts.completePrintedMusicVerified,0);
assert.equal(x.counts.signedEditorialApprovals,0);
assert.equal(x.counts.newlyPublicScores,0);
assert.equal(x.firstTwelveForPrintComparison.length,12);
assert.equal(new Set(x.firstTwelveForPrintComparison).size,12);
assert.equal(x.allScores.filter(r=>!r.textExact).length,9);
assert.ok(x.allScores.every(r=>r.publication==="EDITORIAL_HOLD_NOT_PUBLIC"&&
 !r.completePrintedMusicVerified&&!r.exactReaderCueAndSettingVerified&&
 !r.signedEditorialApproval&&r.noteGroups.length>0&&
 r.noteGroups.every(g=>!g.printedPitchVerified&&!g.printedNeumeVerified&&
 !g.printedUnderlayVerified&&!g.printedRhythmVerified)));
const sourceBatchScoreIds=packet.candidates.map(c=>c.scoreId);
const empty={schema:"ao-proper-first60-independent-print-observations-v1",
 sourceBatchScoreIds,evidence:{},editorialDecision:"PENDING_INDEPENDENT_REVIEW",
 publication:{publicScores:0,automaticApproval:false,doNotImportIntoLive:true}};
assert.deepEqual(buildFirst60PrintedMusicEvidence({
 packet,latinAudit,observations:empty}).counts,x.counts);
const match=x.allScores.find(r=>r.textExact);
assert.ok(match);
const k=match.scoreId+"|"+match.scoreGabcSha256;
const allScore={publicScore:false,editorialApproval:false,
 reviewerObservationOnly:true,groups:{}};
for(const f of ["pitch","neumes","underlay","rhythm","use1962","sourcePrint"])
 allScore[f]="MATCH";
for(const group of match.noteGroups)allScore.groups[group.ordinal]={
 gPitch:"MATCH",gNeumes:"MATCH",gUnderlay:"MATCH",gRhythm:"MATCH"
};
const forged={...empty,evidence:{[k]:allScore}};
const claimed=buildFirst60PrintedMusicEvidence({packet,latinAudit,observations:forged});
assert.equal(claimed.allScores.find(r=>r.scoreId===match.scoreId).observation.status,
 "ALL_OBSERVATIONS_MARKED_PENDING_INDEPENDENT_APPROVAL");
assert.equal(claimed.publication.publicScores,0);
assert.equal(claimed.counts.completePrintedMusicVerified,0);
assert.equal(claimed.allScores.find(r=>r.scoreId===match.scoreId).signedEditorialApproval,false);
const badProof=structuredClone(forged);
badProof.evidence[k].editorialApproval=true;
assert.throws(()=>buildFirst60PrintedMusicEvidence({
 packet,latinAudit,observations:badProof}),/PRINT_OBSERVATION_MAY_NOT_ASSERT_EDITORIAL_APPROVAL/);
const tampered=structuredClone(packet);
tampered.candidates[0].scoreGabc+="something";
assert.throws(()=>buildFirst60PrintedMusicEvidence({
 packet:tampered,latinAudit}),/PRINT_GATE_SOURCE_SCORE_OR_1962_READER_DRIFT/);
const variant=x.allScores.find(r=>!r.textExact);
const withVariant={...empty,evidence:{
 [variant.scoreId+"|"+variant.scoreGabcSha256]:
 {publicScore:false,editorialApproval:false,reviewerObservationOnly:true}}};
assert.throws(()=>buildFirst60PrintedMusicEvidence({
 packet,latinAudit,observations:withVariant}),/NINE_TEXT_VARIANTS_CANNOT_RECEIVE_PRINT_APPROVAL/);
const unexpected={...empty,evidence:{"GREGOBASE-999|"+("0".repeat(64)):allScore}};
assert.throws(()=>buildFirst60PrintedMusicEvidence({
 packet,latinAudit,observations:unexpected}),/PRINT_OBSERVATION_UNKNOWN_OR_TAMPERED_SCORE_ID/);
console.log("PASS: 51 score original-print evidence packets, 9 variant holds, 3453 GABC note groups, zero unauthorized musical approvals");
