import assert from "node:assert/strict";
import fs from "node:fs";
import {
  addDaysIso,
  buildLiturgicalYear,
  buildMajorCelebrations,
  nextMajorCelebration,
} from "../src/calendar/liturgical-year.js";
import { v384Dates, v384Events, v384Event } from "../src/calendar/traditional-year-v384.js";

function assertContinuous(year) {
  assert.equal(year.periods.reduce((sum, period) => sum + period.days, 0), year.totalDays);
  for (let i = 1; i < year.periods.length; i += 1) {
    assert.equal(
      year.periods[i].start,
      addDaysIso(year.periods[i - 1].end, 1),
      `period boundary ${year.periods[i - 1].id} -> ${year.periods[i].id}`,
    );
  }
}

const rosary = buildLiturgicalYear("2026-10-07");
assert.equal(rosary.label, "2025–2026");
assert.equal(rosary.start, "2025-11-30");
assert.equal(rosary.end, "2026-11-28");
assert.equal(rosary.totalDays, 364);
assert.equal(rosary.dayIndex, 312);
assert.equal(rosary.currentPeriod.id, "after-pentecost");
assert.equal(rosary.currentPeriod.start, "2026-05-31");
assert.equal(rosary.currentPeriod.days, 182);
assert.equal(rosary.periodDayIndex, 130);
assert.ok(Math.abs(rosary.periodProgress - (130 / 182)) < 1e-12);
assert.ok(Math.abs(rosary.progress - (312 / 364)) < 1e-12);
assertContinuous(rosary);

const next = nextMajorCelebration("2026-10-07");
assert.equal(next?.date, "2026-10-25");
assert.equal(next?.en, "Christ the King");

const laudemusReferenceDate = buildLiturgicalYear("2026-09-13");
assert.equal(laudemusReferenceDate.currentPeriod.id, "after-pentecost");
assert.equal(laudemusReferenceDate.periodDayIndex, 106);
assert.equal(nextMajorCelebration("2026-09-13")?.date, "2026-09-29");

assert.equal(buildLiturgicalYear("2026-04-05").currentPeriod.id, "easter");
assert.equal(buildLiturgicalYear("2026-04-05").currentPeriod.days, 49);
assert.equal(buildLiturgicalYear("2026-05-24").currentPeriod.id, "pentecost");
assert.equal(buildLiturgicalYear("2026-05-24").currentPeriod.days, 7);
assert.equal(buildLiturgicalYear("2026-05-31").currentPeriod.id, "after-pentecost");
assert.equal(buildLiturgicalYear("2026-11-29").label, "2026–2027");
assert.equal(buildLiturgicalYear("2026-11-29").currentPeriod.id, "advent");

const celebrations = buildMajorCelebrations("2026-10-07");
const byEnglishName = new Map(celebrations.map(item => [item.en, item]));
assert.equal(byEnglishName.get("Purification of the Blessed Virgin Mary · Candlemas")?.date, "2026-02-02");
assert.equal(byEnglishName.get("Dedication of Saint Michael the Archangel")?.date, "2026-09-29");
assert.equal(byEnglishName.get("Christ the King")?.date, "2026-10-25");
assert.equal(byEnglishName.get("All Saints")?.date, "2026-11-01");
assert.equal(byEnglishName.get("Commemoration of All the Faithful Departed")?.date, "2026-11-02");

const traditional=v384Dates(2026);
assert.equal(traditional.easter,"2026-04-05");
assert.equal(traditional.septuagesima,"2026-02-01");
assert.equal(traditional.ash,"2026-02-18");
assert.equal(traditional.corpus,"2026-06-04");
assert.equal(traditional.christKing,"2026-10-25");
assert.deepEqual(traditional.emberSept,["2026-09-23","2026-09-25","2026-09-26"]);

const octoberEvent=v384Event("2026-10-07",{fr:false});
assert.equal(octoberEvent?.key,"october");
assert.equal(octoberEvent?.title,"Month of the Holy Rosary");
const christKingEvents=v384Events("2026-10-25",{fr:false});
assert.deepEqual(christKingEvents.map(x=>x.key),["christ-king","october"],"v38.4 must preserve concurrent Christ the King + October Rosary observances in priority order");
const christKingEvent=v384Event("2026-10-25",{fr:false});
assert.equal(christKingEvent?.key,"christ-king","compatibility primary event must remain the highest-priority donor event");
const septEvent=v384Event("2026-02-01",{fr:false});
assert.equal(septEvent?.key,"septuagesima");

const holyThursdayEvents=v384Events(traditional.holyThursday,{fr:false});
assert.deepEqual(holyThursdayEvents[0]?.actions?.map(x=>x[0]),["pray.adoration","today.calendar"],"Holy Thursday donor actions were simplified");
const holySoulsEvents=v384Events("2026-11-02",{fr:false});
assert.deepEqual(holySoulsEvents[0]?.actions?.map(x=>x[0]),["pray.de_profundis","pray.eternal_rest"],"Holy Souls must open the actual prayers for the dead");
const transferredEmber=v384Events("2026-09-24",{fr:false,properTitle:"Ember Thursday"});
assert.equal(transferredEmber[0]?.key,"ember-calendar","resolved-calendar Ember fallback disappeared");
assert.deepEqual(transferredEmber[0]?.actions?.map(x=>x[0]),["today.calendar","learn.discipline"]);

