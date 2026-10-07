import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CALENDAR_INTELLIGENCE_VERSION,
  calendarDisciplineForDate,
  calendarIntelligenceForDate,
  calendarNovenaEvents,
  calendarPracticeEvents,
  calendarPracticeMonthEntries,
  isFirstWeekday,
  novenaStatusFor,
  novenaWindowFor,
  novenaTargetRegistryStatus,
} from "../src/calendar/intelligence.js";
import { CALENDAR_DEVOTIONAL_REGISTRY_VERSION, DEVOTIONAL_PRACTICE_REGISTRY, NOVENA_SOURCE_HOLDS, NOVENA_TARGET_IDS } from "../src/calendar/devotional-registry.js";

assert.equal(CALENDAR_INTELLIGENCE_VERSION,"calendar-intelligence-v1");
assert.equal(CALENDAR_DEVOTIONAL_REGISTRY_VERSION,"calendar-devotional-registry-v1");
assert.equal(NOVENA_TARGET_IDS.length,16,"frozen target registry must contain 16 devotional programmes");
assert.equal(Object.keys(NOVENA_SOURCE_HOLDS).length,4,"four later target entries must remain explicit source holds");
assert.deepEqual(Object.keys(NOVENA_SOURCE_HOLDS),["st_anthony_nine_tuesdays","christ_the_king","immaculate_heart","st_michael"]);
assert.ok(Object.values(NOVENA_SOURCE_HOLDS).every(x=>x.playable===false&&x.availability==="CALENDAR_METADATA_ONLY_SOURCE_HOLD"),"missing donor bodies must never become playable");
assert.equal(novenaTargetRegistryStatus().playableCount,12);
assert.equal(novenaTargetRegistryStatus().heldCount,4);
assert.equal(novenaTargetRegistryStatus().targetCount,16);


assert.equal(isFirstWeekday("2026-10-02",5),true,"2 October 2026 must be First Friday");
assert.equal(isFirstWeekday("2026-10-09",5),false,"second Friday must not be First Friday");
assert.equal(isFirstWeekday("2026-10-03",6),true,"3 October 2026 must be First Saturday");
assert.equal(isFirstWeekday("2026-10-10",6),false,"second Saturday must not be First Saturday");

const firstFriday=calendarPracticeEvents("2026-10-02",{fr:false});
assert.ok(firstFriday.some(x=>x.id==="programme.first_friday"),"First Friday programme disappeared from Calendar intelligence");
assert.equal(firstFriday.find(x=>x.id==="programme.first_friday")?.route,"programme.first_friday","First Friday no longer opens the canonical PRAY programme");
assert.ok(firstFriday.some(x=>x.id==="practice.friday"),"Friday penitential context disappeared");

const lentenFriday=calendarPracticeEvents("2026-02-20",{fr:false});
assert.ok(lentenFriday.some(x=>x.id==="practice.lenten-friday"),"Lenten Friday devotional context disappeared");
assert.ok(lentenFriday.find(x=>x.id==="practice.lenten-friday")?.tags.includes("CURRENT_INDULGED_WORK_CONDITIONAL"),"Lenten Friday conditional indulgence classification disappeared");
assert.equal(lentenFriday.find(x=>x.id==="practice.lenten-friday")?.route,"pray.communion_treasury");

const pentecost=calendarPracticeEvents("2026-05-24",{fr:false});
assert.ok(pentecost.some(x=>x.id==="practice.pentecost-veni-creator"),"Pentecost Veni Creator disappeared");
assert.ok(pentecost.find(x=>x.id==="practice.pentecost-veni-creator")?.tags.includes("CURRENT_INDULGED_WORK_CONDITIONAL"));

const corpusPractice=calendarPracticeEvents("2026-06-04",{fr:false}).find(x=>x.id==="practice.corpus");
assert.ok(corpusPractice?.tags.includes("CURRENT_INDULGED_WORK_CONDITIONAL"),"Corpus Christi procession grant is no longer conditional/current");
assert.equal(corpusPractice?.classification?.currentIndulgencedWork,"CONDITIONAL_PRESCRIBED_PROCESSION_AND_USUAL_CONDITIONS");

