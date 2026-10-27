import assert from "node:assert/strict";
import {RESIDUAL_1962_PREFACE_CASES,required1962ResidualPrefaceOwner,
  authentic1962ResidualOriginal,render1962ResidualPreface,matches1962ResidualSelected}
  from "../src/mass/1962-residual-preface-source.js";
import {bind1962PrincipalPrefaceIdentity} from "../src/mass/host-adapter.js";

assert.equal(RESIDUAL_1962_PREFACE_CASES.length,13);
assert.deepEqual(Object.fromEntries(
  [...new Set(RESIDUAL_1962_PREFACE_CASES.map(x=>x.category))].map(category=>
    [category,RESIDUAL_1962_PREFACE_CASES.filter(x=>x.category===category).length])),
 {NATIVITATE:2,EPIPHANIA:4,JOSEPH:2,ASCENSIO:1,TRINITATE:4});
const latin={
 NATIVITATE:"de Nativitate Domini\nQuia per incarnáti Verbi mystérium.",
 EPIPHANIA:"de Epiphania Domini\nQuia, cum Unigénitus tuus appáruit.",
 ASCENSIO:"de Ascensione Domini\nQui post resurrectiónem suam.",
 TRINITATE:"de sanctissima Trinitate\nQui cum unigénito Fílio tuo.",
 JOSEPH:"de S. Joseph\nEt te in *Veneratióne* beáti Joseph."
};
for(const owner of RESIDUAL_1962_PREFACE_CASES){
 const found=required1962ResidualPrefaceOwner(owner.principalId,owner.originalPath,owner.date);
 assert.deepEqual(found,owner,owner.date+" correct source owner");
 assert.equal(required1962ResidualPrefaceOwner(owner.principalId,"Tempora/Adv1-1",owner.date),null);
 assert.equal(required1962ResidualPrefaceOwner(owner.principalId,owner.originalPath,"2027"+owner.date.slice(4)),null);
 assert.equal(required1962ResidualPrefaceOwner("votive:"+owner.principalId,owner.originalPath,owner.date),null);
 const parsed=new Map([["Rule",owner.originalPrefatio?["Prefatio="+owner.originalPrefatio]:["Gloria","Credo"]]]);
 assert.equal(authentic1962ResidualOriginal({map:parsed},owner),true,owner.date);
 assert.equal(authentic1962ResidualOriginal({map:new Map([["Rule",["Prefatio=Communis"]]])},owner),
   false,owner.date+" contradicting original directive must be withheld");
 assert.equal(authentic1962ResidualOriginal({map:new Map([["Rule",["Prefatio=Joseph=Veneratione"]]])},owner),
   false,owner.date+" wrong Joseph variant prohibited");
 const src={la:latin[owner.category],
  en:owner.category==="JOSEPH"?
    "St Joseph\non the solemnity of blessed Joseph.":
    "Named heading\nIt is meet and just.",
  fr:owner.category==="JOSEPH"?
    "de Saint Joseph\nCélébrer en la fête du bienheureux Joseph.":
    "Préface\nIl est juste."};
 const rendered={};
 for(const lang of ["la","en","fr"]){
   const text=render1962ResidualPreface(src[lang],lang,owner);
   assert.ok(text,owner.date+" "+lang+" three language selected");
   rendered[lang==="la"?"lat":lang]=text;
 }
 const selected={...rendered,sourcePath:"Ordo/Prefationes",
  prefaceSection:owner.section,recoveryScope:owner.scope,
  residualPrefaceDate:owner.date,originalProperSourcePath:owner.originalPath,
  prefaceVariant:owner.variant};
 assert.equal(matches1962ResidualSelected(selected,owner),true,owner.date);
 assert.equal(matches1962ResidualSelected({...selected,sourcePath:"Ordo/Communis"},owner),false);
 assert.equal(matches1962ResidualSelected({...selected,residualPrefaceDate:"2026-02-01"},owner),false);
 assert.equal(matches1962ResidualSelected({...selected,fr:""},owner),false);
 assert.equal(matches1962ResidualSelected({...selected,lat:latin.NATIVITATE},owner),
   owner.category==="NATIVITATE",owner.date+" wrong Latin category");
 if(owner.category==="JOSEPH"){
   const expected=owner.variant==="FESTIVITY"?"Festivitáte":"Solemnitáte";
   assert.ok(selected.lat.includes(expected),owner.date+" Latin original form");
   assert.ok(!selected.lat.includes("*Veneratióne*"));
 }
}
// Verify the real session-to-reader handoff, not only the source owner.
for(const owner of RESIDUAL_1962_PREFACE_CASES){
 const legacy={date:owner.date,calendarDay:{id:owner.principalId},
   requestedCelebrationId:"mass_of_day",celebrationId:"mass_of_day",
   celebrationType:"CALENDAR"};
 const data={sourcePath:owner.originalPath,preface:{lat:"Communis",en:"Common",fr:"Commune"}};
 const bound=bind1962PrincipalPrefaceIdentity(data,legacy);
 assert.equal(bound.principalCelebrationId,owner.principalId,
   owner.date+": native reader principal ID not bound");
 assert.equal(bound.selectedMassDate,owner.date,owner.date+": reader date not bound");
 assert.equal(bound.requestedCelebrationId,"mass_of_day");
 assert.equal(bind1962PrincipalPrefaceIdentity(data,{
   ...legacy,date:"2027"+owner.date.slice(4)}),data,
   owner.date+": source identity leaked to another year");
 assert.equal(bind1962PrincipalPrefaceIdentity({...data,sourcePath:"Tempora/Pent00-0"},legacy).principalCelebrationId,
   undefined,owner.date+": unrelated donor falsely bound");
 assert.equal(bind1962PrincipalPrefaceIdentity(data,{
   ...legacy,requestedCelebrationId:"other-votive",celebrationId:"other-votive",
   celebrationType:"VOTIVE"}),data,owner.date+": votive Mass inherited day Preface identity");
}
for(const date of ["2026-10-26","2026-01-10","2026-01-13"]){
 const data={sourcePath:"Sancti/01-06",preface:{lat:"Communis",en:"Common",fr:"Commune"}};
 const legacy={date,calendarDay:{id:":feria:4:w"},
   requestedCelebrationId:"mass_of_day",celebrationId:"mass_of_day",
   celebrationType:"CALENDAR"};
 assert.equal(bind1962PrincipalPrefaceIdentity(data,legacy),data,
   date+": generic feria should remain unbound");
}
assert.equal(new Set(RESIDUAL_1962_PREFACE_CASES.map(x=>x.date)).size,13);
console.log("PASS 13 exact 2026 residual 1962 Prefaces: 2 Nativity, 4 Epiphany, 2 Joseph, 1 Ascension, 4 Advent Trinity, poisoned sources/dates/variants rejected");
