// Source-exact novena calendar projection: the Prayer reader remains canonical.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {NOVENA_CORPUS_V4,NOVENA_START_KIND as SOURCE_KINDS} from "../src/pray/novena-corpus-v4.js";
import {NOVENA_CALENDAR_METADATA,NOVENA_START_KIND} from "../src/calendar/novena-calendar-metadata.js";
import {NOVENA_TARGET_REGISTRY_V1,NOVENA_TARGET_IDS,PLAYABLE_NOVENA_IDS,
  NOVENA_SOURCE_HOLDS} from "../src/calendar/devotional-registry.js";
import {novenaWindowFor,novenaStatusFor,calendarNovenaEvents,
  novenaTargetRegistryStatus} from "../src/calendar/intelligence.js";

const project=n=>({
 id:n.id,title:n.title,family:n.family,feast:n.feast,
 calendar:n.calendar,startKind:n.startKind,traditionalStart:n.traditionalStart,
 sourceStatus:n.source?.status??"SOURCE_LOCKED",
 frenchTextStatus:n.frenchTextStatus??"MISSING_FRENCH_BODY"
});
const sourceEntries=Object.entries(NOVENA_CORPUS_V4);
const ids=sourceEntries.map(([id])=>id);
assert.equal(ids.length,16,"Historical 16-source novena corpus count changed");
assert.deepEqual(Object.keys(NOVENA_CALENDAR_METADATA),ids,"Metadata ID order differs from V4");
assert.deepEqual(NOVENA_START_KIND,SOURCE_KINDS,"Calendar StartKind labels drifted");
assert.equal(Object.isFrozen(NOVENA_CALENDAR_METADATA),true);
assert.deepEqual(NOVENA_TARGET_IDS,ids);
assert.deepEqual(PLAYABLE_NOVENA_IDS,ids);
assert.deepEqual(Object.keys(NOVENA_SOURCE_HOLDS),[]);
const metaFields=["id","title","family","feast","calendar","startKind","traditionalStart","sourceStatus","frenchTextStatus"];
for(const [id,full] of sourceEntries){
 const expected=project(full),summary=NOVENA_CALENDAR_METADATA[id];
 assert.deepEqual(Object.keys(summary),metaFields,"Metadata shape drifted for "+id);
 assert.deepEqual(summary,expected,"Canonical metadata drifted for "+id);
 assert.equal(Object.isFrozen(summary),true,"Metadata node must remain read-only: "+id);
 assert.equal(Object.isFrozen(summary.calendar),true);
 assert.equal(Object.isFrozen(summary.title),true);
 assert.deepEqual(NOVENA_TARGET_REGISTRY_V1[id],{
  id,title:full.title,family:full.family,availability:"PLAYABLE_BILINGUAL_SOURCE_LOCKED",
  playable:true,calendar:full.calendar,traditionalStart:full.traditionalStart,
  sourceStatus:full.source?.status??"SOURCE_LOCKED",
  frenchTextStatus:full.frenchTextStatus??"MISSING_FRENCH_BODY"
 },"Devotional registry lost source details for "+id);
 for(const year of [2025,2026,2027]){
  assert.deepEqual(novenaWindowFor(id,year),novenaWindowFor(full,year),
   "Novena dates drifted: "+id+"/"+year);
  const dates=[year+"-01-01",year+"-03-16",year+"-06-13",
   year+"-08-22",year+"-09-28",year+"-10-24",
   year+"-11-04",year+"-11-29",year+"-12-25",
   novenaWindowFor(full,year).start,novenaWindowFor(full,year).end,
   novenaWindowFor(full,year).feast];
  for(const date of [...new Set(dates)]){
   for(const fr of [false,true])
    assert.deepEqual(novenaStatusFor(id,date,{fr}),novenaStatusFor(full,date,{fr}),
     "Novena status drifted: "+id+"/"+date+"/"+fr);
  }
 }
}
const registry=novenaTargetRegistryStatus();
assert.equal(registry.playableCount,16);
assert.equal(registry.targetCount,16);
for(const year of [2025,2026,2027]){
 for(const month of [1,3,5,6,8,9,10,11,12]){
  for(const day of [1,10,16,24,28]){
   const date=year+"-"+String(month).padStart(2,"0")+"-"+String(day).padStart(2,"0");
   for(const fr of [false,true]){
    const events=calendarNovenaEvents(date,{fr,upcomingDays:14});
    assert.ok(Array.isArray(events));
    for(const event of events){
     const full=NOVENA_CORPUS_V4[event.novenaId];
     assert.ok(full,"Unknown Calendar novena: "+event.novenaId);
     assert.equal(event.title,(fr?full.title?.fr:full.title?.en)||full.title?.en||full.title?.fr||full.id);
     assert.deepEqual(event.status,novenaStatusFor(full,date,{fr}));
    }
   }
  }
 }
}
for(const path of ["src/calendar/intelligence.js","src/calendar/devotional-registry.js"]){
 const source=readFileSync(path,"utf8");
 assert.ok(source.includes('from "./novena-calendar-metadata.js"'),"Missing first-use metadata boundary in "+path);
 assert.ok(!source.includes('from "../pray/novena-corpus-v4.js"'),"Full novena body loaded eagerly in "+path);
}
console.log("PASS calendar novena metadata: 16/16 canonical bilingual records, date windows 2025-2027, source flags, route statuses and target registry.");