assert.ok(calendarPracticeEvents("2026-06-15").some(x=>x.id==="practice.sacred-heart-month"),"June Sacred Heart devotion disappeared");
assert.ok(calendarPracticeEvents("2026-07-15").some(x=>x.id==="practice.precious-blood-month"),"July Precious Blood devotion disappeared");
assert.ok(calendarPracticeEvents("2026-08-02").some(x=>x.id==="practice.portiuncula"),"Portiuncula context disappeared");
assert.ok(calendarPracticeEvents("2026-09-29").some(x=>x.id==="practice.st-michael"),"St Michael date-bound devotion disappeared");
assert.ok(calendarPracticeEvents("2026-11-29").some(x=>x.id==="practice.immaculate-conception-novena-start"),"Immaculate Conception novena start disappeared");
assert.ok(calendarPracticeEvents("2026-12-17").some(x=>x.id==="practice.o-antiphons"),"O Antiphons context disappeared");
assert.ok(calendarPracticeEvents("2026-12-31").some(x=>x.id==="practice.te-deum-year-end"),"Te Deum year-end context disappeared");

const firstSaturday=calendarPracticeEvents("2026-10-03",{fr:false});
assert.ok(firstSaturday.some(x=>x.id==="programme.first_saturday"),"First Saturday programme disappeared from Calendar intelligence");
assert.equal(firstSaturday.find(x=>x.id==="programme.first_saturday")?.route,"programme.first_saturday","First Saturday no longer opens the canonical PRAY programme");

const rosaryMonth=calendarPracticeEvents("2026-10-07",{fr:false});
assert.ok(rosaryMonth.some(x=>x.id==="practice.october"),"October Rosary practice disappeared from shared intelligence");
assert.ok(rosaryMonth.find(x=>x.id==="practice.october")?.tags.includes("TRADITIONAL_DEVOTIONAL_PRACTICE"));

const christKing=calendarPracticeEvents("2026-10-25",{fr:false});
assert.ok(christKing.some(x=>x.id==="practice.christ-king"),"Christ the King traditional context disappeared");
assert.ok(christKing.some(x=>x.id==="programme.sunday-mass"),"Sunday obligation projection disappeared on Christ the King");
const christKingPractice=christKing.find(x=>x.id==="practice.christ-king");
assert.equal(christKingPractice?.classification?.observance1962,true);
assert.equal(christKingPractice?.classification?.currentIndulgencedWork,false,"1962 Christ the King date must not inherit a current indulgence");
assert.ok(!christKingPractice?.tags.includes("CURRENT_INDULGED_WORK_CONDITIONAL"),"Christ the King received a current indulgence tag by date alone");


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
assert.equal(intelligence.registryVersion,CALENDAR_DEVOTIONAL_REGISTRY_VERSION);

const octoberPractices=calendarPracticeMonthEntries("2026-10",{fr:false});
assert.ok(octoberPractices.some(x=>x.id==="practice.october"),"Month Practices lost October Rosary");
assert.ok(octoberPractices.some(x=>x.id==="practice.christ-king"),"Month Practices lost Christ the King");
assert.ok(octoberPractices.some(x=>x.id==="programme.first_friday"),"Month Practices lost First Friday");
assert.ok(!octoberPractices.some(x=>x.id==="practice.friday"),"Month Practices must not become a list of every generic Friday");

const novemberPractices=calendarPracticeMonthEntries("2026-11",{fr:false});
assert.ok(novemberPractices.some(x=>x.id==="practice.holy-souls"),"Month Practices lost November Holy Souls context");
assert.ok(novemberPractices.some(x=>x.id==="practice.immaculate-conception-novena-start"),"Month Practices lost Immaculate Conception novena start");
assert.ok(novemberPractices.some(x=>x.id==="novena.immaculate_conception"),"Month Practices lost playable Immaculate Conception novena day 1");

const holySouls=calendarPracticeEvents("2026-11-02").find(x=>x.id==="practice.holy-souls");
assert.equal(holySouls?.classification?.currentIndulgencedWork,"CONDITIONAL_USUAL_CONDITIONS");
assert.ok(holySouls?.tags.includes("CURRENT_INDULGED_WORK_CONDITIONAL"));


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
assert.equal(Object.keys(DEVOTIONAL_PRACTICE_REGISTRY).filter(x=>["corpus","christ-king","october","holy-souls"].includes(x)).length,4,"v38.4 date events lost canonical semantic overlays");
assert.doesNotMatch(novenaRuntime,/function easter\(/,"Novena runtime reintroduced a private Easter calculator");

console.log("PASS shared Calendar intelligence: practices, programmes and novena date semantics");
