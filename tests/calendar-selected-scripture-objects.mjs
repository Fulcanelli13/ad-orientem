import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {selectedCalendarScriptureObjects,matchingSelectedCalendarScriptureObject}
 from "../src/calendar/selected-scripture-objects.js";
import {scriptureLinkedObjectsForPassageWithAtlas}
 from "../src/scripture/related-objects.js";
import {parseScriptureContext} from "../src/scripture/context.js";

const day="2026-08-02";
const proper={
 sourcePath:"Tempora/Pent10-0",
 epistle:{lat:"Lectio. Scitis quoniam cum gentes, dilectissimi."},
 gospel:{lat:"In illo tempore. Dixit Jesus ad quosdam qui in se confidebant."}
};
const selected={selectedDate:day,resolving:false,resolution:{
 date:day,proper:{status:"ready",sourcePath:proper.sourcePath,data:proper}
}};
const rows=selectedCalendarScriptureObjects(selected);
assert.equal(rows.length,2);
assert.deepEqual(rows.map(x=>x.target.slot),["EPISTLE_OR_LESSON","GOSPEL"]);
assert.deepEqual(rows.map(x=>x.reference),["1 Corinthians 12:2–11","Luke 18:9–14"]);
assert.ok(rows.every(x=>x.target.date===day&&x.target.sourcePath==="Tempora/Pent10-0"));
assert.ok(rows.every(x=>x.target.provenance&&x.relation==="SELECTED_1962_PROPER_SOURCE_VERIFIED"));
const gospel=rows[1];
assert.equal(matchingSelectedCalendarScriptureObject(selected,gospel.target)?.id,gospel.id);
for(const field of ["date","slot","sourcePath","reference","provenance"]){
 const corrupt={...gospel.target,[field]:"wrong"};
 assert.equal(matchingSelectedCalendarScriptureObject(selected,corrupt),null,
   "stale/mismatched Proper target should not resolve: "+field);
}
assert.deepEqual(selectedCalendarScriptureObjects({...selected,selectedDate:"2026-08-03"}),[]);
assert.deepEqual(selectedCalendarScriptureObjects({...selected,resolving:true}),[]);
assert.deepEqual(selectedCalendarScriptureObjects({
 ...selected,resolution:{...selected.resolution,date:"2026-08-03"}}),[]);
assert.deepEqual(selectedCalendarScriptureObjects({
 ...selected,resolution:{...selected.resolution,proper:{...selected.resolution.proper,status:"failed"}}}),[]);
assert.equal(selectedCalendarScriptureObjects({
 ...selected,resolution:{...selected.resolution,proper:{status:"ready",sourcePath:"UNVERIFIED",data:proper}}}).length,0,
 "Unknown Proper must not create any reading object");
assert.equal(selectedCalendarScriptureObjects({
 ...selected,resolution:{...selected.resolution,proper:{status:"ready",sourcePath:"Tempora/Pent10-0",
 data:{...proper,gospel:{lat:"Different unrelated Gospel"}}}}}).length,1);
const hits=await scriptureLinkedObjectsForPassageWithAtlas(
 parseScriptureContext("Luke 18:9").passage,{selectedCalendarState:selected,limit:40});
assert.ok(hits.some(x=>x.id===gospel.id),"Selected day should be an exact Scripture backlink");
const absent=await scriptureLinkedObjectsForPassageWithAtlas(
 parseScriptureContext("John 1:1").passage,{selectedCalendarState:selected,limit:40});
assert.ok(!absent.some(x=>x.source==="calendarReading"),
 "Verse overlap cannot manufacture an unrelated selected Proper");
const palm={selectedDate:"2026-03-29",resolving:false,resolution:{date:"2026-03-29",proper:{
 status:"ready",sourcePath:"Tempora/Quad6-0",data:{
 sourcePath:"Tempora/Quad6-0",
 gospel:{lat:"Passio Domini nostri Jesu Christi. Tunc venit Jesus cum illis in villam."}
}}}};
const passion=selectedCalendarScriptureObjects(palm);
assert.equal(passion.length,1);
assert.equal(passion[0].segments.length,2);
assert.equal(passion[0].passages[0].chapter,26);
assert.equal(passion[0].passages[1].chapter,27);
const second=await scriptureLinkedObjectsForPassageWithAtlas(
 parseScriptureContext("Matthew 27:1").passage,{selectedCalendarState:palm,limit:40});
assert.ok(second.some(x=>x.id===passion[0].id),
 "Second Passion segment must retain the exact same Calendar reading");
const scripture=readFileSync("src/scripture/browser-entry.js","utf8");
const calendar=readFileSync("src/calendar/calendar-runtime.js","utf8");
const library=readFileSync("src/scripture/library.js","utf8");
assert.match(scripture,/matchingSelectedCalendarScriptureObject\(current,record\.target\)/);
assert.match(scripture,/openSelectedScriptureReading/);
assert.match(calendar,/function openSelectedScriptureReading/);
assert.match(calendar,/function returnToSelectedScripture/);
assert.match(library,/segmentSet=hit\.segments\?scriptureSegments/);
console.log("PASS selected Calendar/1962 Mass Proper: 2 source-proven slots, segmented Passion, fail-closed exact reciprocal identity");
