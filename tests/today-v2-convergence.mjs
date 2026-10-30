import assert from "node:assert/strict";
import { buildTodayV2Sections, renderTodayV2Sections } from "../src/home/today-v2-sections.js";
import { renderHomeToString as renderApprovedHomeToString } from "../src/home/presentation.js";
const renderHomeToString=(state,win={})=>renderApprovedHomeToString(state,{
  ...win,location:{search:"?aoTodayH4=0"}
});
import { TODAY_V2_CSS } from "../src/home/today-v2-styles.js";

const selectedDate="2026-10-10";
const state={route:"home",selectedDate,language:"en",resolving:false,resolution:{
  date:selectedDate,status:"ready",colourPlan:{label:"White"},
  day:{main:{id:"sancti:10-10:1",title:"Saint Francis Borgia",rank:"III class",color:"White"}},
  proper:{status:"ready",data:{name:"Saint Francis Borgia",rank:"III class",
    gospel:{en:"Luke 12:35\\nLet your loins be girded."}}},
}};
const vm={dateIso:selectedDate,language:"en",celebration:"Saint Francis Borgia",
  gospelReference:"Luke 12:35",gospelStatus:"ready",properStatus:"ready",gospelExcerpt:"Let your loins be girded."};
const sample={visible:true,comingUp:{rows:[{id:"angelus.noon",kind:"route",route:"pray.angelus_regina",
  when:"Noon",title:"Angelus",sub:"Pause around midday"}]},
  dailyCatechism:{title:"Daily Catechism",description:"Continue today's lesson",badge:"2/10"}};
const projection=buildTodayV2Sections(state,vm,sample);
assert.equal(projection.period.id,"after-pentecost");
assert.equal(projection.saintOrFeast,"Saint Francis Borgia");
assert.equal(buildTodayV2Sections({...state,resolution:{...state.resolution,date:undefined}},vm,sample).saintOrFeast,
  "Saint Francis Borgia","A date-less canonical resolver result must still show the observed feast");
assert.equal(buildTodayV2Sections({...state,resolving:true},vm,sample).saintOrFeast,null,
  "Never display an old saint while a selection is resolving");
assert.equal(buildTodayV2Sections({...state,resolution:{...state.resolution,date:"2026-10-09"}},vm,sample).saintOrFeast,null,
  "Explicit date mismatch must suppress stale observed feast");
assert.deepEqual(projection.upcoming.map(x=>x.date),["2026-10-25","2026-11-01"]);
const html=renderTodayV2Sections(projection,vm);
for(const cls of ["aoTodayV2CalendarGlance","aoTodayV2PrayNow","aoTodayV2ReadReflect"]){
  assert.match(html,new RegExp(cls),"Missing uploaded frontispiece's "+cls+" component");
}
for(const route of ["pray.angelus_regina","pray.rosary","pray.confession","pray.adoration"])
  assert.ok(html.includes('data-home-cu-route="'+route+'"'),"Noncanonical or missing Pray route: "+route);
assert.doesNotMatch(html,/data-home-daily-catechism/,"Catechism remains in Learn, not Today");
assert.match(html,/class="aoTodayV2DiscoveryStandalone"/,"Did You Know has a standalone section");
assert.match(html,/data-home-dyk-open/,"Did You Know must be linked to its source");
assert.ok(html.indexOf('class="aoTodayV2CalendarGlance') <
  html.indexOf('class="aoTodayV2DiscoveryStandalone"') &&
  html.indexOf('class="aoTodayV2DiscoveryStandalone"') <
  html.indexOf('class="aoTodayV2Below"'),
  "Did You Know follows the week, before Read");
const emptyRule=buildTodayV2Sections(state,vm,{
  visible:true,
  comingUp:{rows:[sample.comingUp.rows[0],{id:"static.none",kind:"all",title:"Daily Rule"}]},
  dailyCatechism:sample.dailyCatechism,
});
assert.doesNotMatch(renderTodayV2Sections(emptyRule,vm),/data-home-cu-static="static.none"/,
  "No Daily Rule item must not create an inert static action");
const realRule=buildTodayV2Sections(state,vm,{
  visible:true,
  comingUp:{rows:[sample.comingUp.rows[0],{id:"rosary",kind:"static",title:"Rosary",role:"Daily"}]},
  dailyCatechism:sample.dailyCatechism,
});
assert.match(renderTodayV2Sections(realRule,vm),/data-home-cu-static="rosary"/,
  "A configured Daily Rule item must retain its canonical action");
