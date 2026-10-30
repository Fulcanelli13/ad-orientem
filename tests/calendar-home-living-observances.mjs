import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildTodayV2Sections,renderTodayV2Sections} from "../src/home/today-v2-sections.js";
import {buildReviewedSanctoralCards} from "../src/calendar/reviewed-sanctoral-cards.js";
const read=JSON.parse(readFileSync(new URL("../data/calendar/living-sanctoral-read-model.v1.json",import.meta.url),"utf8"));
const view=(date,mainId,commemorations=[],language="en")=>{
 const state={
   route:"home",selectedDate:date,language,resolving:false,
   resolution:{status:"ready",date,day:{date,main:{id:mainId,rank:"III"},
      commemorations}}
 };
 const vm={dateIso:date,language,celebration:"1962 Mass",gospelReference:null,
   properStatus:"ready",gospelExcerpt:""};
 const model=buildTodayV2Sections(state,vm,{visible:false},read);
 return {model,html:renderTodayV2Sections(model,vm)};
};
const leonardi=view("2026-10-09","sancti:10-09:3:w",[
  {id:"sancti:10-11:3:w",title:"Historical Saint"}]);
assert.equal(leonardi.model.historicalCommemorations.length,1);
assert.equal(leonardi.model.modernHonours.length,1);
assert.equal(leonardi.model.modernHonours[0].id,"saint.john-henry-newman");
assert.match(leonardi.html,/Historical Saint/);
assert.match(leonardi.html,/1962 Mass commemoration/);
assert.match(leonardi.html,/John Henry Newman/);
assert.match(leonardi.html,/Modern Roman calendar/);
assert.equal((leonardi.html.match(/class="aoTodayV2ObservedRow(?:\s[^"]*)?"/g)||[]).length,2);
assert.match(leonardi.html,/data-home-calendar-view="day"/);
assert.doesNotMatch(leonardi.html,/data-cal-mass|data-home-mass-entry/);

assert.deepEqual(view("2026-10-11","sancti:10-11:2:w",[]).model.modernHonours.map(x=>x.id),
  ["saint.john-xxiii"],"Contemporary saint does not replace historical feast");
assert.deepEqual(view("2026-10-12","sancti:10-12:3:w",[]).model.modernHonours.map(x=>x.id),
 ["saint.carlo-acutis"],"Home renders Holy See feast-date witness without new 1962 Mass");
assert.deepEqual(view("2024-10-12","sancti:10-12:3:w",[]).model.modernHonours.map(x=>x.id),
 [],"No retrojection before Carlo canonization");
assert.deepEqual(view("2026-10-22","sancti:10-22:3:w",[]).model.modernHonours.map(x=>x.id),
  ["saint.john-paul-ii"]);
assert.deepEqual(view("2026-09-23","tempora:Pent17-3:2:v",[]).model.modernHonours.map(x=>x.id),
  ["saint.pio-pietrelcina"],"Historical Ember day survives, papal 2002 date visible as information");
const names=view("2026-10-05","sancti:10-05:3:w",[]);
assert.deepEqual(names.model.modernHonours.map(x=>x.id),["saint.maria-faustyna-kowalska"]);
const paul=view("2026-05-29","sancti:05-29:3:w",[]);
assert.deepEqual(paul.model.modernHonours.map(x=>x.id),["saint.paul-vi"]);
const prior=view("2019-10-05","sancti:10-05:3:w",[]);
assert.deepEqual(prior.model.modernHonours,[],"No ante-dated Faustina memorial");
const preNewman=view("2025-10-09","sancti:10-09:3:w",[]);
assert.deepEqual(preNewman.model.modernHonours,[],"Newman memorial not backdated");
const duplicate=view("2026-10-09","sancti:10-09:3:w",[
  {id:"sancti:10-11:3:w",title:"Historical Saint"},
  {id:"sancti:10-11:3:r",title:"Historical Saint"}]);
assert.equal(duplicate.model.historicalCommemorations.length,1);
const namesOnly=view("2026-10-09","sancti:10-09:3:w",["10-11"]);
assert.equal(namesOnly.model.historicalCommemorations.length,0,"Opaque code is never named saint");
const failed={
  route:"home",resolving:true,
  resolution:{status:"ready",date:"2026-10-09",day:{main:{id:"sancti:10-09:3:w"}}}
};
const vm={dateIso:"2026-10-09",language:"en",celebration:"1962 Mass",properStatus:"idle"};
const noStale=buildTodayV2Sections(failed,vm,{visible:false},read);
assert.deepEqual(noStale.modernHonours,[]);
assert.deepEqual(noStale.historicalCommemorations,[]);

const asFr=view("2026-10-09","sancti:10-09:3:w",
  [{id:"sancti:10-11:3:w",title:"St Name",titleFr:"Saint Nom"}],"fr");
assert.match(asFr.html,/Saint Nom/);
assert.match(asFr.html,/Saint John Henry Newman|John Henry Newman/);
assert.match(asFr.html,/La messe prescrite de 1962 reste inchangée/);
assert.ok(read.observanceRegistry.observances.length===26);
assert.equal(buildReviewedSanctoralCards({date:"2026-10-09",observedPrincipalId:"sancti:10-09:3:w",...read}).length,1);
console.log("Home Living Traditional Calendar: PASS (1962 observances first, 10 Holy See primary dates, date history, bilingual, no added Mass)");
