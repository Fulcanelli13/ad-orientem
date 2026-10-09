import assert from "node:assert/strict";
import {calendarScriptureContexts} from "../src/calendar/scripture-handoff.js";
import {readFileSync} from "node:fs";

const resolved=(proper,status="ready",sourcePath=proper?.sourcePath)=>({
  proper:{status,data:proper,sourcePath}
});
const sourcePath="Tempora/Pent10-0";
const proper={
  sourcePath,
  epistle:{lat:"Lectio. Scitis quoniam cum gentes, dilectissimi."},
  gospel:{lat:"In illo tempore. Dixit Jesus ad quosdam qui in se confidebant."}
};
const readings=calendarScriptureContexts(resolved(proper));
assert.deepEqual(readings.map(row=>row.slot),["EPISTLE_OR_LESSON","GOSPEL"]);
assert.deepEqual(readings.map(row=>row.reference),["1 Corinthians 12:2–11","Luke 18:9–14"]);
assert.ok(readings.every(row=>row.passage&&row.provenance),"Only Scripture source-bound readings may surface");
assert.equal(calendarScriptureContexts(resolved(proper,"failed")).length,0);
assert.equal(calendarScriptureContexts(resolved({...proper,sourcePath:"UNVERIFIED"})).length,0);
assert.equal(calendarScriptureContexts(resolved({...proper,gospel:{lat:"Wrong unrelated Latin text"}})).length,1);
const frenchWitness=calendarScriptureContexts(resolved({
 ...proper,gospel:{...proper.gospel,reference:"Luc 18:9-14"}
}));
assert.equal(frenchWitness.find(x=>x.slot==="GOSPEL")?.reference,"Luke 18:9–14",
 "English-facing citation must normalize verified French-source book names");
assert.equal(frenchWitness.find(x=>x.slot==="GOSPEL")?.sourceReference,"Luc 18:9-14",
 "Original digital citation must remain traceable");

assert.equal(calendarScriptureContexts(resolved({...proper,gospel:{...proper.gospel,reference:"John 1:1"}})).length,1,
  "Conflicting biblical labels must not survive the Mass source gate");

const palm=calendarScriptureContexts(resolved({
 sourcePath:"Tempora/Quad6-0",
 gospel:{lat:"Passio Domini nostri Jesu Christi. Tunc venit Jesus cum illis in villam."}
}));
assert.equal(palm.length,1);
assert.equal(palm[0].slot,"GOSPEL");
assert.equal(palm[0].segments.length,2,"Palm Passion must preserve its distinct biblical passages");
assert.equal(palm[0].reference,"Matthew 26:36–75; 27:1–60");

const calendar=readFileSync("src/calendar/calendar-runtime.js","utf8");
const scripture=readFileSync("src/scripture/browser-entry.js","utf8");
assert.match(calendar,/calendarScriptureContexts\(r\)/);
assert.match(calendar,/data-cal-scripture-slot/);
assert.match(calendar,/openCalendarScripture\(reading\)/);
assert.match(calendar,/data-cal-scripture-date/);
assert.match(calendar,/onCloseReturn:returnToCalendar/);
assert.match(scripture,/const restore=onCloseReturn;onCloseReturn=null/);
assert.match(scripture,/function openSegments\(segments/);
console.log("PASS Calendar Scripture handoff: exact 1962 source/Latin matches, segmented Palm Passion, no invented refs, reader return");
