import assert from "node:assert/strict";
import {h4Enabled,h4HomeView} from "../src/home/today-h4-view.js";
assert.equal(h4Enabled({location:{search:""}}),false,"H4 must not replace production until approved");
assert.equal(h4Enabled({location:{search:"?aoTodayH4=1"}}),true,"H4 preview opt-in missing");
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
const html=h4HomeView(vm,model);
assert.match(html,/Friday 30 October/);
assert.match(html,/Mass of the 22nd Sunday after Pentecost/);
assert.match(html,/Si iniquitátes observáveris/);
assert.match(html,/data-home-h4-begin/);
assert.match(html,/data-home-h4-change/);
assert.match(html,/data-home-h4-readings/);
assert.match(html,/data-home-cu-route="pray.angelus_regina"/);
assert.match(html,/Next · 18:00/);
assert.match(html,/MY RULE/);
assert.equal((html.match(/pray.rosary/g)||[]).length,0,"Rosary should be one personal-rule chip");
assert.equal((html.match(/data-home-cu-static="rosary"/g)||[]).length,1,"Rosary must appear once");
assert.equal((html.match(/data-home-calendar-date="2026-11-01"/g)||[]).length,1);
assert.equal((html.match(/data-home-calendar-date="2026-11-02"/g)||[]).length,1);
assert.equal((html.match(/data-home-daily-catechism/g)||[]).length,1);
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