const browser = fs.readFileSync(new URL("../src/calendar/browser-entry.js", import.meta.url), "utf8");
assert.match(browser, /modular-calendar-v2-liturgical-year/);
assert.match(browser, /calendarView==="year"\?yearSurface/);
assert.match(browser, /data-cal-view/);
assert.match(browser, /aoCalV2Ring/);
assert.match(browser, /aoCalV2Timeline/);
assert.match(browser, /aoCalV2JourneyRail/);
assert.doesNotMatch(browser, /v384Companion/,"redundant v38.4 Traditional Liturgical Year companion returned");
assert.doesNotMatch(browser, /data-ao-cal-v384-panel/,"retired v38.4 year\/discipline UI returned");
assert.doesNotMatch(browser, /data-ao-cal-v384-era/,"retired duplicate discipline-era tabs returned");
assert.doesNotMatch(browser, /V384_CSS|v384YearHTML|v384DisciplineHTML/,"Calendar browser still imports donor presentation instead of Calendar intelligence");
assert.match(browser, /calendarIntelligenceForDate/,"Calendar Day stopped consuming shared date intelligence");
assert.match(browser, /aoCalPracticeContext/,"Calendar Day lost contextual practices and discipline");
assert.match(browser, /data-cal-intelligence-route/,"Calendar date intelligence lost action routing");
assert.match(browser, /data-cal-month-index-date/);
assert.match(browser, /data-cal-pick-date/);
assert.match(browser, /L\("Month","Mois"\)/, "Calendar must expose Month as a top-level surface");
assert.doesNotMatch(browser, /L\("Year index","Repères"\)/, "redundant Year Index returned as a top-level surface");
assert.doesNotMatch(browser, /function indexSurface\(/, "obsolete Year Index implementation remains active");
assert.match(browser, /MONTH_INDEX_VIEWS=new Set\(\["calendar","major","temporale","sanctorale","practices"\]\)/, "Month did not retain Calendar/Major/Temporale/Sanctorale/Practices projections");
assert.match(browser, /data-cal-month-view/, "Month secondary navigation is missing");
assert.match(browser, /\["practices",L\("Practices","Pratiques"\)\]/, "Month Practices tab disappeared");
assert.match(browser, /calendarPracticeMonthEntries/, "Month Practices stopped consuming shared Calendar Intelligence");
assert.match(browser, /function monthIndexEntries\(monthId,view\)/, "Month index projections are missing");
assert.match(browser, /if\(next==="index"\).*calendarMonthView="major"/, "legacy Year Index route no longer redirects to Month\/Major");
assert.match(browser, /function monthGridIds\(monthId\)/, "Calendar lost its 42-cell month geometry");
assert.match(browser, /function prepareMonth\(monthId,\{concurrency=3/, "Calendar month preload lost its bounded resolver concurrency");
assert.match(browser, /data-cal-liturgical-marker/, "Calendar month cells lost semantic liturgical markers");
assert.match(browser, /data-rank-tier/, "Calendar month cells lost rank salience");
assert.match(browser, /dayLoads\.has\(id\)/, "Calendar no longer deduplicates day resolution across week and month loaders");
assert.match(browser, /data-cal-mass/);
assert.match(browser, /Open this Mass/);
assert.doesNotMatch(browser, /scrollIntoView/, "Calendar must not vertically auto-scroll while centering the selected day");
assert.match(browser, /repeat\(7,minmax\(0,1fr\)\)/, "Calendar month grid must use zero-minimum seven-column tracks");
assert.match(browser, /overflow-y:auto;overflow-x:hidden/, "Calendar root must suppress accidental horizontal overflow");
assert.match(browser, /height:66px!important/, "Calendar liturgical month lost its phone-readable cell height");
assert.match(browser, /grid-template-columns:repeat\(3,1fr\)/, "Calendar top navigation did not collapse to Day · Month · Liturgical Year");
assert.match(browser, /observedCycle\(r,id\)/, "Month Temporale\/Sanctorale classification is missing");
assert.match(browser, /majorForDate\(id\)/, "Month classification stopped using resolved major-day metadata");
assert.match(browser, /function principalSaintContext\(r,id\)/, "Calendar Day lost principal saint\/feast classification");
assert.match(browser, /data-cal-saint-date/, "Calendar lost the shared saint-detail entry point");
assert.match(browser, /AO_MODULES\?\.open\?\.\("today\.saint"/, "Calendar no longer reuses the shared saint-detail engine");
assert.match(browser, /view==="sanctorale".*data-cal-saint-date/s, "Month Sanctorale no longer opens the shared saint detail");

const bodySource = browser.match(/function bodyMarkup\(\)\{[\s\S]*?\n\}\nfunction css/)?.[0] || "";
assert.doesNotMatch(bodySource, /yearWheel\(selected,r\)/, "day surface must not restore the old decorative year ring");
assert.doesNotMatch(bodySource, /aoCalNavigate/, "old collapsed date jump must not remain in the active body");

console.log("Calendar liturgical-year model, intelligence projection and v2 presentation contract: OK");
