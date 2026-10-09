import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const registry=JSON.parse(readFileSync(new URL("../data/calendar/1962-editorial-reconciliation-2024-2027.v1.json",import.meta.url),"utf8"));
assert.equal(registry.schema,"AO_CALENDAR_1962_EDITORIAL_CROSSWALK_V1");
assert.equal(registry.status,"TRIAGE_NOT_LITURGICAL_CERTIFICATION");
assert.equal(registry.totals.flags,132);
assert.equal(registry.totals.year2024+registry.totals.year2027,132);

const counts=new Map([
  ["generic_feria",55],["saturday_bvm_mass_title",24],
  ["saint_variants",32],["major_title_variants",6],
  ["commemoration_count",9],["pentecost_vigil_mislabel",2],
  ["bibiana_mislabel",2],["paul_latin_only",1],
  ["advent_saturday_wording",1],
]);
const displayCorrected=new Set([
  "generic_feria","saturday_bvm_mass_title","pentecost_vigil_mislabel",
  "bibiana_mislabel","paul_latin_only","advent_saturday_wording",
]);
const seen=new Set();
let addressed=0,stillOpen=0;
for(const group of registry.groups){
  assert.ok(counts.has(group.key),"Unexpected editorial owner: "+group.key);
  assert.equal(group.count,counts.get(group.key),group.key+": historical count changed");
  assert.equal(group.dates.length,group.count,group.key+": lost dated provenance");
  assert.equal(new Set(group.dates).size,group.count,group.key+": duplicate date");
  assert.ok(group.reason?.length>30,group.key+": missing original-audit reason");
  for(const date of group.dates){
    assert.match(date,/^202[47]-\d{2}-\d{2}$/,group.key+": malformed date "+date);
    assert.ok(!seen.has(date),date+": appears in multiple historical categories");
    seen.add(date);
  }
  if(displayCorrected.has(group.key)){
    assert.ok(/CORRECTED|GUARDED/.test(group.status),group.key+": corrected headline status regressed");
    addressed+=group.count;
  }else{
    assert.ok(/REVIEW|PENDING|NOT_CLEARED/.test(group.status),group.key+": uncertified historical flags wrongly closed");
    stillOpen+=group.count;
  }
}
assert.equal(seen.size,registry.totals.flags);
assert.equal(addressed,85);
assert.equal(stillOpen,47);
const current=registry.currentReaudit;
assert.equal(current.editorialFlagsCurrentlyDetectedFromRawSource.year2024,65);
assert.equal(current.editorialFlagsCurrentlyDetectedFromRawSource.year2027,62);
assert.equal(current.editorialFlagsCurrentlyDetectedFromRawSource.total,127);
assert.equal(current.editorialFlagsCurrentlyDetectedFromRawSource.genericFeria,55);
assert.equal(current.archivedFlagsNotComparableAsSimpleRemainingCount,132);
assert.equal(current.historicCalendarHeadlineCorrections,addressed);
assert.equal(current.archivedUnclearedFlagsAfterDisplayWork,stillOpen);
assert.equal(current.principalRankColourNewUnclassifiedConflicts,0);
assert.equal(current.currentChristKingSundayCommemorations,0);
assert.equal(current.alternativeRogationMassCertified,false);
assert.equal(current.allPropersCertified,false);
assert.match(current.workflow,/\/actions\/runs\/37958564284$/);
assert.deepEqual(current.feriaReconciliation.historical,55);
assert.equal(current.feriaReconciliation.observedTemporaleWeekday,53);
assert.equal(current.feriaReconciliation.observedEpiphanyProperWithoutTemporale,2);
assert.equal(current.feriaReconciliation.resumedEpiphanyWeekdaysAfterPentecost,6);
assert.equal(current.feriaReconciliation.dateOnlyPatches,0);
console.log("PASS Calendar editorial historical 132-date worklist: 85 source-backed display headlines, 47 open; newer raw-source audit 127");
