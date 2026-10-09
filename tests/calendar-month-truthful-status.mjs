import { observedCycle, cycleFromCanonicalIdentity } from "../src/calendar/observed-cycle.js";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildMajorCelebrations,annunciationObservanceDate} from "../src/calendar/liturgical-year.js";
const runtime=readFileSync("src/calendar/calendar-runtime.js","utf8");
assert.match(runtime,/function monthIndexResolutionState\(monthId,view\)/);
assert.match(runtime,/if\(view==="practices"\)return "independent"/);
assert.match(runtime,/monthDateIds\(monthId\)/);
assert.match(runtime,/if\(missing\.length\)return "loading"/);
assert.match(runtime,/return failed\?"partial":"complete"/);
assert.match(runtime,/status==="loading"\?L\("Resolving this month/);
assert.match(runtime,/status==="partial"\?L\("Some days could not be resolved/);
assert.match(runtime,/rows\.length&&status==="partial"/);
assert.match(runtime,/data-cal-month-index-date/);
assert.match(runtime,/data-cal-saint-date/);
assert.match(runtime,/void select\(monthIndexDate\.dataset\.calMonthIndexDate\)/);
assert.match(runtime,/void openSaintDetail\(saintDetail\.dataset\.calSaintDate\)/);
assert.equal(annunciationObservanceDate(2027),"2027-04-05");
const mar=buildMajorCelebrations("2027-03-25");
assert.ok(mar.some(x=>x.date==="2027-04-05"&&/Annunciation/.test(x.en)));
assert.ok(!mar.some(x=>x.date==="2027-03-25"&&/Annunciation/.test(x.en)));
// Fetched calendar data are not an independently certified 1962 ordo.
assert.doesNotMatch(runtime,/liturgical month verified|mois liturgique vérifié/);
assert.match(runtime,/1962 calendar · 42 day entries loaded/);
assert.match(runtime,/Calendrier 1962 · 42 jours chargés/);
for(const pattern of [/function retryFailedMonth\(\)/,/data-cal-day-retry/,/data-cal-month-retry/,/data-cal-next-major-retry/,/nextMajorResults\.get\(selected\)\?\.unavailable===true/,/Open the Good Friday liturgy/,/AAS-52-1960-ocr\.pdf#page=597/,/Sources & scope/,/input\.setSelectionRange\(start,end\)/,/for="ao-cal-exact-date"/])assert.match(runtime,pattern);
const {execFileSync}=await import("node:child_process");
execFileSync(process.execPath,["--check","src/calendar/calendar-runtime.js"],{stdio:"pipe"});
console.log("PASS calendar source truthfulness, retries, Good Friday, accessibility and JS syntax");

// Stable *observed* identity; bilingual display labels and Sundays cannot
// reassign an impeded saint or an unknown source to another cycle.
const principal=(id, title="Translated alias",extra={})=>({status:"ready",day:{main:{id,title,...extra}}});
for(const [id,expected] of [
  ["sancti:10-DU:1:w","temporale"], // Christ the King
  ["tempora:Epi1-0:2:w","temporale"], // Holy Family
  ["sancti:12-25m1:1:w","temporale"], // Christmas midnight
  ["sancti:12-25m2:1:w","temporale"],
  ["sancti:12-25m3:1:w","temporale"],
  ["sancti:01-06:1:w","temporale"], // Epiphany
  ["sancti:01-01:1:w","temporale"], // Octave Nativity
  ["sancti:01-13:2:w","temporale"], // Baptism of Our Lord
  ["tempora:Quad6-4:1:v","temporale"], // Holy Week
  ["tempora:Quadp3-4:3:v","temporale"], // Ember Day
  ["sancti:08-15:1:w","sanctorale"], // Assumption even on Sunday
  ["sancti:12-08:1:w","sanctorale"], // Immaculate Conception
  ["sancti:11-30:2:r","sanctorale"], // St Andrew during Advent
]){
  assert.equal(observedCycle(principal(id)),expected,id);
  for(const title of ["Our Lord's Sunday", "Dimanche de la fête", "Feria", "Saint le Christ-Roi", "Unrelated alias"]){
    assert.equal(observedCycle(principal(id,title)),expected,id+" must ignore "+title);
  }
}
for(const year of [2024,2025,2026,2027,2028,2029]){
  assert.equal(observedCycle(principal("sancti:08-15:1:w","Sunday "+year)),"sanctorale");
  assert.equal(observedCycle(principal("sancti:10-DU:1:w","Sunday "+year)),"temporale");
}
assert.equal(observedCycle(principal("","Christ the King")),"unknown");
assert.equal(observedCycle(principal("","Dimanche")),"unknown");
assert.equal(observedCycle({status:"failed",day:{main:{id:"sancti:08-15:1:w"}}}),"unknown");
assert.equal(observedCycle({day:{main:{id:"sancti:08-15:1:w",principalCycle:"temporale"}}}),"temporale","Explicit resolver ownership wins");
assert.equal(cycleFromCanonicalIdentity("Sancti/10-DU"),"temporale");
assert.equal(cycleFromCanonicalIdentity("Sancti/12-08"),"sanctorale");
assert.equal(cycleFromCanonicalIdentity("some-unsupported-id"),"unknown");
assert.match(runtime,/import \{ observedCycle \} from "\.\/observed-cycle\.js";/);
assert.doesNotMatch(runtime,/const temporal=\//,"Title-based cycle regex must not recur");
assert.match(runtime,/data-cal-unclassified/,"Unknown resolved days need a visible fail-closed explanation");
console.log("PASS language-neutral observed cycle and unclassified-day disclosure");
