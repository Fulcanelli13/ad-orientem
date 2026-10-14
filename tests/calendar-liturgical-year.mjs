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
import { clockGeometry, clockCandidates, orderedClockCandidateDates, resolvedClockFeasts, nextVerifiedClockFeast, clockMarkerClusters, renderLiturgicalClock, liturgicalClockCss } from "../src/calendar/liturgical-clock.js";
import { calendarMassColour } from "../src/calendar/colour-projection.js";
import { calendarPaletteColour, resolvedYearColour, yearDailyProjection, yearSeasonGradient } from "../src/calendar/year-colour-wheel.js";
import { MASS_LITURGICAL_PALETTES } from "../src/mass/reader-liturgical-theme.js";

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

assert.equal(calendarPaletteColour("white"),MASS_LITURGICAL_PALETTES.WHITE.accent,
  "Year colour palette must inherit real liturgical white instead of beige");
assert.equal(calendarPaletteColour("black"),MASS_LITURGICAL_PALETTES.BLACK.accent,
  "Black must be distinct from the unresolved neutral state");
assert.equal(calendarPaletteColour("violet"),MASS_LITURGICAL_PALETTES.VIOLET.accent);
const sourceDay=(date,color,rank="IV Class")=>({date,status:"ready",day:{main:{id:"fixture:"+date,color,rank}},
  proper:{data:{color,rank}}});
