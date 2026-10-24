import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {SEASONAL_CUSTOMS_PILOT,homeSeasonalCustomForDate,seasonalCustomsPilotCoverage} from "../src/customs/seasonal-home-spotlight.js";
import {calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS} from "../src/calendar/customs-read-model.js";
import {v384Dates} from "../src/calendar/traditional-year-v384.js";
import {buildLiturgicalYear,addDaysIso} from "../src/calendar/liturgical-year.js";
import {renderTodayV2Sections,buildTodayV2Sections} from "../src/home/today-v2-sections.js";
import {TODAY_V2_CSS} from "../src/home/today-v2-styles.js";
const base=JSON.parse(readFileSync("data/customs/customs-atlas-seed.v1.json","utf8"));
const accepted=new Set(base.customs.filter(c=>c.publication_state==="PUBLISHED").map(c=>c.custom_id));
const info=seasonalCustomsPilotCoverage(),ids=new Set();
assert.equal(accepted.size,35);
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,35);
assert.equal(SEASONAL_CUSTOMS_PILOT.length,20);
assert.equal(info.total,20);
assert.equal(info.homeEligible,13);
assert.equal(info.allIdsPublished,true);
assert.equal(info.noCountryFilter,true);
for(const row of SEASONAL_CUSTOMS_PILOT){
 assert.ok(!ids.has(row.id),"Duplicate pilot ID");ids.add(row.id);
 assert.ok(accepted.has(row.id),"Pilot cannot include an unpublished candidate: "+row.id);
 const article=calendarCustomArticle(row.id);
 assert.ok(article?.title?.en && article?.title?.fr && article?.sources?.length);
 assert.ok(row.before>=0 && row.before<=7);
 assert.ok(row.score>0 && row.score<=100);
 assert.ok(["FIXED","MOVABLE","FIRST_ADVENT","ROGATIONS","SACRED_HEART"].includes(row.rule));
}
const on=date=>homeSeasonalCustomForDate(date)?.id??null;
for(const year of [2026,2027,2030]){
 const calendar=v384Dates(year);
 const adventStart=addDaysIso(buildLiturgicalYear(year+"-11-15").end,1);
 assert.equal(on(addDaysIso(adventStart,-7)),"ADVT-001");
 assert.equal(on(addDaysIso(adventStart,-8)),null);
 assert.equal(on(year+"-02-02"),"DOM-011");
 assert.equal(on(year+"-02-03"),"BLSS-001");
 assert.equal(on(calendar.palm),"DOM-013");
 assert.equal(on(calendar.holyThursday),"HTHU-001");
 assert.equal(on(calendar.holySaturday),"BLSS-004");
 assert.equal(on(year+"-05-01"),"DEV-001");
 assert.equal(on(year+"-11-02"),"DEAD-001");
 const rogStart=calendar.minorRog[0];
 assert.equal(on(rogStart),"ROGA-001");
 const sacredHeart=addDaysIso(calendar.corpus,8);
 assert.equal(on(sacredHeart),"DOM-006");
}
for(const bad of ["bad-date","","2026-13-01","2026-02-30","2026-99-99",null]){
 assert.equal(homeSeasonalCustomForDate(bad),null,"Invalid input must be safe: "+bad);
}
assert.equal(on("2026-09-16"),null,"No filler card required on ordinary days");
const model=buildTodayV2Sections({},{
 dateIso:"2026-02-02",language:"en",
 celebration:"Purification of the Blessed Virgin Mary",gospelReference:null,properStatus:"ready"
},{visible:false});
assert.equal(model.spotlight?.id,"DOM-011");
const english=renderTodayV2Sections(model,{dateIso:"2026-02-02"});
assert.match(english,/data-home-custom-spotlight="DOM-011"/);
assert.match(english,/Keeping blessed Candlemas candles at home/);
assert.match(english,/Discover the tradition/);
assert.match(english,/data-home-calendar-date="2026-02-02"/);
assert.match(english,/target="_blank" rel="noopener noreferrer"/);
assert.ok(!english.includes("data-home-customs-atlas"));
const french=renderTodayV2Sections({...model,language:"fr"},{dateIso:"2026-02-02"});
assert.match(french,/Conserver les cierges bénits de la Chandeleur/);
assert.match(french,/Découvrir la coutume/);
assert.match(french,/data-home-custom-spotlight="DOM-011"/);
const blank=renderTodayV2Sections({...model,spotlight:null},{dateIso:"2026-02-02"});
assert.ok(!blank.includes("aoTodayV2CustomSpotlight"));
assert.match(TODAY_V2_CSS,/aoTodayV2CustomSpotlight/);
assert.match(TODAY_V2_CSS,/:focus-visible/);
const home=readFileSync("src/home/presentation.js","utf8");
assert.ok(!home.includes("data-home-customs-atlas"));
assert.match(home,/Traditions through the year/);
assert.match(home,/Read customs and their sources in Calendar/);
const page=readFileSync("src/home/today-v2-sections.js","utf8");
assert.match(page,/renderSeasonalCustomsSpotlight\(spotlight,language\)/);
assert.match(page,/homeSeasonalCustomForDate\(selected\)/);
console.log("PASS Customs year-led Home: 20 published, 13 eligible, one timely card, 1962 dates, EN/FR, no Atlas, no daily filler or research leakage.");