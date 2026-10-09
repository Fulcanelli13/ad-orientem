import assert from "node:assert/strict";
import fs from "node:fs";
import {
  addDaysIso,
  buildLiturgicalYear,
  buildMajorCelebrations,
  nextMajorCelebration,
  annunciationObservanceDate,
  saintJosephObservanceDate,
  allSoulsObservanceDate,
} from "../src/calendar/liturgical-year.js";
import { v384Dates, v384Events, v384Event } from "../src/calendar/traditional-year-v384.js";
import { SEASON_GUIDE, yearSegmentGeometry, renderYearJourney } from "../src/calendar/year-journey.js";
import { calendarMassColour } from "../src/calendar/colour-projection.js";

// This is deliberately display-only. The production day resolver already
// owns the phase colours; the Calendar must label the Mass, not the first
// blessing/procession segment, while R17 retains the full rite sequence.
for(const [name,first,mass] of [
  ["Palm Sunday","Red","Violet"],
  ["Easter Vigil","Violet","White"],
  ["Pentecost Vigil","Violet","Red"],
]){
  const r={proper:{data:{color:first}},day:{main:{color:first+" / "+mass}},colourPlan:{
    primary:first,massColor:mass,sequence:[["Preparatory rites",first],["Mass",mass]]
  }};
  assert.equal(calendarMassColour(r),mass,name+" calendar colour must refer to the Mass");
  assert.deepEqual(r.colourPlan.sequence.map(x=>x[1]),[first,mass],name+" colour plan was mutated");
}
assert.equal(calendarMassColour({day:{main:{id:"tempora:Quad6-5r:1:bv",color:"Black / Violet"}},proper:{data:{color:"Black"}},colourPlan:{primary:"Black",massColor:"Violet",sequence:[["Passion liturgy","Black"],["Communion","Violet"]]}}),"Black","Good Friday is not a Mass: Calendar identity must remain black");
assert.equal(calendarMassColour({proper:{data:{color:"Green"}},day:{main:{color:"Green"}}}),"Green");
assert.equal(calendarMassColour({day:{main:{color:"White"}}}),"White");

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
const segments=yearSegmentGeometry(rosary);
assert.equal(segments.length,9,"1962 seasonal year must contain nine periods");
assert.equal(Object.keys(SEASON_GUIDE).length,9,"Each period needs bilingual formation text");
assert.ok(Math.abs(segments.reduce((n,p)=>n+p.widthPercent,0)-100)<1e-8,"Timeline geometry must sum to 100%");
assert.ok(Math.abs(segments.at(-1).endPercent-100)<1e-8,"Timeline must end at liturgical year boundary");
assert.ok(segments.every(p=>p.days>0&&p.endPercent>p.startPercent),"Timeline segment must represent actual day duration");
assert.ok(segments.find(p=>p.id==="pentecost").widthPercent<3,"Short Pentecost octave must remain proportionally short");
const yearHtml=renderYearJourney({year:rosary,selectedDate:"2026-10-07",formatDate:id=>id});
assert.equal((yearHtml.match(/data-cal-year-segment=/g)||[]).length,9,"Year track must render each period exactly once");
assert.equal((yearHtml.match(/data-cal-year-period=/g)||[]).length,9,"All nine period cards must be selectable");
assert.equal((yearHtml.match(/class="aoCalYearDetail"[^>]*>/g)||[]).filter(x=>!x.includes(" hidden")).length,1,"Only the expanded period detail must be visible");
assert.match(yearHtml,/data-cal-year-open-day="2026-05-31"/,"Current period start day is computed from the year model");
assert.match(yearHtml,/data-cal-year-month="2026-05"/,"Current period month navigation must be grounded");
assert.match(yearHtml,/data-cal-year-stage="present"/,"Current period must be distinguished visually");
const yearFrench=renderYearJourney({year:rosary,selectedDate:"2026-10-07",fr:true,focusedPeriodId:"advent",formatDate:id=>id});
assert.match(yearFrench,/Ouvrir le premier jour/,"French period controls are not translated");
assert.match(yearFrench,/data-cal-year-open-day="2025-11-30"/,"Selecting a different period must change details");
const following=buildLiturgicalYear("2026-11-29");
assert.equal(yearSegmentGeometry(following).length,9,"Advent rollover must build a fresh year");
assert.equal(yearSegmentGeometry(following)[0].start,following.start,"Following liturgical year starts on new Advent");

const next = nextMajorCelebration("2026-10-07");
assert.equal(next?.date, "2026-10-25");
assert.equal(next?.en, "Christ the King");

