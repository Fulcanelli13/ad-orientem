import assert from "node:assert/strict";
import {v384Events} from "../src/calendar/traditional-year-v384.js";
import {calendarPracticeEvents,calendarPracticeMonthEntries} from "../src/calendar/intelligence.js";

// Optional custom, not an alternative Ordo, Mass proper, ministerial ritual,
// automatic indulgence or a calendar feast-rank promotion.
for(const year of [2026,2027,2030]){
  const date=year+"-02-03";
  const en=v384Events(date);
  const fr=v384Events(date,{fr:true});
  assert.equal(en.filter(x=>x.key==="st-blaise-throats").length,1);
  assert.equal(fr.filter(x=>x.key==="st-blaise-throats").length,1);
  const event=en.find(x=>x.key==="st-blaise-throats");
  const french=fr.find(x=>x.key==="st-blaise-throats");
  assert.match(event.title,/throats/i);
  assert.match(french.title,/gorges/i);
  assert.match(event.summary,/older Roman Ritual/);
  assert.match(event.historical,/commemorated on 3 February/i);
  assert.match(event.current,/optional sacramental/i);
  assert.ok(!/guaranteed|automatic|plenary indulgence/i.test(event.summary+" "+event.current));
  assert.ok(event.actions.every(x=>x[0]==="today.calendar"),"No new prayer or ceremony flow");
  assert.equal(v384Events(year+"-02-02").filter(x=>x.key==="st-blaise-throats").length,0);
  assert.equal(v384Events(year+"-02-04").filter(x=>x.key==="st-blaise-throats").length,0);
  const normal=calendarPracticeEvents(date);
  assert.equal(normal.filter(x=>x.key==="st-blaise-throats").length,1);
  const today=normal.find(x=>x.key==="st-blaise-throats");
  assert.equal(today.kind,"practice");
  assert.equal(today.route,"today.calendar");
  assert.equal(today.classification,null,"Do not silently confer an obligation or indulgence");
  assert.ok(today.priority<100);
  assert.equal(calendarPracticeMonthEntries(year+"-02").filter(x=>x.id==="practice.st-blaise-throats").length,1);
}
console.log("PASS St Blaise 3 February: optional 1962-context guide, bilingual, no Mass or rite mutation");
