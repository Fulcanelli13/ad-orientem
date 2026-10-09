import assert from "node:assert/strict";
import {assessPrintableProper,renderPrintableProperHtml} from "../src/calendar/print-proper.js";

const text=(phrase)=>({lat:"Dómine "+phrase+" & sancte.",en:"Lord "+phrase+" & holy.",fr:"Seigneur "+phrase+" & saint."});
const r={
 date:"2026-10-07",status:"ready",
 day:{main:{title:"Our Lady of the Rosary",rank:"II class",color:"White"}},
 proper:{status:"ready",data:{
   name:"Our Lady of the Holy Rosary",nameFr:"Notre-Dame du Très Saint Rosaire",
   rank:"II class",sourcePath:"Sancti/10-07",riteProfile:"ordinary_mass",
   introit:text("<introït>"),collects:[text("collect 1"),text("collect 2")],
   epistle:text("epistle"),preGospelChants:[{kind:"gradual",text:text("gradual")}],
   gospel:text("gospel"),offertory:text("offertory"),secrets:[text("secret 1"),text("secret 2")],
   communion:text("communion"),postcommunions:[text("postcommunion 1"),text("postcommunion 2")],
   specialSections:[],preparatoryLessons:[],
   calendarCommemorations:[{name:"Saint Pius",path:"Sancti/10-07a",prayerSourcePath:"Sancti/10-07a"}],
 }},
 colourPlan:{primary:"White",massColor:"White"},
};
assert.equal(assessPrintableProper(r,{language:"en"}).ok,true);
assert.equal(assessPrintableProper(r,{language:"fr"}).ok,true);
const french=renderPrintableProperHtml(r,{language:"fr"});
assert.match(french,/Notre-Dame du Très Saint Rosaire/);
assert.match(french,/Seigneur collect 2/);
assert.match(french,/Dómine collect 2/);
assert.match(french,/Seigneur secret 2/);
assert.match(french,/Seigneur postcommunion 2/);
assert.match(french,/Sainte? Saint|Saint Pius/);
assert.match(french,/Sancti\/10-07/);
assert.match(french,/Ordinaire/);
assert.match(french,/window\.print\(\)/);
assert.doesNotMatch(french,/<introït>/,"Never execute upstream Proper text as HTML");
assert.match(french,/&lt;introït&gt;/);
assert.equal((french.match(/class="item"/g)||[]).length,12);
const english=renderPrintableProperHtml(r,{language:"en"});
assert.match(english,/Our Lady of the Holy Rosary/);
assert.match(english,/Lord epistle/);
assert.match(english,/Mass Proper only/);
assert.doesNotMatch(english,/Missal complete|Complete Mass/);
const bad=structuredClone(r);bad.proper.data.secrets[0].fr="";
assert.equal(assessPrintableProper(bad,{language:"fr"}).ok,false,"Partial vernacular must not print as bilingual");
assert.throws(()=>renderPrintableProperHtml(bad,{language:"fr"}),/Print withheld/);
for(const mutation of [
 x=>x.proper.status="unavailable",
 x=>x.proper.data.sourcePath="",
 x=>x.proper.data.secrets=[],
 x=>x.proper.data.specialSections=[{id:"Ember-Mass"}],
 x=>x.proper.data.preparatoryLessons=[{id:"Lesson-2"}],
 x=>x.proper.data.riteProfile="easter_vigil_mass",
]){
 const obj=structuredClone(r);mutation(obj);
 assert.equal(assessPrintableProper(obj).ok,false,"Missing text/source or exceptional liturgy was printed");
}
assert.equal(assessPrintableProper(r,{language:"la"}).ok,false);
console.log("PASS printable bilingual 1962 Proper: 11 ordered sections, canonical provenance, EN/FR, escaped text, incomplete and special-rite exclusion");
