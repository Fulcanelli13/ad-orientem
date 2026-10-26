import assert from "node:assert/strict";
import fs from "node:fs";
import {v384Events} from "../src/calendar/traditional-year-v384.js";
import {calendarPracticeEvents,calendarPracticeMonthEntries} from "../src/calendar/intelligence.js";

const read = p => JSON.parse(fs.readFileSync(new URL(p, import.meta.url),"utf8"));
const atlas=read("../data/customs/customs-atlas-seed.v1.json");
const sources=read("../data/customs/source-registry.v1.json");
const negative=read("../data/customs/negative-knowledge.v1.json");
const extensions=read("../data/customs/sot07-extensions.v1.json");

const added=[
 ["NDAY-001","US","EWTN-MCLOUGHLIN-NAMEDAY"],
 ["PATR-001","FR","ECF-CHANTELLE-PATRONAL"],
 ["MARI-001","FR","DIOCESE-PARIS-ASSOMPTION-2026"],
 ["SJOS-001","US","BR-DIOCESE-STJOSEPH-2026"],
 ["SANT-001","FR","ERMITAGE-ANTHONY-POOR-BREAD"],
 ["SCHR-001","FR","DIOCESE-LAVAL-CHRISTOPHER-2026"],
 ["SNIC-001","FR","STRASBOURG-SAINT-NICOLAS-2022"],
];
assert.equal(added.length,7);
// The frozen Weiser seven-identity release has 38 customs, 97 attestations,
// and 108 sources. The independent draft Calendar cohort adds exactly two
// candidate identities, two attestations and four source entries; these must
// not break tests for the earlier seven identities or for published main.
const calendarCohortIds=["EPIP-003","CRIB-001"];
const calendarCohortPresent=calendarCohortIds.filter(id=>atlas.customs.some(c=>c.custom_id===id));
assert.ok(calendarCohortPresent.length===0||calendarCohortPresent.length===2,
 "Calendar customs cohort cannot be partly present");
const calendarCohortSize=calendarCohortPresent.length;
assert.equal(atlas.customs.length,38+calendarCohortSize);
assert.equal(atlas.attestations.length,97+calendarCohortSize);
assert.equal(sources.sources.length,108+calendarCohortSize*2);
assert.equal(negative.entries.length,7);
const srcIds=new Set(sources.sources.map(s=>s.id));
const blocked=new Set(negative.entries.map(e=>e.custom_id));
for(const [id,geo,sourceId] of added){
 const custom=atlas.customs.find(c=>c.custom_id===id);
 const att=atlas.attestations.filter(a=>a.custom_id===id);
 const extension=extensions.extensions.find(e=>e.custom_id===id);
 assert.ok(custom && extension,id+": missing canonical extension");
 assert.equal(custom.publication_state,"PUBLISHED");
 assert.equal(blocked.has(id),false);
 assert.equal(att.length,1,id+": must be one contextual attestation");
 assert.equal(att[0].attestation_id,`att:${id}:${geo}`);
 assert.equal(att[0].geo_area_id,`geo:country:${geo}`);
 assert.equal(att[0].map_policy,"NOT_MAPPED");
 assert.equal(att[0].place_id,null);
 assert.ok(att[0].source_ids.includes(sourceId));
 assert.ok(srcIds.has(sourceId));
 assert.ok(extension.source_ids.includes(sourceId));
 assert.ok(!/guaranteed (safety|cure|miracle)/i.test(custom.canonical_statement));
}
const dead=atlas.customs.filter(c=>c.custom_id==="DEAD-003");
assert.equal(dead.length,1,"Wypominki must enrich the one existing Holy Souls owner");
const polish=atlas.attestations.filter(a=>a.attestation_id==="att:DEAD-003:POLAND-WYPOMINKI-2025");
assert.equal(polish.length,1);
assert.equal(polish[0].custom_id,"DEAD-003");
assert.equal(polish[0].map_policy,"NOT_MAPPED");
assert.equal(polish[0].place_id,null);
assert.ok(polish[0].source_ids.includes("POLAND-WYPOMINKI-2025"));

const notices=[
 ["03-19","st-joseph-table"],
 ["06-13","st-anthony-bread"],
 ["07-25","st-christopher-vehicles"],
 ["12-06","st-nicholas-family"],
];
for(const year of [2026,2027,2030]){
 for(const [mmdd,key] of notices){
   const date=`${year}-${mmdd}`;
   const en=v384Events(date).filter(x=>x.key===key);
   const fr=v384Events(date,{fr:true}).filter(x=>x.key===key);
   assert.equal(en.length,1,date+": one English custom");
   assert.equal(fr.length,1,date+": one French custom");
   assert.ok(en[0].summary.length>30);
   assert.ok(fr[0].summary.length>30);
   assert.equal(en[0].actions.length,1);
   assert.equal(en[0].actions[0][0],"today.calendar");
   assert.equal(calendarPracticeEvents(date).filter(x=>x.key===key).length,1);
   const normalized=calendarPracticeEvents(date).find(x=>x.key===key);
   assert.equal(normalized.kind,"practice");
   assert.equal(normalized.classification,null,"No new 1962 feast or mandatory law");
   assert.equal(calendarPracticeMonthEntries(date.slice(0,7)).filter(x=>x.id==="practice."+key).length,1);
   assert.ok(!/mandatory for all|guarantees protection|guaranteed cure|must be blessed/i.test(en[0].summary+" "+en[0].current));
   const nextDate=new Date(date+"T12:00:00Z");nextDate.setUTCDate(nextDate.getUTCDate()+1);
   const other=nextDate.toISOString().slice(0,10);
   assert.equal(v384Events(other).filter(x=>x.key===key).length,0,key+": should not appear next day");
 }
 assert.equal(v384Events(year+"-08-15").filter(x=>x.key==="assumption-marian-procession").length,0,
  "Assumption procession evidence must not compete with separate herbs PR's date card");
 assert.equal(v384Events(year+"-11-02").filter(x=>x.key==="holy-souls").length,1,
  "Polish Wypominki must not duplicate the All Souls date card");
}
assert.ok(!atlas.customs.some(x=>["WEI58-26-029","WEI58-23-021"].includes(x.custom_id)));
console.log("PASS selective Weiser: 7 new canonical non-map customs, one existing-owner enrichment, four bilingual calendar notices, no Mass-rite inference");
