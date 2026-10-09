import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarObservanceAlias} from "../src/calendar/observance-title.js";

const registry=JSON.parse(readFileSync(new URL("../data/calendar/1962-editorial-reconciliation-2024-2027.v1.json",import.meta.url),"utf8"));
const historical=registry.groups.find(x=>x.key==="generic_feria");
assert.ok(historical&&historical.count===55);
assert.equal(historical.dates.length,55);
assert.equal(historical.dates.filter(x=>x.startsWith("2024-")).length,29);
assert.equal(historical.dates.filter(x=>x.startsWith("2027-")).length,26);
const fake=(date,id,temporalId)=>({
  date,status:"ready",day:{main:{id,title:"Feria",rank:4,color:"Green"},
    tempora:temporalId?[{id:temporalId,title:"Source recorded weekday"}]:[]},
  proper:{status:"ready",data:{name:"Feria",sourcePath:"Tempora/Pent16-0"}},
});
const checks=[
  ["2024-01-09",":feria:4:w","tempora:Epi1-2:4:w",
    "Tuesday after the First Sunday after Epiphany","Mardi après le premier dimanche après l’Épiphanie"],
  ["2024-02-13",":feria:4:v","tempora:Quadp3-2:4:v",
    "Tuesday after Quinquagesima","Mardi après la Quinquagésime"],
  ["2027-02-03",":feria:4:v","tempora:Quadp2-3:4:v",
    "Wednesday after Sexagesima","Mercredi après la Sexagésime"],
  ["2024-04-09",":feria:4:w","tempora:Pasc1-2:4:w",
    "Tuesday after the First Sunday after Easter","Mardi après le premier dimanche après Pâques"],
  ["2024-06-03",":feria:4:g","tempora:Pent02-1:4:g",
    "Monday after the Second Sunday after Pentecost","Lundi après le deuxième dimanche après la Pentecôte"],
  ["2027-09-06",":feria:4:g","tempora:Pent16-1:4:g",
    "Monday after the Sixteenth Sunday after Pentecost","Lundi après le seizième dimanche après la Pentecôte"],
  ["2024-11-05",":feria:4:g","tempora:Epi4-2:4:g",
    "Tuesday after the transferred Fourth Sunday after Epiphany","Mardi après le quatrième dimanche après l’Épiphanie reporté"],
  ["2027-11-03",":feria:4:g","tempora:Epi4-3:4:g",
    "Wednesday after the transferred Fourth Sunday after Epiphany","Mercredi après le quatrième dimanche après l’Épiphanie reporté"],
];
for(const [date,id,temporalId,en,fr] of checks){
  const item=fake(date,id,temporalId);
  assert.equal(calendarObservanceAlias(item,"en"),en,date+" English source lineage");
  assert.equal(calendarObservanceAlias(item,"fr"),fr,date+" French source lineage");
}
for(const item of [
  fake("2024-06-03","sancti:06-03:3:w","tempora:Pent02-1:4:g"),
  fake("2024-06-03",":feria:4:g","tempora:Pent02-2:4:g"),
  fake("2024-06-03",":feria:4:g","tempora:Pent02-1:3:g"),
  fake("2024-06-03",":feria:4:g",null),
  {...fake("2024-06-03",":feria:4:g","tempora:Pent02-1:4:g"),
    day:{main:{id:":feria:4:g"},tempora:[
      {id:"tempora:Pent02-1:4:g"},{id:"tempora:Pent03-1:4:g"}]}},
]){
  assert.equal(calendarObservanceAlias(item,"en"),null,
    "Nonconforming or absent canonical observed Temporale must fail closed");
}
assert.equal(calendarObservanceAlias({...fake("2024-06-03",":feria:4:g","tempora:Pent02-1:4:g"),status:"failed"},"en"),null);
const epiphany=fake("2027-01-07",":feria:4:w",null);
assert.equal(calendarObservanceAlias(epiphany,"en"),null,
  "A date without an inherited observed Epiphany Proper must remain unknown");
epiphany.proper.data.sourcePath="Sancti/01-06";
assert.equal(calendarObservanceAlias(epiphany,"en"),"Thursday after Epiphany");
assert.equal(calendarObservanceAlias(epiphany,"fr"),"Jeudi après l’Épiphanie");
const friday={...epiphany,date:"2027-01-08"};
assert.equal(calendarObservanceAlias(friday,"en"),"Friday after Epiphany");
assert.equal(calendarObservanceAlias(friday,"fr"),"Vendredi après l’Épiphanie");
assert.equal(calendarObservanceAlias({...friday,date:"2027-01-14"},"en"),null,
  "Proper source alone cannot extend Epiphany segment after January 13");
assert.equal(calendarObservanceAlias({...friday,proper:{status:"failed",data:{sourcePath:"Sancti/01-06"}}},"en"),null,
  "An unavailable inherited Proper must not be advertised as sourced");
console.log("PASS 1962 source-first feria headline projection: 55-date historical cohort, EN/FR, temporal source ID and weekday guards");