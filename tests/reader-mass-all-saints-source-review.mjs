import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const ledger=read("data/research/mass-music-2026-11-01-all-saints-five-propers.v1.json");
const archive=Array.from({length:6},(_,i)=>read(
 "data/research/mass-music-m07-gr1961-review-00"+(i+1)+".v1.json"));
const sources=archive.flatMap(x=>x.candidates);
const byId=new Map(sources.map(x=>[x.sourceId,x]));
const triage=read("data/research/mass-music-m07-342-source-triage.v1.json");
const sourceMatches=new Map(triage.records.map(x=>[x.id,x]));
const m09=Array.from({length:6},(_,i)=>read(
 "data/research/mass-music-m09-1962-line-qa-00"+(i+1)+".v1.json"));
const screened=new Map(m09.flatMap(x=>x.records).map(x=>[x.id,x]));
const m05=read("data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json");

assert.equal(ledger.churchCalendar.date,"2026-11-01");
assert.equal(ledger.churchCalendar.massSourcePath,"Sancti/11-01");
assert.equal(ledger.properCandidates.length,5);
assert.deepEqual(ledger.properCandidates.map(x=>x.sourceId),[752,371,1237,835,345]);
assert.deepEqual(ledger.properCandidates.map(x=>x.role),
 ["INTROIT","GRADUAL","ALLELUIA","OFFERTORY","COMMUNION"]);
assert.deepEqual(ledger.properCandidates.map(x=>x.printedGraduale1961Page),
 [647,648,648,649,650]);
const part={INTROIT:"in",GRADUAL:"gr",ALLELUIA:"al",OFFERTORY:"of",COMMUNION:"co"};
let direct=0;
for(const [i,x] of ledger.properCandidates.entries()){
 const original=byId.get(x.sourceId);
 assert.ok(original,"Research archive identity lost for "+x.sourceId);
 assert.equal(original.id,x.originalArchiveId);
 assert.equal(original.sourceSha256,x.originalGabcSha256);
 assert.equal(original.sourceUrl,x.sourceUrl);
 assert.equal(original.folio,x.archiveFolioToken);
 assert.equal(original.incipit,x.archiveIncipit);
 assert.equal(original.part,part[x.role],"Wrong original 1961 chant part");
 assert.equal(x.archivePart,part[x.role]);
 assert.equal(x.order,i+1);
 assert.equal(x.sourceFileReference,"Sancti/11-01");
 assert.equal(x.original1962DonorSourceBlobSha,ledger.churchCalendar.sourceBlobSha);
 assert.equal(x.selectedMass1962,"NOT_VERIFIED");
 assert.equal(x.originalPrintedNeumes,"NOT_COMPARED");
 assert.equal(x.fullVerseParity,"NOT_VERIFIED");
 assert.equal(x.editorialApproval,"PENDING_USER_FINAL_COLLECTION_REVIEW");
 assert.equal(x.readerAutoAssignment,false);
 assert.equal(x.scorePublished,false);
 assert.equal(x.recordingApproved,false);
 assert.match(x.sourceUrl,new RegExp("chant\\.php\\?id="+x.sourceId+"$"));
 const lead=sourceMatches.get(original.id)?.eligibleSourceRefs?.find(r=>r.path==="Sancti/11-01");
 const line=screened.get(original.id)?.occurrences?.find(r=>r.sourcePath==="Sancti/11-01");
 assert.equal(Boolean(lead),Boolean(line));
 if(lead&&line){
  direct++;
  assert.equal(x.sourceTextScreen.status,
   "PRELIMINARY_342_CANDIDATE_1962_DONOR_TEXT_SCREEN");
  assert.equal(lead.sourceBlobSha,ledger.churchCalendar.sourceBlobSha);
  assert.equal(x.sourceTextScreen.sourceSection,lead.section);
  assert.equal(x.sourceTextScreen.initialMatchingWords,line.initialMatchingWords);
  assert.equal(x.sourceTextScreen.donorWordCount,line.donorWordCount);
  assert.equal(x.sourceTextScreen.comparisonClass,line.comparisonClass);
  assert.equal(x.sourceTextScreen.donorLineContained,line.normalizedDonorLineContained);
 }else assert.equal(x.sourceTextScreen.status,"NOT_IN_BOUNDED_342_CANDIDATE_SCREEN");
}
assert.equal(direct,3,"Do not represent two archival incipit leads as certified source comparisons");
const asp=m05.scores.find(x=>x.id==="ASPERGES_NORMAL");
assert.equal(ledger.actualSundayPrelude.sourceId,497);
assert.equal(ledger.actualSundayPrelude.selectedNativeFormula,"ORDINARY");
assert.equal(ledger.actualSundayPrelude.id,asp.id);
assert.equal(ledger.actualSundayPrelude.sourceUrl,asp.gregobaseUrl);
assert.equal(ledger.actualSundayPrelude.renderApproved,false);
assert.equal(asp.renderApproved,false);
assert.equal(ledger.actualSundayPrelude.editorialApproval,asp.editorialApproval);
assert.deepEqual({...ledger.publication}, {
 researchOnly:true,sourceAssignmentsApproved:0,printed1961MelodicVerifications:0,
 publiclyAvailableScores:0,noNewGabcCopied:true,noNewAudio:true,
 sourceArchiveInSeparateUnmergedPR:1749,
 approvalRequired:"ONE_FINAL_USER_COLLECTION_REVIEW"});
assert.equal(new Set(ledger.properCandidates.map(x=>x.originalArchiveId)).size,5);
console.log("PASS: All Saints 2026 source-locked five Proper leads and ordinary Asperges; no approved scores or audio");