const laudemusReferenceDate = buildLiturgicalYear("2026-09-13");
assert.equal(laudemusReferenceDate.currentPeriod.id, "after-pentecost");
assert.equal(laudemusReferenceDate.periodDayIndex, 106);
assert.equal(nextMajorCelebration("2026-09-13")?.date, "2026-09-29");
assert.equal(nextMajorCelebration("2026-11-27")?.date,"2026-11-29","Last liturgical week must link to next Advent");
assert.equal(nextMajorCelebration("2026-11-28")?.date,"2026-11-29","Last liturgical day must not show an empty next feast");
assert.equal(nextMajorCelebration("2026-11-29")?.date,"2026-12-06","At Advent 1, next major day is Advent 2");
assert.equal(nextMajorCelebration("2027-11-27")?.date,"2027-11-28","Boundary check across another liturgical year");


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

// 1960 General Rubrics §§95–99; independently cross-checked against the
// Roman Missal 1962 calendar for 2024, 2025 and 2027.
assert.equal(annunciationObservanceDate(2027),"2027-04-05","Holy Thursday 2027 must not show the Annunciation");
assert.equal(annunciationObservanceDate(2024),"2024-04-08","Holy Week 2024 must transfer the Annunciation");
assert.equal(annunciationObservanceDate(2026),"2026-03-25","Ordinary Passion-week 2026 occurrence remains March 25");
assert.equal(allSoulsObservanceDate(2025),"2025-11-03","All Souls on Sunday transfers to Monday under 1962 rubrics");
assert.equal(allSoulsObservanceDate(2026),"2026-11-02");
const anniversary2027=buildMajorCelebrations("2027-03-25").filter(x=>/Annunciation/.test(x.en));
assert.deepEqual(anniversary2027.map(x=>x.date),["2027-04-05"]);
assert.equal(anniversary2027[0].transferredFrom,"2027-03-25");
assert.equal(buildMajorCelebrations("2027-03-25").some(x=>x.en==="Holy Thursday"&&x.date==="2027-03-25"),true);
assert.equal(nextMajorCelebration("2027-04-04")?.date,"2027-04-05");
assert.equal(nextMajorCelebration("2027-04-04")?.en,"Annunciation of the Blessed Virgin Mary");
const allSouls2025=buildMajorCelebrations("2025-11-02").filter(x=>/Faithful Departed/.test(x.en));
assert.deepEqual(allSouls2025.map(x=>x.date),["2025-11-03"]);
assert.equal(allSouls2025[0].transferredFrom,"2025-11-02");
// These dates are independently witnessed in actual published 1962 ordo
// calendars (not in the Ordinary Form). Keep the audit fixture separately
// from the code under test and verify both observed and original dates.
const transferOracle=JSON.parse(fs.readFileSync(new URL("../data/calendar/1962-transfer-oracle.v1.json",import.meta.url),"utf8"));
assert.equal(transferOracle.schema,"ao-1962-observance-transfer-oracle-v1");
for(const witness of transferOracle.witnesses){
  assert.match(witness.source,/^https:\/\//,"Published independent witness required: "+witness.id);
  const matches=buildMajorCelebrations(witness.original).filter(x=>x.en===witness.name);
  assert.equal(matches.length,1,"Exactly one curated candidate: "+witness.id);
  assert.equal(matches[0].date,witness.observed,"Independent 1962 observed date disagreement: "+witness.id);
  if(witness.original!==witness.observed){
    assert.equal(matches[0].transferredFrom,witness.original,"Original assignment lost: "+witness.id);
    assert.equal(matches.some(x=>x.date===witness.original),false,"Transferred feast incorrectly remains at its old date: "+witness.id);
  }
}
// The independent 2028 witness is a critical regression: the Third Sunday
// of Lent wins on 19 March; St Joseph is observed Monday 20 March.
assert.equal(saintJosephObservanceDate(2028),"2028-03-20");
assert.equal(nextMajorCelebration("2028-03-19")?.date,"2028-03-20");
assert.equal(nextMajorCelebration("2028-03-19")?.en,"Saint Joseph, Spouse of the Blessed Virgin Mary");
assert.equal(saintJosephObservanceDate(2026),"2026-03-19");
assert.equal(saintJosephObservanceDate(2034),"2034-03-20");
// 2035 is a distinct collision with Holy Week and an Annunciation
// transferred to Monday after Low Sunday; n. 96(a) reserves Monday
// for the Annunciation, and n. 96 places St Joseph on Tuesday.
assert.equal(annunciationObservanceDate(2035),"2035-04-02");
assert.equal(saintJosephObservanceDate(2035),"2035-04-03");
const joseph2035=buildMajorCelebrations("2035-03-19").find(x=>x.en==="Saint Joseph, Spouse of the Blessed Virgin Mary");
assert.equal(joseph2035?.date,"2035-04-03");
assert.equal(joseph2035?.transferredFrom,"2035-03-19");

const conception2024=buildMajorCelebrations("2024-12-08").find(x=>/Immaculate Conception/.test(x.en));
assert.equal(conception2024?.date,"2024-12-08","Do not import the 2024 Ordinary Form December 9 transfer into the 1962 calendar");

// For every civil date in both 2024 and 2027, verify model continuity and
// non-overlap; documentary parity for observed rank/colour is checked separately
// against a bounded original-calendar oracle in the browser test.
for(const civilYear of [2024,2027]){
  let date=`${civilYear}-01-01`,count=0;
  while(date<=`${civilYear}-12-31`){
    const model=buildLiturgicalYear(date);
    assertContinuous(model);
    assert.ok(model.currentPeriod.start<=date&&date<=model.currentPeriod.end,"Selected date outside computed liturgical season: "+date);
    assert.equal(model.periods.filter(p=>p.start<=date&&date<=p.end).length,1,"Multiple computed seasons claim "+date);
    assert.ok(model.progress>0&&model.progress<=1,"Liturgical progress outside 0–100%: "+date);
    assert.ok(model.periodProgress>0&&model.periodProgress<=1,"Season progress outside 0–100%: "+date);
    date=addDaysIso(date,1);count++;
  }
  assert.ok(count>=365,"Full civil year date sweep incomplete");
}

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

const traditionalSource = fs.readFileSync(new URL("../src/calendar/traditional-year-v384.js", import.meta.url), "utf8");
assert.doesNotMatch(traditionalSource,/v384YearHTML|v384DisciplineHTML|V384_CSS/,"retired v38.4 presentation exports remain in production");
assert.doesNotMatch(traditionalSource,/v384DateLead|v384EraTabs|data-ao-cal-v384/,"retired v38.4 presentation markup remains in the data donor");
assert.match(traditionalSource,/export function v384Events/,"v38.4 event donor data was removed with its retired presentation");
assert.match(traditionalSource,/export function v384Dates/,"v38.4 date donor data was removed with its retired presentation");

const entry = fs.readFileSync(new URL("../src/calendar/browser-entry.js", import.meta.url), "utf8");
// First-use Calendar shells defer the complete year/day/month presentation.
// Validate the real imported presentation owner, not its intentionally small loader.
const deferred = entry.includes('import("./calendar-runtime.js")');
const browser = deferred
  ? fs.readFileSync(new URL("../src/calendar/calendar-runtime.js", import.meta.url), "utf8")
  : entry;
if(deferred){
  assert.match(entry,/ensureCalendarRuntime/, "Calendar must retain a callable first-use owner");
  assert.match(browser,/installCalendarBrowserOwner/, "Deferred Calendar owner must really install");
}
assert.match(browser, /modular-calendar-v2-liturgical-year/);
assert.match(browser, /if\(calendarView==="year"\)return/, "Year dashboard must remain available if day resolution is pending");
assert.match(browser, /if\(calendarView==="picker"\)return/, "Month picker must remain available if day resolution is pending");
assert.match(browser, /calendarView==="year"\)return \`\$\{tabsMarkup\(\)\}\$\{yearSurface/, "Year view must render before Day's resolution guard");
assert.match(browser, /calendarView==="picker"\)return \`\$\{tabsMarkup\(\)\}\$\{pickerSurface/, "Month must render before Day's resolution guard");
assert.match(browser, /data-cal-view/);
assert.match(browser, /aoCalV2Ring/, "Liturgical Year lost its sourced progress ring");
assert.match(browser, /aoCalV2YearIdentity/, "Liturgical Year lost selected-day and period identity");
assert.match(browser, /renderYearJourney\(\{year:y/, "Liturgical Year lost the proportional timeline and period journey");
assert.match(browser, /yearJourneyCss/, "Liturgical Year did not import responsive journey styles");
assert.match(browser, /aoCalV2Coming/, "Liturgical Year lost its next major celebration and season transitions");
assert.match(browser, /data-cal-open-month="major"/, "Liturgical Year lost its major-days route into Month");
assert.ok(browser.includes('data-cal-year-open-day="${next.date}"'),"Next feast must open Day through existing Year-Journey handler");
assert.ok(browser.includes('data-cal-year-open-day="${nextSeason.start}"'),"Next season must open Day through Year-Journey handler");
assert.ok(!browser.includes('data-cal-month-index-date="${x.date}" ${view==="sanctorale"'),"Sanctorale rows cannot intercept Day selection with saint-detail handler");
assert.ok(browser.includes('if(openMonth&&calendarView!=="picker")pickerMonthId='),"Year-to-Month route must reset stale month");
assert.match(browser,/data-cal-year-open-day/,"Period to Day journey navigation is missing");
assert.match(browser,/data-cal-year-month/,"Period to Month journey navigation is missing");
assert.match(browser,/data-cal-year-period/,"Expandable period card navigation is missing");
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
assert.match(browser, /data-cal-glossary/,"Calendar lost contextual glossary action");
assert.match(browser, /function calendarGlossaryTerms\(\)/,"Calendar lost view-aware glossary mapping");
assert.match(browser, /openTerms\(calendarGlossaryTerms\(\),\{origin:"calendar"\}\)/,"Calendar glossary no longer opens contextually");
for(const id of ["G086","G087","G273","G274","G088","G094","G261","G262"]){
  assert.match(browser,new RegExp('"'+id+'"'),"Calendar glossary mapping lost "+id);
}
assert.match(browser, /Open this Mass/);
assert.doesNotMatch(browser, /scrollIntoView/, "Calendar must not vertically auto-scroll while centering the selected day");
assert.match(browser, /repeat\(7,minmax\(0,1fr\)\)/, "Calendar month grid must use zero-minimum seven-column tracks");
assert.match(browser, /overflow-y:auto;overflow-x:hidden/, "Calendar root must suppress accidental horizontal overflow");
assert.match(browser, /height:66px!important/, "Calendar liturgical month lost its phone-readable cell height");
assert.match(browser, /grid-template-columns:repeat\(3,1fr\)/, "Calendar top navigation did not collapse to Day · Month · Liturgical Year");
assert.match(browser, /observedCycle\(r,id\)/, "Month Temporale\/Sanctorale classification is missing");
assert.match(browser,/import \{ observedCycle \} from "\.\/observed-cycle\.js"/,"Calendar must use one source-identity classifier");
assert.doesNotMatch(browser,/const temporal=\//,"Calendar must not classify by translated title regex");
assert.match(browser,/data-cal-unclassified/,"Unknown cycle must be disclosed, not silently categorized");
assert.doesNotMatch(browser, /majorForDate\(/, "Month may not classify observed feasts from an independent candidate table");
assert.match(browser, /const name=r&&\(tier>0/, "Month labels must come from resolved days only");
assert.match(browser, /nextResolvedMajorCelebration\(selected\)/, "Upcoming major dates must be verified by the daily resolver");
assert.match(browser, /await resolveOne\(date\)/, "Upcoming date must be checked against the observed Mass");
assert.match(browser, /nextMajorResults\.set\(selected,found/, "Upcoming result must retain verified day resolution");
assert.match(browser, /await ensureLearnModule\("learn\.glossary",globalThis\)/, "Calendar must lazy-load the Glossary on demand");
assert.match(browser, /data-cal-glossary-error/, "Missing Glossary must provide visible failure state");
assert.match(browser,/monthVerified\(monthId\)/,"Partial or failed month cannot be marked fully verified");
assert.match(browser,/calendarView="day";pickerMonthId=iso\(new Date\(\)\)\.slice\(0,7\)/,"Today must navigate to the day, not leave user stranded in the month picker");
assert.doesNotMatch(browser,/function yearProgress\(/,"Gregorian civil-year progress cannot drive a liturgical wheel");
assert.match(browser,/buildLiturgicalYear\(selected\)\.progress\*360/,"All Calendar year wheels must use Advent-to-Advent progress");
assert.doesNotMatch(browser,/x\.sunday\|\|x\.tier<=2\|\|Boolean\(x\.major\)/,"Projected festivals cannot override the observed Major tab");

assert.match(browser, /function principalSaintContext\(r,id\)/, "Calendar Day lost principal saint\/feast classification");
assert.match(browser, /data-cal-saint-date/, "Calendar lost the shared saint-detail entry point");
assert.match(browser, /AO_MODULES\?\.open\?\.\("today\.saint"/, "Calendar no longer reuses the shared saint-detail engine");
assert.match(browser, /view==="sanctorale".*data-cal-saint-date/s, "Month Sanctorale no longer opens the shared saint detail");

const bodySource = browser.match(/function bodyMarkup\(\)\{[\s\S]*?\n\}\nfunction css/)?.[0] || "";
assert.doesNotMatch(bodySource, /yearWheel\(selected,r\)/, "day surface must not restore the old decorative year ring");
assert.doesNotMatch(bodySource, /aoCalNavigate/, "old collapsed date jump must not remain in the active body");

// The pinned production day resolver is a compiled boot bundle. Its original
// Passion Friday special case must defer to an I/II class sanctoral feast.
// The browser oracle independently verifies 19 March 2027 against the Missal.
const compiledEngine=fs.readFileSync(new URL("../ao-boot-4ef16d2b0e26d68c.js",import.meta.url),"utf8");
assert.match(compiledEngine,/C\.TEMPORA_QUAD5_5C\)\) && !matchFirst\(obs, PAT\.PATTERN_SANCTI_CLASS_1_OR_2\)/,
  "Passion Friday special case still suppresses first/second-class saints");

console.log("Calendar liturgical-year model, intelligence projection and v2 presentation contract: OK");
