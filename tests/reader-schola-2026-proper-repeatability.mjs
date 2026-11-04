import assert from "node:assert/strict";
import {auditSchola2026ProperRepeatability,SCHOLA_2026_REPRODUCIBILITY_DATES}
 from "../src/mass/reader-schola-2026-proper-repeatability.js";
const ready=(date)=>({date,resolverStatus:"ready",properStatus:"ready",
 principalId:"temporale:"+date,sourcePath:"Tempora/Pent01-0",
 selectedProperSha256:"a".repeat(64),errors:[]});
const baseline=SCHOLA_2026_REPRODUCIBILITY_DATES.map(ready);
assert.equal(baseline.length,17);
const good=auditSchola2026ProperRepeatability({first:baseline,second:
 baseline.map(x=>({...x,properStatus:"cached"}))});
assert.equal(good.summary.stable,true);
assert.equal(good.summary.reproduced,17);
assert.equal(good.results.length,17);
assert.equal(good.publication.publicScores,0);
assert.ok(good.results.every(x=>x.musicalNotationCertified===false&&!x.publicScore));
const withDrop=baseline.map(x=>x.date==="2026-03-08"?
 {...x,properStatus:"failed",selectedProperSha256:null,errors:["HTTP 503"]}:x);
const held=auditSchola2026ProperRepeatability({first:baseline,second:withDrop});
assert.equal(held.summary.stable,false);
assert.equal(held.summary.held,1);
assert.equal(held.results.find(x=>x.date==="2026-03-08").status,
 "SOURCE_FAILED_OR_UNRESOLVED_HOLD");
const altered=baseline.map(x=>x.date==="2026-03-08"?
 {...x,selectedProperSha256:"b".repeat(64)}:x);
assert.equal(auditSchola2026ProperRepeatability({first:baseline,second:altered})
 .results.find(x=>x.date==="2026-03-08").status,
 "1962_SELECTED_TEXT_CHANGED_HOLD");
const differentOwner=baseline.map(x=>x.date==="2026-03-08"?
 {...x,sourcePath:"Sancti/03-08"}:x);
assert.equal(auditSchola2026ProperRepeatability({first:baseline,second:differentOwner})
 .results.find(x=>x.date==="2026-03-08").status,
 "CALENDAR_SOURCE_IDENTITY_DRIFT_HOLD");
assert.throws(()=>auditSchola2026ProperRepeatability({first:baseline,
 second:[...baseline.slice(1),baseline[1]]}),/DATE_OR_IDENTITY_INVALID/);
assert.throws(()=>auditSchola2026ProperRepeatability({first:baseline,
 second:baseline.slice(1)}),/CENSUS_INVALID/);
console.log("PASS 17 independent 2026 Mass Proper source-identity checks, 0 musical approvals, source drift fails closed");
