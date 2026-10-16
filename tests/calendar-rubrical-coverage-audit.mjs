import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildRubricalCoverageAudit,loadCanonicalRubricalCoverageInputs} from "../tools/calendar/rubrical-coverage-audit.mjs";

const inputs=loadCanonicalRubricalCoverageInputs();
const sourceBefore=JSON.stringify(inputs);
const report=buildRubricalCoverageAudit(inputs);
assert.equal(report.schema,"AO_CALENDAR_1962_RUBRICAL_COVERAGE_REPORT_V1");
assert.deepEqual(report.counts.omissionDatesByYear,{"2026":6,"2027":3,"2028":3});
assert.equal(report.counts.omissionClaimDates,12);
assert.equal(report.counts.protectedThirdClassFeasts,70);
assert.equal(report.counts.protectedAnnexSundayScreenings,33);
assert.equal(report.counts.protectedScreeningsAlreadyCited,9);
assert.equal(report.counts.protectedScreeningsAwaitingIndividualReview,24);
assert.equal(report.counts.reviewedOmissionsNotInProtectedAnnex,3);
assert.equal(report.counts.particularWitnessesHeld,3);
assert.equal(report.counts.sourceTransferWitnesses,7);
assert.equal(report.counts.sourceAnnotatedTransfers,4);
assert.equal(report.counts.transferWitnessesWithoutClauseCitation,3);
assert.equal(report.counts.explicitExceptionHolds,8);
assert.equal(report.omittedFeastClaims.length,12);
assert.equal(report.screeningOnly.length,24);
assert.equal(report.protectedAnnexSundayOverlaps.length,33);
assert.equal(new Set(report.protectedAnnexSundayOverlaps.map(x=>x.date)).size,33);
assert.equal(JSON.stringify(inputs),sourceBefore,"Audit must never mutate any source/production owner");

for(const row of report.screeningOnly){
  assert.equal(row.status,"SCREENING_ONLY_NOT_A_CERTIFIED_OMISSION");
  assert.equal(row.omissionClaimId,null);
  assert.equal(report.omittedFeastClaims.some(x=>x.date===row.date),false,
    "Editorial shortlist was silently promoted to a public liturgical claim: "+row.date);
}
for(const row of report.omittedFeastClaims){
  assert.equal(row.publicationOwner,"CALENDAR_EXISTING_SOURCE_DISCLOSURE");
  assert.equal(row.needsParticularCalendarAdjudication,true);
}
assert.ok(report.protectedAnnexSundayOverlaps.some(x=>
 x.date==="2026-12-13"&&x.saint.includes("Lucy")&&x.omissionClaimId===null),
 "The still-disputed Advent III/St Lucy case must remain source-held");
for(const date of ["2027-10-03","2027-01-17","2028-09-03"]){
 assert.ok(report.screeningOnly.some(x=>x.date===date),
   "Unreviewed protected-annex Sunday overlap must be visible as a screening hold: "+date);
}
for(const id of [
 "LUCY_ADVENT_III_2026","PIUS_X_SSPX_2028",
 "DUBLIN_PHILIP_NERI_2026","DUBLIN_NEWMAN_2026","DUBLIN_LUIGI_SCROSOPPI_2026",
 "ROGATIONS_DEFAULT_VOTIVE_CHOICE","ANNUNCIATION_2029_UNANNOTATED","SCRIPTURE_EDITIONS_CONTEXT"
]){
 const held=report.exceptionHolds.find(x=>x.id===id);
 assert.ok(held&&held.automaticallyAffectsMass===false,
   "Missing or Mass-authorizing source exception: "+id);
}
assert.equal(report.transferUnannotated.length,3);
assert.ok(report.transferUnannotated.some(x=>x.witnessId==="annunciation-2029"&&
 x.original==="2029-03-25"&&x.observed==="2029-04-09"));
assert.ok(report.caveats.some(x=>x.includes("NOT 24 certified omitted feasts")));
assert.ok(report.caveats.some(x=>x.includes("2020")&&x.includes("1962")));

const cloned=()=>structuredClone(inputs);
for(const poison of [
 x=>x.corrections.nonCommemorationWitnesses.push({...x.corrections.nonCommemorationWitnesses[0]}),
 x=>x.corrections.nonCommemorationWitnesses[0].scope="PARTICULAR_SSPX",
 x=>x.corrections.nonCommemorationWitnesses[0].changes1962Mass=true,
 x=>x.corrections.nonCommemorationWitnesses[0].principal.sourceId="tempora:Other:2:g",
 x=>x.protectedAnnex.protectedCount=69,
 x=>x.manifest.snapshotExpectations.protectedOverlapPendingClassification=23,
 x=>x.manifest.exceptions=x.manifest.exceptions.filter(row=>row.id!=="LUCY_ADVENT_III_2026"),
 x=>x.manifest.exceptions.find(row=>row.id==="DUBLIN_NEWMAN_2026").automaticallyAffectsMass=true,
 x=>x.manifest.exceptions=x.manifest.exceptions.filter(row=>row.id!=="DUBLIN_LUIGI_SCROSOPPI_2026"),
 x=>x.manifest.scope.years=[2026,2027,2028,2029]
]){
 const copy=cloned();poison(copy);
 assert.throws(()=>buildRubricalCoverageAudit(copy),
   "Unsafe editor change must fail closed before publication/CI");
}
const pkg=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8"));
assert.ok(pkg.scripts["test:calendar"]?.includes("test:calendar-coverage"),
  "Coverage audit must be part of ordinary Calendar CI, not a manual-only script");
const notes=readFileSync(new URL("../docs/CALENDAR-1962-COVERAGE-EXCEPTIONS-20261017.md",import.meta.url),"utf8");
for(const phrase of ["33","24","12","70","Cum sanctissima","St Lucy","2028","particular","Mass resolver"]){
 assert.ok(notes.includes(phrase),"Audit editorial report is missing "+phrase);
}
console.log("PASS 1962 Calendar coverage: 12 actual date-specific omission records (2026–28), 70 protected feasts, 33 Sunday collisions / 9 already cited / 24 research only, 3 particular-calendar holds, 7 transfer witnesses / 4 annotated, 8 explicit exception gates; all source mutations rejected.");
