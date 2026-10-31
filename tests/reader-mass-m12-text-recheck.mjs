import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditM12OriginalScoreText,promoteM12OriginalScore}
 from "../src/mass/reader-m12-text-recheck.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const ledger=read("data/research/mass-music-m12-original-score-text-recheck.v1.json");
const residual15=read("data/research/mass-music-m11-residual15.v1.json");
const m07Batches=Array.from({length:6},(_,i)=>
 read("data/research/mass-music-m07-gr1961-review-00"+(i+1)+".v1.json"));
const args={ledger,residual15,m07Batches};
const x=auditM12OriginalScoreText(args);
assert.equal(x.status,"ORIGINAL_1961_GABC_TEXT_RECHECKED_RESEARCH_ONLY",JSON.stringify(x));
assert.equal(x.originalScoresReviewed,12);
assert.equal(x.sourceOccurrences,15);
assert.equal(x.distinctSourceCases,14);
assert.equal(x.originalRoleConflicts,7);
assert.deepEqual({...x.sharedLatinSpanClasses},{
 SUBSTANTIAL_SHARED_PASSAGE:6,
 PARTIAL_SHARED_PASSAGE:3,
 INSUFFICIENT_SHARED_PASSAGE:6
});
assert.equal(x.corrected1962SelectedAssignments,0);
assert.equal(x.printed1961NeumesVerified,0);
assert.equal(x.publicScores,0);
assert.equal(x.automaticReplacements,0);
const cloned=a=>JSON.parse(JSON.stringify(a));
function blocked(changed){
 const result=auditM12OriginalScoreText({...args,...changed});
 assert.equal(result.status,"SOURCE_OR_EDITORIAL_HOLD",JSON.stringify(result));
}
{const l=cloned(ledger);l.scoreWitnesses[0].gabcSha256="0".repeat(64);blocked({ledger:l});}
{const l=cloned(ledger);l.scoreWitnesses[0].archiveBlobSha="0".repeat(40);blocked({ledger:l});}
{const l=cloned(ledger);l.scoreWitnesses[0].normalizedScoreText+=" fabricated";blocked({ledger:l});}
{const l=cloned(ledger);l.occurrences[0].commonText.words=12;blocked({ledger:l});}
{const l=cloned(ledger);l.occurrences[3].occurrenceOrdinal=2;blocked({ledger:l});}
{const l=cloned(ledger);l.occurrences[0].roleConflict=false;blocked({ledger:l});}
{const l=cloned(ledger);l.occurrences[0].publicReader=true;blocked({ledger:l});}
{const l=cloned(ledger);l.holds.finalEditorialApproval=true;blocked({ledger:l});}
assert.equal(promoteM12OriginalScore({id:"GREGOBASE-391"},{notes:true},{approved:true}),null);
const matrix=read("data/research/mass-music-m12-celebrant-special-rite-gaps.v1.json");
const m05=read("data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json");
assert.equal(matrix.schema,"ao-mass-music-m12-celebrant-and-special-rite-gaps-v1");
assert.equal(matrix.publication,"RESEARCH_HOLD");
assert.equal(matrix.summary.families,19);
assert.deepEqual(matrix.summary.statusCounts,{
 M05_SOURCE_CANDIDATE:6,SOURCE_SCORE_REQUIRED:11,
 SILENT_NOT_SUNG:1,M05_PARTIAL_CANDIDATE:1
});
assert.equal(new Set(matrix.families.map(x=>x.id)).size,19);
const m05scores=new Map(m05.scores.map(x=>[x.id,x]));
for(const f of matrix.families){
 assert.equal(f.sourceTextOnly,true);
 assert.equal(f.notAnObservedPerformance,true);
 assert.equal(f.printedNotesVerified,false);
 assert.equal(f.userApproved,false);
 assert.equal(f.publicReader,false);
 if(f.existingM05Id){
  const known=m05scores.get(f.existingM05Id);
  assert.ok(known,"Missing M05 identity "+f.existingM05Id);
  assert.equal(known.renderApproved,false);
 }else assert.ok(["SOURCE_SCORE_REQUIRED","SILENT_NOT_SUNG"].includes(f.status));
}
const secret=matrix.families.filter(f=>f.id==="SECRET_PRAYER_BODY");
assert.equal(secret.length,1);
assert.equal(secret[0].status,"SILENT_NOT_SUNG");
assert.equal(secret[0].existingM05Id,null);
assert.ok(!matrix.families.some(f=>f.id==="SECRET_FULL_SUNG_SCORE"));
for(const id of ["ITE_MISSA_EST_REGULAR","ITE_MISSA_EST_EASTER_DOUBLE",
 "BENEDICAMUS_DOMINO","REQUIESCANT_IN_PACE"]){
 assert.ok(matrix.families.some(f=>f.id===id));
}
assert.equal(matrix.families.find(f=>f.id==="ITE_MISSA_EST_EASTER_DOUBLE").existingM05Id,
 "DISMISSAL_ITE_I");
assert.ok(Object.values(matrix.holds).every(v=>v===false));
const schola=readFileSync(new URL("../src/mass/reader-schola-event-timeline.js",import.meta.url),"utf8");
assert.doesNotMatch(schola,/reader-m12-text-recheck/);
console.log("PASS M12 15 residuals, 12 archived score identities, 6/3/6 text spans, 19 rubric-correct research gaps");
