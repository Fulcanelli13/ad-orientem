import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CALENDAR_INTELLIGENCE_VERSION,
  calendarDisciplineForDate,
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

const christKingIntelligence=calendarIntelligenceForDate("2026-10-25",{fr:false});
assert.ok(christKingIntelligence.novenas.some(x=>x.novenaId==="holy_souls"),"Active Holy Souls novena was not projected alongside Christ the King and October Rosary");

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

const fridayDiscipline=calendarDisciplineForDate("2026-10-09",{fr:false});
assert.equal(fridayDiscipline.today.key,"friday");
assert.match(fridayDiscipline.today.label,/universal penitential day/);
assert.match(fridayDiscipline.eras.current.items[0].summary,/At least one hour before Holy Communion/);
assert.match(fridayDiscipline.eras["1962"].items[0].summary,/three hours from solid food and alcoholic drink/);
assert.equal(fridayDiscipline.eras["1962"].items[2].status,"SOURCE-SENSITIVE");
assert.match(fridayDiscipline.eras.older.items[0].summary,/substantially stricter/);
assert.match(fridayDiscipline.eras.current.sources[0].label,/can\. 919/);

const ashDiscipline=calendarDisciplineForDate("2026-02-18",{fr:false});
assert.equal(ashDiscipline.today.key,"fast-abstinence");
assert.match(ashDiscipline.today.label,/universal fast and abstinence/);
assert.equal(calendarIntelligenceForDate("2026-10-09").discipline.today.key,"friday","Calendar intelligence stopped carrying discipline context");

const home=readFileSync("src/home/enrichers.js","utf8");
const homeBrowser=readFileSync("src/home/browser-entry.js","utf8");
const prayRuntime=readFileSync("src/pray/presentation-runtime.js","utf8");
const novenaRuntime=readFileSync("src/pray/novena-runtime.js","utf8");

assert.match(home,/calendarIntelligenceForDate/,"Home stopped consuming Calendar intelligence");
assert.doesNotMatch(home,/function weeklyEvent\(/,"Home reintroduced duplicate First Friday\/Saturday date rules");
assert.doesNotMatch(home,/AO_LITURGICAL_YEAR_V384/,"Home still depends on the historical global year surface instead of the shared Calendar service");
assert.match(homeBrowser,/id==="today\.calendar"\|\|id==="calendar".*navigate\?\.\("calendar"\)/s,"Home Calendar intelligence does not route to the Calendar surface");
assert.match(prayRuntime,/calendarIsFirstWeekday/,"PRAY programmes stopped sharing First Friday\/Saturday recurrence");
assert.doesNotMatch(prayRuntime,/d\.getDay\(\)===weekday&&d\.getDate\(\)<=7/,"PRAY reintroduced private First Friday\/Saturday recurrence");
assert.match(novenaRuntime,/novenaStatusFor/,"Novena runtime stopped consuming shared Calendar date semantics");
assert.doesNotMatch(novenaRuntime,/function easter\(/,"Novena runtime reintroduced a private Easter calculator");

console.log("PASS shared Calendar intelligence: practices, programmes and novena date semantics");
