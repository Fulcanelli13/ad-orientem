import assert from "node:assert/strict";
import { renderCalendarHistoricalContext } from "../src/calendar/historical-context-ui.js";
import { readFileSync } from "node:fs";
import { calendarHistoricalNotes, CALENDAR_HISTORICAL_CONTEXT_VERSION, CALENDAR_HISTORICAL_SOURCE_ARTICLE_IDS } from "../src/calendar/historical-context.js";
import { calendarIntelligenceForDate } from "../src/calendar/intelligence.js";
import { calendarPracticeEvents } from "../src/calendar/intelligence.js";
import { v384Dates } from "../src/calendar/traditional-year-v384.js";
import { buildMajorCelebrations, addDaysIso } from "../src/calendar/liturgical-year.js";

assert.equal(CALENDAR_HISTORICAL_CONTEXT_VERSION,"calendar-historical-context-v1");
assert.deepEqual([...CALENDAR_HISTORICAL_SOURCE_ARTICLE_IDS].sort(),["a0170_nouveau","a0281_ancien","a0605_ancien","a0563_ancien","a0745_ancien"].sort());

const expected=[
  ["2026-05-23","history.pentecost-vigil-pre1955","a0281_ancien"],
  ["2026-05-27","history.pentecost-ember-wednesday","a0170_nouveau"],
  ["2026-12-08","history.immaculate-conception-older-vigil-octave","a0605_ancien"],
];
for(const [date,id,sourceArticleId] of expected){
  const en=calendarHistoricalNotes(date),fr=calendarHistoricalNotes(date,{fr:true});
  assert.equal(en.length,1,`${date}: one contextual note only`);
  assert.equal(fr.length,1);
  assert.equal(en[0].id,id);
  assert.equal(fr[0].id,id);
  assert.equal(en[0].date,date);
  assert.equal(en[0].sourceArticleId,sourceArticleId);
  assert.equal(fr[0].sourceArticleId,sourceArticleId);
  assert.ok(en[0].explanation.length>100);
  assert.ok(fr[0].explanation.length>100);
  assert.notEqual(fr[0].explanation,en[0].explanation);
  assert.equal(en[0].authority,"NON_NORMATIVE_HISTORICAL_CONTEXT");
  assert.equal(en[0].kind,"historical-note");
  assert.equal(en[0].isMassRubric,false);
  assert.equal(en[0].createsCalendarFeast,false);
  assert.equal(en[0].imposesObligation,false);
  assert.equal(en[0].sources.length,2);
  for(const source of en[0].sources)assert.ok(source.url.startsWith("https://"));
  assert.equal(calendarIntelligenceForDate(date).historicalNotes[0].id,id);
  assert.equal(calendarIntelligenceForDate(date,{fr:true}).historicalNotes[0].id,id);
  assert.ok(Object.isFrozen(en));
  assert.ok(Object.isFrozen(en[0]));
}

for(const year of [2026,2027,2028]){
  const x=v384Dates(year);
  assert.equal(calendarHistoricalNotes(addDaysIso(x.pentecost,-1))[0].id,"history.pentecost-vigil-pre1955");
  assert.equal(calendarHistoricalNotes(x.emberPent[0])[0].id,"history.pentecost-ember-wednesday");
  assert.equal(calendarHistoricalNotes(`${year}-12-08`)[0].id,"history.immaculate-conception-older-vigil-octave");
  assert.equal(calendarHistoricalNotes(x.pentecost).length,0);
  assert.equal(calendarHistoricalNotes(x.emberPent[1]).length,0);
}
// A saint's historical context is shown only if the 1962 resolver
// actually selected that saint's Mass, not on an impeded civil feast date.
assert.deepEqual(calendarHistoricalNotes("2026-11-22"),[]);
assert.deepEqual(calendarHistoricalNotes("2026-11-22",{observedMainId:"tempora:Pent24-0:2:g"}),[]);
assert.deepEqual(calendarHistoricalNotes("2026-04-11",{observedMainId:"tempora:Pasc0-6:1:w"}),[]);
for(const [date,proper,topic,article] of [
  ["2027-11-22","sancti:11-22:3:r","saint-cecilia-feast-date","a0563_ancien"],
  ["2029-04-11","sancti:04-11:3:w","saint-leo-i-feast-date","a0745_ancien"],
]){
  const note=calendarHistoricalNotes(date,{observedMainId:proper})[0];
  assert.equal(note.id,"history."+topic);
  assert.equal(note.sourceArticleId,article);
  assert.equal(note.observedMainId,proper);
  assert.equal(note.isMassRubric,false);
  assert.equal(note.createsCalendarFeast,false);
  assert.equal(note.imposesObligation,false);
  assert.equal(note.sources.length,2);
  assert.equal(calendarIntelligenceForDate(date,{observedMainId:proper}).historicalNotes.length,1);
  assert.equal(calendarIntelligenceForDate(date).historicalNotes.length,0);
  assert.ok(renderCalendarHistoricalContext(date,{observedMainId:proper}).includes("history."+topic));
  assert.equal(renderCalendarHistoricalContext(date),"");
  assert.ok(calendarHistoricalNotes(date,{fr:true,observedMainId:proper})[0].explanation.length>120);
}
assert.deepEqual(calendarHistoricalNotes("2027-11-22",{observedMainId:"sancti:04-11:3:w"}),[]);
assert.deepEqual(calendarHistoricalNotes("2029-04-11",{observedMainId:"sancti:11-22:3:r"}),[]);

assert.deepEqual(calendarHistoricalNotes("2026-05-25"),[]);
assert.deepEqual(calendarHistoricalNotes("2026-12-07"),[]);
assert.throws(()=>calendarHistoricalNotes("December 8"),TypeError);

// The existing Calendar *event* and 1962 celebration owners retain authority.
const forPentecost=calendarIntelligenceForDate("2026-05-27");
assert.equal(forPentecost.practices.some(e=>e.id==="practice.ember-pent"),true);
assert.equal(forPentecost.events.some(e=>e.kind==="historical-note"),false);
assert.equal(calendarPracticeEvents("2026-05-23").some(e=>e.key==="pentecost-vigil-pre1955"),false);
const celebrations=buildMajorCelebrations("2026-12-08");
assert.equal(celebrations.some(e=>e.key==="history.immaculate-conception-older-vigil-octave"),false);
assert.equal(celebrations.some(e=>e.key==="history.pentecost-vigil-pre1955"),false);

const visible=renderCalendarHistoricalContext("2026-05-27",{fr:true});
assert.match(visible,/data-cal-historical-id="history.pentecost-ember-wednesday"/);
assert.match(visible,/Sainte-Marie-Majeure/);
assert.match(visible,/HISTOIRE LITURGIQUE/);
assert.match(visible,/rel="noopener noreferrer"/);
assert.equal(renderCalendarHistoricalContext("2026-05-25"),"");
assert.equal((visible.match(/<details /g)||[]).length,1);
assert.equal((visible.match(/<a href=/g)||[]).length,2);
const runtimeSource=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
assert.ok(runtimeSource.includes("renderCalendarHistoricalContext(selected,{fr:fr(),observedMainId:r?.day?.main?.id})"));
assert.match(runtimeSource,/\.aoCalHistoricalCard summary/);
assert.ok(runtimeSource.indexOf("${renderCalendarHistoricalContext(selected,{fr:fr(),observedMainId:r?.day?.main?.id})}")<
          runtimeSource.indexOf("${practiceContext(selected,r)}"));

console.log("Calendar historical context: 3 sourced notes, dynamic dates, bilingual output and non-normative boundaries OK.");
