import assert from "node:assert/strict";
import {h4Enabled,h4HomeView,verifiedH4WeekColour} from "../src/home/today-h4-view.js";
import {h4ChoicesMarkup,rememberH4Choices} from "../src/home/today-h4-change-sheet.js";
import {createSettingsDonorState} from "../src/settings/donor-state.js";
import {renderSettingsToString} from "../src/settings/presentation.js";
import {buildHomeViewModel} from "../src/home/presentation.js";
assert.equal(h4Enabled({location:{search:""}}),true,"Approved H4 must be the default Home");
assert.equal(h4Enabled({location:{search:"?aoTodayH4=1"}}),true,"H4 explicit route remains valid");
assert.equal(h4Enabled({location:{search:"?aoTodayH4=0"}}),false,"Temporary rollback must retain old Today");
const model={
 enricherVisible:true,feature:{id:"angelus.evening",kind:"route",role:"Next",title:"Angelus",
    sub:"Sanctify the evening hour",route:"pray.angelus_regina",due:1080},
 enricherRule:{id:"rosary",kind:"static"},upcoming:[
  {date:"2026-11-01",en:"All Saints",fr:"Toussaint"},
  {date:"2026-11-02",en:"All Souls",fr:"Commémoration des fidèles défunts"}],
 spotlight:null,gospelReference:"Matthew 22:15–21",daily:{title:"Daily Catechism",description:"Ten questions"}
};
const vm={
 language:"en",dateIso:"2026-10-30",isToday:true,dateTitle:"Friday 30 October",
 week:Array.from({length:7},(_,i)=>({date:"2026-10-"+String(25+i).padStart(2,"0"),day:"Fri",number:String(25+i),selected:i===5,today:i===5})),
 rank:"IV class",colour:"Green",observedTitle:"Feria",massFormularyName:"Mass of the 22nd Sunday after Pentecost",
 massIntroit:"Si iniquitátes observáveris",properStatus:"ready",resolvedForSelection:true,loading:false
};
// A source-matched feria may show its verified weekday context even when
// the Proper's generic title is only "Feria". A Psalm reference is never
// the Latin Introit incipit.
const sourceState={language:"en",selectedDate:"2026-10-30",resolving:false,
  resolution:{status:"ready",date:"2026-10-30",
    day:{main:{id:":feria:4:g",title:"Feria",rank:4,color:"Green"},
      tempora:[{id:"tempora:Pent22-5:4:g"}]},
    proper:{status:"ready",data:{name:"Feria",sourcePath:"Tempora/Pent22-5",
      introit:{lat:"Ps 129:3-4\nSi iniquitátes observáveris, Dómine, Dómine, quis sustinébit?"}}}}};
const sourceVM=buildHomeViewModel(sourceState,{});
assert.match(sourceVM.contextualObservanceName,/Friday after the Twenty-second Sunday after Pentecost/);
assert.match(sourceVM.massIntroit,/^Si iniquitátes observáveris/);
assert.doesNotMatch(sourceVM.massIntroit,/^Ps /);
assert.equal(sourceVM.massFormularyName,null,
  "Feria's weekday source alone is NOT proof of the inherited Sunday Mass");
const inherited={...sourceState,resolution:{...sourceState.resolution,
  proper:{...sourceState.resolution.proper,data:{
    ...sourceState.resolution.proper.data,sourcePath:"Tempora/Pent22-0"}}}};
const inheritedVm=buildHomeViewModel(inherited,{});
assert.equal(inheritedVm.observedTitle,"Feria","Keep IV-class observed celebration");
assert.equal(inheritedVm.massFormularyName,"Mass of the 22nd Sunday after Pentecost",
  "Only canonical inherited Sunday Proper may name the formulary");
assert.match(h4HomeView({...inheritedVm,week:vm.week},model),
  /Mass of the 22nd Sunday after Pentecost/,
  "Actual Sunday formulary must be present in Mass door");
const inheritedFr=buildHomeViewModel({...inherited,language:"fr"},{});
assert.equal(inheritedFr.massFormularyName,"Messe du vingt-deuxième dimanche après la Pentecôte");
const mismatched=buildHomeViewModel({...inherited,resolution:{
  ...inherited.resolution,proper:{status:"ready",data:{
    ...inherited.resolution.proper.data,sourcePath:"Tempora/Pent23-0"}}}},{});
assert.equal(mismatched.massFormularyName,null,
  "Never infer a different inherited Sunday from the week label");
const sourceHtml=h4HomeView({...sourceVM,week:vm.week},model);
assert.match(sourceHtml,/Friday after the Twenty-second Sunday after Pentecost/);
assert.match(sourceHtml,/Si iniquitátes observáveris/);
const unrelated=buildHomeViewModel({...sourceState,resolution:{...sourceState.resolution,
  day:{main:{id:"sancti:10-30:4:w",title:"St Example",rank:4,color:"White"},tempora:[]}}},{});
