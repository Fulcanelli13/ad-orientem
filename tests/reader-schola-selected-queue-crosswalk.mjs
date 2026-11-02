import assert from "node:assert/strict";
import {crosswalkSelected2026MassesToPinnedReview,
 SELECTED_2026_INLINE_CROSSWALK_SCHEMA}
 from "../src/mass/reader-schola-selected-queue-crosswalk.js";

const dates=Array.from({length:365},(_,i)=>
 new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10));
const path="Sancti/12-25m3";
const lead=(id,n)=>({
 scoreId:"GREGOBASE-"+id,role:"in",selectionKey:"PROPER_INTROIT",
 originalGabcSha256:"a".repeat(64),
 original1961Folio:"42",sourceUrl:"https://gregobase.selapa.net/chant.php?id="+id,
 publication:"RESEARCH_ONLY_NOT_APPROVED",publicScore:false,
 occurrences:n?[{sourcePath:path,sourceBlobSha:"b".repeat(40),
 section:"Introitus",sectionIndex:0,
 liturgicalKind:"Introitus",sourceOwner:path,
 sourceOwnerChain:[path+":Introitus"],
 latinIncipit:"Puer natus est nobis, et filius datus est nobis.",
 matchStatus:"UNIQUE_TEXT_CANDIDATE",matchedOpeningWords:8}]:[]
});
const queue={
 schema:"ao-mass-inline-1962-91-archived-score-review-queue-v1",
 status:"SOURCE_RESEARCH_QUEUE_NOT_PUBLICATION",
 counts:{distinctCandidateScoreIds:342,publishedScores:0},
 provenance:{calendarMassesSelected:false},
 scoreReviewLeads:[lead(72,1),
  ...Array.from({length:341},(_,i)=>lead(i+10000,0))],
 unresolvedSectionHolds:[{sourcePath:"Tempora/Pent19-0"}]
};
const active={
 date:dates[0],principalId:"test-principal",sourcePath:path,
 sourceExistsInPinnedLatinTree:true,resolverStatus:"ready",properStatus:"ready",
 status:"SOURCE_MATCHED_FOR_REVIEW",tracks:[{
 role:"INTROIT",part:"in",sourceGroup:null,
 status:"UNIQUE_SOURCE_TEXT_CANDIDATE",
 selectedParagraphId:"INTROIT.1",
 selectedLatin:"Isa 9:6 ℣. Puer natus est nobis, et filius datus est nobis.",
 candidates:[{scoreId:"GREGOBASE-72",sourceGabcSha256:"a".repeat(64),
 editorApproved:false,publicScore:false}]
 }]};
const held=date=>({date,status:"EN_READER_HOLD",sourcePath:null,tracks:[]});
const report={
 schema:"ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1",
 year:2026,sourceAuthority:"AO_RUNTIME_V8.resolver.resolveDay",
 status:"EDITORIAL_CANDIDATES_ONLY_NO_DIGITAL_NOTATION_PUBLICATION",
 counters:{civilDays:365},rows:dates.map(held)
};
report.rows[0]=active;
report.rows[1]={...active,date:dates[1],sourcePath:"Tempora/Pent19-0"};
report.rows[2]={...active,date:dates[2],
 tracks:active.tracks.map(x=>({...x,
  candidates:[...x.candidates,{scoreId:"GREGOBASE-73",
   sourceGabcSha256:"c".repeat(64),editorApproved:false,publicScore:false}],
  status:"AMBIGUOUS_SOURCE_TEXT_VARIANTS"}))};
report.rows[3]={...active,date:dates[3],
 tracks:active.tracks.map(x=>({...x,selectedLatin:"Other source text altogether"}))};
const result=crosswalkSelected2026MassesToPinnedReview({
 annualReport:report,reviewQueue:queue});
assert.equal(result.schema,SELECTED_2026_INLINE_CROSSWALK_SCHEMA);
assert.equal(result.counters.calendarDays,365);
assert.equal(result.counters.readySelectedDates,4);
assert.equal(result.counters.corroboratedCandidateOccurrences,1);
assert.equal(result.counters.distinctCorroboratedScoreIds,1);
assert.equal(result.calendar[0].status,"ALL_UNIQUE_TRACKS_CORROBORATED");
assert.equal(result.calendar[1].status,"SOURCE_REVIEW_HOLD");
assert.equal(result.calendar[2].tracks[0].status,"SELECTED_SCORE_VARIANTS_AMBIGUOUS");
assert.equal(result.calendar[3].tracks[0].status,"PINNED_1962_SOURCE_INCIPIT_NOT_CORROBORATED");
assert.equal(result.matchedReviewOccurrences[0].scoreId,"GREGOBASE-72");
assert.equal(result.matchedReviewOccurrences[0].sourceOwner,path);
assert.equal(result.matchedReviewOccurrences[0].publicScore,false);
assert.equal(result.publication.scoresApproved,0);
assert.equal(result.counters.calendarDayStatuses.CALENDAR_OR_READER_HOLD,361);
assert.throws(()=>crosswalkSelected2026MassesToPinnedReview({
 annualReport:{...report,rows:report.rows.slice(1)},reviewQueue:queue}),
 /INCOMPLETE_OR_UNORDERED/);
const corrupted=structuredClone(queue);
corrupted.scoreReviewLeads[0].originalGabcSha256="f".repeat(64);
const bad=crosswalkSelected2026MassesToPinnedReview({
 annualReport:report,reviewQueue:corrupted});
assert.equal(bad.counters.corroboratedCandidateOccurrences,0);
assert.equal(bad.calendar[0].tracks[0].status,
 "SOURCE_SCORE_ID_OR_HASH_NOT_CORROBORATED");
const premature=structuredClone(queue);
premature.scoreReviewLeads[0].publicScore=true;
assert.throws(()=>crosswalkSelected2026MassesToPinnedReview({
 annualReport:report,reviewQueue:premature}),/STAGED_SCORE_RECORD_UNTRUSTED/);
console.log("PASS 365 real-calendar-source crosswalk contract; strict source text, score identity and unapproved publication gates");
