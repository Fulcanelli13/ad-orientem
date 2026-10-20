import assert from "node:assert/strict";
import {v384Dates,v384Events} from "../src/calendar/traditional-year-v384.js";
import {calendarPracticeEvents,calendarPracticeMonthEntries} from "../src/calendar/intelligence.js";

for(const year of [2026,2027,2030]){
 const cases=[
  {date:year+"-08-15",id:"assumption-herbs",other:year+"-08-16",title:/herbs|herbes/i},
  {date:year+"-12-27",id:"st-john-wine",other:year+"-12-28",title:/wine|vin/i},
  {date:v384Dates(year).holySaturday,id:"easter-foods",other:v384Dates(year).easter,title:/Easter foods|aliments de Pâques/i},
 ];
 for(const x of cases){
  const en=v384Events(x.date).filter(y=>y.key===x.id);
  const fr=v384Events(x.date,{fr:true}).filter(y=>y.key===x.id);
  assert.equal(en.length,1,x.id+" missing "+x.date);
  assert.equal(fr.length,1,x.id+" French missing");
  assert.match(en[0].title,x.title);
  assert.match(fr[0].title,x.title);
  assert.equal(en[0].actions.length,1);
  assert.equal(en[0].actions[0][0],"today.calendar");
  assert.ok(en[0].priority<100);
  assert.match(en[0].current,/Optional|regional|custom/i);
  assert.ok(!/plenary indulgence|guaranteed protection|universal obligation/i.test(en[0].summary+" "+en[0].current));
  assert.equal(v384Events(x.other).filter(y=>y.key===x.id).length,0);
  const normalized=calendarPracticeEvents(x.date).filter(y=>y.key===x.id);
  assert.equal(normalized.length,1);
  assert.equal(normalized[0].kind,"practice");
  assert.equal(normalized[0].classification,null,"No synthetic canonical feast or law classification");
  assert.equal(normalized[0].route,"today.calendar");
  const month=x.date.slice(0,7);
  assert.equal(calendarPracticeMonthEntries(month).filter(y=>y.id==="practice."+x.id).length,1);
 }
}
console.log("PASS feast blessings: Assumption herbs, St John wine, Holy Saturday Easter foods — 1962 date owner intact");
