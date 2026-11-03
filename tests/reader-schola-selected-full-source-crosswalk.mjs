import assert from "node:assert/strict";
import {crosswalkSelected2026ToFullPinnedSource,
 SELECTED_2026_FULL_SOURCE_CROSSWALK_SCHEMA}
 from "../src/mass/reader-schola-selected-full-source-crosswalk.js";

const dates=Array.from({length:365},(_,i)=>new Date(Date.UTC(2026,0,i+1))
 .toISOString().slice(0,10));
const source="Sancti/12-25m3",hash="a".repeat(64);
const entry={sourcePath:source,sourceBlobSha:"b".repeat(40),
 sourceAuthenticated:true,actualSelectedMass1962:false,tracks:[{
 section:"Introitus",kind:"Introitus",part:"in",
 sourceOwner:source,sourceOwnerChain:[source+":Introitus"],
 latinIncipit:"Puer natus est nobis et filius datus est nobis",
 status:"UNIQUE_TEXT_CANDIDATE",
 candidates:[{id:"GREGOBASE-72",sha256:hash,originalFolio:"42",
 sourceUrl:"https://gregobase.selapa.net/chant.php?id=72",
 matchedOpeningWords:8}]
}]};
const sources=[entry,...Array.from({length:1048},(_,i)=>({
 sourcePath:"Tempora/T"+String(i).padStart(4,"0"),
 sourceBlobSha:"c".repeat(40),sourceAuthenticated:true,
 actualSelectedMass1962:false,tracks:[]
}))];
const audit={schema:"ao-schola-full-pinned-1962-candidate-universe-audit-v1",
 sourceRef:"pinned-test-ref",sourceUniverseCount:1049,
 auditedSourceCount:1049,authenticatedSourceCount:1049,
 authenticationFailures:[],permissions:{publicNotation:false,
 selected1962MassConfirmed:false},coverage:{
  schema:"ao-schola-1962-91-pinned-mass-source-coverage-v1",
  pinnedSourceCount:1049,catalogueSourceCount:1195,
  publication:{approvedScores:0},sourceFiles:sources
 }};
const track={role:"INTROIT",part:"in",status:"UNIQUE_SOURCE_TEXT_CANDIDATE",
 selectedParagraphId:"INTROIT.1",
 selectedLatin:"Ps 9:6 ℣. Puer natus est nobis et filius datus est nobis",
 candidates:[{scoreId:"GREGOBASE-72",sourceGabcSha256:hash,
 editorApproved:false,publicScore:false}]};
const day={date:dates[0],principalId:"christmas",sourcePath:source,
 sourceExistsInPinnedLatinTree:true,resolverStatus:"ready",properStatus:"ready",
 status:"SOURCE_MATCHED_FOR_REVIEW",tracks:[track]};
const annual={schema:"ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1",
 year:2026,sourceAuthority:"AO_RUNTIME_V8.resolver.resolveDay",
 sourceScoreCorpus:1195,
 status:"EDITORIAL_CANDIDATES_ONLY_NO_DIGITAL_NOTATION_PUBLICATION",
 counters:{civilDays:365},
 rows:dates.map(date=>({date,status:"EN_READER_HOLD"}))};
annual.rows[0]=day;
annual.rows[1]={...day,date:dates[1],
 tracks:[{...track,selectedLatin:"Entirely different words four five six"}]};
annual.rows[2]={...day,date:dates[2],sourcePath:"Commune/UNKNOWN",
 sourceExistsInPinnedLatinTree:false};
annual.rows[3]={...day,date:dates[3],tracks:[{
 ...track,status:"AMBIGUOUS_SOURCE_TEXT_VARIANTS",
 candidates:[...track.candidates,{...track.candidates[0],scoreId:"GREGOBASE-99"}]}]};
annual.rows[4]={...day,date:dates[4],sourcePath:sources[1].sourcePath};
const prior={schema:"ao-mass-inline-selected-2026-pinned91-review-crosswalk-v1",
 counters:{calendarDays:365,publishedScores:0},
 matchedReviewOccurrences:[{date:dates[0],sourcePath:source,
 track:"INTROIT",part:"in",scoreId:"GREGOBASE-72",
 scoreGabcSha256:hash}]};
const result=crosswalkSelected2026ToFullPinnedSource({
 annualReport:annual,fullSourceAudit:audit,prior91Crosswalk:prior});
assert.equal(result.schema,SELECTED_2026_FULL_SOURCE_CROSSWALK_SCHEMA);
assert.equal(result.counters.calendarDays,365);
assert.equal(result.counters.readyDays,5);
assert.equal(result.counters.corroboratedScoreOccurrences,1);
assert.equal(result.counters.distinctCorroboratedScoreIds,1);
assert.equal(result.counters.distinctSelectedSourcePaths,3);
assert.equal(result.counters.selectedPathsInFullPinnedTree,2);
assert.equal(result.counters.missingSourcePaths,1);
assert.equal(result.days[0].status,"ALL_TRACKS_SOURCE_CORROBORATED");
assert.equal(result.days[1].tracks[0].status,
 "PINNED_SCORE_AND_1962_OPENING_NOT_CORROBORATED");
assert.equal(result.days[2].status,"OUTSIDE_PINNED_1049_LATIN_TREE");
assert.equal(result.days[3].tracks[0].status,"SELECTED_VARIANTS_COMPETE");
assert.equal(result.days[4].tracks[0].status,
 "PINNED_SCORE_AND_1962_OPENING_NOT_CORROBORATED");
assert.equal(result.counters.dayStatuses.CALENDAR_OR_READER_HOLD,360);
assert.equal(result.matchedReviewOccurrences[0].scoreId,"GREGOBASE-72");
assert.equal(result.matchedReviewOccurrences[0].fullLatinTextVerified,false);
assert.equal(result.deduplicatedScoreReviewLeads[0].occurrences,1);
assert.equal(result.publication.publicScores,0);
assert.equal(result.comparisonWithPrior91.previouslyCorroboratedNotReproduced.length,0);
assert.deepEqual(result.absentFromPinnedLatinTree[0].dates,[dates[2]]);
const corrupt=structuredClone(annual);
corrupt.rows[0].tracks[0].candidates[0].sourceGabcSha256="d".repeat(64);
const held=crosswalkSelected2026ToFullPinnedSource({
 annualReport:corrupt,fullSourceAudit:audit});
assert.equal(held.counters.corroboratedScoreOccurrences,0);
const wrongTree=structuredClone(annual);
wrongTree.rows[0].sourceExistsInPinnedLatinTree=false;
assert.throws(()=>crosswalkSelected2026ToFullPinnedSource({
 annualReport:wrongTree,fullSourceAudit:audit}),
 /SELECTED_SOURCE_TREE_MEMBERSHIP_CHANGED/);
assert.throws(()=>crosswalkSelected2026ToFullPinnedSource({
 annualReport:{...annual,rows:annual.rows.slice(1)},fullSourceAudit:audit}),
 /UNTRUSTED_SELECTED_2026_DAY_RESOLVER/);
assert.throws(()=>crosswalkSelected2026ToFullPinnedSource({
 annualReport:annual,fullSourceAudit:{...audit,authenticatedSourceCount:1048}}),
 /UNTRUSTED_FULL_1049_AUDIT/);
console.log("PASS: 365 source-selected dates vs 1049 authenticated Latin sources, exact score/incipit hash gates, inherited and absent-source holds, zero publication");
