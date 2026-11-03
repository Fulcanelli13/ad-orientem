import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {index1961GradualeGabc} from "../src/mass/reader-proper-gabc-bulk-join.js";
import {buildSelected2026ScoreVerificationWorklist,
 SCHOLA_2026_RELEASE_WORKLIST_SCHEMA}
 from "../src/mass/reader-schola-2026-release-worklist.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const archive=index1961GradualeGabc(Array.from({length:6},(_,i)=>
 load("../data/mass/chant-corpus/gr1961-proper-"+
 String(i+1).padStart(3,"0")+".json")));
const score=id=>Object.values(archive.byRole).flat().find(x=>x.id===id);
const intro=score("GREGOBASE-72"),gradual=score("GREGOBASE-1163");
assert.equal(intro.officePart,"in");assert.equal(gradual.officePart,"gr");
const dates=Array.from({length:365},(_,i)=>
 new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10));
const sourcePath="Sancti/01-01",sourceSha="e".repeat(40);
const day={date:dates[0],sourcePath,principalId:"sancti:01-01:1:w",
 status:"SOURCE_MATCHED_FOR_REVIEW",
 tracks:[{role:"INTROIT",part:"in",selectedParagraphId:"INTROIT.1",
  selectedLatin:"Puer natus est nobis, et filius datus est nobis",
  candidates:[{scoreId:intro.id,sourceGabcSha256:intro.sha256}]}]};
const annualReport={
 schema:"ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1",
 year:2026,sourceAuthority:"AO_RUNTIME_V8.resolver.resolveDay",
 counters:{civilDays:365,EN_READER_HOLD:364},
 rows:dates.map(date=>({date,status:"EN_READER_HOLD"}))
};
annualReport.rows[0]=day;
const fullSourceCrosswalk={
 schema:"ao-schola-2026-selected-full-1049-source-gabc-review-v1",
 provenance:{pinnedLatinSourceFiles:1049},
 counters:{calendarDays:365,readyDays:1,approvedPublicScores:0,
  corroboratedScoreOccurrences:1,missingSourcePaths:0},
 matchedReviewOccurrences:[{date:dates[0],principalId:day.principalId,
  sourcePath,sourceOwner:sourcePath,
  pinned1962SourceBlobSha:sourceSha,sourceSection:"Introitus",
  track:"INTROIT",part:"in",scoreId:intro.id,
  scoreGabcSha256:intro.sha256,selectedParagraphId:"INTROIT.1",
  status:"UNIQUE_1962_SOURCE_AND_SCORE_HASH_REVIEW_ONLY",
  publicScore:false,fullLatinTextVerified:false,printedNeumesVerified:false}],
 absentFromPinnedLatinTree:[]
};
const preGospelReview={
 schema:"ao-schola-2026-pregospel-selected-pinned-latin-editorial-queue-v1",
 counters:{daysChecked:365,publicScores:0,uniqueTextCandidateOccurrences:1,
  sourceOwnershipHolds:0},
 records:dates.map(date=>({date,status:"CALENDAR_PROPER_HOLD",pieces:[]}))
};
preGospelReview.records[0]={date:dates[0],status:"SELECTED_SOURCE_ROLE_CANDIDATES",
 sourcePath,pieces:[{part:"gr",sourceOwner:sourcePath,
 sourceSection:"Graduale",sourceSha,opening:"Viderunt omnes fines terrae",
 status:"UNIQUE_SOURCE_TEXT_CANDIDATE",scoreIds:[gradual.id],
 scoreGabcSha256:[gradual.sha256],publicScore:false,
 readerParagraphSplitCertified:false}]};
const payload={fullSourceCrosswalk,preGospelReview,annualReport,archive,perFamily:2};
const result=buildSelected2026ScoreVerificationWorklist(payload);
assert.equal(result.schema,SCHOLA_2026_RELEASE_WORKLIST_SCHEMA);
assert.equal(result.counters.uniqueScoreCandidates,2);
assert.equal(result.counters.sourceScoreOccurrences,2);
assert.equal(result.counters.byFamily.in.distinctScores,1);
assert.equal(result.counters.byFamily.gr.distinctScores,1);
assert.equal(result.counters.byFamily.tr.distinctScores,0);
assert.equal(result.counters.preGospelBatchScoreCount,1);
assert.equal(result.counters.blockedReaderDays,364);
assert.equal(result.preGospelBatch.every(x=>x.originalGabc.length>50),true);
assert.equal(result.preGospelBatch.every(x=>x.publicScore===false&&
 x.editorialApproved===false&&x.exactReaderCueBound===false),true);
assert.equal(result.preGospelBatch.every(x=>x.publicationBlockers.length===5),true);
assert.equal(result.publication.digitalScorePublished,0);
const falseHash=structuredClone(fullSourceCrosswalk);
falseHash.matchedReviewOccurrences[0].scoreGabcSha256="f".repeat(64);
assert.throws(()=>buildSelected2026ScoreVerificationWorklist({
 ...payload,fullSourceCrosswalk:falseHash}),/FULL_SOURCE_TO_DAY_SELECTED_TEXT_NOT_UNIQUE/);
const forgedAnnual=structuredClone(annualReport);
forgedAnnual.rows[0].tracks[0].candidates[0].sourceGabcSha256="f".repeat(64);
assert.throws(()=>buildSelected2026ScoreVerificationWorklist({
 ...payload,fullSourceCrosswalk:falseHash,annualReport:forgedAnnual}),
 /SELECTED_SCORE_ORIGINAL_HASH_ROLE_MISMATCH/);
const repeated=structuredClone(fullSourceCrosswalk);
repeated.matchedReviewOccurrences.push(repeated.matchedReviewOccurrences[0]);
repeated.counters.corroboratedScoreOccurrences=2;
assert.throws(()=>buildSelected2026ScoreVerificationWorklist({
 ...payload,fullSourceCrosswalk:repeated}),/DUPLICATE_SCORE_SOURCE_OCCURRENCE/);
const publish=structuredClone(preGospelReview);
publish.records[0].pieces[0].publicScore=true;
assert.throws(()=>buildSelected2026ScoreVerificationWorklist({
 ...payload,preGospelReview:publish}),/PREGOSPEL_UNREVIEWED_MUSIC_MATCH/);
const missing=structuredClone(annualReport);missing.rows.pop();
assert.throws(()=>buildSelected2026ScoreVerificationWorklist({
 ...payload,annualReport:missing}),/MUSICAL_REVIEW_SOURCE_AUTHORITY_INVALID/);
console.log("PASS: 2026 Gregorian pre-Gospel batch 02 editorial gate; original 1195-score hash and roles, 365-day parity, no auto publication");