assert.ok(html.indexOf("aoTodayV2PrayNow")<html.indexOf("aoTodayV2CalendarGlance"),"Prayer through the day precedes calendar context");
assert.match(html,/data-home-scripture/);
assert.match(html,/data-action="gospel"/);
assert.doesNotMatch(html,/data-home-calendar-view="year"/,"Liturgical season year link belongs only in the hero");
assert.doesNotMatch(html,/data-home-calendar-view="picker"/,"Month tab replaces duplicate Coming next CTA");
assert.match(html,/data-home-calendar-date="2026-10-25"/);
assert.match(html,/data-home-calendar-date="2026-11-01"/);
assert.match(html,/Life &amp; sources/,"Observed saint opens context without repeating feast identity");
assert.doesNotMatch(html,/Saint Francis Borgia/,"Do not repeat principal saint below the hero");
assert.equal((html.match(/class="aoTodayV2CalendarGlance(?:\s[^"]*)?"/g)||[]).length,1,"One compact Calendar at a glance panel");
assert.doesNotMatch(html,/aoTodayV2Context|aoTodayV2Approaching|Coming next|Full calendar/,"No duplicate season or upcoming panels");
assert.match(html,/Upcoming dates are calendar appointments; verify the observed 1962 day in Calendar\./);
assert.match(html,/class="aoTodayV2EventArrow"/,"H2 agenda rows require a clear destination");
assert.doesNotMatch(html,/data-home-shortcut="/,
  "Unbound home-shortcut attributes would produce inert buttons");
assert.equal((html.match(/class="aoTodayV2PrayerFeature"/g)||[]).length,1);
assert.equal((html.match(/class="aoTodayV2PrayerShortcuts"/g)||[]).length,1);
assert.equal((html.match(/class="aoTodayV2Event(?:\s[^"]*)?"/g)||[]).length,2);
assert.equal((html.match(/class="aoTodayV2GlanceEvents"/g)||[]).length,1);
const offDate=buildTodayV2Sections({...state,resolution:{status:"failed"}},vm,{visible:false});
const unknownHtml=renderTodayV2Sections(offDate,vm);
assert.doesNotMatch(unknownHtml,/Saint Francis Borgia/);
assert.match(unknownHtml,/pray.library/);
assert.match(unknownHtml,/Calendar day &amp; sources/);
assert.doesNotMatch(unknownHtml,/Life & sources/,"Failed resolution must not claim an observed saint");
const temporaState={...state,resolution:{...state.resolution,day:{main:{id:"tempora:Pent19-6:4:g",rank:"IV",title:"Saturday after Pentecost"}}}};
const temporaHtml=renderTodayV2Sections(buildTodayV2Sections(temporaState,vm,sample),vm);
assert.match(temporaHtml,/About this celebration/,"Non-sanctoral observances keep a generic Day details link");
assert.doesNotMatch(temporaHtml,/Life & sources/);
assert.match(unknownHtml,/data-home-calendar-view="day"/);
const frvm={...vm,language:"fr"};
const frHtml=renderTodayV2Sections(buildTodayV2Sections({...state,language:"fr"},frvm,sample),frvm);
assert.match(frHtml,/Prier au fil du jour/);
assert.match(frHtml,/Lire et méditer/);
assert.match(frHtml,/calendrier/i);
assert.match(frHtml,/Vie et sources/,"The saint link must be bilingual");
assert.doesNotMatch(frHtml,/COMING SOON|<h2>À venir<\/h2>/,"French Home has no second Coming next heading");
assert.match(frHtml,/Dates annoncées par le calendrier/);
assert.match(frHtml,/25 oct./i);
const primary=renderHomeToString(state,{AO_PHASE1_ART:{homeMarkup(){return ""}}});
assert.match(primary,/aoTodayV2NoArt/,"No approved artwork must preserve a source-safe visual fallback");
assert.match(primary,/data-home-mass-entry/,"Idle Home must open canonical Mass");
assert.equal((primary.match(/data-home-mass-entry/g)||[]).length,1);
assert.equal((primary.match(/aoTodayV2PrayNow/g)||[]).length,1);
assert.equal((primary.match(/class="aoTodayV2Event(?:\s[^"]*)?"/g)||[]).length,2,"Upcoming leads must be date-specific");
assert.equal((primary.match(/class="aoTodayV2SeasonMicro"/g)||[]).length,1,"Liturgical season belongs once in hero");
assert.equal((primary.match(/class="aoTodayV2CalendarGlance(?:\s[^"]*)?"/g)||[]).length,1,"Only one Calendar at a glance card");
assert.doesNotMatch(primary,/class="contentCard gospelCard/);
assert.doesNotMatch(primary,/class="contentCard findCard/);
assert.doesNotMatch(primary,/aoHomeComingUp/);
assert.equal((primary.match(/data-home-scripture/g)||[]).length,1,"Scripture must retain one compact native entry without duplicate cards");
assert.doesNotMatch(primary,/data-resume-mass/);
assert.match(TODAY_V2_CSS,/\.aoTodayV2Frontispiece \.aoTodayV2Art::after\{display:none!important\}/,"H1.2 image island should have no title veil");
assert.ok(TODAY_V2_CSS.includes('html[data-ao-appearance-v1="light"] .aoTodayV2ArtMissing .aoTodayV2Art::after'),"Light no-art hero must not retain a dark veil under dark text");
assert.ok(TODAY_V2_CSS.includes('html[data-ao-appearance-v1="light"] .aoTodayV2Frontispiece:not(.aoTodayV2ArtMissing) .aoTodayV2ArtOverlay h1'),"Approved artwork keeps light foreground text in either theme");
assert.match(TODAY_V2_CSS, /@media\(max-width:699px\)\{\s*\.aoTodayV2ArtMissing \.aoTodayV2Art\{height:clamp\(138px,36vw,175px\)!important/,
  "Compact no-art fallback is strictly phone-scoped, leaving desktop layout unchanged");
assert.match(TODAY_V2_CSS, /\.aoTodayV2ArtMissing \.aoTodayV2Art\{height:clamp\(138px,36vw,175px\)!important/,
  "No-art celebration fallback must be compact instead of reserving a large blank painting");
assert.match(TODAY_V2_CSS, /\.aoTodayV2Art\{position:relative;height:clamp\(235px,67vw,355px\)/,
  "Approved sacred artwork must retain the immersive original hero");
console.log("PASS Today v2 lower-half: one prayer, sourced calendar leads, canonically routed reading, no duplicate cards");
