import assert from "node:assert/strict";
import {summarizeSelectedCalendarChants,SCHOLA_CALENDAR_BULK_SCHEMA}
 from "../src/mass/reader-schola-selected-calendar-audit.js";
const dates=["2026-01-01","2026-01-02","2026-01-03"];
const sample={status:"MATCHED_CANDIDATES",sourcePath:"Tempora/Nat30",tracks:[
 {track:"INTROIT",part:"in",status:"UNIQUE_SOURCE_TEXT_CANDIDATE",
 sourceLatinSha256:"a".repeat(64),candidateScoreIds:["GREGOBASE-72"]},
 {track:"GRADUAL",part:"gr",status:"AMBIGUOUS_SOURCE_TEXT_VARIANTS",
 sourceLatinSha256:"b".repeat(64),candidateScoreIds:["GREGOBASE-2","GREGOBASE-3"]}]};
const rows=[{date:dates[0],...sample},{date:dates[1],...sample},
 {date:dates[2],status:"READER_PROPER_HOLD",missing:["GRADUAL"]}];
const s=summarizeSelectedCalendarChants({dates,rows});
assert.equal(s.schema,SCHOLA_CALENDAR_BULK_SCHEMA);
assert.equal(s.totalReadyDays,2);
assert.equal(s.uniqueActualSourcePaths,1);
assert.equal(s.distinctActualSourceTextSignatures,1);
assert.equal(s.formularies[0].occurrences,2);
assert.equal(s.matchedChantEntries,4);
assert.equal(s.uniqueTextCandidates,2);
assert.equal(s.competingTextCandidates,2);
assert.equal(s.dayStatuses.READER_PROPER_HOLD,1);
assert.equal(s.publication.publicScores,0);
assert.equal(s.scope.alternateVotiveAndRequiemMassesIncluded,false);
assert.throws(()=>summarizeSelectedCalendarChants({dates,rows:rows.slice(1)}),/INVALID_CALENDAR_SWEEP_SCOPE/);
assert.throws(()=>summarizeSelectedCalendarChants({dates,
 rows:[rows[0],rows[0],rows[2]]}),/CALENDAR_DATE_OR_STATUS_INVALID/);
assert.throws(()=>summarizeSelectedCalendarChants({dates,
 rows:[{...rows[0],sourcePath:"Fake/Chant"},rows[1],rows[2]]}),/UNTRUSTED_SELECTED_FORMULARY/);
assert.throws(()=>summarizeSelectedCalendarChants({dates,
 rows:[{...rows[0],status:"PUBLIC_SCORE_APPROVED"},rows[1],rows[2]]}),/CALENDAR_DATE_OR_STATUS_INVALID/);
console.log("PASS selected calendar aggregation: unique source text, date completeness, explicit holds, no publication");
