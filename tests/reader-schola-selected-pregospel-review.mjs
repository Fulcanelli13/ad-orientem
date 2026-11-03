import assert from "node:assert/strict";
import {buildSelected2026PreGospelSourceReview}
 from "../src/mass/reader-schola-selected-pregospel-review.js";

const date=i=>new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10);
const path="Tempora/Adv4-0",SHA="a".repeat(64);
const sections=["[Graduale]","!Ps 144:18; 144:21",
 "Prope est Dóminus ómnibus invocántibus eum: ómnibus, qui ínvocant eum in veritáte.",
 "V. Laudem Dómini loquétur os meum: et benedícat omnis caro nomen sanctum ejus. Allelúja, allelúja,",
 "V. Veni, Dómine, et noli tardáre: reláxa facínora plebis tuæ Israël. Allelúja."
].join("\n");
const selected=sections.replace("[Graduale]","").replace("!Ps 144:18; 144:21","");
const archive={schema:"ao-mass-1961-full-gabc-source-index-v1",count:1195,
 byRole:{in:[],of:[],co:[],tr:[],
  gr:[{id:"GREGOBASE-1",sha256:SHA,gregobaseId:1,
       normalizedScoreText:"Prope est Dominus omnibus invocantibus eum omnibus",
       sourceUrl:"https://gregobase.selapa.net/chant.php?id=1"}],
  al:[{id:"GREGOBASE-2",sha256:SHA,gregobaseId:2,
       normalizedScoreText:"Veni Domine et noli tardare relaxa facinora",
       sourceUrl:"https://gregobase.selapa.net/chant.php?id=2"}]}};
const day={date:date(0),sourcePath:path,principalId:"adv4",
 status:"SOURCE_MATCHED_FOR_REVIEW",resolverStatus:"ready",properStatus:"ready",
 selectedGradualLatin:selected,selectedSequenceLatin:"",tracks:[]};
const annual={
 schema:"ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1",
 sourceAuthority:"AO_RUNTIME_V8.resolver.resolveDay",year:2026,
 status:"EDITORIAL_CANDIDATES_ONLY_NO_DIGITAL_NOTATION_PUBLICATION",
 counters:{civilDays:365},
 rows:Array.from({length:365},(_,i)=>({date:date(i),
  status:"EN_READER_HOLD"}))
};
annual.rows[0]=day;
annual.rows[1]={...day,date:date(1),selectedGradualLatin:""};
let loaded=0;
const read=async src=>{loaded++;return src===path?{
 text:sections,sha:"b".repeat(40)}:null};
const result=await buildSelected2026PreGospelSourceReview({
 annualReport:annual,archive,fetchSource:read});
assert.equal(result.counters.daysChecked,365);
assert.equal(result.counters.readyDays,2);
assert.equal(result.counters.daysWithCandidatePieces,1);
assert.equal(result.counters.uniqueTextCandidateOccurrences,2);
assert.equal(result.counters.distinctCandidateScoreIds,2);
assert.equal(result.records[0].status,"SELECTED_SOURCE_ROLE_CANDIDATES");
assert.deepEqual(result.records[0].pieces.map(x=>[x.part,x.scoreIds[0]]),[
 ["gr","GREGOBASE-1"],["al","GREGOBASE-2"]]);
assert.equal(result.records[1].status,"SELECTED_GRADUAL_SOURCE_UNAVAILABLE");
assert.equal(result.counters.dayStatuses.CALENDAR_PROPER_HOLD,363);
assert.equal(result.publication.readerPreGospelSourceSeparationChanged,false);
assert.equal(result.publication.publicScores,0);
assert.equal(result.scoreReviewLeads.every(x=>!x.publicScore&&!x.editorialApproved),true);
assert.ok(loaded>0);
const bad=structuredClone(annual);
bad.rows[0].selectedGradualLatin="Completely unrelated Proper text four five six";
const failed=await buildSelected2026PreGospelSourceReview({
 annualReport:bad,archive,fetchSource:read});
assert.equal(failed.counters.daysWithCandidatePieces,0);
assert.equal(failed.counters.distinctCandidateScoreIds,0);
await assert.rejects(buildSelected2026PreGospelSourceReview({
 annualReport:annual,archive:{...archive,count:1194},fetchSource:read}),
 /PREGOSPEL_SELECTED_2026_SOURCE_INPUT_INVALID/);
console.log("PASS selected 2026 actual Gradual/Alleluia research reuse, exact pinned source boundaries, 365-day completeness and zero publication");
