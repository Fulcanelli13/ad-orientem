import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {v384Dates,v384Events} from "../src/calendar/traditional-year-v384.js";
import {calendarPracticeEvents,calendarPracticeMonthEntries} from "../src/calendar/intelligence.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const atlas=read("../data/customs/customs-atlas-seed.v1.json");
const registry=read("../data/customs/source-registry.v1.json");
const ext=read("../data/customs/sot07-extensions.v1.json");
const neg=read("../data/customs/negative-knowledge.v1.json");
assert.equal(atlas.customs.length,39);
assert.equal(atlas.attestations.length,98);
assert.equal(registry.sources.length,110);
assert.equal(ext.extensions.length,22);
assert.equal(neg.entries.length,7);
const ids=new Set(atlas.customs.map(c=>c.custom_id)),src=new Set(registry.sources.map(s=>s.id));
assert.equal(ids.size,39);
assert.equal(new Set(registry.sources.map(s=>s.id)).size,110);
assert.equal(new Set(atlas.attestations.map(a=>a.attestation_id)).size,98);
assert.equal(new Set(ext.extensions.map(e=>e.custom_id)).size,22);
const seven=["NDAY-001","PATR-001","MARI-001","SJOS-001","SANT-001","SCHR-001","SNIC-001"];
const three=["BLSS-002","BLSS-003","BLSS-004"];
for(const id of [...seven,...three]){
 assert.ok(ids.has(id),"missing coordinated custom "+id);
 assert.ok(!neg.entries.some(n=>n.custom_id===id),"blocked custom");
 const att=atlas.attestations.filter(a=>a.custom_id===id);
 assert.equal(att.length,1,id+" duplicated or missing attestation");
 assert.equal(att[0].place_id,null,id+" invented pin");
 assert.equal(att[0].map_policy,"NOT_MAPPED");
 for(const sourceId of att[0].source_ids)assert.ok(src.has(sourceId),id+" foreign key "+sourceId);
 assert.ok(ext.extensions.some(e=>e.custom_id===id),id+" missing SOT-07 extension");
}
assert.equal(atlas.attestations.filter(a=>a.custom_id==="DEAD-003"&&a.attestation_id==="att:DEAD-003:POLAND-WYPOMINKI-2025").length,1);
for(const year of [2026,2027,2030]){
 const cases=[["03-19","st-joseph-table"],["06-13","st-anthony-bread"],["07-25","st-christopher-vehicles"],["12-06","st-nicholas-family"],["08-15","assumption-herbs"],["12-27","st-john-wine"]];
 for(const [mmdd,id] of cases){
  const day=`${year}-${mmdd}`;
  for(const fr of [false,true]){
   const list=v384Events(day,{fr}).filter(e=>e.key===id);
   assert.equal(list.length,1,day+" "+id+" fr="+fr);
   assert.equal(list[0].actions.length,1,id+" must use one calendar navigation action");
   assert.equal(list[0].actions[0][0],"today.calendar");
  }
  assert.equal(calendarPracticeEvents(day).filter(e=>e.key===id).length,1,"double date surface "+id);
  assert.equal(calendarPracticeMonthEntries(day.slice(0,7)).filter(e=>e.id==="practice."+id).length,1);
 }
 const holy=v384Dates(year).holySaturday;
 assert.equal(v384Events(holy).filter(e=>e.key==="holy-saturday").length,1,"one Holy Saturday card");
 assert.equal(v384Events(holy).filter(e=>e.key==="easter-foods").length,0,"no redundant Easter food card");
 assert.match(v384Events(holy).find(e=>e.key==="holy-saturday")?.summary||"",/Easter foods.*priestly blessing/i);
 assert.match(v384Events(holy,{fr:true}).find(e=>e.key==="holy-saturday")?.summary||"",/aliments.*bénédiction sacerdotale/i);
 assert.equal(v384Events(`${year}-08-15`).filter(e=>e.key==="assumption-marian-procession").length,0,"Marian procession is context without duplicate date notice");
 assert.equal(v384Events(`${year}-11-02`).filter(e=>e.key==="holy-souls").length,1,"only one All Souls date card");
}
console.log("PASS coordinated customs union + P0 six: 39 canonical, 98 attestations, 110 sources, 22 extensions, original 10 release IDs intact, DEAD-003 enrichment and Holy Saturday unchanged.");
