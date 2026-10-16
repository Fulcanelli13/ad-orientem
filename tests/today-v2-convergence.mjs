import assert from "node:assert/strict";
import { buildTodayV2Sections, renderTodayV2Sections } from "../src/home/today-v2-sections.js";
import { renderHomeToString } from "../src/home/presentation.js";
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
for(const cls of ["aoTodayV2Context","aoTodayV2PrayNow","aoTodayV2ReadReflect","aoTodayV2Approaching"]){
  assert.match(html,new RegExp(cls),"Missing uploaded frontispiece's "+cls+" component");
}
for(const route of ["pray.angelus_regina","pray.rosary","pray.confession","pray.adoration"])
  assert.ok(html.includes('data-home-cu-route="'+route+'"'),"Noncanonical or missing Pray route: "+route);
assert.match(html,/data-home-daily-catechism/);
assert.match(html,/data-home-scripture/);
assert.match(html,/data-action="gospel"/);
assert.match(html,/data-home-calendar-view="year"/);
assert.match(html,/data-home-calendar-view="picker"/);
assert.match(html,/data-home-calendar-date="2026-10-25"/);
assert.match(html,/data-home-calendar-date="2026-11-01"/);
assert.match(html,/Life & sources/,"Observed saint must open context rather than repeat the hero title");
assert.doesNotMatch(html,/Saint Francis Borgia/,"Do not repeat the principal saint's name below the hero");
assert.equal((html.match(/data-home-calendar-view="year"/g)||[]).length,1,"One liturgical season Year entry");
assert.equal((html.match(/data-home-calendar-view="picker"/g)||[]).length,1,"Only the Coming next section links to Month");
assert.equal((html.match(/class="aoTodayV2Context"/g)||[]).length,1);
assert.doesNotMatch(html,/COMING SOON/,"Upcoming celebrations must not be repeated in the season bar");
assert.match(html,/Coming next/,"Preserve the upcoming list and its date-specific navigation");
assert.match(html,/Calendar date · verify observance in Calendar/,
  "Future candidates must not be described as resolved liturgical Masses");
assert.doesNotMatch(html,/data-home-shortcut="/,
  "Unbound home-shortcut attributes would produce inert buttons");
assert.equal((html.match(/class="aoTodayV2PrayerFeature"/g)||[]).length,1);
assert.equal((html.match(/class="aoTodayV2PrayerShortcuts"/g)||[]).length,1);
assert.equal((html.match(/class="aoTodayV2Event"/g)||[]).length,2);
const offDate=buildTodayV2Sections({...state,resolution:{status:"failed"}},vm,{visible:false});
const unknownHtml=renderTodayV2Sections(offDate,vm);
assert.doesNotMatch(unknownHtml,/Saint Francis Borgia/);
assert.match(unknownHtml,/pray.library/);
assert.match(unknownHtml,/Calendar day & sources/);
assert.doesNotMatch(unknownHtml,/Life & sources/,"Failed resolution must not claim an observed saint");
const temporaState={...state,resolution:{...state.resolution,day:{main:{id:"tempora:Pent19-6:4:g",rank:"IV",title:"Saturday after Pentecost"}}}};
const temporaHtml=renderTodayV2Sections(buildTodayV2Sections(temporaState,vm,sample),vm);
assert.match(temporaHtml,/About this celebration/,"Non-sanctoral observances keep a generic Day details link");
assert.doesNotMatch(temporaHtml,/Life & sources/);
assert.match(unknownHtml,/data-home-calendar-view="day"/);
const frvm={...vm,language:"fr"};
const frHtml=renderTodayV2Sections(buildTodayV2Sections({...state,language:"fr"},frvm,sample),frvm);
assert.match(frHtml,/Prier maintenant/);
assert.match(frHtml,/Lire et méditer/);
assert.match(frHtml,/Calendrier/);
assert.match(frHtml,/Vie et sources/,"The saint link must be bilingual");
assert.doesNotMatch(frHtml,/COMING SOON|À VENIR<\/small>/,"French context must not duplicate the upcoming list");
assert.match(frHtml,/À venir/);
assert.match(frHtml,/25 oct./i);
const primary=renderHomeToString(state,{AO_PHASE1_ART:{homeMarkup(){return ""}}});
assert.match(primary,/aoTodayV2NoArt/,"No approved artwork must preserve a source-safe visual fallback");
assert.match(primary,/data-home-mass-entry/,"Idle Home must open canonical Mass");
assert.equal((primary.match(/data-home-mass-entry/g)||[]).length,1);
assert.equal((primary.match(/aoTodayV2PrayNow/g)||[]).length,1);
assert.equal((primary.match(/class="aoTodayV2Event"/g)||[]).length,2,"Upcoming leads must be date-specific");
assert.equal((primary.match(/class="aoTodayV2Context"/g)||[]).length,1,"Only one season bar should remain");
assert.doesNotMatch(primary,/class="contentCard gospelCard/);
assert.doesNotMatch(primary,/class="contentCard findCard/);
assert.doesNotMatch(primary,/aoHomeComingUp/);
assert.equal((primary.match(/data-home-scripture/g)||[]).length,1,"Scripture must retain one compact native entry without duplicate cards");
assert.doesNotMatch(primary,/data-resume-mass/);
assert.match(TODAY_V2_CSS, /@media\(max-width:699px\)\{\s*\.aoTodayV2ArtMissing \.aoTodayV2Art\{height:clamp\(138px,36vw,175px\)!important/,
  "Compact no-art fallback is strictly phone-scoped, leaving desktop layout unchanged");
assert.match(TODAY_V2_CSS, /\.aoTodayV2ArtMissing \.aoTodayV2Art\{height:clamp\(138px,36vw,175px\)!important/,
  "No-art celebration fallback must be compact instead of reserving a large blank painting");
assert.match(TODAY_V2_CSS, /\.aoTodayV2Art\{position:relative;height:clamp\(235px,67vw,355px\)/,
  "Approved sacred artwork must retain the immersive original hero");
console.log("PASS Today v2 lower-half: one prayer, sourced calendar leads, canonically routed reading, no duplicate cards");
