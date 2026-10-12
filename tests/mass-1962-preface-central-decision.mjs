import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {choose1962PrefaceForDay,materialize1962Preface,apply1962PrefaceSelection} from "../src/mass/1962-preface-decision.js";
import {install1962PrefaceRuntime} from "../src/mass/1962-preface-runtime.js";
const registry=JSON.parse(readFileSync(new URL("../data/mass/1962-preface-source-full-seasonal.v2.json",import.meta.url),"utf8"));
const ordinary={lat:"Communis\n℣. Vere dignum et justum est",en:"Common",fr:"Commune"};
const day=(id,preface=ordinary,commemorations=[],date="2026-10-12")=>
 ({status:"ready",date,day:{main:{id,title:"The principal feast"},commemorations},
  proper:{status:"ready",data:{sourcePath:id,preface,collects:[],secrets:[],postcommunions:[]}}});
const cases=[
 ["tempora:Pasc7-0:1:r","Spiritu","HOLY_GHOST","2026-05-24"],
 ["tempora:Pasc7-5:1:r","Spiritu","HOLY_GHOST","2026-05-29"],
 ["sancti:10-07:2:w","Maria","BVM"],
 ["sancti:12-08:1:w","Maria","BVM"],
 ["sancti:03-25:1:w","Maria","BVM"],
 ["sancti:09-08:2:w","Maria","BVM"],
];
for(const [id,section,selected,date] of cases){
 const current=day(id,ordinary,[],date);
 const choice=choose1962PrefaceForDay(current);
 assert.equal(choice?.sourceSection,section,id);
 assert.equal(choice?.id,selected,id);
 const result=apply1962PrefaceSelection(current,registry);
 assert.notEqual(result,current);
 assert.equal(result.prefaceDecision.applied,true);
 assert.equal(result.proper.data.preface.selected1962PrefaceId,selected);
 for(const k of ["lat","en","fr"]){
   assert.ok(result.proper.data.preface[k].length>250,id+" "+k);
   assert.ok(!/\*Festivitáte\*|\*Feast\*|\* \*/.test(result.proper.data.preface[k]));
 }
 assert.equal(current.proper.data.preface,ordinary,"Never mutate the source Proper");
}
const rosary=apply1962PrefaceSelection(day("sancti:10-07:2:w"),registry).proper.data.preface;
assert.match(rosary.lat,/Et te in Festivitáte/);
const immaculate=apply1962PrefaceSelection(day("sancti:12-08:1:w"),registry).proper.data.preface;
assert.match(immaculate.lat,/Et te in Conceptióne immaculáta/);
assert.match(immaculate.en,/Immaculate Conception/);
assert.match(immaculate.fr,/Conception immaculée/);
const pentecost=apply1962PrefaceSelection(day("tempora:Pasc7-0:1:r",ordinary,[],"2026-05-24"),registry).proper.data.preface;
assert.match(pentecost.lat,/Spíritum Sanctum hodiérna die/);
assert.match(pentecost.fr,/en ce jour/);
assert.ok(!pentecost.lat.startsWith("Communis"));
const correctTrinity={lat:"de sanctissima Trinitate\n℣. Vere dignum",en:"Holy Trinity",fr:"Trinité"};
const control=day("tempora:Pent20-0:2:g",correctTrinity,[{title:"Divine Maternity"}]);
assert.equal(choose1962PrefaceForDay(control),null,"A commemoration may not change the Sunday Preface");
assert.equal(apply1962PrefaceSelection(control,registry),control);
assert.equal(apply1962PrefaceSelection(day("sancti:02-02:2:w",{lat:"de Nativitate Domini",en:"Nativity",fr:"Nativité"}),registry).proper.data.preface.lat,"de Nativitate Domini");
assert.equal(apply1962PrefaceSelection(day("sancti:10-07:2:w",{lat:"de Beata Maria Virgine",en:"Blessed Virgin",fr:"Vierge"}),registry).proper.data.preface.lat,"de Beata Maria Virgine","An already proper Preface must win");
assert.equal(choose1962PrefaceForDay({...day("sancti:12-08:1:w"),status:"failed"}),null);
assert.equal(choose1962PrefaceForDay({...day("sancti:12-08:1:w"),proper:{status:"failed"}}),null);
const fake={AO_RUNTIME_V8:{resolver:{async resolveDay(_date){return day("sancti:10-07:2:w")}}},
 fetch:async()=>({ok:true,json:async()=>registry})};
