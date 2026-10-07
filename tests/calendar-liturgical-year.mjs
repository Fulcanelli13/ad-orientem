import assert from "node:assert/strict";
import fs from "node:fs";
import {
  addDaysIso,
  buildLiturgicalYear,
  buildMajorCelebrations,
  nextMajorCelebration,
} from "../src/calendar/liturgical-year.js";

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

const browser = fs.readFileSync(new URL("../src/calendar/browser-entry.js", import.meta.url), "utf8");
assert.match(browser, /modular-calendar-v2-liturgical-year/);
assert.match(browser, /calendarView==="year"\?yearSurface/);
assert.match(browser, /data-cal-view/);
assert.match(browser, /aoCalV2Ring/);
assert.match(browser, /aoCalV2Timeline/);
assert.match(browser, /aoCalV2JourneyRail/);
assert.match(browser, /data-cal-index-date/);
assert.match(browser, /data-cal-pick-date/);
assert.match(browser, /data-cal-mass/);
assert.match(browser, /Open this Mass/);

const bodySource = browser.match(/function bodyMarkup\(\)\{[\s\S]*?\n\}\nfunction css/)?.[0] || "";
assert.doesNotMatch(bodySource, /yearWheel\(selected,r\)/, "day surface must not restore the old decorative year ring");
assert.doesNotMatch(bodySource, /aoCalNavigate/, "old collapsed date jump must not remain in the active body");

console.log("Calendar liturgical-year model and v2 presentation contract: OK");