assert.equal(unrelated.contextualObservanceName,null,"No invented weekday context for a saint");
const html=h4HomeView(vm,model);
assert.match(html,/Friday 30 October/);
assert.match(html,/Mass of the 22nd Sunday after Pentecost/);
assert.match(html,/Si iniquitátes observáveris/);
assert.equal((html.match(/data-home-week-colour=/g)||[]).length,7,"All days must have independent colour slots");
const resolved={status:"ready",date:"2026-10-30",day:{main:{id:"temporale:green",color:"Green"}},
  colourPlan:{massColor:"Green"},proper:{status:"ready",data:{color:"Green"}}};
assert.equal(verifiedH4WeekColour(resolved,"2026-10-30"),"#62a473","Canonical green Mass");
assert.equal(verifiedH4WeekColour({...resolved,date:"2026-10-31"},"2026-10-30"),null,"No stale-day colour");
assert.equal(verifiedH4WeekColour({...resolved,status:"failed"},"2026-10-30"),null,"No failed-day colour");
assert.equal(verifiedH4WeekColour({...resolved,colourPlan:{massColor:"unknown"},proper:{data:{color:"unknown"}},day:{main:{color:"unknown"}}},"2026-10-30"),null,"Never infer unknown colour");
assert.equal(verifiedH4WeekColour({...resolved,colourPlan:{massColor:"White"}},"2026-10-30"),"#e9e0c9","Use canonical Mass colour, not observed seasonal guess");
assert.match(html,/data-home-h4-begin/);
assert.match(html,/data-home-h4-change/);
const modal=h4ChoicesMarkup({chosenForm:"SOLEMN",formChangeAllowed:true,readerMode:"MISSAL",
  experience:{language:"fr",before:"prepare",after:"thanksgiving"}},{language:"en"});
assert.equal((modal.match(/data-h4-option=/g)||[]).length,5,"Mass, ceremony, reader, language and prayer choices use one sheet");
assert.match(modal,/data-h4-different-mass/,"Other Mass must use canonical resolver");
assert.match(modal,/value="SOLEMN" selected/,"Source preflight ceremony must populate sheet");
assert.match(modal,/value="MISSAL" selected/,"Source preflight reader must populate sheet");
assert.match(modal,/value="fr" selected/,"Source preflight language must populate sheet");
assert.match(modal,/data-h4-remember/,"Remember must be a deliberate Settings-backed action");
// Opt-in persistence belongs to Settings, not Home or a second localStorage key.
const memory=new Map();
const ls={getItem:k=>memory.has(k)?memory.get(k):null,
  setItem:(k,v)=>memory.set(k,String(v)),
  removeItem:k=>memory.delete(k),get length(){return memory.size;},
  key:i=>[...memory.keys()][i]??null};
const savedWin={localStorage:ls,
  AO_R17_BROWSER_ENTRY:{status:()=>({fullMassPreflight:{
    chosenForm:"SOLEMN",readerMode:"MISSAL",
    experience:{language:"fr",before:"prepare",after:"thanksgiving"}}})}};
savedWin.AO_SETTINGS_DONOR_V4359=createSettingsDonorState(savedWin);
assert.equal(savedWin.AO_SETTINGS_DONOR_V4359.snapshot().preferences.mass.todayChoices,null,
  "Current-Mass edits are not implicitly remembered");
const saved=rememberH4Choices(savedWin);
assert.deepEqual({ok:saved.ok,persistent:saved.persistent},{ok:true,persistent:true});
assert.deepEqual(createSettingsDonorState(savedWin).snapshot().preferences.mass.todayChoices,{
  form:"SOLEMN",readerMode:"MISSAL",readerLanguage:"fr",beforeMass:"prepare",afterMass:"thanksgiving"
},"All five usual Mass choices must survive a donor reinitialisation");
const settingsMass=renderSettingsToString(savedWin,{route:"/settings/mass"});
assert.match(settingsMass,/data-pref-clear-today/, "Remembered choices need a targeted Settings reset");
assert.match(settingsMass,/Defaults saved from Today/, "Settings must disclose their override");

savedWin.AO_R17_BROWSER_ENTRY={status:()=>({fullMassPreflight:{chosenForm:"INVALID",
  readerMode:"LIVE",experience:{language:"en",before:"none",after:"none"}}})};
assert.equal(rememberH4Choices(savedWin).ok,false,"Never persist an invalid ceremony");
savedWin.AO_SETTINGS_DONOR_V4359.setPath("mass.todayChoices",{form:"SOLEMN",
  readerMode:"INVALID",readerLanguage:"fr",beforeMass:"prepare",afterMass:"thanksgiving"});
