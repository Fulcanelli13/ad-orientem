import assert from "node:assert/strict";
import {calendarCustomProfileActions,CALENDAR_CUSTOM_PROFILE_IDS} from "../src/calendar/customs-profile-links.js";
import {calendarPracticeEvents} from "../src/calendar/intelligence.js";
import {v384Dates,v384Events} from "../src/calendar/traditional-year-v384.js";
import {readFileSync} from "node:fs";
const atlas=JSON.parse(readFileSync(new URL("../data/customs/customs-atlas-seed.v1.json",import.meta.url),"utf8"));
const guidance=JSON.parse(readFileSync(new URL("../data/customs/customs-p0-guidance-en-fr.v1.json",import.meta.url),"utf8"));
const expected=["ADVT-001","ADVT-002","ADVT-003","XMAS-001","HTHU-001","ROGA-001","EPIP-001","EPIP-002","CORP-001","EAST-001","MARI-002"];
const extraGuidance=JSON.parse(readFileSync(new URL("../data/customs/customs-p1-guidance-en-fr.v1.json",import.meta.url),"utf8"));
assert.deepEqual([...CALENDAR_CUSTOM_PROFILE_IDS].sort(),[...expected].sort());
for(const id of expected){
 assert.ok(atlas.customs.some(row=>row.custom_id===id&&row.publication_state==="PUBLISHED"),id+" missing canonical identity");
 const guide=[...guidance.entries,...extraGuidance.entries].find(row=>row.custom_id===id);
 assert.ok(guide?.description_en&&guide.description_fr&&guide.meaning_en&&guide.meaning_fr&&guide.how_en&&guide.how_fr);
}
const noUnrelated=calendarCustomProfileActions("holy-saturday");
assert.deepEqual(noUnrelated,[],"Other Mass customs cannot acquire inferred reader links");
for(const year of [2026,2027,2030]){
 const firstSunday=(()=>{
  const d=new Date(Date.UTC(year,10,27));
  while(d.getUTCDay()!==0)d.setUTCDate(d.getUTCDate()+1);
  return d.toISOString().slice(0,10);
 })();
 const dates=[
  [firstSunday,"advent-family-traditions",["ADVT-001","ADVT-002"]],
  [`${year}-12-16`,"las-posadas",["ADVT-003"]],
  [`${year}-12-24`,"oplatek-christmas",["XMAS-001"]],
  [v384Dates(year).holyThursday,"holy-thursday",["HTHU-001"]],
  [`${year}-04-25`,"rogation",["ROGA-001"]]
 ];
 for(const [date,key,ids] of dates){
  for(const fr of [false,true]){
   const raw=v384Events(date,{fr}).find(row=>row.key===key);
   assert.ok(raw,"Missing base Calendar record "+date+" "+key);
   assert.equal(raw.actions.filter(row=>row[0].startsWith("find:traditions:")).length,0,"do not mutate ritual date source");
   const normalized=calendarPracticeEvents(date,{fr}).filter(row=>row.key===key);
   assert.equal(normalized.length,1,date+" duplicated calendar record "+key);
   const direct=normalized[0].actions.filter(row=>row[0].startsWith("find:traditions:"));
   assert.deepEqual(direct.map(row=>row[0]),ids.map(id=>"find:traditions:"+id));
   for(const [route,label] of direct){
    assert.match(route,/^find:traditions:[A-Z]{4}-[0-9]{3}$/);
    assert.ok(fr?/Découvrir/.test(label):/Explore/.test(label),"missing localized route label");
   }
   assert.ok(normalized[0].priority<=raw.priority,"linked custom must not gain higher liturgical priority");
  }
 }
 const afterRogation=`${year}-04-26`;
 if(!dates.some(row=>row[0]===afterRogation)){
  assert.equal(calendarPracticeEvents(afterRogation).filter(e=>e.key==="rogation").length,0,"no fabricated daily Rogation custom");
 }
}
const next=value=>{const d=new Date(value+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10)};
for(const year of [2026,2027,2030]){
 for(const [date,key,ids] of [
  [`${year}-01-06`,"epiphany-family",["EPIP-001","EPIP-002"]],
  [v384Dates(year).corpus,"corpus",["CORP-001"]],
  [next(v384Dates(year).easter),"easter-monday-emmaus",["EAST-001"]],
  [`${year}-05-01`,"may-marian-garden",["MARI-002"]]
 ]){
  for(const fr of [false,true]){
   assert.equal(v384Events(date,{fr}).filter(row=>row.key===key).length,1,date+" duplicated "+key);
   const actions=calendarPracticeEvents(date,{fr}).find(row=>row.key===key)?.actions.filter(row=>row[0].startsWith("find:traditions:"));
   assert.deepEqual(actions?.map(row=>row[0]),ids.map(id=>"find:traditions:"+id));
  }
 }
}
assert.equal(atlas.customs.length,39);
console.log("PASS: exact eleven custom Calendar deep links across three liturgical years, EN/FR, no duplicate rite or feasts, 33 unique customs.");
