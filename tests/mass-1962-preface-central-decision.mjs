import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {choose1962PrefaceForDay,materialize1962Preface,apply1962PrefaceSelection} from "../src/mass/1962-preface-decision.js";
import {install1962PrefaceRuntime} from "../src/mass/1962-preface-runtime.js";
const registry=JSON.parse(readFileSync(new URL("../data/mass/1962-preface-source-maria-spiritu.v1.json",import.meta.url),"utf8"));
const ordinary={lat:"Communis\n℣. Vere dignum et justum est",en:"Common",fr:"Commune"};
const day=(id,preface=ordinary,commemorations=[])=>
 ({status:"ready",date:"2026-10-12",day:{main:{id,title:"The principal feast"},commemorations},
  proper:{status:"ready",data:{sourcePath:id,preface,collects:[],secrets:[],postcommunions:[]}}});
const cases=[
 ["tempora:Pasc7-0:1:r","Spiritu","HOLY_GHOST"],
 ["tempora:Pasc7-5:1:r","Spiritu","HOLY_GHOST"],
 ["sancti:10-07:2:w","Maria","BVM"],
 ["sancti:12-08:1:w","Maria","BVM"],
 ["sancti:03-25:1:w","Maria","BVM"],
 ["sancti:09-08:2:w","Maria","BVM"],
];
for(const [id,section,selected] of cases){
 const current=day(id);
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
const pentecost=apply1962PrefaceSelection(day("tempora:Pasc7-0:1:r"),registry).proper.data.preface;
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
console.log("PASS: 1962 trilingual Preface recovery for Rosary, Immaculate Conception, Pentecost octave; no commemoration override and central resolver interception");