assert.equal(savedWin.AO_SETTINGS_DONOR_V4359.snapshot().preferences.mass.todayChoices,null,
  "Settings must reject malformed remembered choices");
assert.doesNotMatch(renderSettingsToString(savedWin,{route:"/settings/mass"}),/data-pref-clear-today/,
  "Clearing remembered choices must restore legacy Mass preference presentation");
const modalFr=h4ChoicesMarkup({chosenForm:"LOW",formChangeAllowed:false,readerMode:"LIVE",
  experience:{language:"fr",before:"none",after:"full"}},{language:"fr"});
assert.match(modalFr,/Une autre messe est célébrée/);
assert.match(modalFr,/data-h4-option="form" disabled/,"Good Friday must block illicit form change");

assert.match(html,/data-home-h4-readings/);
assert.match(html,/data-home-cu-route="pray.angelus_regina"/);
assert.match(html,/Next · 18:00/);
assert.match(html,/MY RULE/);
assert.equal((html.match(/pray.rosary/g)||[]).length,0,"Rosary should be one personal-rule chip");
assert.equal((html.match(/data-home-cu-static="rosary"/g)||[]).length,1,"Rosary must appear once");
assert.equal((html.match(/data-home-calendar-date="2026-11-01"/g)||[]).length,1);
assert.equal((html.match(/data-home-calendar-date="2026-11-02"/g)||[]).length,1);
assert.equal((html.match(/data-home-daily-catechism/g)||[]).length,0,"No Catechism on Home");
assert.equal((html.match(/data-home-dyk-open/g)||[]).length,1,"One Did You Know Home box");
assert.match(html,/<\/section><section class="aoH4DiscoveryStandalone"[^>]*><button[^>]*data-home-dyk-open/,
  "Did You Know is a standalone section immediately below This week");
assert.ok(html.indexOf('class="aoTodayV2CalendarGlance"')<html.indexOf('class="aoH4DiscoveryStandalone"'),
  "This week must precede Discovery");
assert.ok(html.indexOf('class="aoH4DiscoveryStandalone"')<html.indexOf('class="aoTodayV2Below"'),
  "Discovery must precede Read");
const readFragment=html.slice(html.indexOf('class="aoH4Read"'));
assert.doesNotMatch(readFragment,/data-home-dyk-open/,"Did You Know must not be inside Read");
assert.equal((readFragment.match(/data-action="gospel"/g)||[]).length,1,"Read keeps its Gospel entry");
assert.match(html,/class="aoH4CalendarViews"/,"Calendar must retain its own view selector");
assert.match(html,/<nav class="aoH4CalendarViews"[^>]*>[\\s\\S]*data-home-calendar-view="day">Day/);
assert.match(html,/<nav class="aoH4CalendarViews"[^>]*>[\\s\\S]*data-home-calendar-view="picker">Month/);
assert.match(html,/<nav class="aoH4CalendarViews"[^>]*>[\\s\\S]*data-home-calendar-view="year">Liturgical Year/);
assert.match(html,/Liturgical Year/,"Year clock needs a visible labelled route");
assert.match(h4HomeView({...vm,language:"fr"},model),/Année liturgique/,
  "Year clock route must be bilingual");
assert.match(html,/DID YOU KNOW\?/,"English affirmative discovery heading");
assert.match(h4HomeView({...vm,language:"fr"},model),/LE SAVIEZ-VOUS \?/,"French discovery heading");
assert.equal((html.match(/data-action="gospel"/g)||[]).length,1);
assert.doesNotMatch(html,/verify the observed|strongly french-attested|Today\/Month\/Year/i);
assert.doesNotMatch(html,/data-home-find|data-home-scripture/,"H4 five-block Home must not duplicate other permanent tabs");
const fail=h4HomeView({...vm,properStatus:"failed"},model);
assert.match(fail,/data-home-h4-begin disabled/,"Source-incomplete H4 must fail closed");
const resumable=h4HomeView(vm,model,{resume:{date:"2026-10-30",stepNumber:11}});
assert.match(resumable,/data-resume-mass/);
assert.doesNotMatch(resumable,/data-home-h4-begin/,"Resuming must not create a second start");
const fr=h4HomeView({...vm,language:"fr",dateTitle:"vendredi 30 octobre"},model);
assert.match(fr,/Commencer la messe/);
assert.match(fr,/Lectures/);
assert.match(fr,/Rosaire/);
assert.match(fr,/Cette semaine/);
console.log("PASS H4 Today door: original Mass, canonical events, Rosary once, 18:00 next, fail closed, Resume, bilingual");
