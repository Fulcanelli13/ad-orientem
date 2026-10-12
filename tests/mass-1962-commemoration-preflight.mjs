import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {massCalendarPreflightContext,fillMassCalendarPreflight} from "../src/mass/calendar-preflight-context.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";

const text=(lat,en,fr)=>({lat,en,fr});
const latinMaternity="Deus, qui de beátæ Maríæ Vírginis útero Verbum tuum, Angelo nuntiánte";
const proper={
 sourcePath:"Tempora/Pent20-0",
 collects:[text("Largire quaesumus Domine","Grant forgiveness and peace","Accordez pardon et paix"),
           text(latinMaternity,"O God, who willed the Word to take flesh","O Dieu, qui avez voulu l'incarnation du Verbe")],
 secrets:[text("Caelestem nobis","May these mysteries","Que ces mystères"),
          text("Tua Domine propitiatione","Through Your mercy","Par votre miséricorde")],
 postcommunions:[text("Ut sacris Domine","May we be worthy","Rendez-nous dignes"),
                 text("Haec nos communio","May this communion","Que cette communion")]
};
const main={id:"tempora:Pent20-0:2:g",title:"XX Sunday after Pentecost",rank:"II",color:"green"};
const commem={name:"Maternity of the Blessed Virgin Mary",nameFr:"Maternité divine de la Bienheureuse Vierge Marie",path:"Sancti/10-11"};
const state={selectedDate:"2026-10-11",resolving:false,resolution:{date:"2026-10-11",day:{main:{...main,commemorations:[commem]},commemorations:[commem]}}};
const legacy={date:"2026-10-11",celebrationType:"CALENDAR",celebrationId:"mass_of_day",
 calendarDay:{id:main.id,title:"Twentieth Sunday after Pentecost"},
 actualCelebration:{title:"20th Sunday after Pentecost"},proper:{status:"READY",data:proper},canStart:true};
const en=massCalendarPreflightContext(legacy,state,"en");
assert.deepEqual(en.commemorations,["Maternity of the Blessed Virgin Mary"]);
assert.equal(en.commemorationApplies,true,"Different Sunday title spelling must not hide commemoration");
assert.equal(en.commemorationOrations.status,"COMPLETE");
assert.deepEqual(en.commemorationOrations.counts,[2,2,2]);
assert.equal(en.calendar.source,"1962_RESOLVER");
const fr=massCalendarPreflightContext(legacy,state,"fr");
assert.deepEqual(fr.commemorations,["Maternité divine de la Bienheureuse Vierge Marie"]);
assert.equal(fr.commemorationOrations.status,"COMPLETE");
assert.equal(properToReaderSlots(proper,{language:"fr"}).slots.COLLECT_SET.data.paragraphs.length,2);
assert.equal(properToReaderSlots(proper,{language:"en"}).slots.SECRET_SET.data.paragraphs.length,2);
assert.equal(properToReaderSlots(proper,{language:"fr"}).slots.POSTCOMMUNION_SET.data.paragraphs.length,2);
const incomplete={...proper,secrets:[proper.secrets[0]]};
const bad=massCalendarPreflightContext({...legacy,proper:{status:"READY",data:incomplete}},state,"fr");
assert.equal(bad.commemorationOrations.status,"INCOMPLETE","No silently omitted Secret");
assert.deepEqual(bad.commemorationOrations.counts,[2,1,2]);
const noFrench={...proper,collects:[proper.collects[0],{lat:latinMaternity,en:"O God",fr:""}]};
assert.equal(massCalendarPreflightContext({...legacy,proper:{status:"READY",data:noFrench}},state,"fr").commemorationOrations.status,"INCOMPLETE");
assert.equal(massCalendarPreflightContext({...legacy,proper:null},state,"en").commemorationOrations.status,"PENDING");
assert.equal(massCalendarPreflightContext(legacy,{...state,selectedDate:"2026-10-12"}, "en").commemorations.length,0,
 "No stale prior-day commemoration");
assert.equal(massCalendarPreflightContext({...legacy,date:"2026-10-12"},state, "en").commemorations.length,0);
const different={...legacy,celebrationType:"VOTIVE",celebrationId:"other-votive"};
assert.equal(massCalendarPreflightContext(different,state,"en").commemorationApplies,false,
 "Feast/votive choice must not inherit Sunday prayers");
assert.equal(massCalendarPreflightContext({...legacy,sourceDiagnostics:{actualMassSelection:"OBSERVED_SOURCE_DAY"}},state,"en").commemorationApplies,false);
const none={...state,resolution:{date:"2026-10-11",day:{main,commemorations:[]}}};
assert.equal(massCalendarPreflightContext(legacy,none,"en").commemorations.length,0);
const badStatus={...state,resolving:true};
assert.equal(massCalendarPreflightContext(legacy,badStatus,"en").commemorations.length,0);
const xss={...state,resolution:{...state.resolution,day:{main:{...main,commemorations:[{name:"<script>bad()</script>"}]}}}};
const hostile=massCalendarPreflightContext(legacy,xss,"en");
const fields=new Map();
for(const name of ["commemoration-label","commemoration-name","commemoration-prayers"]){
 fields.set(name,{textContent:"",hidden:false});
}
const block={hidden:true,dataset:{}};
const root={
  dataset:{},
  querySelector(selector){
   if(selector==="[data-mass-calendar-commemoration]")return block;
   const name=/^\[data-mass-calendar-([^\]]+)\]$/.exec(selector)?.[1];
   return fields.get(name)||null;
  }
};
assert.equal(fillMassCalendarPreflight(root,en),true);
assert.equal(block.hidden,false);
assert.match(fields.get("commemoration-name").textContent,/Maternity/);
assert.match(fields.get("commemoration-prayers").textContent,/Collect, Secret and Postcommunion/);
assert.equal(root.dataset.massCalendarSource,"1962_RESOLVER");
assert.equal(block.dataset.massCommemorationReadiness,"COMPLETE");
fillMassCalendarPreflight(root,bad);
assert.equal(block.dataset.massCommemorationReadiness,"INCOMPLETE");
assert.match(fields.get("commemoration-prayers").textContent,/incomplets dans le propre choisi/);
fillMassCalendarPreflight(root,hostile);
assert.equal(fields.get("commemoration-name").textContent,"<script>bad()</script>");
const fakeRootHtml=readFileSync(new URL("../src/mass/full-mass-preflight.js",import.meta.url),"utf8");
assert.match(fakeRootHtml,/data-mass-calendar-commemoration-name/);
assert.match(fakeRootHtml,/data-mass-calendar-commemoration-prayers/);
assert.match(fakeRootHtml,/data-mass-calendar-commemoration-label/);
assert.ok(!fakeRootHtml.includes("2026-10-11"),"No date-specific forcing in production UI");
console.log("PASS: Oct 11 Marian commemoration preflight, EN/FR, all three extra orations, fail-closed missing sources and negative date/votive gates.");
