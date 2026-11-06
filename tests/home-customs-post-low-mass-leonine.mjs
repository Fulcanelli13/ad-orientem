import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { homeFirstMonthlyObservancesForDate, renderHomeFirstMonthlyObservances } from "../src/home/home-first-monthly-observances.js";
import { homeSeasonalCustomForDate, homeSeasonalCustomsForDate } from "../src/customs/seasonal-home-spotlight.js";
import { buildTodayV2Sections } from "../src/home/today-v2-sections.js";
import { h4HomeView } from "../src/home/today-h4-view.js";
import { postLowMassLeonineEligible, postLowMassLeonineSections, ICKSP_LOW_MASS_BOOKLET } from "../src/mass/reader-post-low-mass.js";
import { PRAY_CANONICAL_DATA_V435930 } from "../src/pray/canonical-data.js";

const nov6=homeFirstMonthlyObservancesForDate("2026-11-06");
assert.deepEqual(nov6.map(x=>[x.id,x.date,x.daysUntil]),[
 ["FIRST_FRIDAY","2026-11-06",0],
 ["FIRST_SATURDAY","2026-11-07",1]
],"This year's first Friday and first Saturday must be shown together");
assert.deepEqual(homeFirstMonthlyObservancesForDate("2026-11-07").map(x=>x.id),["FIRST_SATURDAY"]);
assert.deepEqual(homeFirstMonthlyObservancesForDate("2026-11-08"),[]);
assert.deepEqual(homeFirstMonthlyObservancesForDate("2026-10-31").map(x=>x.id),["FIRST_FRIDAY","FIRST_SATURDAY"]);
assert.deepEqual(homeFirstMonthlyObservancesForDate("2027-01-01").map(x=>[x.id,x.daysUntil]),[
 ["FIRST_FRIDAY",0],["FIRST_SATURDAY",1]
]);
for(const bad of ["","2026-02-30","2026-13-01","tomorrow",null])
 assert.equal(homeFirstMonthlyObservancesForDate(bad).length,0);
const monthHtml=renderHomeFirstMonthlyObservances(nov6,"en");
assert.match(monthHtml,/data-home-monthly-route="programme.first_friday"/);
assert.match(monthHtml,/data-home-monthly-route="programme.first_saturday"/);
assert.match(renderHomeFirstMonthlyObservances(nov6,"fr"),/Premier vendredi/);

const nov2=homeSeasonalCustomsForDate("2026-11-02");
assert.ok(nov2.length>=2,"All Souls can expose multiple sourced customs");
assert.equal(nov2[0].id,homeSeasonalCustomForDate("2026-11-02")?.id,"Existing one-feature priority preserved");
assert.ok(nov2.every(x=>x.article?.sources?.length),"Only approved published customs");

const vm={
 dateIso:"2026-11-06",language:"en",formularies:[],week:[],weekday:"Friday",
 dateTitle:"6 November",observedTitle:"Feria",rank:"IV Class",colour:"green",
 isToday:true,massIntroit:"",resolvedForSelection:false,properStatus:"idle",loading:false
};
const model=buildTodayV2Sections({},vm,{visible:false});
const html=h4HomeView(vm,model);
assert.match(html,/data-home-monthly-route="programme.first_friday"/);
assert.match(html,/data-home-monthly-route="programme.first_saturday"/);
assert.ok(html.indexOf("FIRST_FRIDAY")<0,"Home exposes an ordinary card, not internal programme IDs");
assert.match(readFileSync("src/home/browser-entry.js","utf8"),/ensurePrayReader\(\{win\}\)/);
assert.match(readFileSync("src/home/browser-entry.js","utf8"),/data-home-monthly-route/);

const prepared={
 session:{plan:{kind:"MASS",followingGraphs:[],overlayGraphs:[]},resolvedMass:{form:"LOW",followingActions:[],overlays:[]}},
 readerPreferences:{language:"en"}
};
const finished={cardTitle:"Last Gospel · The Word Made Flesh"};
assert.equal(postLowMassLeonineEligible(prepared,finished,"LIVE"),true);
assert.equal(postLowMassLeonineEligible(prepared,{cardTitle:"Last Gospel · Prologue of St John"},"LIVE"),false);
assert.equal(postLowMassLeonineEligible(prepared,{cardTitle:"Last Gospel"},"MISSAL"),true);
assert.equal(postLowMassLeonineEligible({...prepared,session:{...prepared.session,resolvedMass:{...prepared.session.resolvedMass,form:"SOLEMN"}}},finished,"LIVE"),false);
assert.equal(postLowMassLeonineEligible({...prepared,session:{...prepared.session,resolvedMass:{...prepared.session.resolvedMass,form:"MISSA_CANTATA_SIMPLE"}}},finished,"LIVE"),false);
assert.equal(postLowMassLeonineEligible({...prepared,session:{...prepared.session,plan:{...prepared.session.plan,followingGraphs:["REQUIEM_ABSOLUTION"]}}},finished,"LIVE"),false);
assert.equal(postLowMassLeonineEligible({...prepared,session:{...prepared.session,plan:{...prepared.session.plan,overlayGraphs:["NUPTIAL"]}}},finished,"LIVE"),false);
assert.equal(postLowMassLeonineEligible({...prepared,session:{...prepared.session,plan:{kind:"GOOD_FRIDAY",followingGraphs:[],overlayGraphs:[]}}},finished,"LIVE"),false);
const en=postLowMassLeonineSections("en"),fr=postLowMassLeonineSections("fr");
assert.equal(en.length,5);
assert.equal(fr.length,5);
assert.match(en[0].latin[0].text,/Ave Maria/);
assert.match(fr[1].vernacular.map(x=>x.text).join(" "),/Salut, ô Reine/);
assert.match(en[3].latin[0].text,/Sancte Michael/);
assert.match(en[4].latin[0].text,/Cor Iesu/);
assert.ok(en.every(x=>x.latin.length&&x.vernacular.length));
assert.match(PRAY_CANONICAL_DATA_V435930.prayers.mass_devotion_leonine.en,/Most Sacred Heart/);
assert.match(ICKSP_LOW_MASS_BOOKLET,/icksp\.org\.uk/);
assert.match(readFileSync("src/mass/reader-dom.js","utf8"),/syncPostLowMassLeoninePrayers\(root,prepared,current,mode\)/);
console.log("PASS: H4 monthly devotions, concurrent customs and 5 ICKSP Leonine blocks after qualifying Low Mass only.");