const resolvedFixtures=new Map([
  ["2026-04-05",sourceDay("2026-04-05","White","I Class")],
  ["2026-10-07",sourceDay("2026-10-07","Green")],
  ["2026-05-24",sourceDay("2026-05-24","Red","I Class")],
  ["2026-10-10",sourceDay("2026-10-10","White")],
  ["2026-10-11",sourceDay("2026-10-11","Green")],
  ["2026-11-02",sourceDay("2026-11-02","Black","I Class")],
]);
const daily=yearDailyProjection(rosary,id=>resolvedFixtures.get(id));
assert.equal(daily.total,364,"2025–2026 liturgical-year daily wheel must have 364 distinct days");
assert.equal(daily.verified,6);
assert.equal(daily.complete,false);
assert.equal(daily.selected,"GREEN");
assert.match(daily.gradient,/conic-gradient\(from -90deg,/);
assert.match(daily.timeline,/linear-gradient\(to right,/);
assert.ok(daily.gradient.includes(MASS_LITURGICAL_PALETTES.RED.accent),"Pentecost red must not be averaged into green");
assert.ok(daily.gradient.includes(MASS_LITURGICAL_PALETTES.BLACK.accent),"All Souls black must survive inside green season");
assert.ok(daily.gradient.includes(MASS_LITURGICAL_PALETTES.WHITE.accent),"White saints' days must survive inside green season");
assert.ok(daily.gradient.includes(MASS_LITURGICAL_PALETTES.NEUTRAL.panel),
  "Unresolved dates must be neutral, not deceptively filled with the season's colour");
assert.equal(resolvedYearColour({...sourceDay("2026-10-10","White"),status:"failed"},"2026-10-10"),null);
assert.equal(resolvedYearColour(sourceDay("2026-10-10","White"),"2026-10-11"),null,
  "Stale daily calendar results may never colour another date");
assert.ok(yearSeasonGradient(rosary).includes(MASS_LITURGICAL_PALETTES.WHITE.accent),
  "The explanatory season band must also use the proper WHITE palette");
const verifiedEveryday=yearDailyProjection(rosary,id=>sourceDay(id,"Green"));
assert.equal(verifiedEveryday.verified,364);
assert.equal(verifiedEveryday.complete,true);
assert.equal((verifiedEveryday.gradient.match(/#[a-f0-9]+/gi)||[]).length,1,
  "Contiguous equal-colour days must combine into one CSS band");
const yearRuntimeSource=fs.readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
assert.match(yearRuntimeSource,/requestClockFeasts\(y\)/,"Year view must load candidate feasts without resolving 365 days");
assert.match(yearRuntimeSource,/renderLiturgicalClock\(/,"Year view must render the canonical SVG clock");
assert.doesNotMatch(yearRuntimeSource.slice(yearRuntimeSource.indexOf("function yearSurface("),yearRuntimeSource.indexOf("function pickerSurface(")),/aoCalV2Ring|renderYearJourney/,"Obsolete progress ring or duplicated timeline returned to Year");
const yearJourneySource=fs.readFileSync(new URL("../src/calendar/year-journey.js",import.meta.url),"utf8");
assert.doesNotMatch(yearJourneySource,/const COLOR=Object.freeze/,"Legacy beige seasonal palette must be removed");
assert.match(yearJourneySource,/aoCalYearDailyTrack/,"Timeline must show actual daily colours separately from seasons");

const segments=yearSegmentGeometry(rosary);
assert.equal(segments.length,11,"1962 seasonal subperiods must contain Epiphany and Ascensiontide explicitly");
assert.equal(Object.keys(SEASON_GUIDE).length,11,"Each period needs bilingual formation text");
assert.ok(Math.abs(segments.reduce((n,p)=>n+p.widthPercent,0)-100)<1e-8,"Timeline geometry must sum to 100%");
assert.ok(Math.abs(segments.at(-1).endPercent-100)<1e-8,"Timeline must end at liturgical year boundary");
assert.ok(segments.every(p=>p.days>0&&p.endPercent>p.startPercent),"Timeline segment must represent actual day duration");
assert.ok(segments.find(p=>p.id==="pentecost").widthPercent<3,"Short Pentecost octave must remain proportionally short");
const clockGroups=clockGeometry(rosary);
assert.equal(clockGroups.groups.length,8,"The Liturgical Clock must have eight major visual sections");
assert.equal(clockGroups.groups[0].start,rosary.start);
assert.equal(clockGroups.groups.at(-1).end,rosary.end);
assert.equal(clockGroups.groups.reduce((total,g)=>total+g.periods.reduce((n,p)=>n+p.days,0),0),rosary.totalDays,"Season arcs must cover every date exactly once");
assert.equal(clockCandidates(rosary).filter(c=>c.date==="2026-04-05").length,1);
const clockQueue=clockCandidates(rosary);
const clockPriority=orderedClockCandidateDates(rosary,"2026-10-13");
const kingCandidate=clockQueue.find(c=>c.en==="Christ the King");
assert.equal(clockPriority[0],kingCandidate.date,
 "Year preload must resolve the next major feast before all the previous winter's candidates");
assert.equal(new Set(clockPriority).size,clockQueue.length,
 "Preload priority must neither duplicate nor discard source candidate dates");
assert.deepEqual([...clockPriority].sort(),clockQueue.map(c=>c.date).sort(),
 "Reordered source candidate list must preserve the complete original resolver work queue");

for(const name of ["First Sunday of Advent","Annunciation of the Blessed Virgin Mary","Trinity Sunday","Holy Wednesday","Fourth Sunday of Lent"]){
 assert.ok(clockQueue.some(c=>c.en.startsWith(name)),name+" omitted from source-curated marker candidates");
}
assert.equal(new Set(clockQueue.map(c=>c.date)).size,clockQueue.length,
 "Transferred coincidences must not fetch/render the same liturgical date twice");
const annunciationCandidate=clockQueue.find(c=>c.en.startsWith("Annunciation"));
assert.equal(annunciationCandidate.date,annunciationObservanceDate(2026),
 "The Annunciation marker queue must use the already computed 1962 observance date");
const announcedDay=sourceDay(annunciationCandidate.date,"White","I Class");
const announcedMarkers=resolvedClockFeasts(rosary,id=>id===annunciationCandidate.date?announcedDay:null,
 r=>r.day.main.id,r=>r.day.main.rank);
assert.ok(announcedMarkers.some(c=>c.date===annunciationCandidate.date),
 "A source-confirmed first-class Annunciation must have a clickable clock marker");
const unobservedAnnunciation=resolvedClockFeasts(rosary,id=>id===annunciationCandidate.date
 ?sourceDay(annunciationCandidate.date,"Violet","IV Class"):null,
 r=>r.day.main.id,r=>r.day.main.rank);
assert.equal(unobservedAnnunciation.length,0,
 "A calendar candidate alone must not imply the Annunciation is observed on that date");

// A later confirmed jewel is not necessarily the next feast: the prior
// Christ-the-King candidate must be resolved before claiming All Saints next.
const pendingKing=new Map([["2026-11-01",sourceDay("2026-11-01","White","I Class")]]);
const pendingFeasts=resolvedClockFeasts(rosary,id=>pendingKing.get(id),
 r=>r.day.main.id,r=>r.day.main.rank);
assert.equal(nextVerifiedClockFeast(rosary,"2026-10-13",id=>pendingKing.get(id),pendingFeasts),null,
 "Do not call All Saints next while Christ the King is still unresolved");
const renderUpcoming=({cache,nextMajor=null})=>{
 const html=renderLiturgicalClock({year:rosary,selectedDate:"2026-10-13",todayDate:"2026-10-13",
  getDay:id=>cache.get(id),titleFor:r=>r.day.main.id,rankFor:r=>r.day.main.rank,nextMajor});
 return html.split('<section class="aoClockUpcoming">')[1]?.split("</section>")[0]||"";
};
assert.doesNotMatch(renderUpcoming({cache:pendingKing}),/data-cal-clock-open-day="2026-11-01"/,
 "The Coming next card must not jump over an unresolved source date");
assert.doesNotMatch(renderUpcoming({cache:pendingKing,
 nextMajor:{date:"2026-11-01",title:"All Saints"}}),/data-cal-clock-open-day="2026-11-01"/,
 "An unverified explicit next-feast hint must not override the source gate");
const resolvedKing=new Map(pendingKing);
resolvedKing.set(kingCandidate.date,sourceDay(kingCandidate.date,"White","I Class"));
assert.equal(nextVerifiedClockFeast(rosary,"2026-10-13",id=>resolvedKing.get(id),
 resolvedClockFeasts(rosary,id=>resolvedKing.get(id),r=>r.day.main.id,r=>r.day.main.rank))?.date,
 kingCandidate.date,"Once resolved, Christ the King must appear before All Saints");
const lowRankKing=new Map(pendingKing);
lowRankKing.set(kingCandidate.date,sourceDay(kingCandidate.date,"Green","IV Class"));
assert.equal(nextVerifiedClockFeast(rosary,"2026-10-13",id=>lowRankKing.get(id),
 resolvedClockFeasts(rosary,id=>lowRankKing.get(id),r=>r.day.main.id,r=>r.day.main.rank))?.date,
 "2026-11-01","A source-verified IV-class day may be skipped when finding the next I/II feast");
assert.match(renderUpcoming({cache:pendingKing,
 nextMajor:{date:kingCandidate.date,title:"Christ the King",verified:true}}),
 new RegExp('data-cal-clock-open-day="'+kingCandidate.date+'"'),
 "A canonical explicitly verified next observance may be displayed");

// Rank typography must not silently remove a confirmed I/II feast from the
// French wheel. III-class dates remain excluded even if source-resolved.
for(const [rank,tier] of [["I Class","principal"],["Classis I","principal"],
 ["Classe I","principal"],["1re classe","principal"],["première classe","principal"],
 ["II Class","significant"],["Classe II","significant"],["2e classe","significant"],
 ["deuxième classe","significant"],["Classe III",null]]){
 const marked=resolvedClockFeasts(rosary,id=>id==="2026-04-05"
   ?sourceDay("2026-04-05","White",rank):null,
   r=>r.day.main.id,r=>r.day.main.rank);
 assert.equal(marked.find(f=>f.date==="2026-04-05")?.tier||null,tier,
  "Source-confirmed 1962 class notation "+rank+" must produce the correct marker");
}

const knownClock=resolvedClockFeasts(rosary,id=>resolvedFixtures.get(id),r=>r.day.main.id,r=>r.day.main.rank);
assert.ok(knownClock.some(f=>f.date==="2026-04-05"),"Easter should be marked when resolved");
assert.equal(knownClock.find(f=>f.date==="2026-04-05")?.tier,"principal","Observed I-class rank must determine marker tier");
const displacedClock=resolvedClockFeasts(rosary,id=>{
 const row=resolvedFixtures.get(id);
 return id==="2026-04-05"?{...row,day:{main:{...row.day.main,rank:"IV Class"}}}:row;
},r=>r.day.main.id,r=>r.day.main.rank);
assert.ok(!displacedClock.some(f=>f.date==="2026-04-05"),
 "A projected first-class candidate cannot make a resolver-observed IV-class feria into a major feast");
assert.equal(resolvedClockFeasts(rosary,id=>resolvedFixtures.get(id),r=>r.day.main.id,
 r=>r.day.main.rank).filter(f=>f.date==="2026-04-05").length,1,
 "Do not duplicate the same observed Mass date when candidate dates overlap");
assert.ok(!knownClock.some(f=>f.date==="2025-12-25"),"Unresolved feasts cannot be displayed as confirmed");
const clockHtml=renderLiturgicalClock({year:rosary,selectedDate:"2026-10-07",todayDate:"2026-10-13",
 getDay:id=>resolvedFixtures.get(id),titleFor:r=>r.day.main.id,rankFor:r=>r.day.main.rank,massColourFor:()=> "Green"});
assert.equal((clockHtml.match(/data-cal-clock-season="/g)||[]).length,8,"One eight-sector wheel; no redundant season browser");
assert.doesNotMatch(clockHtml,/aoClockSeasonMenu|Browse seasons|Parcourir les temps/,
 "The wheel must not duplicate all seasons in a second navigation menu");
assert.match(liturgicalClockCss,/var\(--liturgical\)/,
 "Active Clock controls must follow the application's daily liturgical theme");
assert.match(liturgicalClockCss,/var\(--bg\)/,
 "Clock background must inherit the existing app canvas");
assert.match(liturgicalClockCss,/var\(--text\)/,
 "Clock text must inherit the app's contrast hierarchy");
assert.doesNotMatch(liturgicalClockCss,/#[\da-f]{3,8}\b/i,
 "The Year wheel must not introduce a competing hardcoded hex palette");
assert.match(liturgicalClockCss,/background:var\(--ao-surface-1,var\(--bg\)\)!important/,
 "Upcoming feast cards must inherit the daily application surface, not a fixed green-grey gradient");
assert.match(clockHtml,/data-cal-clock-feast="2026-04-05"/,"Resolved feast must have an interactive marker");
assert.match(clockHtml,/class="aoClockFeastMenu"/,
 "The small phone dial must have a separate full-size accessible feast chooser");
assert.match(clockHtml,/Feast dates/,
 "Verified celebrations must have one touch-friendly date list fallback");
assert.match(clockHtml,/<button type="button" data-cal-clock-feast="2026-04-05"/,
 "Verified feasts must remain selectable via a touch-sized list control");

assert.doesNotMatch(clockHtml,/data-cal-clock-feast="2025-12-25"/,"Unresolved feast must not have a fabricated marker");
assert.match(clockHtml,/data-cal-clock-open-day="2026-10-07"/,"Clock centre must open the selected date");
assert.doesNotMatch(clockHtml,/data-cal-clock-today/,
 "Return to today is unnecessary when already in the current liturgical year");
const otherYear=buildLiturgicalYear("2024-10-13");
const olderClock=renderLiturgicalClock({year:otherYear,selectedDate:"2024-10-13",todayDate:"2026-10-13"});
assert.match(olderClock,/data-cal-clock-today/,
 "Year navigation still needs one return-to-today action when browsing another year");
assert.doesNotMatch(clockHtml,/aoClockActions|Browse month|Browse this season|aoClockCoreSeason|aoClockCoreColour/,
 "Duplicate Year menus, season labels, colour labels and bottom navigation must be absent");
assert.doesNotMatch(clockHtml,/1962 day resolver|source resolution/i,
 "Liturgical year must not expose internal verification jargon in the user interface");
assert.match(clockHtml,/data-cal-clock-year="-1"/);
const selectedFeastClock=renderLiturgicalClock({year:rosary,selectedDate:"2026-04-05",todayDate:"2026-10-13",
 getDay:id=>resolvedFixtures.get(id),titleFor:r=>r.day.main.id,rankFor:r=>r.day.main.rank,
 selection:{type:"feast",date:"2026-04-05"}});
assert.match(selectedFeastClock,/data-cal-clock-open-day="2026-04-05"/);
const frenchClock=renderLiturgicalClock({year:rosary,selectedDate:"2026-10-07",todayDate:"2026-10-13",
 fr:true,getDay:id=>resolvedFixtures.get(id),titleFor:r=>r.day.main.id,selection:{type:"season",id:"advent"}});
assert.match(frenchClock,/TEMPS LITURGIQUE/,"French season details must be translated");
const frenchFeastMenu=renderLiturgicalClock({year:rosary,selectedDate:"2026-10-07",todayDate:"2026-10-13",
 fr:true,getDay:id=>resolvedFixtures.get(id),titleFor:r=>r.day.main.id,rankFor:r=>r.day.main.rank});
assert.match(frenchFeastMenu,/Dates des fêtes/,
 "The accessible verified-feast chooser must be bilingual");


// Holy Week is a dense 1962 run. Nearby verified celebrations must have ONE
// readable cluster marker and remain individually reachable in the drawer.
const holyDays=new Map([
 ["2026-04-02",sourceDay("2026-04-02","White","I Class")],
 ["2026-04-03",sourceDay("2026-04-03","Black","I Class")],
 ["2026-04-04",sourceDay("2026-04-04","Violet","I Class")],
 ["2026-04-05",sourceDay("2026-04-05","White","I Class")]
]);
const holyFeasts=resolvedClockFeasts(rosary,id=>holyDays.get(id),r=>r.day.main.id,r=>r.day.main.rank);
// Clustering is geometric only. A chain of consecutive observed Holy Week
// dates must not collapse Lent, Passiontide and Easter into one unselectable dot.
const allCandidateMarkers=clockCandidates(rosary).map(c=>({...c,title:c.en,tier:"principal"}));
const boundedClockClusters=clockMarkerClusters(allCandidateMarkers);
assert.equal(boundedClockClusters.reduce((n,g)=>n+g.length,0),allCandidateMarkers.length,
 "All candidate dates must survive cluster layout without dropping feasts");
assert.ok(boundedClockClusters.every(g=>g.length<=5&&
 (new Date(g.at(-1).date+"T12:00:00Z")-new Date(g[0].date+"T12:00:00Z"))/86400000<=4),
 "A visual feast cluster must span at most four days; no transitive Holy Week chain");
assert.ok(boundedClockClusters.filter(g=>g.some(f=>f.date>="2026-03-15"&&f.date<="2026-04-05")).length>=3,
 "Fourth Sunday of Lent through Easter Sunday must remain distinguishable clusters");
const holyClusters=clockMarkerClusters(holyFeasts);
assert.equal(holyFeasts.length,4,"Known Holy Week dates must resolve into four verified celebrations");
assert.equal(holyClusters.length,1,"Adjacent Holy Week markers must be grouped into one tap target");
assert.equal(holyClusters[0].length,4);
const holyHtml=renderLiturgicalClock({year:rosary,selectedDate:"2026-04-05",todayDate:"2026-10-13",
 getDay:id=>holyDays.get(id),titleFor:r=>r.day.main.id,rankFor:r=>r.day.main.rank,
 selection:{type:"cluster",date:"2026-04-02"}});
assert.match(holyHtml,/data-cal-clock-cluster="2026-04-02"/,"Crowded feasts need a group selector");
for(const iso of holyDays.keys())assert.match(holyHtml,new RegExp('data-cal-clock-feast="'+iso+'"'),
 "A clustered celebration must remain individually available from its detail");
assert.ok(!holyHtml.includes('<g data-cal-clock-feast="2026-04-02"'),
 "Clustered days should not draw overlapping individual outer dots");

// Source resolution arrives out of order. A cluster opened while only Apr 3–5
// are known must stay open if Apr 2 resolves later and becomes the first marker.
const partialHolyDays=new Map([...holyDays].filter(([date])=>date>="2026-04-03"));
const initialClusterHtml=renderLiturgicalClock({year:rosary,selectedDate:"2026-04-05",todayDate:"2026-10-13",
 getDay:id=>partialHolyDays.get(id),titleFor:r=>r.day.main.id,rankFor:r=>r.day.main.rank,
 selection:{type:"cluster",date:"2026-04-03"}});
assert.match(initialClusterHtml,/data-cal-clock-cluster="2026-04-03"/,
 "Partially resolved cluster should open from its first verified date");
const expandedClusterHtml=renderLiturgicalClock({year:rosary,selectedDate:"2026-04-05",todayDate:"2026-10-13",
 getDay:id=>holyDays.get(id),titleFor:r=>r.day.main.id,rankFor:r=>r.day.main.rank,
 selection:{type:"cluster",date:"2026-04-03"}});
assert.match(expandedClusterHtml,/data-cal-clock-cluster="2026-04-02"/,
 "Newly resolved earlier day must become the source-aligned cluster anchor");
assert.match(expandedClusterHtml,/data-cal-clock-cluster-members="2026-04-02,2026-04-03,2026-04-04,2026-04-05"/,
 "Cluster must expose source dates for stable keyboard focus restoration");
assert.match(expandedClusterHtml,/Adjacent major celebrations/,
 "A selected cluster must remain open even after its anchor date changes");
assert.match(expandedClusterHtml,/data-cal-clock-cluster="2026-04-02"[^>]*aria-pressed="true"/,
 "Regrouped source marker must remain visibly selected");
// A selected group may become an individual observed jewel after a resolver
// update. Never silently discard its detail just because the group disappeared.
const isolatedEaster=renderLiturgicalClock({year:rosary,selectedDate:"2026-04-05",todayDate:"2026-10-13",
 getDay:id=>id==="2026-04-05"?holyDays.get(id):null,
 titleFor:r=>r.day.main.id,rankFor:r=>r.day.main.rank,
 selection:{type:"cluster",date:"2026-04-05"}});
assert.match(isolatedEaster,/OBSERVED CELEBRATION/,
 "A formerly clustered source date must fall back to its individual observed-feast detail");
assert.match(isolatedEaster,/data-cal-clock-open-day="2026-04-05"/,
 "Source-confirmed singleton detail must still open the exact observed day");
assert.doesNotMatch(isolatedEaster,/Adjacent major celebrations/,
 "A one-day observed feast must not be presented as a multi-date cluster");

const yearHtml=renderYearJourney({year:rosary,selectedDate:"2026-10-07",formatDate:id=>id});
assert.equal((yearHtml.match(/data-cal-year-segment=/g)||[]).length,11,"Year track must render each period exactly once");
assert.equal((yearHtml.match(/data-cal-year-period=/g)||[]).length,11,"All 11 period cards must be selectable");
assert.equal((yearHtml.match(/class="aoCalYearDetail"[^>]*>/g)||[]).filter(x=>!x.includes(" hidden")).length,1,"Only the expanded period detail must be visible");
assert.match(yearHtml,/data-cal-year-open-day="2026-05-31"/,"Current period start day is computed from the year model");
assert.match(yearHtml,/data-cal-year-month="2026-05"/,"Current period month navigation must be grounded");
assert.match(yearHtml,/data-cal-year-stage="present"/,"Current period must be distinguished visually");
const yearFrench=renderYearJourney({year:rosary,selectedDate:"2026-10-07",fr:true,focusedPeriodId:"advent",formatDate:id=>id});
assert.match(yearFrench,/Ouvrir le premier jour/,"French period controls are not translated");
assert.match(yearFrench,/data-cal-year-open-day="2025-11-30"/,"Selecting a different period must change details");
const following=buildLiturgicalYear("2026-11-29");
assert.equal(yearSegmentGeometry(following).length,11,"Advent rollover must build a fresh year");
assert.equal(yearSegmentGeometry(following)[0].start,following.start,"Following liturgical year starts on new Advent");

// Independent normative rubrical boundaries: AAS 52 (1960), Rubricae generales nn. 72, 76–77, 119(a), 127(a).
// Do not conflate explanatory season colour with an actual resolved feast/Mass colour.
for(const year of [2024,2026,2027,2028,2035]){
 const jan06=buildLiturgicalYear(`${year}-01-06`).currentPeriod,jan13=buildLiturgicalYear(`${year}-01-13`).currentPeriod,jan14=buildLiturgicalYear(`${year}-01-14`).currentPeriod;
 assert.equal(jan06.id,"epiphany",`${year} January 6 season`);
 assert.equal(jan13.id,"epiphany",`${year} January 13 season`);
 assert.equal(jan13.color,"white",`${year} January 13 must not project green`);
 assert.equal(jan14.id,"after-epiphany",`${year} January 14 begins per annum`);
 assert.equal(jan14.color,"green",`${year} January 14 seasonal green`);
 const easter=buildLiturgicalYear(`${year}-04-01`).easter;
 const asc=addDaysIso(easter,39),before=addDaysIso(asc,-1),pent=addDaysIso(easter,49);
 assert.equal(buildLiturgicalYear(before).currentPeriod.id,"easter",`${year} Ascension vigil`);
 assert.equal(buildLiturgicalYear(asc).currentPeriod.id,"ascension",`${year} Ascension day`);
 assert.equal(buildLiturgicalYear(addDaysIso(pent,-1)).currentPeriod.id,"ascension",`${year} Pentecost vigil civil-date illustration`);
 assert.equal(buildLiturgicalYear(pent).currentPeriod.id,"pentecost",`${year} Pentecost begins octave`);
 assertContinuous(buildLiturgicalYear(asc));
}
assert.match(yearHtml,/data-cal-year-period="after-epiphany"/);
assert.match(yearHtml,/data-cal-year-period="ascension"/);
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
assert.equal(buildLiturgicalYear("2026-04-05").currentPeriod.days, 39);
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
assert.match(browser,/liturgicalClockCss/,"Calendar must ship responsive wheel styles");

/* Calendar controls inherit the active app theme.  Per-day Month markers
   retain their own source-resolved colour, not a global seasonal tint. */
assert.match(browser,/\.aoCalV2Tabs button\.active\{color:var\(--liturgical\);border-bottom-color:var\(--liturgical\)\}/,
 "Selected Calendar navigation must use the shared daily liturgical theme");
assert.match(browser,/\.aoCalV2MonthGrid button\.selected\{[^}]*box-shadow:inset 0 0 0 2px var\(--liturgical\)/,
 "The selected month date must use the shared theme accent");
assert.match(browser,/const accent=r\?liturgicalAccent\(r\):"var\(--muted\)"/,
 "Unresolved Month dates must use neutral theme markers, not invented liturgical colours");
assert.match(browser,/\.aoCalV2MonthGrid button\{[^}]*var\(--month-accent,var\(--liturgical\)\) 3%,var\(--ao-surface-1,var\(--bg\)\)/,
 "Each month cell must preserve its own verified daily colour on the neutral app surface");
assert.match(browser,/\.aoCalV2NextMajor\{[^}]*background:var\(--ao-surface-1,var\(--bg\)\)/,
 "Day upcoming-celebration cards must inherit the app surface");
assert.match(browser,/\.aoCalV2Primary\{[^}]*color-mix\(in srgb,var\(--liturgical\)/,
 "Day's Mass action must use the current liturgical accent");
assert.match(browser,/\.aoCalV2DirectJump input\{[^}]*background:var\(--ao-surface-1,var\(--bg\)\)/,
 "Month date input must inherit the app surface");
assert.match(browser,/\.aoCalV2TextLink\{[^}]*color:var\(--liturgical\)/,
 "Calendar text actions must use the shared liturgical accent");

assert.match(browser,/requestClockFeasts/,"Calendar must resolve bounded feast candidates");
assert.match(browser,/renderLiturgicalClock/,"Year must use the SVG Liturgical Clock");
assert.doesNotMatch(browser,/View the liturgical year|Voir l’année liturgique/,
 "Day must not repeat the already visible Year navigation");
assert.doesNotMatch(browser,/class="aoCalV2WeekShift"/,
 "Day must not add a second row of previous/next week navigation controls");
assert.doesNotMatch(browser,/Date-bound devotional context|Contexte dévotionnel lié à la date/,
 "Repeated technical practices introductions must not reappear");
assert.match(browser,/r.addEventListener\("change",event=>/,
 "Month filter must work with keyboard and pointer selection");

assert.match(browser,/data-cal-clock-feast/,"Feast markers must have real selection handling");
assert.match(browser,/data-cal-clock-season/,"Seasons must have real selection handling");
assert.match(browser,/data-cal-clock-browse/,"Wheel must hand off to Month without a parallel calendar");
assert.match(browser,/data-cal-clock-open-day/,"Wheel must hand off to Day");
assert.match(browser,/data-cal-clock-today/,"Wheel must provide a Today reset");
assert.match(browser,/data-cal-clock-year/,"Wheel must navigate liturgical years");
assert.ok(!browser.includes('data-cal-month-index-date="${x.date}" ${view==="sanctorale"'),"Sanctorale rows cannot intercept Day selection with saint-detail handler");
assert.ok(browser.includes('if(openMonth&&calendarView!=="picker")pickerMonthId='),"Year-to-Month route must reset stale month");
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
assert.match(browser, /data-cal-month-filter/, "Month must use one compact filter rather than five competing tab views");
assert.doesNotMatch(browser, /<nav class="aoCalMonthTabs"/,
 "Old five-tab Month index should not be mounted");
assert.match(browser, /\["practices",L\("Practices","Pratiques"\)\]/,
 "The single Month filter must retain Practices data");
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

// Reuse the one existing Calendar observance-title owner. A default selected
// Mass exists in pinned DayResolver output and must not suppress a day alias.
const {calendarObservanceAlias}=await import("../src/calendar/observance-title.js");
const observed=(date,id,extras={})=>({date,status:"ready",day:{main:{id,title:"Common formulary"},...extras}});
for(const [date,id] of [
  ["2024-02-03","commune:C10c:4:w"],
  ["2024-04-20","commune:C10Pasc:4:w"],
  ["2024-06-08","commune:C10t:4:w"],
  ["2027-01-02","commune:C10b:4:w"],
  ["2027-11-27","commune:C10t:4:w"],
]){
  assert.equal(calendarObservanceAlias(observed(date,id),"en"),"Blessed Virgin Mary on Saturday",date);
  assert.equal(calendarObservanceAlias(observed(date,id),"fr"),"Sainte Vierge Marie le samedi",date);
}
assert.equal(calendarObservanceAlias(observed("2024-06-09","commune:C10t:4:w")),null,"Common chosen outside Saturday is not automatically a Saturday office");
assert.equal(calendarObservanceAlias(observed("2024-06-08","commune:C10t:4:w",{selectedMassOption:{id:"auto"}}),"en"),"Blessed Virgin Mary on Saturday","Default Mass selection cannot suppress the day name");
assert.equal(calendarObservanceAlias(observed("2024-12-14","tempora:Adv2-6:3:v"),"en"),"Saturday after the Second Sunday of Advent");
assert.equal(calendarObservanceAlias(observed("2024-12-14","tempora:Adv2-6:3:v"),"fr"),"Samedi après le deuxième dimanche de l’Avent");
assert.equal(calendarObservanceAlias(observed("2024-10-27","sancti:10-DU:1:w")),null,"Do not hide Christ the King commemoration in a Calendar alias");
assert.equal(calendarObservanceAlias({status:"failed"}),null,"Do not invent a title for unresolved date");

console.log("Calendar liturgical-year model, intelligence projection and v2 presentation contract: OK");
