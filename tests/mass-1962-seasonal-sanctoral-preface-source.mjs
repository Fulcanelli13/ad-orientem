import assert from "node:assert/strict";
import {SEASONAL_SANCTORAL_2026_COUNTS,
 required1962SeasonalSanctoralPrefaceOwner,originalSanctoralLacksOwnPreface,
 matches1962SeasonalSanctoralSelection} from "../src/mass/1962-seasonal-sanctoral-preface-source.js";
const list={
 PASCHALIS:["04-13","04-14","04-21","04-22","04-24","04-27","04-28",
   "04-29","04-30","05-02","05-04","05-05","05-07","05-09","05-12"],
 ASCENSIO:["05-15","05-16","05-18","05-19","05-20"]
};
assert.deepEqual(SEASONAL_SANCTORAL_2026_COUNTS,{paschal:15,ascension:5,total:20});
let checked=0;
for(const [family,dates] of Object.entries(list))for(const md of dates){
 const date="2026-"+md,path="Sancti/"+md,id="sancti:"+md+":3:w";
 const source=required1962SeasonalSanctoralPrefaceOwner(id,path,date);
 assert.ok(source,date+" original source was not matched");
 assert.equal(source.category,family,date);
 assert.equal(source.date,date);
 assert.equal(source.variant,family==="PASCHALIS"?"EASTERTIDE":null);
 assert.equal(source.section,family==="PASCHALIS"?"Pasch":"Asc");
 assert.equal(required1962SeasonalSanctoralPrefaceOwner(id,path,"2027-"+md),null);
 assert.equal(required1962SeasonalSanctoralPrefaceOwner(id,"Sancti/01-14",date),null);
 assert.equal(required1962SeasonalSanctoralPrefaceOwner(id.replace("sancti","votive"),path,date),null);
 assert.equal(required1962SeasonalSanctoralPrefaceOwner(id,path,md),null);
 assert.equal(required1962SeasonalSanctoralPrefaceOwner(id,path,date.replace("2026-","2025-")),null);
 assert.equal(originalSanctoralLacksOwnPreface({map:new Map([["Rule",[]]])},source),true);
 assert.equal(originalSanctoralLacksOwnPreface({map:new Map([["Rule",["Prefatio=Maria=Assumptione"]]])},source),false);
 assert.equal(originalSanctoralLacksOwnPreface(null,source),false);
 const preface=family==="PASCHALIS"?{
   lat:"Paschalis\nVere dignum et justum est, sed in hoc potíssimum gloriósius praedicáre, cum Pascha nostrum immolátus est Christus.",
   en:"Easter\nIt is truly meet and just, in this season, when Christ our Pasch was sacrificed.",
   fr:"de Pâques\nIl est vraiment juste et nécessaire, en ce temps où le Christ est immolé.",
   prefaceSection:"Pasch",prefaceVariant:"EASTERTIDE",
   recoveryScope:source.scope,seasonalSanctoralDate:date
 }:{
   lat:"de Ascensione Domini\nVere dignum et justum est, qui post resurrectiónem suam ómnibus discípulis apparuit.",
   en:"Ascension\nIt is truly meet and just, through Christ our Lord.",
   fr:"de l’Ascension\nIl est vraiment juste et nécessaire.",
   prefaceSection:"Asc",prefaceVariant:null,
   recoveryScope:source.scope,seasonalSanctoralDate:date
 };
 assert.equal(matches1962SeasonalSanctoralSelection(preface,source),true,date);
 for(const corrupt of [
   {...preface,seasonalSanctoralDate:"2026-03-25"},
   {...preface,lat:"Communis\n"+preface.lat},
   {...preface,fr:""},
   {...preface,prefaceSection:"Communis"},
   {...preface,recoveryScope:"VOTIVE"},
   {...preface,prefaceVariant:"VIGIL_NIGHT"}
 ])assert.equal(matches1962SeasonalSanctoralSelection(corrupt,source),false,date);
 checked++;
}
assert.equal(checked,20);
assert.equal(required1962SeasonalSanctoralPrefaceOwner(
  "sancti:05-11r:2:r","Sancti/05-11r","2026-05-11"),null,
  "Saints Philip and James own the Apostles Preface, not seasonal Paschal");
console.log("PASS 20 exact-source 1962 Easter/Ascension Sanctoral Prefaces; strict 2026 date, donor and variant rejects; Apostles exception excluded");
