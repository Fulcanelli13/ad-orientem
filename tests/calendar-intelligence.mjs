import assert from "node:assert/strict";
import {
  CALENDAR_INTELLIGENCE_VERSION,
  calendarIntelligenceForDate,
  calendarNovenaEvents,
  calendarPracticeEvents,
  isFirstWeekday,
  novenaStatusFor,
  novenaWindowFor,
} from "../src/calendar/intelligence.js";

assert.equal(CALENDAR_INTELLIGENCE_VERSION,"calendar-intelligence-v1");

assert.equal(isFirstWeekday("2026-10-02",5),true,"2 October 2026 must be First Friday");
assert.equal(isFirstWeekday("2026-10-09",5),false,"second Friday must not be First Friday");
assert.equal(isFirstWeekday("2026-10-03",6),true,"3 October 2026 must be First Saturday");
assert.equal(isFirstWeekday("2026-10-10",6),false,"second Saturday must not be First Saturday");

const firstFriday=calendarPracticeEvents("2026-10-02",{fr:false});
assert.ok(firstFriday.some(x=>x.id==="programme.first_friday"),"First Friday programme disappeared from Calendar intelligence");
assert.equal(firstFriday.find(x=>x.id==="programme.first_friday")?.route,"programme.first_friday","First Friday no longer opens the canonical PRAY programme");
assert.ok(firstFriday.some(x=>x.id==="practice.friday"),"Friday penitential context disappeared");

const firstSaturday=calendarPracticeEvents("2026-10-03",{fr:false});
assert.ok(firstSaturday.some(x=>x.id==="programme.first_saturday"),"First Saturday programme disappeared from Calendar intelligence");
assert.equal(firstSaturday.find(x=>x.id==="programme.first_saturday")?.route,"programme.first_saturday","First Saturday no longer opens the canonical PRAY programme");

const rosaryMonth=calendarPracticeEvents("2026-10-07",{fr:false});
assert.ok(rosaryMonth.some(x=>x.id==="practice.october"),"October Rosary practice disappeared from shared intelligence");
assert.ok(rosaryMonth.find(x=>x.id==="practice.october")?.tags.includes("TRADITIONAL_DEVOTIONAL_PRACTICE"));

const christKing=calendarPracticeEvents("2026-10-25",{fr:false});
assert.ok(christKing.some(x=>x.id==="practice.christ-king"),"Christ the King traditional context disappeared");
assert.ok(christKing.some(x=>x.id==="programme.sunday-mass"),"Sunday obligation projection disappeared on Christ the King");

const ash=calendarPracticeEvents("2026-02-18",{fr:false}).find(x=>x.id==="practice.ash");
assert.ok(ash?.tags.includes("CURRENT_UNIVERSAL_DISCIPLINE"),"Ash Wednesday current discipline classification disappeared");

const ember=calendarPracticeEvents("2026-09-23",{fr:false}).find(x=>x.id==="practice.ember-sept");
assert.ok(ember?.tags.includes("1962_ERA_HISTORICAL_DISCIPLINE"),"Ember historical-discipline classification disappeared");

const holyGhostWindow=novenaWindowFor("holy_ghost",2026);
assert.deepEqual(holyGhostWindow,{start:"2026-05-15",end:"2026-05-23",feast:"2026-05-24"},"Holy Ghost novena no longer shares the 2026 paschal calendar");

const holyGhostDay1=novenaStatusFor("holy_ghost","2026-05-15",{fr:false});
assert.equal(holyGhostDay1.kind,"active");
assert.equal(holyGhostDay1.day,1);
assert.match(holyGhostDay1.label,/Day 1 of 9/);

const immaculate=novenaWindowFor("immaculate_conception",2026);
assert.deepEqual(immaculate,{start:"2026-11-29",end:"2026-12-07",feast:"2026-12-08"});
assert.equal(novenaStatusFor("immaculate_conception","2026-12-07").day,9);

const activeNovenas=calendarNovenaEvents("2026-05-15",{fr:false});
assert.ok(activeNovenas.some(x=>x.novenaId==="holy_ghost"),"Calendar intelligence did not expose active Holy Ghost novena");

const intelligence=calendarIntelligenceForDate("2026-10-02",{fr:false});
assert.equal(intelligence.schema,CALENDAR_INTELLIGENCE_VERSION);
assert.equal(intelligence.date,"2026-10-02");
assert.ok(intelligence.events.some(x=>x.id==="programme.first_friday"));
assert.ok(intelligence.events.every(x=>x.date==="2026-10-02"));

console.log("PASS shared Calendar intelligence: practices, programmes and novena date semantics");
