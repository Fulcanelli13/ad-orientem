import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {index1961GradualeGabc}
 from "../src/mass/reader-proper-gabc-bulk-join.js";
import {build2026ProperFirst60ScoreReview,
 PROPER_FIRST_60_REVIEW_SCHEMA}
 from "../src/mass/reader-proper-first60-print-review.js";
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const output=read("../.tmp/schola-1962-selected-annual/2026-selected-proper-first60-print-review.json");
const annual=read("../.tmp/schola-1962-selected-annual/2026-selected-gabc-coverage.json");
const crosswalk=read("../.tmp/schola-1962-selected-annual/2026-selected-full1049-inline-crosswalk.json");
const archive=index1961GradualeGabc(Array.from({length:6},(_,i)=>
 read("../data/mass/chant-corpus/gr1961-proper-"+String(i+1).padStart(3,"0")+".json")));
const recreated=build2026ProperFirst60ScoreReview({
 annualReport:annual,fullSourceCrosswalk:crosswalk,archive});
assert.deepEqual(output,recreated,"Review candidates changed without original sources changing");
assert.equal(output.schema,PROPER_FIRST_60_REVIEW_SCHEMA);
assert.equal(output.status,"FIRST_60_EDITORS_PRINT_REVIEW_NOT_MUSIC_APPROVAL");
assert.equal(output.batch.candidates,60);
assert.equal(output.batch.distinctScoreIds,60);
assert.deepEqual(output.batch.quotaByPart,{in:20,of:20,co:20});
assert.deepEqual(Object.fromEntries(["in","of","co"].map(p=>[p,
 output.candidates.filter(x=>x.part===p).length])),{in:20,of:20,co:20});
assert.equal(output.publication.publicScores,0);
assert.equal(output.publication.autoPromotion,false);
// Editorially locked initial 60 may not silently churn after the 6 March
// Perpetua/Felicity Reader repair makes that day's additional GABC leads
// available. They remain in the full annual worklist, never automatically
// displace an existing first60 candidate or receive an approval.
const postLock=output.postLockNewlyReadySourceLeads??[];
assert.ok(postLock.length>=1&&postLock.every(x=>
 x.date==="2026-03-06"&&x.sourcePath==="Tempora/Quad2-5"&&
 x.principalId==="tempora:Quad2-5:3:v"&&
 x.publication==="LATER_EDITORIAL_WORKLIST_NOT_PUBLIC"));
assert.ok(postLock.some(x=>x.scoreId==="GREGOBASE-993"&&x.part==="of"),
 "The newly authenticated March 6 Offertory lead must remain discoverable");
assert.ok(output.candidates.some(x=>x.scoreId==="GREGOBASE-812"&&x.part==="of"),
 "Original first60 locked Offertory review item disappeared");
assert.ok(!output.candidates.some(x=>x.scoreId==="GREGOBASE-993"&&x.part==="of"),
 "New date silently replaced the locked musical shortlist");
assert.ok(output.candidates.every(c=>
 c.publication==="EDITORIAL_HOLD_NOT_PUBLIC"&&
 !c.approvedForMassReader&&!c.approvedForLocalScholaPerformance&&
 Object.values(c.review).every(v=>v===false)&&
 c.representative.scoreOpeningWordsMatched>=4&&
 c.scoreGabc.includes("(::)")&&
 /^GREGOBASE-\d+$/.test(c.scoreId)&&
 /^[a-f0-9]{64}$/.test(c.scoreGabcSha256)&&
 createHash("sha256").update(c.scoreGabc,"utf8").digest("hex")===c.scoreGabcSha256&&
 c.occurrences===c.dates.length&&c.sourcePaths.length>=1&&
 typeof c.representative.sourceLatin==="string"&&
 c.representative.sourceLatin.length>25
));
const bad=structuredClone(crosswalk);
bad.publication.publicScores=1;
assert.throws(()=>build2026ProperFirst60ScoreReview({
 annualReport:annual,fullSourceCrosswalk:bad,archive}),
 /FIRST_60_REVIEW_SOURCE_SCOPE_INVALID/);
const wrong=structuredClone(annual);
wrong.rows[0].date="2026-12-31";
assert.throws(()=>build2026ProperFirst60ScoreReview({
 annualReport:wrong,fullSourceCrosswalk:crosswalk,archive}),
 /FIRST_60_REVIEW_SOURCE_SCOPE_INVALID/);
assert.ok(output.candidates.every(x=>x.screen.result===
 "SELECTED_1962_SOURCE_OPENING_AGREES_NOT_FULL_SCORE_CERTIFICATE"));
console.log("PASS first 60 real-calendar Introits/Offertories/Communions: 1961 GABC SHA parity, authenticated original source and reader-paragraph anchor, 20 per family, 0 public approvals");
