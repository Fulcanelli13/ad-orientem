import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {v384Dates,v384Events} from "../src/calendar/traditional-year-v384.js";
import {calendarPracticeEvents,calendarPracticeMonthEntries} from "../src/calendar/intelligence.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const atlas=load("../data/customs/customs-atlas-seed.v1.json");
const sources=load("../data/customs/source-registry.v1.json");
const extensions=load("../data/customs/sot07-extensions.v1.json");
const guidance=load("../data/customs/customs-p0-guidance-en-fr.v1.json");
const negatives=load("../data/customs/negative-knowledge.v1.json");
const planned=[
  ["ADVT-001","US","USCCB-ADVENT-WREATH-HOME"],
  ["ADVT-002","US","CATHCULTURE-ADVENT-MANGER-STRAW-2014"],
  ["ADVT-003","MX","USCCB-POSADAS-DEC16"],
  ["XMAS-001","US","SJV-VERMONT-OPLATKI"],
  ["HTHU-001","US","CHICAGO-CATHOLIC-HOLY-THURSDAY-2026"],
  ["ROGA-001","US","NEWLAND-ROGATION-FAMILY-1956"]
];
assert.equal(atlas.customs.length,39);
assert.equal(atlas.attestations.length,98);
assert.equal(sources.sources.length,110);
assert.equal(extensions.extensions.length,22);
assert.equal(negatives.entries.length,7);
assert.equal(guidance.entries.length,6);
assert.equal(guidance.publication,"SUPPORTING_COPY_FOR_PUBLISHED_CANONICAL_IDS");
assert.equal(new Set(atlas.customs.map(x=>x.custom_id)).size,39);
assert.equal(new Set(atlas.attestations.map(x=>x.attestation_id)).size,98);
assert.equal(new Set(sources.sources.map(x=>x.id)).size,110);
assert.equal(new Set(extensions.extensions.map(x=>x.custom_id)).size,22);
assert.equal(new Set(guidance.entries.map(x=>x.custom_id)).size,6);

for(const [id,country,sourceId] of planned){
 const custom=atlas.customs.find(c=>c.custom_id===id);
 const att=atlas.attestations.filter(a=>a.custom_id===id);
 const extension=extensions.extensions.find(e=>e.custom_id===id);
 const source=sources.sources.find(s=>s.id===sourceId);
 const card=guidance.entries.find(c=>c.custom_id===id);
 assert.ok(custom&&extension&&source&&card,id+" missing canonical/source/extended/guidance owner");
 assert.equal(custom.publication_state,"PUBLISHED");
 assert.equal(att.length,1,id+" exactly one regional or historical attestation");
 assert.equal(att[0].attestation_id,`att:${id}:${country}`);
 assert.equal(att[0].geo_area_id,`geo:country:${country}`);
 assert.equal(att[0].place_id,null);
 assert.equal(att[0].map_policy,"NOT_MAPPED");
 assert.equal(att[0].geographic_precision,"COUNTRY");
 assert.deepEqual(att[0].source_ids,[sourceId]);
 assert.deepEqual(extension.source_ids,[sourceId]);
 assert.deepEqual(card.source_ids,[sourceId]);
 assert.ok(card.weiser_observation_ids.length>0);
 assert.equal(card.review_status,"CANONICAL_ID_PUBLISHED_IN_MAIN");
 assert.ok(!negatives.entries.some(x=>x.custom_id===id));
 assert.ok(source.url.startsWith("https://"));
 for(const field of ["title_en","title_fr","description_en","description_fr","meaning_en","meaning_fr","how_en","how_fr"]){
   assert.ok(card[field]?.length>(field.startsWith("title_")?10:30),id+" missing "+field);
 }
 assert.ok(custom.guardrail.length>75,"ritual boundaries missing");
}
function adventFirst(y){
 const start=new Date(Date.UTC(y,10,27));
 while(start.getUTCDay()!==0)start.setUTCDate(start.getUTCDate()+1);
 return start.toISOString().slice(0,10);
}
for(const year of [2026,2027,2030]){
 const advent=adventFirst(year);
 const holy=v384Dates(year).holyThursday;
 const observances=[
  [advent,"advent-family-traditions"],
  [`${year}-12-16`,"las-posadas"],
  [`${year}-12-24`,"oplatek-christmas"]
 ];
 for(const [date,key] of observances){
  for(const fr of [false,true]){
   const es=v384Events(date,{fr}).filter(e=>e.key===key);
   assert.equal(es.length,1,"duplicate or missing "+key+" "+date+" French="+fr);
   assert.ok(es[0].summary.length>70,"missing meaningful short bilingual guidance");
   assert.equal(es[0].actions.length,1);
   assert.equal(es[0].actions[0][0],"today.calendar");
   assert.ok(es[0].priority<60,"household custom must be below principal feast guidance");
  }
  assert.equal(calendarPracticeEvents(date).filter(e=>e.key===key).length,1);
  assert.equal(calendarPracticeMonthEntries(date.slice(0,7)).filter(e=>e.id==="practice."+key).length,1);
 }
 const advNext=new Date(advent+"T12:00:00Z");advNext.setUTCDate(advNext.getUTCDate()+7);
 assert.equal(v384Events(advNext.toISOString().slice(0,10)).filter(e=>e.key==="advent-family-traditions").length,0,"no repeated new Sunday card");
 const th=v384Events(holy);
 assert.equal(th.filter(e=>e.key==="holy-thursday").length,1);
 assert.match(th.find(e=>e.key==="holy-thursday").summary,/seven is a traditional number/i);
 assert.match(v384Events(holy,{fr:true}).find(e=>e.key==="holy-thursday").summary,/sept est traditionnel/i);
 assert.equal(th.some(e=>e.key==="holy-thursday-seven-churches"),false);
 assert.equal(calendarPracticeEvents(holy).filter(e=>e.key==="holy-thursday").length,1);
 const r=v384Events(`${year}-04-25`);
 assert.equal(r.filter(e=>e.key==="rogation").length,1);
 assert.match(r.find(e=>e.key==="rogation").summary,/family prayer walk/);
 assert.match(v384Events(`${year}-04-25`,{fr:true}).find(e=>e.key==="rogation").summary,/marche familiale/);
 assert.equal(r.some(e=>e.key==="rogation-family-walk"),false);
 const saturday=v384Dates(year).holySaturday;
 assert.equal(v384Events(saturday).filter(e=>e.key==="holy-saturday").length,1);
 assert.equal(v384Events(saturday).some(e=>e.key==="easter-foods"),false);
}
console.log("PASS Weiser six P0: 39 customs, 98 attestations, 110 sources, 22 extensions; all six EN/FR complete; 3 new date notices, one Holy Thursday and Rogation owner; no maps, duplicate ceremonies or changed Holy Saturday.");
