import assert from "node:assert/strict";
import {SEASONAL_SANCTORAL_2026_COUNTS,
 required1962SeasonalSanctoralPrefaceOwner,originalSanctoralLacksOwnPreface,
 matches1962SeasonalSanctoralSelection,
 required1962May11ApostlesPrefaceOwner,authenticMay11ApostolicOriginal,
 matches1962May11ApostlesSelection} from "../src/mass/1962-seasonal-sanctoral-preface-source.js";
const list={
 PASCHALIS:["04-13:3:r","04-14:3:r","04-21:3:w","04-22:3:r","04-24:3:r",
  "04-27:3:w","04-28:3:w","04-29:3:r","04-30:3:w","05-02:3:w",
  "05-04:3:w","05-05:3:w","05-07:3:r","05-09:3:w","05-12:3:r"],
 ASCENSIO:["05-15:3:w","05-16:3:w","05-18:3:r","05-19:3:w","05-20:3:w"]
};
assert.deepEqual(SEASONAL_SANCTORAL_2026_COUNTS,{paschal:15,ascension:5,total:20});
let checked=0;
for(const [family,dates] of Object.entries(list))for(const key of dates){
 const [md,rank,colour]=key.split(":");
 const date="2026-"+md,path="Sancti/"+md,id="sancti:"+key;
 assert.equal(required1962SeasonalSanctoralPrefaceOwner("sancti:"+md+":"+rank+":"+
   (colour==="r"?"w":"r"),path,date),null,
   md+" must not apply the season to a different colour/feast ID");
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
const apostle=required1962May11ApostlesPrefaceOwner(
  "sancti:05-11r:2:r","Sancti/05-11r","2026-05-11");
assert.equal(apostle?.section,"Apostolis");
assert.equal(apostle?.rubric,"RGMR_497");
assert.equal(required1962May11ApostlesPrefaceOwner(
 "sancti:05-11r:3:r","Sancti/05-11r","2026-05-11"),null);
assert.equal(required1962May11ApostlesPrefaceOwner(
 "sancti:05-11r:2:r","Sancti/05-11r","2027-05-11"),null);
assert.equal(required1962May11ApostlesPrefaceOwner(
 "sancti:05-11r:2:r","Sancti/05-01","2026-05-11"),null);
const witness={map:new Map([["Officium",["Ss. Philippi et Jacobi Apostolorum"]]])};
assert.equal(authenticMay11ApostolicOriginal(witness),true);
assert.equal(authenticMay11ApostolicOriginal({map:new Map([
 ["Officium",["S. Joseph Opificis"]]])}),false);
const selected={
 lat:"de Apostolis\nVere dignum et justum est: Te, Dómine, supplíciter exoráre, ut gregem tuum, Pastor ætérne, non déseras.",
 en:"of Apostles\nIt is truly meet and just, O Lord.",
 fr:"des Apôtres\nIl est vraiment juste et nécessaire.",
 prefaceSection:"Apostolis",prefaceVariant:null,
 recoveryScope:apostle.scope,sanctoralSourceDate:apostle.date
};
assert.equal(matches1962May11ApostlesSelection(selected,apostle),true);
assert.equal(matches1962May11ApostlesSelection({...selected,lat:"Communis"},apostle),false);
assert.equal(matches1962May11ApostlesSelection({...selected,sanctoralSourceDate:"2027-05-11"},apostle),false);
assert.equal(matches1962May11ApostlesSelection({...selected,fr:""},apostle),false);

console.log("PASS 20 seasonal + 1 apostolic exact-source 1962 Easter/Ascension Sanctoral Prefaces; strict 2026 date, donor and variant rejects; Apostles exception excluded");