const installed=install1962PrefaceRuntime(fake);
assert.equal(installed.installed,true);
const updated=await fake.AO_RUNTIME_V8.resolver.resolveDay("2026-10-07");
assert.match(updated.proper.data.preface.lat,/Beata Maria/);
assert.equal(updated.prefaceDecision.id,"BVM");

assert.equal(install1962PrefaceRuntime(fake).installed,true,"Do not wrap twice");
// The 1962 Proper source must supply the correct Preface across ordinary
// seasonal formularies, not only Pentecost and selected BVM feasts.
const seasonal=[
 ["2025-12-27","tempora:Nat1-6:3:w","Nat","NATIVITY"],
 ["2026-01-07","tempora:Epi1-1:3:w","Epi","EPIPHANY"],
 ["2026-02-25","tempora:Quad1-3:3:v","Quad","LENT"],
 ["2026-04-08","tempora:Pasc0-3:1:w","Pasch","EASTER"],
 ["2026-04-19","tempora:Pasc2-0:2:w","Pasch","EASTER"],
 ["2026-05-15","tempora:Pasc5-5:3:w","Asc","ASCENSION"],
 ["2026-05-23","tempora:Pasc6-6:1:r","Spiritu","HOLY_GHOST"],
 ["2026-03-19","sancti:03-19:1:w","Joseph","ST_JOSEPH"],
 ["2026-05-01","sancti:05-01:1:w","Joseph","ST_JOSEPH"],
 ["2026-09-21","sancti:09-21:2:r","Apostolis","APOSTLES"]
];
for(const [date,id,section,key] of seasonal){
 const candidate=day(id,ordinary,[],date),choice=choose1962PrefaceForDay(candidate);
 assert.equal(choice?.sourceSection,section,date);
 assert.equal(choice?.id,key,date);
 const resolved=apply1962PrefaceSelection(candidate,registry);
 assert.equal(resolved.prefaceDecision.applied,true,date);
 assert.equal(resolved.proper.data.preface.selected1962PrefaceId,key,date);
 for(const lang of ["lat","en","fr"]){
  const text=resolved.proper.data.preface[lang];
  assert.ok(text?.length>180,date+" "+lang);
  assert.ok(!/(\(sed |\(à la Messe|[*][^*]+[*])/.test(text),date+" "+lang+" raw variant leaked");
 }
}
const easterOctave=apply1962PrefaceSelection(day("tempora:Pasc0-3:1:w",ordinary,[],"2026-04-08"),registry).proper.data.preface;
const easterAfter=apply1962PrefaceSelection(day("tempora:Pasc2-0:2:w",ordinary,[],"2026-04-19"),registry).proper.data.preface;
assert.match(easterOctave.lat,/hac potíssimum die gloriósius/);
assert.match(easterOctave.en,/on this day when Christ/);
assert.match(easterOctave.fr,/en ce jour où le Christ/);
assert.match(easterAfter.lat,/hoc potíssimum gloriósius/);
assert.match(easterAfter.en,/in this season when Christ/);
assert.match(easterAfter.fr,/en ce temps où le Christ/);
const josephMarch=apply1962PrefaceSelection(day("sancti:03-19:1:w",ordinary,[],"2026-03-19"),registry).proper.data.preface;
const josephMay=apply1962PrefaceSelection(day("sancti:05-01:1:w",ordinary,[],"2026-05-01"),registry).proper.data.preface;
assert.match(josephMarch.lat,/Festivitáte beáti Joseph/);
assert.match(josephMay.lat,/Solemnitáte beáti Joseph/);
// The 1962 Advent Preface is a local authorized variant, not a
// universal automatic replacement under the general calendar.
const advent=day("tempora:Adv1-0:1:v",ordinary,[],"2025-11-30");
assert.equal(choose1962PrefaceForDay(advent),null);
assert.equal(choose1962PrefaceForDay(advent,{allowLocalAdventPreface:true})?.sourceSection,"Adv");
assert.equal(apply1962PrefaceSelection(advent,registry),advent);
// Commemoration of a Marian feast must not change the principal Mass
// even if the day falls in Advent or a season with another Preface.
const sunday=day("tempora:Pent20-0:2:g",correctTrinity,[{title:"Divine Maternity"}],"2026-10-11");
assert.equal(apply1962PrefaceSelection(sunday,registry),sunday);

console.log("PASS: 1962 trilingual Preface recovery for Rosary, Immaculate Conception, Pentecost octave; no commemoration override and central resolver interception");
